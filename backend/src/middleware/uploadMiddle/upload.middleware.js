const uploadManager = require('./uploadManager.middleware');
const updateExpiredVideo = require('./updateExpiredVideo.middleware');

const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");


const metadataDir = path.resolve(
    __dirname,
    "../../../videoMetaData"
);

function uploadMiddleware() {
    console.log("=================================");
    console.log("Metadata watcher indítása");
    console.log("Mappa:", metadataDir);
    console.log("=================================");

    if (!fs.existsSync(metadataDir)) {
        fs.mkdirSync(metadataDir, {
            recursive: true
        });
    }

    const watcher = chokidar.watch(metadataDir, {
        persistent: true,
        ignoreInitial: true,

        // Docker esetén ez különösen hasznos
        usePolling: true,
        interval: 500,

        // Megvárjuk, amíg a yt-dlp befejezi az írást
        awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 100
        }
    });

    watcher
        .on("ready", () => {
            console.log("Metadata watcher AKTÍV");
            console.log("Figyelt mappa:", metadataDir);
        })

        .on("add", (filePath) => {
            console.log("[ÚJ FÁJL]", filePath);

            if (!filePath.endsWith(".json")) {
                return;
            }

            processFile(filePath);
        })


        .on("error", (error) => {
            console.error("[WATCHER HIBA]", error);
        });
}


async function processFile(filePath) {
    try {
        console.log("[FELDOLGOZÁS]", filePath);

        const content = await fs.promises.readFile(
            filePath,
            "utf8"
        );

        const data = JSON.parse(content);
        const fileName = path.basename(filePath);

        const parts = fileName.split(".");
        
        if(!(parts[1]=="update")){
            console.log("this video is upload to database....")
            uploadManager({data, fileName});
        }
        if(parts[1]=="update"){
            console.log("this video is uploading....")
            updateExpiredVideo({data, fileName});
        }

        await fs.promises.rm(filePath)

    } catch (error) {
        console.error(
            "[METADATA HIBA]",
            filePath,
            error.message
        );
    }
}


module.exports = uploadMiddleware;