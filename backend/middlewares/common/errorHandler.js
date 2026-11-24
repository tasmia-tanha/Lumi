import createError from "http-errors";

export function notFoundHandler(req, res, next) {
  const acceptsHtml = req.accepts("html");

  if (acceptsHtml) {
    res.locals.html = true;
  }

  next(createError(404, "Your requested content was not found"));
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;

  const isDevelopment = process.env.NODE_ENV === "development";

  const error = {
    message: isDevelopment
      ? err.message
      : status === 404
        ? "Your requested content was not found."
        : "Something went wrong. Please try again later.",
    status,
    ...(isDevelopment && { stack: err.stack }),
  };

  if (res.locals.html) {
    return res.status(status).render("error", {
      title: "Error Page",
      error,
    });
  }

  return res.status(status).json({
    errors: {
      common: {
        msg: error.message,
      },
    },
  });
}