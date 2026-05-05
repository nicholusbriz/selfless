import mongoose from 'mongoose';

// Reaction schema
const ReactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

//Message schema 
const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text'], default: 'text' },
  timestamp: { type: Date, default: Date.now },
  senderName: { type: String, required: true },
  receiverName: { type: String, required: true },
  reactions: [ReactionSchema],
});

export const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export { ReactionSchema };
