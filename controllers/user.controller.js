const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const { AppError } = require("../utils/errors.util");

async function perform_logout_or_delete(req, res, next, action) {
  try {
    const saved_email = req.user.email;
    const saved_password = req.user.password;
    const entered_email = req.body.email;
    const entered_password = req.body.password;

    // password is in the hashed form in saved_password variable, but guessedPassword is not in the hashed form
    const isPasswordMatching = await bcrypt.compare(
      entered_password,
      saved_password
    );

    if (isPasswordMatching === false || saved_email !== entered_email) {
      throw new AppError({
        message: "Please enter valid email/password to process this request..",
        shortMsg: "invalid-credentials-entered",
        statusCode: 400,
        targetUri: `/user/${action}`,
      });
    } else if (isPasswordMatching === true && saved_email === entered_email) {
      if (action === "delete") {
        existing_user = await User.findOne({ email: entered_email });
        existing_user.remove();
      }

      req.logout((err)=>{
        if (err) {
          throw new AppError({
            shortMsg: `${action}-failed-err`,
            statusCode: 500,
            targetUri: "/",
            message: `Cannot perform the ${action} request. Please try again later!!`,
          })
        }

        res.redirect("/");
      });
    }
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    } else {
      return next(
        new AppError({
          shortMsg: `${action}-failed-err`,
          statusCode: 500,
          targetUri: "/",
          message: `Cannot perform the ${action} request. Please try again later!!`,
        })
      );
    }
  }
}

module.exports = {
  perform_logout_or_delete,
};