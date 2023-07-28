const express = require('express');
const app = express();
require("dotenv").config()  ;
const dbConfig = require('./config/dbConfig');
app.use(express.json());
const userRoute = require('./routes/userRoute');
const empRoute = require('./routes/empRoute');
const adminRoute = require('./routes/adminRoute');
const cors = require("cors");


//cors
app.use(cors({ 
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST","PATCH"],
  credentials: true
}));

app.use('/user', userRoute);
app.use('/employer', empRoute);
app.use('/admin', adminRoute);
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));

