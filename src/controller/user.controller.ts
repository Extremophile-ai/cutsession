import { Request, Response } from "express";
import dotenv from "dotenv";
import validation from "../validation";
import { IUser } from "../interface/user.interface";
import userService from "../service/user.service"
import utilService from "../service/util.service";
import merchantService from "../service/merchant.service";
import { IRequest } from "../interface/IRequest.interface";

dotenv.config();

export default {
  async createNewUser(req: Request, res: Response) {
    try {
      const { name, password, email, dob, cityOfResidence, phoneNumber, username } = req.body;
      const userData = {
        name,
        password,
        email,
        dob,
        cityOfResidence,
        phoneNumber,
        username
      } as IUser;
      const validateUserData = validation.validateCreateUserData(userData);
      if(validateUserData) {
        const emailTaken = await validation.emailTaken(userData.email);
        if(!emailTaken) {
          const usernameTaken = await validation.usernameTaken(userData.username);
          if(!usernameTaken) {
            const createUser = await userService.createUser(userData);
            const token = utilService.generateToken(createUser.userId as string)
            return res.status(201).json({ message: "new user created", data: createUser, token })
          } else {
            throw new Error("username already taken")
          }
        } else {
          throw new Error("email already taken")
        }
      }
    } catch (error: any) {
      return res.status(400).json({error: error.message})
    }
  },

  async loginClient(req: Request, res: Response) {
    try {
      const { email, password, accessType } = req.body;
      const validateUserData = validation.validateClientLoginData(email, password, accessType);
      if(validateUserData) {
        if(accessType === "USER") {
          const user = await userService.loginUser(email, password);
          return res.status(200).json({userId: user.userId, token: user.token})
        } 

        if(accessType === "MERCHANT") {
          const merchant = await merchantService.loginMerchant(email, password);
          return res.status(200).json({merchantId: merchant.merchantId, token: merchant.token})
        }

      } 
    } catch (error: any) {
      return res.status(400).json({error: error.message})
    }
  },

  async getClients(req: Request, res: Response) {
    try {
      const {type, limit, offset, city, name } = req.query;
      if(type) {
        const newlimit = Number(limit) || 20
        const newOffset = Number(offset) || 1
        const users = await userService.fetchUsers(type as string, newlimit, newOffset, city as string, name as string);
        return res.status(200).json({count: users.length, data: users})
      } else {
        throw new Error("please enter a user type to retrieve")
      }
    } catch (error: any) {
      return res.status(400).json({error: error.message})
    }
  },

  async bookASession(req: IRequest, res: Response) {
    try {
      const userId = req.decoded?.id as string;
      const { sessionId, date, notes, title } = req.body;
      const bookSession = await userService.bookSession(userId, sessionId, date, notes, title )
      return res.status(200).json({bookingId: bookSession.bookingId, bookingRef: bookSession.bookingRef})
    } catch (error: any) {
      return res.status(400).json({error: error.message})
    }
  },

  async getSessionBookings(req: Request, res: Response) {
    try {
      const { city, merchant, period, limit, offset } = req.query;
      if(city) {
        let bookedSessions = await userService.retrieveStudioSessionsByCity(city as string, merchant as string, period as string)
        const newlimit = Number(limit) || 20
        const newOffset = Number(offset) || 1

        const paginateBookedSessions = utilService.getDataPage(bookedSessions, newlimit, newOffset)
        return res.status(200).json({count: paginateBookedSessions.length, data: paginateBookedSessions })
      } else {
        throw new Error("please enter a city to search")
      }

    } catch (error: any) {
      return res.status(400).json({error: error.message})
    }
  }
}