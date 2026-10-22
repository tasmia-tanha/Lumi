import Task from "../models/task.js"
export async function getDashboard(req,res,next){
    try {
        const activeTasks=await Task.find({
            user:req.user._id,
            completed:{$ne:true},
        });

        const fourActiveTasks=await Task.find({
            user:req.user._id,
            completed:{$ne:true},
        }).sort({createdAt:-1}).limit(4);


        res.render("dashboard",{activeTasks,fourActiveTasks});

    } catch (error) {
        next(error);
    }
    
    
    
}


export async function getTasksAsJson(req,res,next) {
    try {
        const activeTasks=await Task.find({
            user:req.user._id,
            completed:{$ne:true},
        });

        res.json({activeTasks});
    } catch (error) {
        next(error);
    }
}
