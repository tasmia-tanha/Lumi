import Task from "../models/task.js";


export async function addTasks(req, res, next) {
  try {
    const { title } = req.body;

    const task = await Task.create({
      title: title,
      user:req.user._id
    });

    res.redirect("/task");
  } catch (error) {
        console.log(error.message);
        return res.status(500).send("Internal Sever Error");
  }
}

export async function getTasks(req,res,next) {

    try{
        const tasks=await Task.find({
            user:req.user._id
        })

        res.render("task",{ tasks });
    }catch(error){
        next(error);
    }
    
}

export async function updateTasks(req,res,next) {
    try{
        const {completed}=req.body;
        const task=await Task.findOneAndUpdate(
        {
            _id:req.params.id,
            user:req.user._id,
        },
        {
            completed:completed,
        },
        {
            returnDocument: 'after',
            runValidators:true,
        }
        );

        if(!task){
           return res.status(404).send("Task not found");
        }

        res.json({task});
    }catch(error){
        next(error);
    }
}
