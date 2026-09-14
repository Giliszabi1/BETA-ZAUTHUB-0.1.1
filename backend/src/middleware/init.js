const uploadMiddleware = require('./uploadMiddle/upload.middleware');
const expiredVideosMidddleware = require('./expiredVideosMiddleware/expiredVideos.middleware');

class Middleware {
    interval;
    start(){
        uploadMiddleware();

        this.interval = setInterval(expiredVideosMidddleware.checkExpiredVideos,  300000);
    }

    close() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

}

module.exports = new Middleware();