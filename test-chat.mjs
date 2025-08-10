import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zbabcmgcevtqrnsfltfp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYWJjbWdjZXZ0cXJuc2ZsdGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjU1NTIsImV4cCI6MjA3MDQwMTU1Mn0.zZj8shPVf1AjjnpNsIKwHnbqCWrA1NgO8UGaYoGcOrs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChatOperations() {
  console.log('Testing Supabase chat operations...\n');

  // Test authentication
  console.log('1. Testing authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.log('No authenticated user (expected for anonymous test)');
  } else {
    console.log('Authenticated user:', user?.email);
  }

  // Test creating a guest user
  console.log('\n2. Creating guest session...');
  const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
  if (signInError) {
    console.error('Error creating guest session:', signInError);
    return;
  }
  console.log('Guest session created:', signInData.user?.id);

  // Test creating a chat
  console.log('\n3. Creating a test chat...');
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .insert({ 
      user_id: signInData.user.id, 
      title: 'Test Chat from Script' 
    })
    .select()
    .single();

  if (chatError) {
    console.error('Error creating chat:', chatError);
    return;
  }
  console.log('Chat created:', { id: chat.id, title: chat.title });

  // Test creating a message
  console.log('\n4. Creating a test message...');
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      chat_id: chat.id,
      role: 'user',
      parts: [{ type: 'text', text: 'Hello from test script!' }],
      attachments: []
    })
    .select()
    .single();

  if (messageError) {
    console.error('Error creating message:', messageError);
    return;
  }
  console.log('Message created:', { id: message.id, role: message.role });

  // Test fetching messages
  console.log('\n5. Fetching messages for chat...');
  const { data: messages, error: fetchError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chat.id);

  if (fetchError) {
    console.error('Error fetching messages:', fetchError);
    return;
  }
  console.log(`Found ${messages.length} message(s)`);

  // Test updating chat visibility
  console.log('\n6. Updating chat visibility...');
  const { error: updateError } = await supabase
    .from('chats')
    .update({ visibility: 'public' })
    .eq('id', chat.id);

  if (updateError) {
    console.error('Error updating chat:', updateError);
    return;
  }
  console.log('Chat visibility updated to public');

  // Clean up - delete test data
  console.log('\n7. Cleaning up test data...');
  await supabase.from('messages').delete().eq('chat_id', chat.id);
  await supabase.from('chats').delete().eq('id', chat.id);
  console.log('Test data cleaned up');

  console.log('\n✅ All tests passed successfully!');
}

testChatOperations().catch(console.error);