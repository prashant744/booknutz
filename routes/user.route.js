const express = require("express");

const { perform_logout_or_delete } = require("../controllers/user.controller");

const router = express.Router();

router.get("/logout", (req, res) => {
  return res.render("user/logout");
});

router.get("/delete", (req, res) => {
  return res.render("user/delete");
});

router.post("/logout", (req, res, next) =>
  perform_logout_or_delete(req, res, next, "logout")
);

router.post("/delete", (req, res, next) =>
  perform_logout_or_delete(req, res, next, "delete")
);

module.exports = router;