
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;

app.use(bodyParser.json());

db.on("error", ()=>{
    console.log("Error while connecting to data base");
})

db.once("open",()=>{
    console.log("Connected to MongoDB Successfully");
})


require("./Routes/userRoutes")(app);
require("./Routes/authRoutes")(app);
require("./Routes/ticketRoutes")(app);
app.listen(process.env.PORT,()=>{
    console.log(`Application running on port ${process.env.PORT}`);
})




