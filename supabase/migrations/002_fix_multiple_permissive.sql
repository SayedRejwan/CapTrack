BEGIN;

-- Drop multiple permissive policies and combine them into single policies
-- Comments
DROP POLICY IF EXISTS "comments_select_own" ON comments;
DROP POLICY IF EXISTS "comments_select_all_supervisor" ON comments;
CREATE POLICY "comments_select" ON comments FOR SELECT
USING (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
  OR
  auth.uid() IS NULL
);

DROP POLICY IF EXISTS "comments_crud_supervisor" ON comments;
DROP POLICY IF EXISTS "comments_insert_supervisor" ON comments;
DROP POLICY IF EXISTS "comments_delete_supervisor" ON comments;

CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK ( (select is_supervisor()) );
CREATE POLICY "comments_update" ON comments FOR UPDATE USING ( (select is_supervisor()) ) WITH CHECK ( (select is_supervisor()) );
CREATE POLICY "comments_delete" ON comments FOR DELETE USING ( (select is_supervisor()) );


-- Files
DROP POLICY IF EXISTS "files_select_own" ON files;
DROP POLICY IF EXISTS "files_select_all_supervisor" ON files;
CREATE POLICY "files_select" ON files FOR SELECT
USING (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
  OR
  auth.uid() IS NULL
);

DROP POLICY IF EXISTS "files_insert_own" ON files;
DROP POLICY IF EXISTS "files_delete_own" ON files;
DROP POLICY IF EXISTS "files_crud_supervisor" ON files;

CREATE POLICY "files_insert" ON files FOR INSERT
WITH CHECK (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
);

CREATE POLICY "files_update" ON files FOR UPDATE
USING ( (select is_supervisor()) ) WITH CHECK ( (select is_supervisor()) );

CREATE POLICY "files_delete" ON files FOR DELETE
USING (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
);

-- Meetings
DROP POLICY IF EXISTS "meetings_select_own" ON meetings;
DROP POLICY IF EXISTS "meetings_select_all_supervisor" ON meetings;
CREATE POLICY "meetings_select" ON meetings FOR SELECT
USING (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
  OR
  auth.uid() IS NULL
);

DROP POLICY IF EXISTS "meetings_insert_own" ON meetings;
DROP POLICY IF EXISTS "meetings_delete_own" ON meetings;
DROP POLICY IF EXISTS "meetings_crud_supervisor" ON meetings;

CREATE POLICY "meetings_insert" ON meetings FOR INSERT
WITH CHECK (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
);

CREATE POLICY "meetings_update" ON meetings FOR UPDATE
USING ( (select is_supervisor()) ) WITH CHECK ( (select is_supervisor()) );

CREATE POLICY "meetings_delete" ON meetings FOR DELETE
USING (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
);

-- Tasks
DROP POLICY IF EXISTS "tasks_select_own" ON tasks;
DROP POLICY IF EXISTS "tasks_select_all_supervisor" ON tasks;
CREATE POLICY "tasks_select" ON tasks FOR SELECT
USING (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
  OR
  auth.uid() IS NULL
);

DROP POLICY IF EXISTS "tasks_insert_own" ON tasks;
DROP POLICY IF EXISTS "tasks_update_own" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_own" ON tasks;
DROP POLICY IF EXISTS "tasks_crud_supervisor" ON tasks;

CREATE POLICY "tasks_insert" ON tasks FOR INSERT
WITH CHECK (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
);

CREATE POLICY "tasks_update" ON tasks FOR UPDATE
USING (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
)
WITH CHECK (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
);

CREATE POLICY "tasks_delete" ON tasks FOR DELETE
USING (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
);


-- Teams
DROP POLICY IF EXISTS "teams_select_all_supervisor" ON teams;
DROP POLICY IF EXISTS "teams_select_own" ON teams;

CREATE POLICY "teams_select" ON teams FOR SELECT
USING (
  id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
  OR
  auth.uid() IS NULL
);

-- Team members
DROP POLICY IF EXISTS "members_select_all_supervisor" ON team_members;
DROP POLICY IF EXISTS "members_select_own" ON team_members;

CREATE POLICY "members_select" ON team_members FOR SELECT
USING (
  team_id = coalesce(current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id', '')
  OR
  (select is_supervisor())
  OR
  auth.uid() IS NULL
);

COMMIT;
