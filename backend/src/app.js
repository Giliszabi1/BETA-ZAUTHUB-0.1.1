const express = require('express');
const cors = require('cors');

const app = express();

const modules = require("./modules/init");

const middlewares = require('./middleware/init');

app.use(express.json())
app.use(cors());

//middleware
middlewares.start()

//modules
app.use("/api", modules);

module.exports = app;