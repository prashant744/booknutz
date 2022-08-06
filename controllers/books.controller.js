const {
    fetch_single_book,
    upload_book,
    delete_book,
  } = require("../services/books.service");
  
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const sendMail = require("../utils/send_mail.util");
  
  const { AppError } = require("../utils/errors.util");
  
  async function view_book_controller(req, res, next) {
    try {
      const { book } = await fetch_single_book(req.params.bookId);
  
      return res.render("books/view_book", {
        book,
      });
    } catch (err) {
      if (err instanceof AppError) {
        return next(err);
      }
  
      return next(
        new AppError({
          message:
            "Unable to fetch the requested ebook.. Please try again after sometime!!",
          shortMsg: "failed-fetching-requested-book",
          statusCode: 500,
          targetUri: "/",
        })
      );
    }
  }
  
  async function stream_book_cover_controller(req, res, next) {
    try {
      const { coverImageStream } = await fetch_single_book(req.params.bookId);
      coverImageStream.pipe(res);
    } catch (err) {
      if (err instanceof AppError) {
        return next(err);
      }
  
      return next(
        new AppError({
          message:
            err.message ??
            "Unable to load the cover of the requested ebook.. Please try again after sometime!!",
          shortMsg: err.message ?? "failed-loading-cover",
          statusCode: 500,
          targetUri: "/",
        })
      );
    }
  }
  
  async function upload_book_controller(req, res, next) {
    try {
      await upload_book(req, res);
      return res.redirect("/admin");
    } catch (err) {
      if (err instanceof AppError) {
        return next(err);
      }
  
      return next(
        new AppError({
          message:
            "Could not upload the provided book. Please try again after sometime!!",
          shortMsg: "uploading-ebook-failed",
          statusCode: 500,
          targetUri: "/admin",
        })
      );
    }
  }
  
  async function delete_book_controller(req, res, next) {
    try {
      await delete_book(req.params.bookId);
      return res.redirect("/admin");
    } catch (err) {
      if (err instanceof AppError) {
        return next(err);
      }
  
      return next(
        new AppError({
          message:
            "Unable to delete this ebook. Please try again after sometime!!",
          shortMsg: "deleting-ebook-failed",
          statusCode: 500,
          targetUri: "/admin",
        })
      );
    }
  }
  
  async function purchase_book_controller(req, res, next) {
    try {
      const amount = 50000; // amount is set as Rs. 500.00, which in the stripe is to be inputted as 50000..
      const user = req.user;
  
      // First create customer, then create the charge, then render the payment success page
  
      const customer = await stripe.customers.create({
        email: user.email,
        source: req.body.stripeToken,
      });
  
      await stripe.charges.create({
        amount,
        description: req.body.description,
        currency: "INR",
        customer: customer.id,
      });
  
      const bookId = req.body.purchasedBookId;
  
      user.purchases.unshift(bookId); // adds the newly purchased bookId at the beginning of the list
      await user.save(); // save changes to the user in the database
  
      res.render("books/book_purchase_success");
  
      sendMail(
        user.email,
        "purchase",
        `Congrats ${user.username} on your purchase of ebook(ID: ${bookId}).<br> Thank You`
      );
    } catch (err) {
      if (err instanceof AppError) {
        return next(err);
      }
  
      return next(
        new AppError({
          statusCode: 400, // as mostly user has provided wrong card details
          message:
            "Purchase of the ebook failed. Please contact the admin or try again with other cards!!",
          shortMsg: "purchase-ebook-failed",
          targetUri: "/",
        })
      );
    }
  }
  
  module.exports = {
    view_book_controller,
    stream_book_cover_controller,
    upload_book_controller,
    delete_book_controller,
    purchase_book_controller,
  };