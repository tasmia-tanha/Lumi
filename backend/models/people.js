import mongoose from "mongoose";

const peopleSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    }
    },
    {
        timestamps:true
    }
);

const people=mongoose.model("People",peopleSchema);

export default people;