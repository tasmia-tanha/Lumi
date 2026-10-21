import mongoose from "mongoose";

const taskSchema=mongoose.Schema({
    
    title:{
        type:String,
        require:true,
        trim:true,
    },
    completed:{
        type:Boolean,
        default:false,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"People",
        require:true,
    }
    },
    {
        timestamps:true
    }
)

const task=mongoose.model("Task",taskSchema);
export default task;