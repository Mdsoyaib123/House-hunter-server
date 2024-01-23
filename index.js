const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
var jwt = require('jsonwebtoken');
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
    
    
    app.post('/jwt',async(req,res)=>{
      const user = req.body 
      // console.log('user',user);
      const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET,{expiresIn:'24h'})
      res.send(token) 
      
     })

     app.post('/checkCurrentUser',async(req,res,next)=>{
      const localToken = req.body.token  
      if(!localToken){
        return res.send({message:'please login '})
      }
      jwt.verify(localToken,process.env.ACCESS_TOKEN_SECRET,(error,decoded)=>{
        if(error){
          return res.status(401).send({ message: "unAuthorized access" });
        }
        // console.log('decoded token ',decoded);
        req.user = decoded
        
      })
      const email =  req.user.email
      const query = {email:email}
      const result = await userCollection.findOne(query)
      res.send(result)
      
     })

     app.post('/LoginToken',async(req,res)=>{
      const LoginTokenData = req.body 
      const email = LoginTokenData.email 
      const password = LoginTokenData.password 
      const query = {email:email}
      const LoginData = await userCollection.findOne(query)
      if(LoginData){
        const token = jwt.sign(LoginTokenData , process.env.ACCESS_TOKEN_SECRET,{expiresIn:'24h'})

      res.send(token)

      }
     })

    app.post("/users", async (req, res) => {
      const userData = req.body;
      const email = userData.email
      const query = {email:email}
      const existingUser =await userCollection.findOne(query);
      if(existingUser){
        return res.send({ message: "email already exist", insertedId: null });
      }
      const result = await userCollection.insertOne(userData);
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
