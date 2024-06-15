var express = require("express");
var router = express.Router();

/* GET todos listing. */

module.exports = function (db) {
  const Todo = db.collection("todos");
  const { ObjectId } = require("mongodb");

  router.get("/", async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 0;
      const title = req.query.title || "";
      const sortBy = req.query.sortBy || "_id";
      const sortMode = req.query.sortMode || "-1";
      const executor = req.query.executor;
      const startdateDeadline = req.query.startdateDeadline;
      const enddateDeadline = req.query.enddateDeadline;
      const complete = req.query.complete

      const sort = {};
      const where = {};

      if (executor) where.executor = new ObjectId(executor);

      if (sortBy) sort[sortBy] = sortMode == "-1" ? "-1" : "1";

      if (title) {
        where.title = {
          $regex: new RegExp(title),
        };
      }

      if (startdateDeadline) {
        where.deadline
          ? (where.deadline.$gte = startdateDeadline)
          : (where.deadline = { $gte: startdateDeadline });
      }

      if (enddateDeadline) {
        where.deadline
          ? (where.deadline.$lte = enddateDeadline)
          : (where.deadline = { $lte: enddateDeadline });
      }

      if (complete) {
        where.complete = JSON.parse(complete)
      }

      const offset = (page - 1) * limit;

      const todo = await Todo.find(where)
        .limit(limit)
        .skip(offset)
        .sort(sort)
        .toArray();
      const total = await Todo.countDocuments(where);
      const pages = limit ? Math.ceil(total / limit) : 1;

      res.json({
        todo,
        total,
        pages,
        page,
        limit,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const todo = await Todo.find({ _id: new ObjectId(id) }).toArray();
      res.json(todo);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { title, complete, deadline, executor } = req.body;

      if (!title || !complete || !deadline || !executor)
        throw new Error("todo must filled");
      const insert = await Todo.insertOne({
        title,
        complete: JSON.parse(complete),
        deadline,
        executor: new ObjectId(executor),
      });
      const result = await Todo.find({
        _id: new ObjectId(insert.insertedId),
      }).toArray();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      let todo = await Todo.find({ _id: new ObjectId(id) }).toArray();
      if (!todo.length) throw new Error("todo does'nt exists");
      if (req.body.complete) req.body.complete = JSON.parse(req.body.complete);
      await Todo.updateOne({ _id: new ObjectId(id) }, { $set: req.body });
      todo = await Todo.find({ _id: new ObjectId(id) }).toArray();
      res.json(todo);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const del = await Todo.deleteOne({ _id: new ObjectId(id) });
      res.json(del);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.delete("/many/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const del = await Todo.deleteMany({ executor: new ObjectId(id) });
      res.json(del);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


  return router;
};
