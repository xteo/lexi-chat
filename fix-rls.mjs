import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zbabcmgcevtqrnsfltfp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYWJjbWdjZXZ0cXJuc2ZsdGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDgyNTU1MiwiZXhwIjoyMDcwNDAxNTUyfQ.7Q0GGrbV9KZbJyxPOdcsRJIjddqON9xKQwrOZwObOq0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  console.log('Fixing RLS policies for messages table...\n');

  // Drop existing policies
  const dropPolicies = [
    "DROP POLICY IF EXISTS \"Users can read messages from their chats\" ON messages",
    "DROP POLICY IF EXISTS \"Users can insert messages in their chats\" ON messages",
    "DROP POLICY IF EXISTS \"Users can delete messages from their chats\" ON messages"
  ];

  for (const sql of dropPolicies) {
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) console.log('Drop policy error (may be ok if not exists):', error.message);
  }

  // Create new policies
  const createPolicies = [
    `CREATE POLICY "Users can read messages from their chats" 
     ON messages FOR SELECT 
     USING (
       EXISTS (
         SELECT 1 FROM chats 
         WHERE chats.id = messages.chat_id 
         AND (chats.user_id = auth.uid() OR chats.visibility = 'public')
       )
     )`,
    
    `CREATE POLICY "Users can insert messages in their chats" 
     ON messages FOR INSERT 
     WITH CHECK (
       EXISTS (
         SELECT 1 FROM chats 
         WHERE chats.id = messages.chat_id 
         AND chats.user_id = auth.uid()
       )
     )`,
    
    `CREATE POLICY "Users can delete messages from their chats" 
     ON messages FOR DELETE 
     USING (
       EXISTS (
         SELECT 1 FROM chats 
         WHERE chats.id = messages.chat_id 
         AND chats.user_id = auth.uid()
       )
     )`
  ];

  for (const sql of createPolicies) {
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) {
      console.error('Error creating policy:', error);
    } else {
      console.log('Policy created successfully');
    }
  }

  console.log('\nRLS policies fixed!');
}

fixRLSPolicies().catch(console.error);