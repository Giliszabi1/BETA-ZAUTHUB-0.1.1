require('dotenv').config();

class AppConfig {
    static serverConfig() {
        const appConfig={
            PORT: process.env.SERVER_PORT,
            HOST: process.env.SERVER_HOST
        }
        return appConfig;
    }
}
module.exports = AppConfig;