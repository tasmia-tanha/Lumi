
import jwt from "jsonwebtoken";
import People from "../../models/people.js";

export async function authGuard(req, res, next) {
  try {
    const token = req.signedCookies?.[process.env.COOKIE_NAME];

    if (!token) {
      return handleAuthFailure(req, res);
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return handleAuthFailure(req, res);
    }

    const user = await People.findById(decoded._id)
      .select("_id name email tokenVersion");

    if (!user) {
      return handleAuthFailure(req, res);
    }

    // Check whether the token was issued before a password change.
    if ((decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
      return handleAuthFailure(req, res);
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      tokenVersion: user.tokenVersion ?? 0,
    };

    if (res.locals.html) {
      res.locals.loggedinUser = req.user;
    }

    next();
  } catch (error) {
    next(error);
  }
}

function handleAuthFailure(req, res) {
  if (res.locals.html) {
    return res.redirect("/");
  }

  return res.status(401).json({
    errors: {
      common: {
        msg: "Authentication failure!",
      },
    },
  });
}

export async function redirectLoggedInUser(req, res, next) {
  const token = req.signedCookies?.[process.env.COOKIE_NAME];

  if (!token) {
    return next();
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next();
  }

  try {
    const user = await People.findById(decoded._id)
      .select("_id tokenVersion");

    if (
      !user ||
      (decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)
    ) {
      return next();
    }

    return res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
}

