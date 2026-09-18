const DB_CONNECT = require('../../infrastructure/database/mysql.database');

class VideoRepository {
    
    async getVideos({videoTypes}) {
        try {
            const [answer] = await DB_CONNECT.query("CALL selectVideos(?, ?)", [
                "video",
                videoTypes
            ]);
            return {
                success: true,
                answer: answer[0]
            }
        } catch (error) {
            return {
                success: false,
                error: error
            }
        }
    }

    async  getVideoById({video_id}) {
        try {
            const [answer] = await DB_CONNECT.query("CALL selectVideoByYid(?);", [video_id]);
            return {
                success: true,
                answer: answer[0][0]
            }
        } catch (error) {
            console.log("Error: " +error)
            return {
                success: false,
                error: error
            }
        }
    }
    async deleteVideoByYid({video_id}) {
        try {
            const [answer] = await DB_CONNECT.query("CALL deleteVideo(?);", [video_id]);
            return {
                success: true,
                answer: answer
            }
        } catch (error) {
            return {
                success: false,
                error: error
            }
        }
    }
}

module.exports = new VideoRepository();