import mongoose from 'mongoose';

//Message schema 
const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text'], default: 'text' },
  timestamp: { type: Date, default: Date.now },
  senderName: { type: String, required: true },
  receiverName: { type: String, required: true },
});

// Database indexes for chat performance
MessageSchema.index({ senderId: 1, receiverId: 1 });  // Conversation queries
MessageSchema.index({ timestamp: -1 });              // Message ordering
MessageSchema.index({ senderId: 1 });                  // Sent messages
MessageSchema.index({ receiverId: 1 });                 // Received messages
MessageSchema.index({ senderId: 1, timestamp: -1 });  // User's sent history
MessageSchema.index({ receiverId: 1, timestamp: -1 }); // User's received history

export const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);
