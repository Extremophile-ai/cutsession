import fs from "fs";
import {IBooking} from "../interface/booking.interface"

export default {
  async createBokings(bookingData: IBooking) {
    try {
      let bookings = await this.fetchAllBookings()
      if(bookings.length) {
        bookings.push(bookingData)
      } else {
        bookings = [bookingData]
      }
      fs.writeFileSync("src/dbStore/booking.json", JSON.stringify(bookings));
    } catch (error) {
      throw error
    }
  },

  async fetchAllBookings() {
    try {
      let existingBookings =  fs.readFileSync("src/dbStore/booking.json", "utf-8");
      let bookings: IBooking[] = [];
      if(existingBookings.length) {
        bookings = JSON.parse(existingBookings)
      }
      return bookings;
    } catch (error) {
      console.log("booking error =>", error)
      throw error
    }
  },

  async fetchBookingsBySessionIds(sessionIds: string[]) {
    try {
      const bookings = await this.fetchAllBookings();
      let bookedSessions = []
      for(let sessionId of sessionIds) {
        const booking = bookings.find(data => data.sessionId === sessionId);
        if(booking) {
          bookedSessions.push(booking)
        }
      };
      return bookedSessions
    } catch (error) {
      throw error
    }
  }
}