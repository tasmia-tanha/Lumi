export function decorateHtml(page_title){
    return function(req,res,next){
        res.locals.html=true;
        res.locals.title=page_title;
        next(); 
    }
}