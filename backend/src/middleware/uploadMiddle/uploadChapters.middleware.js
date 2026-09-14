const uploadRepository = require("./upload.repository");

async function uploadChapters(video_json) {
  
  const VIDEO_CHAPTERS = video_json.chapters;
  const VIDEO_Y_VIDEO_ID = video_json.id;

  if (VIDEO_CHAPTERS) {
    for (let j = 0; j < VIDEO_CHAPTERS.length; j++) {
      const VIDEO_CHAPTER = VIDEO_CHAPTERS[j];
      const CHAPTER_START_TIME = VIDEO_CHAPTER.start_time;
      const CHAPTER_TITLE = VIDEO_CHAPTER.title;
      const CHAPTER_END_TIME = VIDEO_CHAPTER.end_time;

      if (!VIDEO_CHAPTER) {
        continue;
      }
      if (!CHAPTER_START_TIME) {
        continue;
      }
      if (!CHAPTER_TITLE) {
        continue;
      }
      if (!CHAPTER_END_TIME) {
        continue;
      }

      if (!VIDEO_Y_VIDEO_ID) {
        return {
          success: false,
          error: {
            code: 400,
            title: "Bad Request",
            variable: "VIDEO_Y_VIDEO_ID",
            message: "Videó ID hiányzik: " + VIDEO_Y_VIDEO_ID,
          },
        };
      }
    
      if (
        CHAPTER_START_TIME === undefined ||
        CHAPTER_START_TIME === null ||
        CHAPTER_START_TIME < 0
      ) {
        return {
          success: false,
          error: {
            code: 400,
            title: "Bad Request",
            variable: "CHAPTER_START_TIME",
            message: "Fejezet kezdési idő hibás: " + CHAPTER_START_TIME,
          },
        };
      }
    
      if (!CHAPTER_TITLE) {
        return {
          success: false,
          error: {
            code: 400,
            title: "Bad Request",
            variable: "CHAPTER_TITLE",
            message: "Fejezet cím hiányzik: " + CHAPTER_TITLE,
          },
        };
      }
    
      if (
        CHAPTER_END_TIME === undefined ||
        CHAPTER_END_TIME === null ||
        CHAPTER_END_TIME < 0
      ) {
        return {
          success: false,
          error: {
            code: 400,
            title: "Bad Request",
            variable: "CHAPTER_END_TIME",
            message: "Fejezet befejezési idő hibás: " + CHAPTER_END_TIME,
          },
        };
      }
      const uploadChapterReturn = await uploadRepository.uploadVideoChapters({
          VIDEO_Y_VIDEO_ID,
          CHAPTER_START_TIME,
          CHAPTER_TITLE,
          CHAPTER_END_TIME
        })
    }
  }
}




/*

  const VIDEO_TAGS = video_json.tags;

  if (VIDEO_TAGS) {
    for (let k = 0; k < VIDEO_TAGS.length; k++) {
      const VIDEO_TAG = VIDEO_TAGS[k];

      const Video_tagInsertReturn = await create_v_tag(
        VIDEO_Y_VIDEO_ID,
        VIDEO_TAG,
      );

      console.log(
        "Is video tag upload: " + (await Video_tagInsertReturn).success,
      );
    }
  }
*/


module.exports = uploadChapters;