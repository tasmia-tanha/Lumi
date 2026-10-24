import mongoose from "mongoose";

const sessionSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"People",
        required:true,
    },
    duration:{
        type:Number,
        required:true,
        min:0
    },
},
{
    timestamps:true
}
)

export const FocusSession=mongoose.model("Session",sessionSchema);