BEGIN;

-- Add missing indexes to foreign keys
CREATE INDEX IF NOT EXISTS comments_team_id_idx ON comments(team_id);
CREATE INDEX IF NOT EXISTS files_team_id_idx ON files(team_id);
CREATE INDEX IF NOT EXISTS meetings_team_id_idx ON meetings(team_id);
CREATE INDEX IF NOT EXISTS tasks_team_id_idx ON tasks(team_id);
CREATE INDEX IF NOT EXISTS team_emails_team_id_idx ON team_emails(team_id);
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);

COMMIT;
