import bcrypt from "bcrypt";
import userStoreService from "./user-store.service";
import bookingStoreService from "./booking-store.service";
import sessionStoreService from "./session-store.service";
import {IUser} from "../interface/user.interface";
import utilServices from "./util.service";
import merchantService from "./merchant.service";
import merchantStoreService from "./merchant-store.service";

export default {
  async createUser(user: IUser) {
    try {
      const password = user.password as string
      const hashPassword = bcrypt.hashSync(password, 10);
      const userId = utilServices.generateIds()
      let userData = {
        password: hashPassword,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dob: user.dob,
        userId,
        cityOfResidence: user.cityOfResidence,
        username: user.username
      } as IUser 
      userStoreService.createNewUser(userData)
      return {
        name: userData.name,
        email: userData.email,
        userId: userData.userId,
        cityOfResidence: userData.cityOfResidence
      }
    } catch (error) {
      throw error
    }
  },

  async loginUser(email: string, password: string) {
    try {
      const user = await userStoreService.getUserByEmail(email)
      if(user) {
        const verifyPassword = await bcrypt.compare(password, user.password as string);
				if (verifyPassword) {
					const token = utilServices.generateToken(user.userId as string);
          return {
            userId: user.userId,
            token
          }
        } else {
          throw new Error("you entered a wrong password")
        }
      } else {
        throw new Error("user not found")
      }
    } catch (error) {
      throw error
    }
  },

  async fetchUsers(type: string, limit: number, offset: number, city?: string, name?: string) {
    try {
      let users: any[] = []
      if(type === "USER") {
        users = await userStoreService.fetchAllUsers()
        if(users.length && city) {
          users = users.filter(data => data.cityOfResidence.toLowerCase() === city.toLowerCase())
        }
      } 

      if(type === "MERCHANT") {
        users = await merchantStoreService.fetchAllMerchants();
        if(users.length && city) {
          users = users.filter(data => data.cityOfOperation.toLowerCase() === city.toLowerCase())
        }
      }

      if(users?.length){
        if(name) {
          users = users.filter(data => data.name === name)
        }
        const data = utilServices.getDataPage(users, limit, offset)
        return data
      } else {
        throw new Error("no user found")
      }
    } catch (error) {
      throw error
    }
  },

  async bookSession(userId: string, sessionId: string, date: string, notes?: string, title?: string) {
    try {
      const bookedSessions = await bookingStoreService.fetchAllBookings();
    const sessionBooked = bookedSessions.filter(bookedSession => bookedSession.sessionId === sessionId && bookedSession.date === date);
    if(sessionBooked.length) {
      throw new Error("sorry, this session is already booked for this date")
    }

    const session = await sessionStoreService.fetchSessionById(sessionId);
    const bookingId = utilServices.generateIds();

    const getBookingRef = await utilServices.generateBookingRef(date, bookingId)
    const bookingData = {
      bookingId,
      bookingRef: getBookingRef,
      sessionId,
      date,
      userId,
      notes,
      title,
      startsAt: session.startsAt,
      endsAt: session.endsAt
    }
    await bookingStoreService.createBokings(bookingData)
    return bookingData
    } catch (error) {
      throw error
    }
    
  },

  async retrieveStudioSessionsByCity(city: string, merchant?: string, period?: string) {
    try {
      const sessions = await merchantService.getSessionByCityOfOperation(city);
      if(sessions.length) {
        const sessionIds = sessions.map(data => data.id)
        let bookings =  await bookingStoreService.fetchBookingsBySessionIds(sessionIds)
        if(merchant) {
          const merchantSessions = await sessionStoreService.fetchMerchantSessions(merchant);
          if(merchantSessions.length){
            const sessionIds = merchantSessions.map(data => data.id)
            bookings = bookings.filter(data =>sessionIds.includes(data.sessionId))
          }
        }

        if(period) {
          const dateRange = period.includes(":");
          if(dateRange) {
            const startsAt = `${period.split("Z:")[0]}Z`;
            const endsAt = `${period.split("Z:")[1]}`
            bookings = bookings.filter(data => data.startsAt === startsAt && data.endsAt === endsAt)
          } else {
            bookings = bookings.filter(data => data.date === period)
          }
        }
        return bookings
      } else {
        return []
      }
    } catch (error) {
      throw error
    }
  }

}