import fs from "fs";
import {IUser} from "../interface/user.interface";


export default {
  async createNewUser(userData: IUser) {
    try {
      let users = await this.fetchAllUsers()
      if(users.length) {
        users.push(userData)
      } else {
        users = [userData]
      }
      fs.writeFileSync("src/dbStore/user.json", JSON.stringify(users));
    } catch (error) {
      console.log("error =>", error)
      throw error
    }
  },

  async fetchAllUsers() {
    try {
      let existingUsers =  fs.readFileSync("src/dbStore/user.json", "utf-8");
      let users: IUser[]  = []
      if(existingUsers.length) {
        users = JSON.parse(existingUsers)
      }
      return users
    } catch (error) {
      throw error
    }
  },

  async getUserByEmail(email: string) {
    let users = await this.fetchAllUsers();
    if(users.length) {
      const user = users.filter((data: IUser) => data.email.toLowerCase() === email.toLowerCase());
      if(user.length) {
        return user[0]
      } else {
        throw new Error("no user account associated with this email")
      }
    } else {
      throw new Error("user not found")
    }
  }
}