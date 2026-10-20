import { check, validationResult } from "express-validator"
export const loginValidation=[
    check("username")
    .trim()
    .isLength({
        min:1
    })
    .withMessage("Name or email is required!"),

    check("password")
    .trim()
    .isLength({min:1})
    .withMessage("Password is required")

]

export const loginValidatorHandler=function (req,res,next){
    const errors=validationResult(req);
    const mappedErrors=errors.mapped();

    if(Object.keys(mappedErrors).length===0){
        next();
    }else{
        res.render("login",{
            data:{
                username:req.body.username
            },
            errors:mappedErrors
        })
    }
}