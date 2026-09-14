const VideoRepository = require('./video.repository');

const { spawn } = require('child_process');
const videoUploadService = require('../upload/videos/videos.service');
class videoService {
    
    async getVideos({videoTypes}) {
        
        const videos = await VideoRepository.getVideos({videoTypes})
        if(videos.success){
            return videos.answer
        }
    }

    async getVideoById({video_id}) {
        const video = await VideoRepository.getVideoById({video_id})
        if(video.success){
            return video.answer
        }
    }

    async VideoSearchTo({ searchTo, limit = 3 }) {
        const query = (searchTo || "").trim();

        if (!query) {
            return {
                success: false,
                error: {
                    code: 400,
                    title: "Bad Request",
                    variable: "searchTo",
                    message: "A keresési kifejezés hiányzik.",
                },
            };
        }

        return new Promise((resolve) => {
            
            const yt = spawn("yt-dlp", [
                "--skip-download",
                "--socket-timeout",
                "10",
                "--retries",
                "1",
                "--fragment-retries",
                "1",
                "--no-check-certificates",
                "--ignore-errors",
                "--dump-single-json",
                `ytsearch${limit}:${query}`,
            ]);

            let output = "";
            let errorOutput = "";

            yt.stdout.on("data", (data) => {
                output += data.toString();
            });

            yt.stderr.on("data", (data) => {
                errorOutput += data.toString();
                console.error("[yt-dlp search]", data.toString());
            });

            yt.on("error", (error) => {
                console.error("[yt-dlp search] spawn error:", error);
                resolve({
                    success: false,
                    error: {
                        code: 500,
                        title: "Internal Server Error",
                        message: "A yt-dlp indítása nem sikerült: " + error.message,
                    },
                });
            });

            yt.on("close", () => {
                if (!output.trim()) {
                    return resolve({
                        success: false,
                        error: {
                            code: 502,
                            title: "Bad Gateway",
                            message: "A yt-dlp nem adott vissza választ.",
                            details: errorOutput || undefined,
                        },
                    });
                }

                try {
                    const parsed = JSON.parse(output);
                    const entries = parsed.entries || [];

                    const results = entries
                        .filter((entry) => entry && entry.id)
                        .map((entry) => {
                            const VIDEO_THUMBNAIL_URL =
                                entry.thumbnails && entry.thumbnails.length
                                    ? entry.thumbnails[entry.thumbnails.length - 1].url
                                    : entry.thumbnail;

                            videoUploadService.uploadVideo({
                                video_url: "https://www.youtube.com/watch?v="+entry.id,
                                videosType: "other"
                            });

                            return {
                                y_video_id: entry.id,
                                video_title: entry.title,
                                view_count: entry.view_count || 0,
                                upload_date: entry.upload_date,
                                thumbnail_url: VIDEO_THUMBNAIL_URL,
                                duration_string: entry.duration_string || "",
                                avatar_icon_url:
                                    "https://matrica.shop/img/44997/lgk4290/500x500/lgk4290.jpg?time=1714280686",
                                name: "anonymus",
                                is_verifield: false,
                            };
                    });

                    return resolve({
                        success: true,
                        answer: results,
                    });

                } catch (parseError) {
                    console.error("[yt-dlp search] JSON parse error:", parseError);
                    return resolve({
                        success: false,
                        error: {
                            code: 502,
                            title: "Bad Gateway",
                            message: "A yt-dlp válaszát nem sikerült feldolgozni.",
                        },
                    });
                }
            });
        });
    }
}

module.exports = videoService;