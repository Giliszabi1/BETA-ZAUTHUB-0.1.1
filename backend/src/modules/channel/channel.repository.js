const DB_CONNECT = require('../../infrastructure/database/mysql.database');


class ChannelRepository {
    async getChannelInfo({channel_id}) {
        try {
            const [answer] = await DB_CONNECT.query("call selectChannelWhereYId(?)", [
              channel_id,
            ]);

            return({
                success: true,
                result: answer[0][0]
            })
        }catch (error) {
            return({
                success: false,
                error: "something went wrong",
            })
        }
    }

    async getChannelVideos({channel_id}) {
        try {
            const [answer] = await DB_CONNECT.query("call selectVideosByChannel(?)", [
              channel_id,
            ]);

            return({
                success: true,
                result: answer[0]
            })
        }catch (error) {
            return({
                success: false,
                error: "something went wrong",
            })
        }
    }
}

module.exports = new ChannelRepository();