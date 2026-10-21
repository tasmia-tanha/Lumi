import Task from "../models/task.js";


export async function addTasks(req, res, next) {
  try {
    const { title,priority } = req.body;

    const task = await Task.create({
      title: title,
      priority:priority,
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
        const activeTasks=await Task.find({
            user:req.user._id,
            completed:{$ne:true},
        })

        const completedTasks=await Task.find({
            user:req.user._id,
            completed:true,
        })

        res.render("task",{ activeTasks,completedTasks });
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


export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
}

