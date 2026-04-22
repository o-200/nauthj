import { Document } from 'mongoose';

export interface Notification extends Document {
  readonly title: string;
  readonly data: object;
}
