const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.Payment_Api_Key);
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173"] }));

const uri = `mongodb+srv://${process.env.Db_user}:${process.env.Db_pass}@cluster0.2m0rny5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //    await client.connect();
    const usersCollection = await client.db("flowMate").collection("users");
    const paymentsCollection = await client
      .db("flowMate")
      .collection("payments");
    const subscribeCollection = await client
      .db("flowMate")
      .collection("subscribers");
    const membersCollection = await client.db("flowMate").collection("members");

    app.post("/users", async (req, res) => {
      const query = req.body;
      const email = query?.email;
      const isExiting = await await usersCollection.findOne({ email });
      if (isExiting) {
        return res.status(400).send({ message: "Exiting the user" });
      }
      const result = await usersCollection.insertOne(query);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    // create payment

    app.post("/create-payment-intent", async (req, res) => {
      try {
        const { price } = req.body;
        const amount = parseInt(price * 100);

        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          payment_method_types: ["card"],
          currency: "usd",
        });

        console.log("Payment Intent Created:", paymentIntent);
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).send({ message: "Failed to create payment intent" });
      }
    });
    app.post("/payment", async (req, res) => {
      try {
        const payment = req.body;
        const result = await paymentsCollection.insertOne(payment);
        res.send(result);
      } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).send({ message: "Failed to process payment" });
      }
    });
    //   create-member post api
    app.post("/create-member", async (req, res) => {
      const query = req.body;
      const result = await membersCollection.insertOne(query);
      res.send(result);
    });
    //   create-member get api
    app.get("/create-member", async (req, res) => {
        const result = await membersCollection.find().toArray();
        res.send(result);
      });
    // contact us
    app.post("/contact", async (req, res) => {
      const query = req.body;
      const result = await contactCollection.insertOne(query);
      res.send(result);
    });
    // contact us get api
    app.post("/contact", async (req, res) => {
      const result = await contactCollection.find().toArray();
      res.send(result);
    });
    // subscribe post api
    app.post("/subscribe", async (req, res) => {
      const query = req.body;
      const result = await subscribeCollection.insertOne(query);
      res.send(result);
    });
    // subscribe get api
    app.get("/subscribe", async (req, res) => {
      const result = await subscribeCollection.find().toArray();
      res.send(result);
    });

    //    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Welcome the server");
});

app.listen(port, () => {
  console.log(`ami tor bap server ${port}`);
});
