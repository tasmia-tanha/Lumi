import createError from "http-errors";
import { title } from "node:process";

export function notFoundHandler(req,res,next){
    next(createError(404,"Your requested content was not found"));
}

export function errorHandler(err,req,res,next){
    
    res.locals.error=process.env.NODE_ENV==="development"?err:res.json({message:err.message});

    res.status(err.status||500);

    if(res.locals.html){
        res.render("error",{
            title:"Erorr Page"
        });
    }else{
        res.json(res.locals.error);
    }
}