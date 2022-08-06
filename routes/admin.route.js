const express = require("express");

const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.get("/", adminController.admin_fetch_books_controller);

module.exports = router;