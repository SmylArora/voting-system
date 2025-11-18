const express  = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();
const bodyParser = require('body-parser');
const { jwtAuthMiddleware } = require('./jwt');

app.use(bodyParser.json());
const PORT = process.env.PORT ||3000;
const userRoutes = require('./src/routes/userRoutes');
const candidateRoutes = require('./src/routes/candidateRoutes');

app.use('/user', userRoutes);
app.use('/candidate' ,candidateRoutes);


app.listen(PORT , ()=>{
console.log(`Server Running on Port : ${PORT}`);
})
