const uploadRepository = require("./upload.repository");

async function uploadVideoTag(video_json) {
    const VIDEO_TAGS = video_json.tags;

    const VIDEO_Y_VIDEO_ID = video_json.id;

    if (VIDEO_TAGS) {
      for (let k = 0; k < VIDEO_TAGS.length; k++) {
        const VIDEO_TAG_NAME = VIDEO_TAGS[k];

        if (!VIDEO_Y_VIDEO_ID) {
          return {
            success: false,
            error: {
              code: 400,
              title: "Bad Request",
              variable: "VIDEO_Y_VIDEO_ID",
              message: "Fejezet cím hiányzik: " + VIDEO_Y_VIDEO_ID,
            },
          };
        }
    
        if (!VIDEO_TAG_NAME) {
          return {
            success: false,
            error: {
              code: 400,
              title: "Bad Request",
              variable: "VIDEO_TAG_NAME",
              message: "Fejezet cím hiányzik: " + VIDEO_TAG_NAME,
            },
          };
        }

        const uploadVideoTagsReturn = await uploadRepository.uploadVideoTags(
          VIDEO_Y_VIDEO_ID,
          VIDEO_TAG_NAME
        );

        console.log(
          "Is video tag upload: " + (await uploadVideoTagsReturn).success,
        );
      }
    }
}
module.exports = uploadVideoTag;