const VideoController = require('./video.controller');

const videoValidation = require('./video.validation');
const validate = require('../../shared/utils/validation');
const Routes = require('express').Router();

Routes.get("/getVideos", VideoController.getVideos);

Routes.get("/", VideoController.getVideoById);

Routes.get("/delete", VideoController.deleteVideoByYid)
//work in proggress
Routes.get("/search", VideoController.VideoSearchTo)




module.exports = Routes;