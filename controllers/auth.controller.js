const passport = require("passport");

const User = require("../models/user.model");

const { AppError } = require("../utils/errors.util");
const sendMail = require("../utils/send_mail.util");

function login(req, res, next) {
  passport.authenticate("local", function (server_err, user, info) {
    if (server_err) {
      return next(server_err); // some server error
    }

    if (!user) {
      /*
      if user is not setup, means the login was not successful
      user entered wrong details
      error_msg is setup in our passport-init.service.js file
      render auth/login page
      */
      const err = new AppError({
        message: info.error_msg,
        shortMsg: "login-failed",
        statusCode: info.statusCode ?? 404,
        targetUri: "/auth/login",
      });

      return next(err);
    }

    req.logIn(user, function (err) {
      if (err) {
        return next(err); // some login issues at server end, so throw a server error
      }

      return res.redirect("/");
    });
  })(req, res, next);
}

async function signup(req, res, next) {
  passport.authenticate("local-signup", function (server_err, user, info) {
    if (server_err) {
      return next(server_err); // some server error
    }

    if (!user) {
      /*
      if user is not setup, means the login was not successful
      user entered wrong details
      error_msg is setup in our passport-init.service.js file
      render auth/signup page
      */
      const err = new AppError({
        message: info.error_msg,
        statusCode: info.statusCode ?? 404,
        targetUri: "/auth/signup",
      });

      return next(err);
    }

    req.logIn(user, async function (err) {
      if (err) {
        // here some login issues might have occurred at server end, so throw a server error
        return next(err);
      }

      await user.save();
      res.redirect("/auth/verify");
    });
  })(req, res, next);
}

async function request_to_send_mail(req, res, next) {
  try {
    const dataFromMail = sendMail(req.user.email);
    const mailSent = dataFromMail.mailSent;

    if (mailSent) {
      // if mail is sent, then save the otp sent to the mail, in a signed cookie
      res.cookie("otp", dataFromMail.otp, {
        maxAge: 15 * 60 * 1000, // 15 mins
        signed: true,
      });

      return res.render("auth/verify", {
        mailJustSent: true,
        success_msg: "Mail sent succcessfully, please check and enter the OTP",
      });
    } else {
      throw new AppError({
        statusCode: 400, // as the mail id might be incorrect
        shortMsg: "verification-mail-not-sent",
        message:
          "Mail could not be sent! Please try again with different mail id or try again later..",
        targetUri: "/auth/verify",
      });
    }
  } catch (e) {
    if (e instanceof AppError) {
      return next(e);
    }

    return next(
      new AppError({
        statusCode: 400, // as the mail id might be incorrect
        shortMsg: "verification-mail-not-sent",
        message:
          "Mail could not be sent! Please try again with different mail id or try again later..",
        targetUri: "/auth/verify",
      })
    );
  }
}

async function verify_otp(req, res, next) {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      throw new AppError({
        statusCode: 400, // Bad request, user provided is not valid
        message: "Please signup before requesting for email verification..",
        shortMsg: "invalid-user",
        targetUri: "/auth/signup",
      });
    }

    const otpEntered = req.body.otp ?? "0";

    // check if otp entered is same as otp set by server
    if (parseInt(otpEntered) === parseInt(req.signedCookies.otp ?? -1)) {
      /*
      either get the otp set by server from signed cookies or if not present, then compare with -1,
      which will obviously return false, as the otp set by server is a positive 6-digit integer..
      */
      await User.updateOne(
        {
          email: req.user.email,
        },
        {
          $set: {
            isVerified: true,
          },
        }
      );

      return res.redirect("/");
    } else {
      throw new AppError({
        statusCode: 400, // Bad request
        message: "Invalid OTP entered.. Please try again..",
        shortMsg: "invalid-otp",
        targetUri: "/auth/verify",
      });
    }
  } catch (e) {
    /*
      There can be different places where the error might have been thrown:
      
      1. Invalid otp -- thrown when otp check returned false
      2. Invalid user -- when the request is bad, or manipulated..
      3. While save function is called -- It will throw error in mongoose model itself, in pre hook of save. 
    */
    if (e instanceof AppError) {
      return next(e);
    }

    return next(
      new AppError({
        statusCode: 409,
        // 409 conflict : meaning that the request could not be completed, as conflicts are there with state of resource.
        message: "Error in creating the account! Please try again..",
        targetUri: "/auth/signup",
      })
    );
  }
}

module.exports = {
  login,
  signup,
  verify_otp,
  request_to_send_mail,
};