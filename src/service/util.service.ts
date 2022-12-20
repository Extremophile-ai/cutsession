import { v4 as uuidv4 } from 'uuid';
import jwt from "jsonwebtoken";
import {randomStrategy, derivedStrategy} from "./strategy.service";
import bookingStoreService from "./booking-store.service";

export default {
  generateIds() {
    return uuidv4()
  },
  
  generateToken(id: string){
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
      expiresIn: "30d",
    });
  },

  async generateBookingRef(date: string, bookingId: string) {
    const bookedSessions = await bookingStoreService.fetchAllBookings();
    let bookingRef
    if(bookedSessions.length % 2 === 1){
      bookingRef = derivedStrategy.generateRef(date, bookingId)
    } else {
      bookingRef = randomStrategy.generateRef(date, bookingId)
    }
    return bookingRef
  },

  getDataPage(data: any[], limit: number, offset: number){
    const totalItemLength = data.length;
    const totalPage = Math.ceil(totalItemLength / limit);
    const startIndex = (offset -1) * limit;
    const endIndex = startIndex + limit;
    return data.slice(startIndex, endIndex)
  }
}