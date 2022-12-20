import fs from "fs";
import {Imerchant} from "../interface/merchant.interface"

export default {
  async createNewMerchant(merchantData: Imerchant) {
    try {
      let merchants = await this.fetchAllMerchants()
      if(merchants.length) {
        merchants.push(merchantData)
      } else {
        merchants = [merchantData]
      }
      fs.writeFileSync("src/dbStore/merchant.json", JSON.stringify(merchants));
    } catch (error) {
      throw error
    }
  },

  async fetchAllMerchants() {
    try {
      let existingmerchants =  fs.readFileSync("src/dbStore/merchant.json", "utf-8");
      let merchants: Imerchant[] = [];
      if(existingmerchants.length) {
        merchants = JSON.parse(existingmerchants)
      }
      return merchants;
    } catch (error) {
      console.log("merchant error =>", error)
      throw error
    }
  },

  async getMerchantByEmail(email: string) {
    let merchants = await this.fetchAllMerchants();
    if(merchants.length) {
      const merchant = merchants.filter((data: Imerchant) => data.email.toLowerCase() === email.toLowerCase());
      if(merchant.length) {
        return merchant[0]
      } else {
        throw new Error("no merchant account is associated with this email")
      }
    } else {
      throw new Error("user not found")
    }
  },

  async getMerchantById(merchantId: string) {
    let merchants = await this.fetchAllMerchants();
    if(merchants.length) {
      const merchant = merchants.filter((data: Imerchant) => data.merchantId?.toString() === merchantId.toString());
      if(merchant.length) {
        return merchant[0]
      } else {
        throw new Error("merchant not found")
      }
    };
  },
}