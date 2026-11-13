import express from "express";
import {getSignUp,createUser} from "../controllers/signUpController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import {userValidation,addUserValidatorHandler} from "../middlewares/user/userValidator.js";
import { signupLimiter } from "../middlewares/rateLimiter.js";
const router=express.Router();

router.get("/",decorateHtml("SignUp Page"),getSignUp);
router.post("/",signupLimiter,userValidation,addUserValidatorHandler,createUser);

export default router;