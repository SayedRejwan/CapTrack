-- CapTrack V2.0 — Supabase Schema
-- Run this in the Supabase SQL Editor (Database → SQL Editor → New query)
-- Tables: teams, team_members, tasks, files, comments, meetings, app_settings
-- RLS: teams read their own rows; supervisor sees all

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Teams ──
CREATE TABLE IF NOT EXISTS teams (
  id            TEXT PRIMARY KEY,         -- e.g. 'team-01'
  number        TEXT NOT NULL,
  title         TEXT NOT NULL,
  accent        TEXT NOT NULL DEFAULT '#0079BF',
  progress      INT  NOT NULL DEFAULT 0,
  drive_link    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Team Members ──
CREATE TABLE IF NOT EXISTS team_members (
  id            TEXT PRIMARY KEY,         -- composite: team_id + sid
  team_id       TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  sid           TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'Member',
  mobile        TEXT,
  color         TEXT NOT NULL DEFAULT '#0079BF',
  initials      TEXT,
  idx           INT  NOT NULL DEFAULT 0,   -- display order / assignee index
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Tasks ──
CREATE TABLE IF NOT EXISTS tasks (
  id            TEXT PRIMARY KEY,         -- e.g. 'team-01-t1'
  team_id       TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'todo',
  assignee_idx  INT  NOT NULL DEFAULT 0,
  week          INT  NOT NULL DEFAULT 1,
  labels        TEXT[] DEFAULT '{}',
  comment_count INT  NOT NULL DEFAULT 0,
  attachment_count INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Files ──
CREATE TABLE IF NOT EXISTS files (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id       TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  kind          TEXT NOT NULL DEFAULT 'pdf',
  size          TEXT,
  week          INT  NOT NULL DEFAULT 1,
  by_idx        INT  NOT NULL DEFAULT 0,
  link          TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Comments (Supervisor Feedback) ──
CREATE TABLE IF NOT EXISTS comments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id       TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  week          INT  NOT NULL DEFAULT 1,
  mood          TEXT NOT NULL DEFAULT 'note',
  text          TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Meetings ──
CREATE TABLE IF NOT EXISTS meetings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id       TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  week          INT  NOT NULL DEFAULT 1,
  title         TEXT NOT NULL,
  attendees     INT  NOT NULL DEFAULT 0,
  decisions     INT  NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── App Settings (single-row config) ──
CREATE TABLE IF NOT EXISTS app_settings (
  id            INT  PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  current_week  INT  NOT NULL DEFAULT 18,
  total_weeks   INT  NOT NULL DEFAULT 28,
  midpoint_week INT  NOT NULL DEFAULT 14,
  supervisor_name  TEXT NOT NULL DEFAULT 'Dr. Md. Abu Shaid Sujon',
  supervisor_role  TEXT NOT NULL DEFAULT 'Capstone Supervisor',
  supervisor_email TEXT NOT NULL DEFAULT 'shaid.sujon@iut-dhaka.edu',
  supervisor_id    TEXT NOT NULL DEFAULT 'sup1',
  team_password  TEXT NOT NULL DEFAULT 'CHANGE_ME_AFTER_DEPLOY',
  drive_link     TEXT DEFAULT '',
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- ── Auth Users mapping (optional — for email-based auth if needed later) ──
CREATE TABLE IF NOT EXISTS team_emails (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id       TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email         TEXT,
  auth_provider TEXT DEFAULT 'password',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── RLS Enable ──
ALTER TABLE teams        ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE files        ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_emails  ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ──

-- Helper: is_supervisor() — checks raw_user_meta_data role claim
CREATE OR REPLACE FUNCTION is_supervisor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'role', '') = 'supervisor';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Teams: supervisor sees all; teams see their own row only
CREATE POLICY "teams_select_all_supervisor"
  ON teams FOR SELECT
  USING (is_supervisor() OR auth.uid() IS NULL);

CREATE POLICY "teams_select_own"
  ON teams FOR SELECT
  USING (id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));

CREATE POLICY "teams_update_supervisor"
  ON teams FOR UPDATE
  USING (is_supervisor())
  WITH CHECK (is_supervisor());

-- Team Members: same pattern
CREATE POLICY "members_select_all_supervisor"
  ON team_members FOR SELECT USING (is_supervisor() OR auth.uid() IS NULL);

CREATE POLICY "members_select_own"
  ON team_members FOR SELECT
  USING (team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));

CREATE POLICY "members_update_supervisor"
  ON team_members FOR UPDATE USING (is_supervisor()) WITH CHECK (is_supervisor());

-- Tasks: teams CRUD their own; supervisor CRUD all
CREATE POLICY "tasks_select_own"
  ON tasks FOR SELECT
  USING (team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));

CREATE POLICY "tasks_select_all_supervisor"
  ON tasks FOR SELECT USING (is_supervisor() OR auth.uid() IS NULL);

CREATE POLICY "tasks_insert_own"
  ON tasks FOR INSERT
  WITH CHECK (team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));

CREATE POLICY "tasks_update_own"
  ON tasks FOR UPDATE
  USING (team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));

CREATE POLICY "tasks_delete_own"
  ON tasks FOR DELETE
  USING (team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));

CREATE POLICY "tasks_crud_supervisor"
  ON tasks FOR ALL USING (is_supervisor()) WITH CHECK (is_supervisor());

-- Files: same as tasks
CREATE POLICY "files_select_own"     ON files FOR SELECT USING (team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));
CREATE POLICY "files_select_all_supervisor" ON files FOR SELECT USING (is_supervisor() OR auth.uid() IS NULL);
CREATE POLICY "files_insert_own"     ON files FOR INSERT WITH CHECK (team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));
CREATE POLICY "files_delete_own"     ON files FOR DELETE USING (team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));
CREATE POLICY "files_crud_supervisor" ON files FOR ALL USING (is_supervisor()) WITH CHECK (is_supervisor());

-- Comments: teams read their own (feedback); supervisor CRUD all
CREATE POLICY "comments_select_own"      ON comments FOR SELECT USING (team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));
CREATE POLICY "comments_select_all_supervisor" ON comments FOR SELECT USING (is_supervisor() OR auth.uid() IS NULL);
CREATE POLICY "comments_insert_supervisor" ON comments FOR INSERT WITH CHECK (is_supervisor());
CREATE POLICY "comments_delete_supervisor" ON comments FOR DELETE USING (is_supervisor());
CREATE POLICY "comments_crud_supervisor" ON comments FOR ALL USING (is_supervisor()) WITH CHECK (is_supervisor());

-- Meetings: teams CRUD their own; supervisor CRUD all
CREATE POLICY "meetings_select_own"      ON meetings FOR SELECT USING (team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));
CREATE POLICY "meetings_select_all_supervisor" ON meetings FOR SELECT USING (is_supervisor() OR auth.uid() IS NULL);
CREATE POLICY "meetings_insert_own"      ON meetings FOR INSERT WITH CHECK (team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));
CREATE POLICY "meetings_delete_own"      ON meetings FOR DELETE USING (team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', ''));
CREATE POLICY "meetings_crud_supervisor" ON meetings FOR ALL USING (is_supervisor()) WITH CHECK (is_supervisor());

-- App Settings: everyone reads; supervisor updates
CREATE POLICY "settings_select_all" ON app_settings FOR SELECT USING (true);
CREATE POLICY "settings_update_supervisor" ON app_settings FOR UPDATE USING (is_supervisor()) WITH CHECK (is_supervisor());

-- Team emails: only supervisor reads/writes
CREATE POLICY "emails_supervisor" ON team_emails FOR ALL USING (is_supervisor()) WITH CHECK (is_supervisor());

-- ── Realtime Enable ──
-- This lets the JS client subscribe to INSERT/UPDATE/DELETE on tables
BEGIN;
  -- Supabase auto-enables realtime on tables via publication, but we ensure it
  ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  ALTER PUBLICATION supabase_realtime ADD TABLE files;
  ALTER PUBLICATION supabase_realtime ADD TABLE comments;
  ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
  ALTER PUBLICATION supabase_realtime ADD TABLE teams;
  ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
COMMIT;

-- ── Seed app_settings (single row) ──
-- NOTE: team_password is set via Supabase Auth, not stored here.
-- Set drive_link to your actual Google Drive folder after deployment.
INSERT INTO app_settings (id, current_week, total_weeks, midpoint_week,
  supervisor_name, supervisor_role, supervisor_email, supervisor_id,
  drive_link)
VALUES (1, 18, 28, 14,
  'Dr. Md. Abu Shaid Sujon',
  'Capstone Supervisor',
  'shaid.sujon@iut-dhaka.edu',
  'sup1',
  ''
)
ON CONFLICT (id) DO NOTHING;
