import bcrypt from "bcrypt";
import merchantStoreService from "./merchant-store.service";
import {Imerchant} from "../interface/merchant.interface";
import utilServices from "./util.service";
import sessionStoreService from "./session-store.service";
import { ISession } from "../interface/session.interface";

export default {
  async createMerchant(merchant: Imerchant) {
    try {
      const password = merchant.password as string
      const hashPassword = bcrypt.hashSync(password, 10);
      const merchantId = utilServices.generateIds()
      const merchantData = {
        merchantId,
        name: merchant.name,
        email: merchant.email,
        phoneNumber: merchant.phoneNumber,
        cityOfOperation: merchant.cityOfOperation,
        password: hashPassword,
        username: merchant.username
      }
      merchantStoreService.createNewMerchant(merchantData)
      return { 
        name: merchantData.name,
        merchantId: merchantData.merchantId,
        cityOfOperation: merchantData.cityOfOperation,
        email: merchantData.email
      }
    } catch (error) {
      throw error
    }
  },

  async loginMerchant(email: string, password: string) {
    try {
      const merchant = await merchantStoreService.getMerchantByEmail(email)
      if(merchant) {
        const verifyPassword = await bcrypt.compare(password, merchant.password as string);
				if (verifyPassword) {
					const token = utilServices.generateToken(merchant.merchantId as string);
          return {
            merchantId: merchant.merchantId,
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

  async createSession(merchantId: string, startsAt: string, endsAt: string, type: "WeekDay" | "WeekEnd") {
    try {
      const merchantExist = await merchantStoreService.getMerchantById(merchantId);
      if(merchantExist) {
        const merchantStudioSessions = await this.fetchMerchantStudioSession(merchantId);
        if(merchantStudioSessions.length) {
          // check if time slot is available
          const sessionTimeSlotAvailable = merchantStudioSessions.filter(
            data => (data.startsAt === startsAt) && 
            (data.endsAt === endsAt) &&
            (data.type === type)
          );
          if(sessionTimeSlotAvailable.length) {
            throw new Error("session slot already exist");
          } 
        }
  
        const sessionId = utilServices.generateIds();
        const studioSessionData = {
          id: sessionId,
          merchantId,
          startsAt,
          endsAt,
          type
        };
        await sessionStoreService.createNewSession(studioSessionData);
        return studioSessionData
      } else {
        throw new Error("merchant not found")
      }
    } catch (error) {
      throw error
    }
  },

  async fetchMerchantStudioSession(merchantId: string) {
    try {
      const merchantExist = await merchantStoreService.getMerchantById(merchantId);
      if(merchantExist) {
        const sessions = await sessionStoreService.fetchMerchantSessions(merchantId);
        return sessions
      } else {
        throw new Error("merchant not found")
      }
    } catch (error) {
      throw error
    }
  },

  async getSessionByCityOfOperation(city: string) {
    try {
      let merchants = await merchantStoreService.fetchAllMerchants();
      if(merchants.length) {
        merchants = merchants.filter((data: Imerchant) => data.cityOfOperation?.toLowerCase() === city.toLowerCase());
        const merchantsIds = merchants.map(data => data.merchantId as string);
        let sessions: ISession[] = []
        for(let id of merchantsIds) {
          const merchantStudioSessions = await sessionStoreService.fetchMerchantSessions(id);
          sessions.push(...merchantStudioSessions)
        }
        return sessions;
      } else {
        return []
      }
    } catch (error) {
      throw error
    }
  },

}