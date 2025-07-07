
-- Fix the ai_settings table constraint to allow the correct request_type values for support_requests
-- The support_requests table needs different values than ai_settings, so let's check what values are actually used

-- First, let's see what constraint exists on support_requests table
-- If there's a constraint preventing 'question', 'technical_issue', 'feature_request', we need to fix it

-- Check if there's a constraint on request_type in support_requests table and fix it
ALTER TABLE public.support_requests DROP CONSTRAINT IF EXISTS support_requests_request_type_check;

-- Add the correct constraint for support_requests table
ALTER TABLE public.support_requests 
ADD CONSTRAINT support_requests_request_type_check 
CHECK (request_type IN ('question', 'technical_issue', 'feature_request'));
