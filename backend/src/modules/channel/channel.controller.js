const ChannelService = require('./channel.service');

class ChannelController {
    constructor() {
        this.ChannelService = new ChannelService();

        this.getChannelInfo = this.getChannelInfo.bind(this)
        this.getChannelVideos = this.getChannelVideos.bind(this)
    }

    async getChannelInfo(req, res, next){

        const channel_id = req.query.channel_id ?? null;

        if (!channel_id) {
          res.send(
            JSON.stringify({
              success: false,
              error: "No channel id",
            }),
          );
          return;
        }

        const answer = await this.ChannelService.getChannelInfo({ channel_id });

        console.log(answer)
        if (answer.success) {
          res.send(
            JSON.stringify({
              success: true,
              result: answer.answer
            }),
          );
        } else {
          res.send(
            JSON.stringify({
              success: false,
              error: answer.error
            }),
          );
        }
    }

    async getChannelVideos(req, res, next) {
        const channel_id = req.query.channel_id;

        if (!channel_id) {
          res.send(
            JSON.stringify({
              success: false,
              error: "No channel id",
            }),
          );
          return;
        }

        const answer = await this.ChannelService.getChannelVideos({ channel_id });
        if (answer.success) {
          res.send(
            JSON.stringify({
              success: true,
              result: answer.answer
            }),
          );
        } else {
          res.send(
            JSON.stringify({
              success: false,
              error: answer.error
            }),
          );
        }
    }
}

module.exports = new ChannelController;