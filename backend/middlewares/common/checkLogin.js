import jwt from "jsonwebtoken";

export function authGuard(req, res, next) {
  let cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (cookies) {
    try {
      const token = cookies[process.env.COOKIE_NAME];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
      if (res.locals.html) {
        res.locals.loggedinUser = decoded;
      }
      next();
    } catch (error) {
      if (res.locals.html) {
        res.redirect("/");
      } else {
        return res.status(401).json({
          errors: {
            common: {
              msg: "Authentication failure!",
            },
          },
        });
      }
    }
  } else {
    if (res.locals.html) {
      res.redirect("/");
    } else {
      return res.status(401).json({
        errors: {
          common: {
            msg: "Authentication failure!",
          },
        },
      });
    }
  }
}

export function redirectLoggedInUser(req,res,next){
    
    const token=req.signedCookies[process.env.COOKIE_NAME];
    if(!token){
        next();
    }else{
        try{
            jwt.verify(token,process.env.JWT_SECRET);
            res.redirect("/dashboard");
        }catch(error){
            return next();
        }
    }
        
}
