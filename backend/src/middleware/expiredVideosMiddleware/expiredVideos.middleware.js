const ExpiredVideosRepository = require('./expiredVideos.repository');

const { spawn } = require('child_process');
class CheckExpiredVideos {

    isRunning = false;

    constructor() {
        this.isRunning = false;
    }

    async checkExpiredVideos() {
        if(this.isRunning){
            return;
        }

        const expiredVideos = await ExpiredVideosRepository.selectExpiredVideos()
        this.isRunning = true;
        if(!expiredVideos.success){
            return;
        }
        const promises = expiredVideos.result.map((expiredVideo) => {
            return new Promise((resolve, reject) => {
                const youtube_id = expiredVideo.y_video_id;
            
                const yt = spawn("yt-dlp", [
                    "--skip-download",
                    "--no-check-certificates",
                    "--write-info-json",
                    "--socket-timeout",
                    "10",
                    "--retries",
                    "1",
                    "--fragment-retries",
                    "1",
                    "-o",
                    `./videoMetaData/%(id)s.update.expired.${youtube_id}.%(ext)s`,
                    `https://www.youtube.com/watch?v=${youtube_id}`,
                ]);
            
                yt.stdout.on("data", (data) => {
                    console.log(data.toString());
                });
            
                yt.stderr.on("data", (data) => {
                    console.log("stderr:", data.toString());
                });
            
                yt.on("close", (code) => {
                    console.log(`${youtube_id} finished with code ${code}`);
                    resolve();
                });
            
                yt.on("error", (err) => {
                    console.error(`${youtube_id} error:`, err);
                    reject(err);
                });
            });
            
        });
        
        await Promise.all(promises);

        this.isRunning = false;
        console.log("every video is ready")
    }
}

module.exports = new CheckExpiredVideos();