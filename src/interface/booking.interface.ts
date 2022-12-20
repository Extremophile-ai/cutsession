export interface IBooking {
  bookingId: string,
  bookingRef: string,
  userId: string,
  sessionId: string,
  date: string,
  startsAt?: string,
  endsAt?: string,
  notes?: string,
  title?: string
}