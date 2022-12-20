import fs from "fs";
import {ISession} from "../interface/session.interface";


export default {
  async createNewSession(sessionData: ISession) {
    try {
      let sessions = await this.fetchAllSessions();
      if(sessions.length) {
        sessions.push(sessionData);
      } else {
        sessions = [sessionData];
      }
      fs.writeFileSync("src/dbStore/sessions.json", JSON.stringify(sessions));
    } catch (error) {
      throw error;
    }
  },

  async fetchMerchantSessions(merchantId: string) {
    try {
      const allSessions = await this.fetchAllSessions();
      let merchantSessions: ISession[] = [];
      if(allSessions.length) {
        merchantSessions = allSessions.filter(session => session.merchantId.toString() === merchantId.toString());
      }
      return merchantSessions;
    } catch (error) {
      throw error;
    }
  },

  async fetchSessionById(sessionId: string) {
    try {
      const sessions = await this.fetchAllSessions();
      if(sessions.length) {
        const session = sessions.filter(data => data.id.toString() === sessionId.toString());
        if(session.length) {
          return session[0];
        } else {
          throw new Error("session not found");
        }
      } else {
        throw new Error("sessions not available at the moment");
      }
    } catch (error) {
      throw error;
    }
  },

  async fetchAllSessions() {
    try {
      let existingSessions = fs.readFileSync("src/dbStore/sessions.json", "utf-8");
      let sessions: ISession[] = [];
      if(existingSessions.length) {
        sessions = JSON.parse(existingSessions);
      }
      return sessions;
    } catch (error) {
      throw error;
    }
  }
}