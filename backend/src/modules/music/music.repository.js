const DB_CONNECT = require('../../infrastructure/database/mysql.database');

class MusicsRepository {
    
    async getMusics() {
        try {
            const [answer] = await DB_CONNECT.query("CALL selectMusics()");
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
}

module.exports = new MusicsRepository();