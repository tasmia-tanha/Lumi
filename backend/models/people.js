import mongoose from "mongoose";

const peopleSchema=mongoose.Schema({
    name:{
        type:String,
        require:true,
        trim:true
    },
    email:{
        type:String,
        require:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        require:true
    }
    },
    {
        timeStamps:true
    }
);

const people=mongoose.model("People",peopleSchema);

export default people;