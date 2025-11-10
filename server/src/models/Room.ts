import mongoose, { Schema, Document, Types } from 'mongoose';

export interface RoomDocument extends Document {
  roomId: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
}

const roomSchema = new Schema<RoomDocument>({
  roomId: { type: String, required: true, unique: true, index: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Auto-delete rooms 4 hours after last activity (updatedAt)
roomSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 4 });

export const RoomModel = mongoose.model<RoomDocument>('Room', roomSchema);

