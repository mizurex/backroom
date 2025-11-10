import mongoose, { Schema, Document } from 'mongoose';

export interface MessageDocument extends Document {
  roomId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
}

const messageSchema = new Schema<MessageDocument>({
  roomId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

// Auto-delete messages 4 hours after creation
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 4 });

export const MessageModel = mongoose.model<MessageDocument>('Message', messageSchema);

