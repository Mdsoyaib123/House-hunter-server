const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
var jwt = require("jsonwebtoken");
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

// House-hunter
// AugyBZt0MdBdoKZY

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2amfc4s.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // collection
    const userCollection = client.db("House-hunters").collection("users");

    const bookingCollection = client
      .db("House-hunters")
      .collection("bookingData");

    const houseDataCollection = client
      .db("House-hunters")
      .collection("houseData");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      // console.log('user',user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "24h",
      });
      res.send(token);
    });

    app.post("/checkCurrentUser", async (req, res, next) => {
      const localToken = req.body.token;
      if (!localToken) {
        return res.send({ message: "please login " });
      }
      jwt.verify(
        localToken,
        process.env.ACCESS_TOKEN_SECRET,
        (error, decoded) => {
          if (error) {
            return res.status(401).send({ message: "unAuthorized access" });
          }
          // console.log('decoded token ',decoded);
          req.user = decoded;
        }
      );
      const email = req.user.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.post("/LoginToken", async (req, res) => {
      const LoginTokenData = req.body;
      const email = LoginTokenData.email;
      const password = LoginTokenData.password;
      const query = { email: email };
      const LoginData = await userCollection.findOne(query);
      if (LoginData) {
        const token = jwt.sign(
          LoginTokenData,
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "24h" }
        );

        res.send(token);
      }
    });

    app.post("/users", async (req, res) => {
      const userData = req.body;
      const email = userData.email;
      const query = { email: email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "email already exist", insertedId: null });
      }
      const result = await userCollection.insertOne(userData);
      res.send(result);
    });

    app.get("/houseDataCount", async (req, res) => {
      const totalUser = await houseDataCollection.estimatedDocumentCount();
      res.send({ totalUser });
    });
    app.get("/houseData", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page);
      console.log("pagination data", page, size);
      const result = await houseDataCollection
        .find()
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });
    app.get("/houseDetail/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await houseDataCollection.findOne(query);
      res.send(result);
    });
    app.get("/updateHouseData/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await houseDataCollection.findOne(query);
      res.send(result);
    });
    app.post("/houseData", async (req, res) => {
      const houseData = req.body;
      const result = await houseDataCollection.insertOne(houseData);
      res.send(result);
    });

    app.put("/houseDataEdit/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          houseName: data.houseName,
          address: data.address,
          roomSize: data.roomSize,
          city: data.city,
          Bedrooms: data.Bedrooms,
          Bathrooms: data.Bathrooms,
          Picture: data.Picture,
          PhoneNumber: data.PhoneNumber,
          rentPerMonth: data.rentPerMonth,
          des: data.des,
        },
      };

      const result = await houseDataCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.delete("/houseDataDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await houseDataCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/bookingData", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });

    app.post("/bookingData", async (req, res) => {
      const bookingData = req.body;
      const maximanBooking = await bookingCollection.find().toArray();
      if (maximanBooking.length >= 2) {
        res.send({ message: "You can book maximum 2 house" });
      } else {
        const result = await bookingCollection.insertOne(bookingData);
        res.send(result);
      }
    });

    app.delete("/bookingData/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
