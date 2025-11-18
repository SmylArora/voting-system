const mongoose = require('mongoose');
//define mongodb connection url 
const mongoUrl = 'mongodb://localhost:27017/voter';

//setup mongo-connection
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

//get the default connection
// mongoose maintains a default connection object that respresents the mongoDB connection.
const db = mongoose.connection;
db.on('connected', () => {
    console.log("Database Connected");
})
db.on('disconnected', () => {
    console.log("Database Disconnected");
})
db.on('error', (error) => {
    console.error("Database errored", error);
})

module.exports = db;