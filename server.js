const bodyParser = require('body-parser');
const express  = require('express');
const app = express();
require('dotenv').config();
app.use(bodyParser.json());
const PORT = process.env.PORT ||3000;

app.listen(PORT , ()=>{
console.log(`Server Running on Port : ${PORT}`);
})
