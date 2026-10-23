import mongoose from "mongoose";

const taskSchema=mongoose.Schema({
    
    title:{
        type:String,
        required:true,
        trim:true,
    },
    completed:{
        type:Boolean,
        default:false,
    },
    priority:{
        type:String,
        enum:["high","medium","low"],
        default:"meduim",
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"People",
        required:true,
    }
    },
    {
        timestamps:true
    }
)

const task=mongoose.model("Task",taskSchema);
export default task;