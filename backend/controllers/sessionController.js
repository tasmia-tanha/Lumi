import { FocusSession } from "../models/focusSession.js";
export function getFocusSession(req,res,next){
    res.render("focusSession")
}


export async function saveFocusSession(req,res,next) {
    try{
        const {duration}=req.body;
        const session=await FocusSession.create({
            user:req.user._id,
            duration
        });

        res.status(201).json({
            message:"Study sesson saved successfully",
            data:session
        });
    }catch(error){
        next(error);
    }
}

export async function getTotalStudyTime(req,res,next) {
    try{
        const sessions=await FocusSession.find({
            user:req.user._id,
        }).select("duration");

        const totalMilliseconds=sessions.reduce(
            (total,session)=>
                total+session.duration,0
            
        );
        res.json({
            totalMilliseconds
        })
    }catch(error){
        next(error);
    }
}