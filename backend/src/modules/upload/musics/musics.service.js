const { spawn } = require("child_process");

class VideosService {

    async uploadVideo({video_url, videosType}) {
        
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
          `./videoMetaData/%(id)s.music.${videosType}.%(ext)s`,
          video_url,
        ]);

        yt.stdout.on("data", async (data) => {
          console.log(data.toString());
        });
    
        yt.stderr.on("data", (data) => {
          console.log("stderr:", data.toString());
        });
    }
}

module.exports = VideosService;