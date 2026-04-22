import * as mongoose from 'mongoose';

export const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  },
);
