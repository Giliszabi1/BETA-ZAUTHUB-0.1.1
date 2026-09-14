const uploadRepository = require("./upload.repository");

const { spawn } = require("child_process");

async function uploadChannel({ data }) {
  
    let isListUpload = false;

    let VIDEO_CHANNEL_NAME = data.uploader_id;

    if (!VIDEO_CHANNEL_NAME) {
      isListUpload = true;
      VIDEO_CHANNEL_NAME = data.channel_id;
    }

    if (!VIDEO_CHANNEL_NAME) {
      return {
        success: false,
        error: {
          code: 400,
          title: "Bad Request",
          variable: "VIDEO_CHANNEL_NAME",
          message: "Csatorna név hiányzik: " + VIDEO_CHANNEL_NAME,
        },
      };
    }
    return new Promise((resolve, reject) => {
      let yt_channel;
      if (!isListUpload) {
        yt_channel = spawn("yt-dlp", [
          "--dump-single-json",
          "--flat-playlist",
          "--playlist-items",
          "0",
          `https://www.youtube.com/${VIDEO_CHANNEL_NAME}`,
        ]);
      }else{
        yt_channel = spawn("yt-dlp", [
          "--dump-single-json",
          "--flat-playlist",
          "--playlist-items",
          "0",
          `https://www.youtube.com/channel/${VIDEO_CHANNEL_NAME}`,
        ]);
      }

      let output = "";

      yt_channel.stdout.on("data", (data) => {
        output += data.toString();
      });

      yt_channel.stderr.on("data", (data) => {
        console.error("[yt-dlp]", data.toString());
      });

      yt_channel.on("error", (error) => {
        reject(error);
      });

      yt_channel.stdout.on("close", async (data) => {
        let channel_json = JSON.parse(output);
        const CHANNEL_NAME = channel_json.title;
        const CHANNEL_UPLOADER_ID = channel_json.uploader_id;
        let CHANNEL_DESCRIPTION = channel_json.description;
        const CHANNEL_FOLLOWER_COUNT = channel_json.channel_follower_count || 0;

        const CHANNEL_AVATAR_ICON = channel_json.thumbnails[0].url;
        const CHANNEL_IS_VERIFIELD = channel_json.channel_is_verified || false;

        if (!CHANNEL_NAME) {
          return reject({
            success: false,
            error: {
              code: 400,
              title: "Bad Request",
              variable: "CHANNEL_NAME",
              message: "Csatorna név hiányzik: " + CHANNEL_NAME,
            },
          });
        }

        if (!CHANNEL_UPLOADER_ID) {
          return reject({
            success: false,
            error: {
              code: 400,
              title: "Bad Request",
              variable: "CHANNEL_UPLOADER_ID",
              message: "Csatorna uploader ID hiányzik: " + CHANNEL_UPLOADER_ID,
            },
          });
        }

        if (
          CHANNEL_FOLLOWER_COUNT === undefined ||
          CHANNEL_FOLLOWER_COUNT === null ||
          CHANNEL_FOLLOWER_COUNT < 0
        ) {
          return reject({
            success: false,
            error: {
              code: 400,
              title: "Bad Request",
              variable: "CHANNEL_FOLLOWER_COUNT",
              message: "Követő szám hibás: " + CHANNEL_FOLLOWER_COUNT,
            },
          });
        }

        if (!CHANNEL_AVATAR_ICON) {
          return reject({
            success: false,
            error: {
              code: 400,
              title: "Bad Request",
              variable: "CHANNEL_AVATAR_ICON",
              message: "Csatorna avatar URL hiányzik: " + CHANNEL_AVATAR_ICON,
            },
          });
        }

        if (CHANNEL_IS_VERIFIELD === undefined || CHANNEL_IS_VERIFIELD === null) {
          return reject({
            success: false,
            error: {
              code: 400,
              title: "Bad Request",
              variable: "CHANNEL_IS_VERIFIELD",
              message: "Ellenőrzött státusz hiányzik: " + CHANNEL_IS_VERIFIELD,
            },
          });
        }

        const createChannelReturn = await uploadRepository.uploadChannel({
          CHANNEL_NAME,
          CHANNEL_UPLOADER_ID,
          CHANNEL_DESCRIPTION: CHANNEL_DESCRIPTION || "",
          CHANNEL_FOLLOWER_COUNT,
          CHANNEL_AVATAR_ICON,
          CHANNEL_IS_VERIFIELD,
        });

        const CHANNEL_TAGS = channel_json.tags;
        if (CHANNEL_TAGS) {
          for (let l = 0; l < CHANNEL_TAGS.length; l++) {
            const CHANNEL_TAG = CHANNEL_TAGS[l];
            const createChannelTagReturn =
              await uploadRepository.uploadChannelTags({
                CHANNEL_UPLOADER_ID,
                CHANNEL_TAG,
              });
          }
        }

        return resolve(createChannelReturn);
      });
    });
}

module.exports = uploadChannel;
