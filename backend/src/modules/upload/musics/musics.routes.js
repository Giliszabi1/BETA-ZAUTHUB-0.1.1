const routes = require('express').Router();

const VideosController = require('./musics.controller');

const validate = require('../../../shared/utils/validation');


const VideosSchemas = require('./musics.validation');
routes.post("/music", validate(VideosSchemas.uploadMusicSchema), VideosController.uploadVideo)

module.exports = routes;