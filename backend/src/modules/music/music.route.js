const MusicsController = require('./music.controller');

const Routes = require('express').Router();

Routes.get("/getMusics", MusicsController.getMusics);

module.exports = Routes;