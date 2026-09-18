const VideoService = require('./video.service');

class VideoController {
    constructor() {
        this.VideoService = new VideoService();

        this.getVideos = this.getVideos.bind(this);
        this.getVideoById = this.getVideoById.bind(this);
        this.VideoSearchTo = this.VideoSearchTo.bind(this);
        this.deleteVideoByYid = this.deleteVideoByYid.bind(this);

    }

    async getVideos(req, res, next) {
        const videoTypes = req.query.videoTypes;
        const result = await this.VideoService.getVideos({videoTypes})

        res.send(JSON.stringify({
            success: true,
            result: result
        }))
    }

    async getVideoById(req, res, next) {
        const video_id = req.query.video_id;

        const result = await this.VideoService.getVideoById({video_id})
        if (result) {
          res.send(
            JSON.stringify({
              success: true,
              result: result,
            }),
          );
        } else {
          res.send(
            JSON.stringify({
              success: false,
            }),
          );
        }
    }

    async VideoSearchTo(req, res, next){
      const searchTo = req.query.to;

      const result = await this.VideoService.VideoSearchTo({searchTo})
      if (result) {
        res.send(
          JSON.stringify({
            success: true,
            result: result.answer,
          }),
        );
      } else {
        res.send(
          JSON.stringify({
            success: false,
          }),
        );
      }
    }
    async deleteVideoByYid(req, res, next) {
      const video_id = req.query.video_id;

      if(!video_id){
        res.send(JSON.stringify({success: false}));
        return;
      }
      const result = await this.VideoService.deleteVideoByYid({video_id})

      res.send(JSON.stringify({success: result.success, data: "deleted"}));
    }


}

module.exports = new VideoController();