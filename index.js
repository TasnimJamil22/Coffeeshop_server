const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;




//middleware
app.use(cors());
app.use(express.json());



 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yz4qi.mongodb.net/?retryWrites=true&w=majority`;
 

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
     const coffeeCollection = client.db("coffeeshop").collection("coffeedetails");
     const ordersCollection = client.db('Orders').collection("confirmedOrders");

     app.post('/addcoffee',async(req,res)=>{
        const newCoffee = req.body;
        const result = await coffeeCollection.insertOne(newCoffee);
        res.send(result);
     })

     app.get('/services',async(req,res)=>{
        const cursor = coffeeCollection.find();
        const result = await cursor.toArray();
        res.send(result);
     })

      app.get('/services/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const options = {
          projection: {name: 1, price: 1, img: 1}
        }
        const result = await coffeeCollection.findOne(query,options);
        console.log(result);
        res.send(result);
      })

      app.post('/checkout', async(req,res)=>{
        const checkOut = req.body;
        console.log(checkOut);
        const result = await ordersCollection.insertOne(checkOut);
        res.send(result);
      })
 
       
       

    //  orders
      app.get('/mycart',async(req,res)=>{
        let query= {};
        console.log(query);
        if(req.query?.email){
          query = {email:req.query.email};
        }
        const result = await ordersCollection.find(query).toArray();
        res.send(result);
      })
      
       
      app.delete('/mycart/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await ordersCollection.deleteOne(query);
        res.send(result);
      })


    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('coffee shop server is running');
})


 app.listen(port, ()=>{
    console.log('coffee shop server is running on port ',port)
 })