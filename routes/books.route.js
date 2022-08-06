const express = require("express");

const {
  allow_signedin_users_only,
  allow_admins_only,
} = require("../middlewares/auth.middleware");

const {
  view_book_controller,
  stream_book_cover_controller,
  upload_book_controller,
  delete_book_controller,
} = require("../controllers/books.controller");

const router = express.Router();

router.get("/:bookId/view", allow_signedin_users_only, view_book_controller);

router.get("/:bookId/cover", stream_book_cover_controller);

router.post("/upload", allow_admins_only, upload_book_controller);

router.delete("/:bookId", allow_admins_only, delete_book_controller);

module.exports = router;