import express from "express";
import userController from "../controller/user.controller";
import merchantController from "../controller/merchant.controller";
import Authentication from "../middleware/auth.middleware";


const router = express.Router();
const {authenticate} = Authentication
const {
  createNewUser,
  loginClient,
  bookASession,
  getSessionBookings,
  getClients
} = userController;

const {
  createNewMerchant,
  createMerchantSession,
  getMerchantStudioSessions
} = merchantController;

router.post("/register/users", createNewUser);
router.post("/register/merchants", createNewMerchant);
router.post("/sing-in", loginClient);
router.post("/bookings", authenticate, bookASession);
router.post("/studios/:merchantId", createMerchantSession);

router.get("/clients", getClients);
router.get("/bookings", getSessionBookings);
router.get("/studios/:merchantId", getMerchantStudioSessions);


export default router;