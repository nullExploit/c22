var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.render("index");
});

router.get("/users/:id/todos", (req, res) => {
  res.render("todos");
});

module.exports = router;
