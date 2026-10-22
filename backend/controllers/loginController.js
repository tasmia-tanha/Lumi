import people from "../models/people.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
export function getLogin(req,res,next){
    res.render("login")
}


export async function login(req,res,next){
    try{
        const {username,password}=req.body;

        const user=await people.findOne({
            $or:[
                {name:username},
                {email:username}
            ]
        })

        if(user){
            const isValidPassword=await bcrypt.compare(password,user.password);

            if(isValidPassword){
                const userObj={
                    _id:user._id,
                    name:user.name,
                    email:user.email,
                    
                }

                const token=jwt.sign(userObj,process.env.JWT_SECRET,{
                    expiresIn:process.env.JWT_EXPIRES
                });

                res.cookie(process.env.COOKIE_NAME,token,{
                    maxAge:process.env.JWT_EXPIRES,
                    httpOnly:true,
                    signed:true
                })

                res.locals.loggedinUser=userObj;

                res.redirect("/dashboard");
            }else{
                throw new Error("Wrong password!")
            }
        }else{
            throw new Error("User not found!")
        }
    }catch(error){
         console.log("LOGIN ERROR:", error.message);
        res.render("login",{
            data:{
                username:req.body.username
            },
            errors:{
                common:{
                    msg:error.message
                }
            }
        })
    }
}

export function logout(req,res){
    res.clearCookie(process.env.COOKIE_NAME,{
        signed:true,
        httpOnly:true
    });
     return res.status(200).json({ message: "Logged out successfully" });
}