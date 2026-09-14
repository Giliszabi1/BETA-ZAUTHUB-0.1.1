const VideosService = require('./videos.service');

class VideosController {
    constructor() {
        this.VideosService = new VideosService();

    }

    async uploadVideo(req, res, next){
        const {video_url, videosType } = req.body

        res.send("you are successfully upload an video")

        await VideosService.uploadVideo({
            video_url: video_url, 
            videosType: videosType || "Egyéb"
        });

    }
}

module.exports = new VideosController();