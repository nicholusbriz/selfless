const mongoose = require('mongoose');
require('dotenv').config();

async function testConversationId() {
  console.log('🧪 Testing Conversation ID Fix');
  console.log('=' .repeat(50));
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/selfless-app');
    
    // Message schema
    const MessageSchema = new mongoose.Schema({
      senderId: String,
      receiverId: String,
      content: String,
      messageType: String,
      read: Boolean,
      timestamp: Date,
      senderName: String,
      receiverName: String,
    });
    
    const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);
    
    // User IDs
    const yourId = '69e9e4c30e6a27c9a9750352';
    const tonnyId = '69ea15300e570037885e8fdd';
    
    // Generate conversation ID like the frontend does
    const participantIds = [yourId, tonnyId].sort();
    const conversationId = `conv-${participantIds[0]}-${participantIds[1]}`;
    
    console.log(`\n🎯 Generated Conversation ID: ${conversationId}`);
    
    // Test the API logic
    const extractedIds = conversationId.replace('conv-', '').split('-');
    console.log(`📝 Extracted IDs: ${extractedIds.join(', ')}`);
    
    // Verify the ID format
    if (extractedIds.length === 2) {
      console.log(`✅ Valid conversation ID format`);
      
      // Find messages using the same logic as the API
      const messages = await MessageModel.find({
        $or: [
          { senderId: extractedIds[0], receiverId: extractedIds[1] },
          { senderId: extractedIds[1], receiverId: extractedIds[0] }
        ]
      }).sort({ timestamp: 1 });
      
      console.log(`\n💬 Found ${messages.length} messages with this ID format`);
      
      if (messages.length > 0) {
        console.log(`✅ SUCCESS! Tonny should now see your message`);
        console.log(`\n📱 What Tonny should do:`);
        console.log(`1. Login as kiwanukatonny@gmail.com`);
        console.log(`2. Click "Open Chat"`);
        console.log(`3. Click "Users" tab`);
        console.log(`4. Find "Turyamureba Nicholus"`);
        console.log(`5. Click to start conversation`);
        console.log(`6. Should see your message: "${messages[0].content}"`);
      } else {
        console.log(`❌ No messages found`);
      }
    } else {
      console.log(`❌ Invalid conversation ID format`);
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConversationId();
