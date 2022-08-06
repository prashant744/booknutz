const express = require("express");

const {
  allow_signedout_users_only,
  allow_signedin_users_only,
  allow_non_verified_users_only,
} = require("../middlewares/auth.middleware");

const authController = require("../controllers/auth.controller");

const router = express.Router();

router.get("/login", allow_signedout_users_only, (req, res) => {
  res.render("auth/login");
});

router.post("/login", allow_signedout_users_only, authController.login);

router.get("/signup", allow_signedout_users_only, (req, res) => {
  res.render("auth/signup");
});

router.post("/signup", allow_signedout_users_only, authController.signup);

router.get(
  "/verify",
  allow_signedin_users_only,
  allow_non_verified_users_only,
  (req, res) => {
    return res.render("auth/verify");
  }
);

router.post(
  "/send-mail",
  allow_signedin_users_only,
  allow_non_verified_users_only,
  authController.request_to_send_mail
);

router.post(
  "/verify",
  allow_signedin_users_only,
  allow_non_verified_users_only,
  authController.verify_otp
);

module.exports = router;