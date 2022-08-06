const { fetch_all_books } = require("../services/books.service");
const { AppError } = require("../utils/errors.util");

async function passGlobalVarsToEjsPage(req, res, next) {
  try {
    const books = await fetch_all_books();

    res.locals = {
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,

      // req.user is set and unset by passport authentication
      user: req.user, // this passes the current user if any, else undefined
      // in case of undefined, the ejs pages will check user locals value and will render respective actions for non-logged in users.
      books,
    };

    return next(); // call the next middleware to run for that request
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }

    return next(
      new AppError({
        message: "Unable to fetch the ebooks.. Please try again later!",
        shortMsg: "failed-fetching-ebooks",
        statusCode: 500,
        targetUri: "/",
      })
    );
  }
}

module.exports = {
  passGlobalVarsToEjsPage,
};