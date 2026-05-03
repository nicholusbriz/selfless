const mongoose = require('mongoose');
require('dotenv').config();

async function debugMessages() {
  console.log('🔍 Debugging Message System');
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
    
    // Find messages between you and Tonny
    const yourId = '69e9e4c30e6a27c9a9750352'; // Your ID
    const tonnyId = '69ea15300e570037885e8fdd'; // Tonny's ID
    
    console.log(`\n📧 Checking messages between:`);
    console.log(`   You: ${yourId}`);
    console.log(`   Tonny: ${tonnyId}`);
    
    // Find all messages between these two users
    const messages = await MessageModel.find({
      $or: [
        { senderId: yourId, receiverId: tonnyId },
        { senderId: tonnyId, receiverId: yourId }
      ]
    }).sort({ timestamp: 1 });
    
    console.log(`\n💬 Found ${messages.length} messages:`);
    
    messages.forEach((msg, index) => {
      console.log(`\n${index + 1}. Message:`);
      console.log(`   From: ${msg.senderName} (${msg.senderId})`);
      console.log(`   To: ${msg.receiverName} (${msg.receiverId})`);
      console.log(`   Content: ${msg.content}`);
      console.log(`   Time: ${msg.timestamp}`);
      console.log(`   Read: ${msg.read}`);
    });
    
    if (messages.length > 0) {
      console.log(`\n🎯 Expected Conversation ID:`);
      const participantIds = [yourId, tonnyId].sort();
      const expectedConvId = `conv-${participantIds[0]}-${participantIds[1]}`;
      console.log(`   ${expectedConvId}`);
      
      console.log(`\n📝 Test Conversation ID Formats:`);
      console.log(`   conv-${yourId}-${tonnyId}`);
      console.log(`   conv-${tonnyId}-${yourId}`);
      console.log(`   ${expectedConvId}`);
    }
    
    await mongoose.disconnect();
    
    console.log(`\n🔧 Issue Analysis:`);
    if (messages.length > 0) {
      console.log(`✅ Messages exist in database`);
      console.log(`❌ Problem: Conversation ID format mismatch`);
      console.log(`💡 Solution: Fix conversation ID generation in frontend`);
    } else {
      console.log(`❌ No messages found between these users`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugMessages();
