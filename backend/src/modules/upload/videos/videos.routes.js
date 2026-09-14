const routes = require('express').Router();

const VideosController = require('./videos.controller');

const validate = require('../../../shared/utils/validation');


const VideosSchemas = require('./videos.validation');
routes.post("/video", validate(VideosSchemas.uploadVideoSchema), VideosController.uploadVideo)

module.exports = routes;