require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;
// middlewere
app.use(cors());
app.use(express.json());

// vulnerable-information
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@mrb.saeddyn.mongodb.net/?appName=MRB`;
// vulnerable-information ^

// mongodb connector

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("vento-ai");
    const latestCollection = db.collection("latest_models");
    const modelCollection = db.collection("models");

    app.get("/latest_models", async (req, res) => {
      const result = await latestCollection.find().toArray();

      res.send(result);
    });

    app.get("/models", async (req, res) => {
      try {
        const search = req.query.search || "";
        const framework = req.query.framework || "All";

        const query = {};

        if (search) {
          query.name = { $regex: search, $options: "i" };
        }

        if (framework !== "All") {
          query.frameworl = framework;
        }

        const result = await modelCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        res.send(result);
      } catch (error) {
        console.error("Error fetching models:", error);
        res.status(500).send({ message: "Error fetching models" });
      }
    });

    app.post("/models", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await modelCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You are successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// mongodb connector ^

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
