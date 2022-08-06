const { AppError } = require("../utils/errors.util");

function allow_admins_only(req, res, next) {
  if (!req.isAuthenticated()) {
    return next(
      new AppError({
        statusCode: 401,
        message: "Please login as admin, to access the admins-only page..",
        shortMsg: "not-logged-in-as-admin",
        targetUri: "/",
      })
    );
  } else if (req.user !== null && req.user.isAdmin === false) {
    return next(
      new AppError({
        statusCode: 401,
        message: "Only admins can access this page",
        shortMsg: "restricted-access-denied",
        targetUri: "/",
      })
    );
  } else {
    return next();
  }
}

function allow_signedin_users_only(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return next(
      new AppError({
        statusCode: 401,
        message: "Please login/signup to make this request..",
        shortMsg: "not-logged-in",
        targetUri: "/",
      })
    );
  }
}

function allow_signedout_users_only(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    // if already signedin, then redirect to the home page
    return res.redirect("/");
  }
}

function allow_verified_users_only(req, res, next) {
  if (req.isAuthenticated()) {
    // logged in
    if (req.user.isVerified === true) {
      // logged in and verified account
      return next();
    } else {
      // logged in yet unverified account
      return next(
        new AppError({
          message:
            "Only users with verified accounts can make this request. Please verify the email address to continue..",
          shortMsg: "non-verified-email-restricted",
          statusCode: 401,
          targetUri: "/",
        })
      );
    }
  } else {
    // not logged in
    return next(
      new AppError({
        statusCode: 401,
        message: "Please login/signup to make this request..",
        shortMsg: "not-logged-in",
        targetUri: "/",
      })
    );
  }
}

function allow_non_verified_users_only(req, res, next) {
  if (req.isAuthenticated()) {
    // logged in
    if (req.user.isVerified === false) {
      // logged in and unverified account
      return next();
    } else {
      // logged in but verified account, so don't allow to proceed further
      return next(
        new AppError({
          message:
            "Only users with non-verified accounts can make this request..",
          shortMsg: "verified-account-restricted",
          statusCode: 401,
          targetUri: "/",
        })
      );
    }
  } else {
    // not logged in
    return next(
      new AppError({
        statusCode: 401,
        message: "Please login/signup to make this request..",
        shortMsg: "not-logged-in",
        targetUri: "/",
      })
    );
  }
}

module.exports = {
  allow_admins_only,
  allow_signedin_users_only,
  allow_signedout_users_only,
  allow_verified_users_only,
  allow_non_verified_users_only,
};