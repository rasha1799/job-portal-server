const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zkh6g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const jobCollection = client.db("jobs");
    const jobs = jobCollection.collection("jobs");
    const applicationsCollection = jobCollection.collection("application");

    //get API
    app.get("/jobs", async (req, res) => {
      const cursor = jobs.find({});
      const job = await cursor.toArray();
      res.send(job);
    });
    // GET Single job
    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific job", id);
      const query = { _id: ObjectId(id) };
      const job = await jobs.findOne(query);
      res.json(job);
    });
    app.post("/applications", async (req, res) => {
      console.log("body", req.body);
      console.log("file", req.files);
      const name = req.body.name;
      const status = req.body.status;
      const email = req.body.email;
      const namePost = req.body.namePost;
      const vaccancy = req.body.vaccancy;
      const id = req.body.job_id;
      const file = req.files.file;
      const fileData = file.data;
      const encodedFile = fileData.toString("base64");
      const fileBuffer = Buffer.from(encodedFile, "base64");
      const application = {
        name,
        email,
        vaccancy,
        namePost,
        status,
        id,
        file: fileBuffer,
      };
      const result = await applicationsCollection.insertOne(application);
      res.json(result);
    });
    //get API
    app.get("/applications", async (req, res) => {
      const cursor = applicationsCollection.find({});
      const application = await cursor.toArray();
      res.send(application);
    });

    app.put("/applications/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      const updateDoc = { $set: { status: "Accepted" } };
      const result = await applicationsCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    app.put("/job/:id", async (req, res) => {
      console.log(req.params.id);
      const filter = { _id: req.params.id };
      console.log(req.body);
      const updateDoc = { $inc: { vaccancy: -1 } };
      const result = await jobs.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running server");
});

app.listen(port, () => {
  console.log("listening on port", port);
});
