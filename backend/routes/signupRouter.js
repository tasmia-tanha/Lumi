import express from "express";
import {getSignUp,createUser} from "../controllers/signUpController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import {userValidation,addUserValidatorHandler} from "../middlewares/user/userValidator.js";
const router=express.Router();

router.get("/",decorateHtml("SignUp Page"),getSignUp);
router.post("/",userValidation,addUserValidatorHandler,createUser);

export default router;