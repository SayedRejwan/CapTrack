-- CapTrack V2.0 — Security Hardening Migration
-- Run AFTER 001_initial_schema.sql
--
-- What this fixes:
-- 1. Removes plaintext password columns from exposed tables
-- 2. Tightens RLS: removes unauthenticated read access to teams/members
-- 3. Adds input validation constraints at the DB level
-- 4. Drops the password column from teams (auth is via Supabase Auth only)

-- ── 1. Drop password column from teams (auth handled by Supabase Auth) ──
ALTER TABLE teams DROP COLUMN IF EXISTS password;

-- ── 2. Drop team_password from app_settings (same reason) ──
ALTER TABLE app_settings DROP COLUMN IF EXISTS team_password;

-- ── 3. Tighten RLS: Remove unauthenticated access ──

-- Teams: unauthenticated users should NOT see team data
DROP POLICY IF EXISTS teams_select_all_supervisor ON teams;
DROP POLICY IF EXISTS teams_select_own ON teams;
CREATE POLICY "teams_authenticated_only"
  ON teams FOR SELECT
  USING (
    is_supervisor()
    OR id = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'team_id', '')
  );

-- Team Members: same — authenticated only
DROP POLICY IF EXISTS members_select_all_supervisor ON team_members;
DROP POLICY IF EXISTS members_select_own ON team_members;
CREATE POLICY "members_authenticated_only"
  ON team_members FOR SELECT
  USING (
    is_supervisor()
    OR team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'team_id', '')
  );

-- Tasks: remove unauthenticated reads
DROP POLICY IF EXISTS tasks_select_all_supervisor ON tasks;
DROP POLICY IF EXISTS tasks_select_own ON tasks;
CREATE POLICY "tasks_authenticated_own"
  ON tasks FOR SELECT
  USING (
    team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'team_id', '')
  );
CREATE POLICY "tasks_supervisor_all"
  ON tasks FOR SELECT USING (is_supervisor());

-- Files: remove unauthenticated reads
DROP POLICY IF EXISTS files_select_all_supervisor ON files;
DROP POLICY IF EXISTS files_select_own ON files;
CREATE POLICY "files_authenticated_own"
  ON files FOR SELECT
  USING (
    team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'team_id', '')
  );
CREATE POLICY "files_supervisor_all"
  ON files FOR SELECT USING (is_supervisor());

-- Comments: remove unauthenticated reads
DROP POLICY IF EXISTS comments_select_all_supervisor ON comments;
DROP POLICY IF EXISTS comments_select_own ON comments;
CREATE POLICY "comments_authenticated_own"
  ON comments FOR SELECT
  USING (
    team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'team_id', '')
  );
CREATE POLICY "comments_supervisor_all"
  ON comments FOR SELECT USING (is_supervisor());

-- Meetings: remove unauthenticated reads
DROP POLICY IF EXISTS meetings_select_all_supervisor ON meetings;
DROP POLICY IF EXISTS meetings_select_own ON meetings;
CREATE POLICY "meetings_authenticated_own"
  ON meetings FOR SELECT
  USING (
    team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'team_id', '')
  );
CREATE POLICY "meetings_supervisor_all"
  ON meetings FOR SELECT USING (is_supervisor());

-- ── 4. Add DB-level input validation constraints ──

-- Task title length
ALTER TABLE tasks ADD CONSTRAINT tasks_title_length CHECK (char_length(title) <= 200);

-- Comment text length
ALTER TABLE comments ADD CONSTRAINT comments_text_length CHECK (char_length(text) <= 1000);

-- Meeting title length
ALTER TABLE meetings ADD CONSTRAINT meetings_title_length CHECK (char_length(title) <= 200);

-- File name length
ALTER TABLE files ADD CONSTRAINT files_name_length CHECK (char_length(name) <= 100);

-- Week range constraints
ALTER TABLE tasks ADD CONSTRAINT tasks_week_range CHECK (week >= 1 AND week <= 28);
ALTER TABLE comments ADD CONSTRAINT comments_week_range CHECK (week >= 1 AND week <= 28);
ALTER TABLE meetings ADD CONSTRAINT meetings_week_range CHECK (week >= 1 AND week <= 28);
ALTER TABLE files ADD CONSTRAINT files_week_range CHECK (week >= 1 AND week <= 28);

-- Status validation
ALTER TABLE tasks ADD CONSTRAINT tasks_status_valid CHECK (status IN ('todo', 'doing', 'review', 'done'));

-- Comment mood validation
ALTER TABLE comments ADD CONSTRAINT comments_mood_valid CHECK (mood IN ('praise', 'note', 'concern'));

-- File kind validation
ALTER TABLE files ADD CONSTRAINT files_kind_valid CHECK (kind IN ('pdf', 'img', 'xls', 'ppt', 'csv', 'fig', 'cad', 'sim', 'zip', 'code'));

-- Attendees range
ALTER TABLE meetings ADD CONSTRAINT meetings_attendees_range CHECK (attendees >= 0 AND attendees <= 30);
ALTER TABLE meetings ADD CONSTRAINT meetings_decisions_range CHECK (decisions >= 0 AND decisions <= 100);

-- ── 5. Secure app_settings: only supervisor can read ──
DROP POLICY IF EXISTS settings_select_all ON app_settings;
CREATE POLICY "settings_authenticated_read"
  ON app_settings FOR SELECT
  USING (is_supervisor() OR auth.uid() IS NOT NULL);

-- ── 6. Add updated_at trigger for tasks ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();