const uploadVideo = require('./uploadVideo.middleware');
const uploadChannel = require('./uploadChannel.middleware');
const uploadChapters = require('./uploadChapters.middleware');
const uploadVideoTags = require('./uploadVideoTags.middleware');
async function uploadManager({data, fileName}) {

    try {
        
    const uploadVideoReturn = await uploadVideo({data, fileName});

    if(!uploadVideoReturn.success){
        console.log(uploadVideoReturn.error)
    }

    if(uploadVideoReturn.success){
        uploadChapters(data);
        uploadVideoTags(data);
    }



    if (!uploadVideoReturn.success) {

        if(uploadVideoReturn.error.sqlState == "45067"){
            //
        }
        if (uploadVideoReturn.error.sqlState == "45000") {
            console.log("ez a video már benne van a adatbázisba");
        } else if (uploadVideoReturn.error.sqlState == "45001" || uploadVideoReturn.error.code == 400 && uploadVideoReturn.error.variable == "VIDEO_CHANNEL_NAME") {
        //nem található ilyen csatorna
            const uploadChannelReturn = await uploadChannel({data});

            if (!uploadChannelReturn.success) {
                if(uploadChannelReturn.error.sqlState == "0"){
                    return;
                }
                if (uploadChannelReturn.error.sqlState == "45067") {
                    uploadManager({data, fileName})
                    return;
                }
            }

            if (uploadChannelReturn.success) {
                const createVideoReturnAfterChannel = await uploadVideo({data, fileName, uploadChannelReturn: uploadChannelReturn.result});

                if(!createVideoReturnAfterChannel.success){
                    console.log(uploadVideoReturn.error)
                }
                if (createVideoReturnAfterChannel.success) {
                    uploadChapters(data);
                    uploadVideoTags(data);
                }
            }
      }
    }
    } catch (error) {
        console.log("ERROR")
        console.log(error)   
    }
}

module.exports = uploadManager;