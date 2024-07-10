const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const dbName = "tododb";

async function main() {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);

  return db;
}

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

async function launch() {
    const db = await main();
    const Todo = db.collection("todos");

    const insertedData = [];

    for (let i = 0; i < 150; i++) {
      insertedData.push({
        title: `title ke ${i}`,
        complete: false,
        deadline: new Date(+new Date() + Number(`8640${i}000`)).toLocaleString("af-ZA"),
        executor: new ObjectId("6684e367bfa2e9dad1c4c279"),
      });
    }

    await Todo.insertMany(insertedData);
    console.log("success");
    process.exit(0)
}

launch()
