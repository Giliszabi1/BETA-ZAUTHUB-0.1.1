const uploadRepository = require('./upload.repository');

async function uploadVideo({data, fileName, uploadChannelReturn}) {
    const parts = fileName.split(".");

    const videosType = parts[1];
    const video_category = parts[2];
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

    const VIDEO_THUMBNAILS_INDEX = video_json.thumbnails.length - 1;
    const VIDEO_THUMBNAIL = video_json.thumbnails[VIDEO_THUMBNAILS_INDEX];

    var audio_format = "";
    for (let i = VIDEO_FORMATS.length - 1; i >= 0; i--) {
      const VIDEO_FORMAT = VIDEO_FORMATS[i];

      if (VIDEO_FORMAT.video_ext == "none" && VIDEO_FORMAT != "none") {
        audio_format = VIDEO_FORMAT;
        break;
      }
    }

    const VIDEO_CHAPTERS = video_json.chapters;

    const VIDEO_TITLE = video_json.title;
    const VIDEO_Y_VIDEO_ID = video_json.id;
    const VIDEO_CATEGORY_NAME = video_json.categories[0];
    const VIDEO_DESCRIPTION = video_json.description;
    const VIDEO_VIDEO_URL = VIDEO_VID_FORMAT.url;
    const VIDEO_DURATION = video_json.duration || 0;
    const VIDEO_DURATION_STRING = video_json.duration_string;
    const VIDEO_UPLOAD_DATE = video_json.upload_date;
    let VIDEO_CHANNEL_NAME = video_json.uploader_id;
    const VIDEO_VIEW_COUNT = video_json.view_count || 0;
    const VIDEO_LIKE_COUNT = video_json.like_count || 0;
    const VIDEO_FILESIZE = VIDEO_VID_FORMAT.filesize;
    const VIDEO_FORMAT_NOTE = VIDEO_VID_FORMAT.format_note;
    const VIDEO_START_TIME = 0;
    const VIDEO_EXPIRE_AT = new URL(VIDEO_VIDEO_URL).searchParams.get("expire");
    const VIDEO_THUMBNAIL_URL = VIDEO_THUMBNAIL.url;
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
    if (!VIDEO_Y_VIDEO_ID) {
      return {
        success: false,
        error: {
          code: 400,
          title: "Bad Request",
          variable: "VIDEO_Y_VIDEO_ID",
          message: "YouTube video ID hibás: " + VIDEO_Y_VIDEO_ID,
        },
      };
    }

    if (!VIDEO_CATEGORY_NAME) {
      VIDEO_CATEGORY_NAME = "";
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

    if (!VIDEO_DURATION || VIDEO_DURATION <= 0) {
      return {
        success: false,
        error: {
          code: 400,
          title: "Bad Request",
          variable: "VIDEO_DURATION",
          message: "Videó időtartam hibás: " + VIDEO_DURATION,
        },
      };
    }

    if (!VIDEO_CHANNEL_NAME) {
      if(uploadChannelReturn){
        VIDEO_CHANNEL_NAME = uploadChannelReturn.uploader_id
      }
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

    if (!VIDEO_DURATION_STRING) {
      VIDEO_DURATION_STRING = "";
    }

    if (!VIDEO_UPLOAD_DATE) {
      return {
        success: false,
        error: {
          code: 400,
          title: "Bad Request",
          variable: "VIDEO_UPLOAD_DATE",
          message: "Feltöltési dátum hiányzik: " + VIDEO_UPLOAD_DATE,
        },
      };
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

    if (
      VIDEO_START_TIME === undefined ||
      VIDEO_START_TIME === null ||
      VIDEO_START_TIME < 0
    ) {
      return {
        success: false,
        error: {
          code: 400,
          title: "Bad Request",
          variable: "VIDEO_START_TIME",
          message: "Kezdési idő hibás: " + VIDEO_START_TIME,
        },
      };
    }
    console.log("A videó validácioja sikeres volt online 213");
    
    const createVideoReturn = await uploadRepository.uploadVideo({
      VIDEO_TITLE,
      VIDEO_Y_VIDEO_ID,
      VIDEO_CATEGORY_NAME,
      VIDEO_DESCRIPTION,
      VIDEO_VIDEO_URL,
      VIDEO_DURATION,
      VIDEO_DURATION_STRING,
      VIDEO_UPLOAD_DATE,
      VIDEO_CHANNEL_NAME,
      VIDEO_VIEW_COUNT,
      VIDEO_LIKE_COUNT,
      VIDEO_FILESIZE,
      VIDEO_FORMAT_NOTE,
      VIDEO_START_TIME,
      VIDEO_EXPIRE_AT,
      VIDEO_THUMBNAIL_URL,
      VIDEO_AUDIO_URL,
      videosType,
      video_category
    });

    return createVideoReturn;
}
module.exports = uploadVideo;