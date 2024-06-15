var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  const { limit, query } = req.query;

  res.render("index", { limit, query });
});

router.get("/users/:id/todos", (req, res) => {
  const { title, complete, startdateDeadline, enddateDeadline } = req.query;

  res.render("todos", { title, complete, startdateDeadline, enddateDeadline });
});

module.exports = router;
