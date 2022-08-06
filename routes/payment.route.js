const express = require("express");

const { purchase_book_controller } = require("../controllers/books.controller");
const {
  allow_signedin_users_only,
  allow_verified_users_only,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/",
  allow_signedin_users_only,
  allow_verified_users_only,
  purchase_book_controller
);

module.exports = router;