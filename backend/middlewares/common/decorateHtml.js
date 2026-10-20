export function decorateHtml(page_title){
    return function(req,res,next){
        res.set("Cache-Control", "no-store");
        res.locals.html=true;
        res.locals.title=page_title;
        res.locals.loggedinUser={};
        res.locals.data={};
        res.locals.errors={};
        
        next(); 
    }
}