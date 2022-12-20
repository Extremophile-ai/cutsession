import { IUser } from "../interface/user.interface";
import userStoreService from "../service/user-store.service";
import merchantStoreService from "../service/merchant-store.service";
import { Imerchant } from "../interface/merchant.interface";

export default {
  validateCreateUserData(user: IUser) {
    if(!user.name) {
      throw new Error("please enter a name")
    }

    if(!user.password) {
      throw new Error("please enter a password")
    }

    if(!user.email || !user.email.includes("@")) {
      throw new Error("please enter a valid email")
    }

    if(!user.username) {
      throw new Error("please enter a username")
    }

    if(!user.dob || !this.isValidDob(user.dob)) {
      throw new Error("please enter your date of birth in format: yyyy-mm-dd")
    }

    return user
  },

  isValidDob(dob: string) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return false;
    }

    let parts = dob.split("-");
    let yearOfBirth = parseInt(parts[0]);
    let currentYear = new Date().getFullYear();

    if(currentYear < yearOfBirth) {
      return false
    }
    return true
  },

  async emailTaken(email: string) {
    let users = await userStoreService.fetchAllUsers();
    let merchants = await merchantStoreService.fetchAllMerchants()

    if(users.length || merchants.length) {
      const user = users.filter((data: IUser) => data.email.toLowerCase() === email.toLowerCase());
      const merchant = merchants.filter((data: Imerchant) => data.email.toLowerCase() === email.toLowerCase());
      if(user.length || merchant.length) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  },

  async usernameTaken(username: string) {
    try {
      let users = await userStoreService.fetchAllUsers();
      let merchants = await merchantStoreService.fetchAllMerchants();
      if(users.length || merchants.length) {
        const user = users.filter((data: IUser) => data.username.toLowerCase() === username.toLowerCase());
        const merchant = merchants.filter((data: Imerchant) => data.username.toLowerCase() === username.toLowerCase());
        if(user.length || merchant.length) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    } catch (error) {
      throw error
    }
  },

  validateClientLoginData(email: string, password: string, accessType: string) {
    if(!password) {
      throw new Error("password is required to login")
    }

    if(!email || !email.includes("@")) {
      throw new Error("a valid email is required")
    }

    if(!accessType) {
      throw new Error("access type is required")

    }
    return {email, password}
  },

  validateCreateMerchantData(merchant: Imerchant) {
    if(!merchant.name) {
      throw new Error("please enter a name")
    }
    
    if(!merchant.password) {
      throw new Error("please enter a password")
    }
    if(!merchant.cityOfOperation) {
      throw new Error("please enter a city of operation")
    }

    if(!merchant.email || !merchant.email.includes("@")) {
      throw new Error("please enter a valid email")
    }
    if(!merchant.username) {
      throw new Error("please enter a username")
    }
    return merchant
  },

  validateSessionTimeSlots(startsAt: string, endsAt: string, type: string) {
    try {
      if(!startsAt || !endsAt || !type ) {
        throw new Error("you require a start time, an end time and a type to create a session")
      }

      // Parse start time into desired format
      let startTime = startsAt.split("Z").join("");
      const startTimeHr = Number(startTime.split(":")[0]);
      const startTimeMin = Number(startTime.split(":")[1]);
      const startTimeSec = Number(startTime.split(":")[2]);
      let timeOne = new Date();
      timeOne.setHours(startTimeHr);
      timeOne.setMinutes(startTimeMin);
      timeOne.setSeconds(startTimeSec);
      const startTimeMilliseconds = timeOne.getTime();

      // parse end time into desired format
      let endTime = endsAt.split("Z").join("")
      const endTimeHr = Number(endTime.split(":")[0]);
      const endTimeMin = Number(endTime.split(":")[1]);
      const endTimeSec = Number(endTime.split(":")[2]);
      let timeTwo = new Date();
      timeTwo.setHours(endTimeHr);
      timeTwo.setMinutes(endTimeMin);
      timeTwo.setSeconds(endTimeSec);
      const endTimeMilliseconds = timeTwo.getTime();

      // get time difference
      let diff = Math.abs(endTimeMilliseconds - startTimeMilliseconds);
      diff = Math.floor(diff / 1000 / 60);
      if(type === "WeekDay" && startTimeHr >=9 && endTimeHr <= 19) {
        return this.validateDuration(diff, startTimeHr, endTimeHr)
      } else if(type === "WeekEnd" && startTimeHr >= 10 && endTimeHr <= 21) {
        return this.validateDuration(diff, startTimeHr, endTimeHr)
      } else {
        throw new Error("sessions must be between 9am to 8pm on week days and 10am to 10pm on weekends")
      }
    } catch (error) {
      throw error
    }
  },

  validateDuration(time: number, startTimeHr: number, endTimeHr: number) {
    const hrDiff = endTimeHr - startTimeHr;
    if(hrDiff < 2) {
      let validDurations = [45, 60, 90]
      if(validDurations.includes(time)) {
        return true
      } else {
        throw new Error("sessions must have duration between 40, 60 or 90 minutes")
      }
    } else {
      throw new Error("start and end times for each session must be less than 2 hours apart")
    }
  }
}