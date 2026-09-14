const videoRoutes = require('./videos/videos.routes');
const musicRoutes = require('./musics/musics.routes');

const routes = require('express').Router();

routes.use(videoRoutes);
routes.use(musicRoutes);

module.exports = routes;