const express = require('express');
const app = express();
require("dotenv").config()  ;
const dbConfig = require('./config/dbConfig');
app.use(express.json());
const userRoute = require('./routes/userRoute');
const empRoute = require('./routes/empRoute');
const cors = require("cors");


//cors
app.use(cors())

app.use('/api/user', userRoute);
app.use('/api/employer', empRoute);
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));

