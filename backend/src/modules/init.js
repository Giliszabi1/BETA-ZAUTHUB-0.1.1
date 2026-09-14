const uploadVideo = require('./upload/init');
const videosRoutes = require('./video/video.route');
const ChannelRoutes = require('./channel/channel.routes');
const musicRoutes = require('./music/music.route');

const router = require("express").Router();

router.use("/uploads", uploadVideo)
router.use("/video", videosRoutes)
router.use("/channel", ChannelRoutes)
router.use("/music", musicRoutes)

module.exports = router;