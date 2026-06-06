import mongoose, { Schema, Document } from 'mongoose';

export interface IPassenger {
  name: string;
}

export interface IBooking {
  bookingRef: string;
  email: string;
  phone: string;
  passengers: IPassenger[]; // one booking (PNR) covers 1..N passengers / seats
  bookedAt: Date;
  status: 'confirmed' | 'cancelled';
}

export interface ISchedule extends Document {
  flightNumber: string;
  aircraft: string;
  totalSeats: number;
  origin: string;
  destination: string;
  departureUTC: Date;
  arrivalUTC: Date;
  price: number;
  bookings: IBooking[];
}

const PassengerSchema = new Schema<IPassenger>(
  { name: { type: String, required: true, trim: true } },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>({
  bookingRef: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  passengers: { type: [PassengerSchema], required: true },
  bookedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
});

const ScheduleSchema = new Schema<ISchedule>(
  {
    flightNumber: { type: String, required: true, index: true },
    aircraft: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    origin: { type: String, required: true, index: true },
    destination: { type: String, required: true, index: true },
    departureUTC: { type: Date, required: true, index: true },
    arrivalUTC: { type: Date, required: true },
    price: { type: Number, required: true },
    bookings: { type: [BookingSchema], default: [] },
  },
  { timestamps: true }
);

// Compound index for flight search
ScheduleSchema.index({ origin: 1, destination: 1, departureUTC: 1 });

// Enforce globally-unique booking references at the database level.
ScheduleSchema.index({ 'bookings.bookingRef': 1 }, { unique: true, sparse: true });

const Schedule =
  (mongoose.models.Schedule as mongoose.Model<ISchedule>) ||
  mongoose.model<ISchedule>('Schedule', ScheduleSchema);

export default Schedule;
