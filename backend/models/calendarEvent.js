import mongoose, { Mongoose } from "mongoose";

const calendarSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"People",
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
    title:{
        type:String,
        maxLength:30,
        trim:true,
    },
    pinned:{
        type:Boolean,
        default:false,
        
    },
    timeEntries:[
        {
            time:{
                type:String,
            },
            description:{
                type:String,
                maxLength:100,
            },
        }
    ]},
    {
        timestamps:true
    }

)
calendarSchema.index({user:1,date:1},{unique:true});
export const calendar=mongoose.model("Calendar",calendarSchema);