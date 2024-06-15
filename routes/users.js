var express = require("express");
var router = express.Router();

/* GET users listing. */

module.exports = function (db) {
  const User = db.collection("users");
  const { ObjectId } = require("mongodb");

  router.get("/", async (req, res) => {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 0
      const query = req.query.query || ""
      const sortBy = req.query.sortBy || "_id";
      const sortMode = req.query.sortMode || '1'

      const sort = {}
      const where = {};

      if (sortBy) {
        sort[sortBy] = sortMode == "1" ? "1" : "-1" 
      }

      if (query) {
        where.name = {
          $regex: new RegExp(query)
        }
      }

      const offset = (page - 1) * limit;

      const user = await User.find(where).limit(limit).skip(offset).sort(sort).toArray();
      const total = await User.countDocuments(where);
      const pages = limit ? Math.ceil(total / limit) : 1

      res.json({
        user,
        total,
        pages,
        page,
        limit,
        offset
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.find({ _id: new ObjectId(id) }).toArray();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { name, phone } = req.body;
      if (!name || !phone) throw new Error("user must filled");
      const insert = await User.insertOne({ name, phone });
      const result = await User.find({
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
      let user = await User.find({ _id: new ObjectId(id) }).toArray();
      if (!user.length) throw new Error("user does'nt exists");
      await User.updateOne({ _id: new ObjectId(id) }, { $set: req.body });
      user = await User.find({ _id: new ObjectId(id) }).toArray();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.find({ _id: new ObjectId(id) }).toArray();
      if (!user.length) throw new Error("user does'nt exists");
      const del = await User.deleteOne({ _id: new ObjectId(id) });
      res.json(del);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
