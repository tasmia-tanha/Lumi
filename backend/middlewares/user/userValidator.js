import { check,validationResult} from "express-validator";
import people from "../../models/people.js";


export const userValidation = [
  check("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Name is required")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("Name must not contain anythg other than alphabet")
    ,

  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (value) => {
      
        const user = await people.findOne({ email: value });
        if (user) {
            throw new Error("email alredy in use!")
        }

        return true;
      
    }),

    check("password")
    .isStrongPassword({
        minLength:8,
        minLowercase:1,
        minUppercase:1,
        minNumbers:1,
        minSymbols:1
    })
    .withMessage("Password must be of 8 characters and contain at least 1 lowercase,1 uppercase,1 number and 1 symbol")
];


export const addUserValidatorHandler=function(req,res,next){
    const errors=validationResult(req);
    const mappedErrors=errors.mapped();

    if(Object.keys(mappedErrors).length===0){
        next();
    }else{
        res.status(500).json({
            errors:mappedErrors
        })
    }
}