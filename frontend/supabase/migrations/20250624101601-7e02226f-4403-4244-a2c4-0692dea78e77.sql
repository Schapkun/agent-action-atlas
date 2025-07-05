
-- Add sender_email column to workspaces table
ALTER TABLE public.workspaces 
ADD COLUMN sender_email text;

-- Add comment to explain the column
COMMENT ON COLUMN public.workspaces.sender_email IS 'Email address used for sending emails from this workspace. Falls back to organization company_email if not set.';
