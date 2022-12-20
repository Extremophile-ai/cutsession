import { Request, Response } from "express";
import dotenv from "dotenv";
import {Imerchant} from "../interface/merchant.interface";
import merchantServices from "../service/merchant.service";
import validation from "../validation";
import utilService from "../service/util.service"

dotenv.config();

export default {
  async createNewMerchant(req: Request, res: Response) {
    try {
      const { name, email, password, cityOfOperation, phoneNumber, username } = req.body;
      const merchantData = {
        name,
        email,
        password,
        cityOfOperation,
        phoneNumber,
        username
      } as Imerchant;
      const validatemerchantData = validation.validateCreateMerchantData(merchantData);
      if(validatemerchantData) {
        const emailTaken = await validation.emailTaken(merchantData.email);
        if(!emailTaken) {
          const usernameTaken = await validation.usernameTaken(merchantData.username);
          if(!usernameTaken) {
            const createmerchant = await merchantServices.createMerchant(merchantData);
            const token = utilService.generateToken(createmerchant.merchantId as string)
            return res.status(201).json({ message: "new merchant created", data: createmerchant, token })
          } else {
            throw new Error("username already taken");
          }
        } else {
          throw new Error("email already taken");
        }
      }
    } catch (error: any) {
      return res.status(400).json({error: error.message})
    }
  },

  async createMerchantSession(req: Request, res: Response) {
    try {
      const {merchantId} = req.params;
      const {type, startsAt, endsAt} = req.body;
      const validateSessionData = validation.validateSessionTimeSlots(startsAt, endsAt, type);
      if(validateSessionData) {
        const createSession = await merchantServices.createSession(merchantId, startsAt, endsAt, type);
        return res.status(201).json({message: "session created successfully", sessionId: createSession.id})
      }
    } catch (error: any) {
      return res.status(400).json({error: error.message})
    }
  },

  async getMerchantStudioSessions(req: Request, res: Response) {
    try {
      const {merchantId} = req.params;
      const sessions = await merchantServices.fetchMerchantStudioSession(merchantId);
      return res.status(200).json({message: "sessions retrieved", sessions})
    } catch (error: any) {
      return res.status(400).json({error: error.message})
    }
  }
}