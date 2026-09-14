const VideosService = require('./musics.service');

class VideosController {
    constructor() {
        this.VideosService = new VideosService();
        this.uploadVideo = this.uploadVideo.bind(this);
    }

    async uploadVideo(req, res, next){
        const {video_url, videosType } = req.body

        res.send("you are successfully upload an music")

        await this.VideosService.uploadVideo({
            video_url: video_url, 
            videosType: videosType || "Egyéb"
        });

    }
}

module.exports = new VideosController();