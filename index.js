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
    const applicationCollection = jobCollection.collection("applications");

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
      const name = req.body.name;
      const post = req.body.namePost;
      const email = req.body.email;
      const file = req.files.file;
      const fileData = file.data;
      const encodedFile = fileData.toString("base64");
      const fileBuffer = Buffer.from(encodedFile, "base64");
      const application = {
        name,
        email,
        post,
        file: fileBuffer,
      };
      const result = await applicationCollection.insertOne(application);
      console.log(result);
      res.json(result);
    });
    //get applications
    app.get("/applications", async (req, res) => {
      const cursor = applicationCollection.find({});
      const application = await cursor.toArray();
      res.send(application);
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
