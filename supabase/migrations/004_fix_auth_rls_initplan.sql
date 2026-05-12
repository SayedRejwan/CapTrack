BEGIN;

-- Update the RLS functions that use current_setting to wrap them in SELECT
-- to prevent the auth_rls_initplan warning

-- Helper: is_supervisor() — checks raw_user_meta_data role claim
CREATE OR REPLACE FUNCTION is_supervisor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'role'), '') = 'supervisor';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies with the select wrapper around current_setting
-- Teams
DROP POLICY IF EXISTS "teams_select" ON teams;

CREATE POLICY "teams_select" ON teams FOR SELECT
USING (
  id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
  OR
  auth.uid() IS NULL
);

-- Team members
DROP POLICY IF EXISTS "members_select" ON team_members;

CREATE POLICY "members_select" ON team_members FOR SELECT
USING (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
  OR
  auth.uid() IS NULL
);

-- Tasks
DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;

CREATE POLICY "tasks_select" ON tasks FOR SELECT
USING (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
  OR
  auth.uid() IS NULL
);

CREATE POLICY "tasks_insert" ON tasks FOR INSERT
WITH CHECK (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
);

CREATE POLICY "tasks_update" ON tasks FOR UPDATE
USING (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
)
WITH CHECK (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
);

CREATE POLICY "tasks_delete" ON tasks FOR DELETE
USING (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
);

-- Files
DROP POLICY IF EXISTS "files_select" ON files;
DROP POLICY IF EXISTS "files_insert" ON files;
DROP POLICY IF EXISTS "files_delete" ON files;

CREATE POLICY "files_select" ON files FOR SELECT
USING (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
  OR
  auth.uid() IS NULL
);

CREATE POLICY "files_insert" ON files FOR INSERT
WITH CHECK (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
);

CREATE POLICY "files_delete" ON files FOR DELETE
USING (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
);


-- Comments
DROP POLICY IF EXISTS "comments_select" ON comments;

CREATE POLICY "comments_select" ON comments FOR SELECT
USING (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
  OR
  auth.uid() IS NULL
);


-- Meetings
DROP POLICY IF EXISTS "meetings_select" ON meetings;
DROP POLICY IF EXISTS "meetings_insert" ON meetings;
DROP POLICY IF EXISTS "meetings_delete" ON meetings;

CREATE POLICY "meetings_select" ON meetings FOR SELECT
USING (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
  OR
  auth.uid() IS NULL
);


CREATE POLICY "meetings_insert" ON meetings FOR INSERT
WITH CHECK (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
);

CREATE POLICY "meetings_delete" ON meetings FOR DELETE
USING (
  team_id = coalesce((SELECT current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'team_id'), '')
  OR
  (select is_supervisor())
);


COMMIT;
