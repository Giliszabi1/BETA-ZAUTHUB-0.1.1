const ChannelController = require('./channel.controller');

const Routes = require('express').Router();

Routes.get("/", ChannelController.getChannelInfo)
Routes.get("/video", ChannelController.getChannelVideos)

module.exports = Routes;