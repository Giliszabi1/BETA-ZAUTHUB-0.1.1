const DB_CONNECT = require('../../infrastructure/database/mysql.database');

class uploadRepository {
    static async uploadVideo({
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
        }){
            try{
                const [answer] = await DB_CONNECT.query(
                  `CALL createVideo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
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
                    
                  ],
                );
              return {
                success: true,
                result: answer,
              };
            } catch (error) {
              return {
                success: false,
                error: error,
              };
            }
    }

    static async uploadChannel({
        CHANNEL_NAME,
        CHANNEL_UPLOADER_ID,
        CHANNEL_DESCRIPTION,
        CHANNEL_FOLLOWER_COUNT,
        CHANNEL_AVATAR_ICON,
        CHANNEL_IS_VERIFIELD
    }){
        try {
            const [answer] = await DB_CONNECT.query(
              "call create_channel(?, ?, ?, ?, ?, ?)",
              [
                CHANNEL_NAME,
                CHANNEL_UPLOADER_ID,
                CHANNEL_DESCRIPTION,
                CHANNEL_FOLLOWER_COUNT,
                CHANNEL_AVATAR_ICON,
                CHANNEL_IS_VERIFIELD,
              ],
            );
        
            return {
              success: true,
              result: answer[0][0],
            };
          } catch (error) {
            return {
              success: false,
              error: error,
            };
        }
    }

    static async uploadChannelTags({CHANNEL_UPLOADER_ID, CHANNEL_TAG}) {
      try {
            const [answer] = await DB_CONNECT.query(
              "call sp_add_channel_tag(?, ?)",
              [
                CHANNEL_UPLOADER_ID,
                CHANNEL_TAG
              ],
            );
        
            return {
              success: true,
              result: answer,
            };
          } catch (error) {
            return {
              success: false,
              error: error,
            };
        }
    }

    static async uploadVideoChapters({
      VIDEO_Y_VIDEO_ID,
      CHAPTER_START_TIME,
      CHAPTER_TITLE,
      CHAPTER_END_TIME
    }) {
      try {
        const [answer] = await DB_CONNECT.query("call createChapters(?, ?, ?, ?)", [
          VIDEO_Y_VIDEO_ID,
          CHAPTER_START_TIME,
          CHAPTER_TITLE,
          CHAPTER_END_TIME
        ]);
      
        return {
          success: true,
          result: answer,
        };
      } catch (error) {
        return {
          success: false,
          error: error,
        };
      }
    }

    static async uploadVideoTags(VIDEO_Y_VIDEO_ID, VIDEO_TAG_NAME) {
      try {
        const [answer] = await DB_CONNECT.query(`call sp_add_video_tag(?, ?)`, [
          VIDEO_Y_VIDEO_ID,
          VIDEO_TAG_NAME,
        ]);
      
        return {
          success: true,
          result: answer,
        };
      } catch (error) {
        return {
          success: false,
          error: error,
        };
      }
    }

    static async updateExpiredVideo({
      VIDEO_TITLE,
      VIDEO_Y_VIDEO_ID,
      VIDEO_DESCRIPTION,
      VIDEO_VIDEO_URL,
      VIDEO_VIEW_COUNT,
      VIDEO_LIKE_COUNT,
      VIDEO_EXPIRE_AT,
      VIDEO_AUDIO_URL
    }) {
      try {
        const [answer] = await DB_CONNECT.query(`call updateExpiredVideo(?, ?, ?, ?, ?, ?, ?, ?)`, [
          VIDEO_Y_VIDEO_ID,
          VIDEO_TITLE,
          VIDEO_DESCRIPTION,
          VIDEO_VIDEO_URL,
          VIDEO_VIEW_COUNT,
          VIDEO_LIKE_COUNT,
          VIDEO_EXPIRE_AT,
          VIDEO_AUDIO_URL
        ]);
      
        return {
          success: true,
          result: answer,
        };
      } catch (error) {
        return {
          success: false,
          error: error,
        };
      }
    }
}

module.exports = uploadRepository