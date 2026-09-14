const uploadRepository = require('./upload.repository');

async function updateExpiredVideo({data, fileName}) {


    const video_json = data;
    if (!video_json.formats) {
      return {
        success: false,
        error: {
          sqlState: 0
        }
      };
    }
    const VIDEO_FORMATS_INDEX = video_json.formats.length - 1;
    const VIDEO_FORMATS = video_json.formats;
    const VIDEO_VID_FORMAT = video_json.formats[VIDEO_FORMATS_INDEX];

    var audio_format = "";
    for (let i = VIDEO_FORMATS.length - 1; i >= 0; i--) {
      const VIDEO_FORMAT = VIDEO_FORMATS[i];

      if (VIDEO_FORMAT.video_ext == "none" && VIDEO_FORMAT != "none") {
        audio_format = VIDEO_FORMAT;
        break;
      }
    }

    const VIDEO_TITLE = video_json.title;
    const VIDEO_Y_VIDEO_ID = video_json.id;
    const VIDEO_DESCRIPTION = video_json.description;
    const VIDEO_VIDEO_URL = VIDEO_VID_FORMAT.url;
    const VIDEO_VIEW_COUNT = video_json.view_count || 0;
    const VIDEO_LIKE_COUNT = video_json.like_count || 0;
    const VIDEO_EXPIRE_AT = new URL(VIDEO_VIDEO_URL).searchParams.get("expire");
    const VIDEO_AUDIO_URL = audio_format.url;

    if (!VIDEO_TITLE) {
      return {
        success: false,
        error: {
          code: 400,
          title: "bad request",
          variable: "VIDEO_TITLE",
          message: "Video_title érvénytelen: " + VIDEO_TITLE,
        },
      };
    }


    if (!VIDEO_DESCRIPTION) {
      VIDEO_DESCRIPTION = "";
    }

    if (!VIDEO_VIDEO_URL) {
      return {
        success: false,
        error: {
          code: 400,
          title: "Bad Request",
          variable: "VIDEO_VIDEO_URL",
          message: "Videó URL hiányzik: " + VIDEO_VIDEO_URL,
        },
      };
    }


    if (VIDEO_VIEW_COUNT < 0) {
      return {
        success: false,
        error: {
          code: 400,
          title: "Bad Request",
          variable: "VIDEO_VIEW_COUNT",
          message: "Megtekintés szám nem lehet negatív: " + VIDEO_VIEW_COUNT,
        },
      };
    }

    if (VIDEO_LIKE_COUNT < 0) {
      return {
        success: false,
        error: {
          code: 400,
          title: "Bad Request",
          variable: "VIDEO_LIKE_COUNT",
          message: "Like szám nem lehet negatív: " + VIDEO_LIKE_COUNT,
        },
      };
    }


    if (
      VIDEO_VIEW_COUNT === undefined ||
      VIDEO_VIEW_COUNT === null ||
      VIDEO_VIEW_COUNT < 0
    ) {
      return {
        success: false,
        error: {
          code: 400,
          title: "Bad Request",
          variable: "VIDEO_VIEW_COUNT",
          message: "Megtekintés szám hibás: " + VIDEO_VIEW_COUNT,
        },
      };
    }

    if (
      VIDEO_LIKE_COUNT === undefined ||
      VIDEO_LIKE_COUNT === null ||
      VIDEO_LIKE_COUNT < 0
    ) {
      return {
        success: false,
        error: {
          code: 400,
          title: "Bad Request",
          variable: "VIDEO_LIKE_COUNT",
          message: "Like szám hibás: " + VIDEO_LIKE_COUNT,
        },
      };
    }


    const update = await uploadRepository.updateExpiredVideo({
      VIDEO_TITLE,
      VIDEO_Y_VIDEO_ID,
      VIDEO_DESCRIPTION,
      VIDEO_VIDEO_URL,
      VIDEO_VIEW_COUNT,
      VIDEO_LIKE_COUNT,
      VIDEO_EXPIRE_AT,
      VIDEO_AUDIO_URL
    });

    if(update.success){
        console.log("video updated successfully");
    }

}

module.exports = updateExpiredVideo;