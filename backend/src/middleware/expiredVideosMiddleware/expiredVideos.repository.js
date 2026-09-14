const DB_CONNECT = require('../../infrastructure/database/mysql.database');

class ExpiredVideosRepository {
    static async selectExpiredVideos(){
            try{
                const [answer] = await DB_CONNECT.query(`CALL selectExpiredVideo()`);
              return {
                success: true,
                result: answer[0],
              };
            } catch (error) {
              console.log("ERROR:"+ error);
              return {
                success: false,
                error: error,
              };
            }
    }
}

module.exports = ExpiredVideosRepository;