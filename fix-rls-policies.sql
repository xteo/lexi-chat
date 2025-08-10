-- Fix RLS policies for messages table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can read messages from their chats" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can delete messages from their chats" ON messages;

-- Create new policies with proper checks
CREATE POLICY "Users can read messages from their chats" 
ON messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = messages.chat_id 
    AND (chats.user_id = auth.uid() OR chats.visibility = 'public')
  )
);

CREATE POLICY "Users can insert messages in their chats" 
ON messages FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = messages.chat_id 
    AND chats.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages from their chats" 
ON messages FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = messages.chat_id 
    AND chats.user_id = auth.uid()
  )
);