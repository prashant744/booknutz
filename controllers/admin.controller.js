const { fetch_all_books } = require("../services/books.service");
const { AppError } = require("../utils/errors.util");

async function admin_fetch_books_controller(req, res, next) {
  try {
    const books = await fetch_all_books();

    return res.render("admin/index", { books });
  } catch (err) {
    return next(
      new AppError({
        statusCode: 500,
        shortMsg: "failed-fetch-ebooks",
        message: "Unable to fetch the ebooks. Please try again later!!",
        targetUri: "/admin",
      })
    );
  }
}

module.exports = {
  admin_fetch_books_controller,
};