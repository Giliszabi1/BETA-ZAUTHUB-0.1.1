-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Gép: mysql:3306
-- Létrehozás ideje: 2026. Sze 06. 11:10
-- Kiszolgáló verziója: 8.4.11
-- PHP verzió: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `Zauthub_db`
--
CREATE DATABASE IF NOT EXISTS `Zauthub_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `Zauthub_db`;

ALTER DATABASE Zauthub_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

DELIMITER $$
--
-- Eljárások
--


DROP PROCEDURE IF EXISTS `deleteVideo`$$
CREATE PROCEDURE `deleteVideo` (
    IN `p_y_video_id` VARCHAR(255)
)
BEGIN
    DECLARE v_video_id INT DEFAULT NULL;

    /*
     * 1. Videó ID megkeresése
     */
    SELECT id
    INTO v_video_id
    FROM video
    WHERE y_video_id = p_y_video_id
    LIMIT 1;

    /*
     * 2. Ha nincs ilyen videó
     */
    IF v_video_id IS NULL THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A megadott YouTube video nem található';

    ELSE
        DELETE t
        FROM tags t
        INNER JOIN video_tags vt
            ON vt.tags_id = t.id
        WHERE vt.video_id = v_video_id
          AND NOT EXISTS (
              SELECT 1
              FROM channel_tags ct
              WHERE ct.tags_id = t.id
          )
          AND NOT EXISTS (
              SELECT 1
              FROM video_tags vt2
              WHERE vt2.tags_id = t.id
                AND vt2.video_id <> v_video_id
          );

        DELETE FROM video_tags
        WHERE video_id = v_video_id;


        DELETE FROM chapters
        WHERE video_id = v_video_id;

        DELETE FROM video
        WHERE id = v_video_id;

        SELECT
            v_video_id AS video_id,
            p_y_video_id AS youtube_id,
            'Video, chapters, video_tags and unused tags deleted permanently'
                AS message;

    END IF;

END$$


DROP PROCEDURE IF EXISTS `updateExpiredVideo`$$ 
CREATE PROCEDURE `updateExpiredVideo` 
( 
    IN `p_y_video_id` VARCHAR(255), 
    IN `p_title` VARCHAR(255), 
    IN `p_description` MEDIUMTEXT, 
    IN `p_video_url` MEDIUMTEXT, 
    IN `p_view_count` INT, 
    IN `p_like_count` INT, 
    IN `p_expired_at` INT, 
    IN `p_audio_url` MEDIUMTEXT 
) 
BEGIN 
    IF NOT EXISTS ( 
        SELECT 1 
        FROM video 
        WHERE y_video_id = p_y_video_id 
    ) THEN 
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'A megadott YouTube video nem található'; 
    END IF; 
    
    UPDATE video 
    SET title = p_title, 
        description = p_description, 
        video_url = p_video_url, 
        view_count = p_view_count, 
        like_count = p_like_count, 
        expired_at = p_expired_at, 
        audio_url = p_audio_url, 
        updated_at = NOW() 
    WHERE y_video_id = p_y_video_id; 
    SELECT id AS video_id, 
        y_video_id, 
        title AS video_title, 
        description, 
        video_url, 
        view_count, 
        like_count, 
        expired_at, 
        audio_url, 
        updated_at 
    FROM video 
    WHERE y_video_id = p_y_video_id; 
END$$



DROP PROCEDURE IF EXISTS `createChapters`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createChapters` (IN `p_y_video_id` VARCHAR(255), IN `p_start_time` INT(11), IN `p_title` VARCHAR(255), IN `p_end_time` INT(11))   BEGIN

    DECLARE v_video_id INT DEFAULT NULL;

    -- Megkeressük a videót
    SELECT id INTO v_video_id
    FROM video
    WHERE y_video_id = p_y_video_id
    AND deleted_at IS NULL
    LIMIT 1;


    -- Ha nincs ilyen videó
    IF v_video_id IS NULL THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A megadott YouTube video nem létezik';

    ELSE

        INSERT INTO chapters (
            video_id,
            start_time,
            title,
            end_time
        )
        VALUES (
            v_video_id,
            p_start_time,
            p_title,
            p_end_time
        );

    END IF;

END$$

DROP PROCEDURE IF EXISTS `createVideo`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createVideo` (
    IN `p_title` VARCHAR(255), 
    IN `p_Y_video_id` VARCHAR(255), 
    IN `p_category_name` VARCHAR(255), 
    IN `p_description` TEXT, 
    IN `p_video_url` TEXT, 
    IN `p_duration` INT, 
    IN `p_duration_string` VARCHAR(255), 
    IN `p_upload_date` DATE, 
    IN `p_channel_name` VARCHAR(255), 
    IN `p_view_count` INT, 
    IN `p_like_count` INT, 
    IN `p_filesize` INT, 
    IN `p_format_note` VARCHAR(255), 
    IN `p_start_time` INT, 
    IN `p_expire_at` INT, 
    IN `p_thumbnail_url` TEXT, 
    IN `p_audio_url` TEXT,
    IN `p_videoType` VARCHAR(255),
    IN `p_videoCategory` VARCHAR(255)
)   BEGIN

    DECLARE existing_video INT;
    DECLARE new_video_id INT;
	  DECLARE v_category_id INT;
    DECLARE v_channel_id INT;
    
    -- Ellenőrizzük, hogy létezik-e már ilyen YouTube video ID
    SELECT id INTO existing_video
    FROM video
    WHERE Y_video_id = p_Y_video_id
    AND Deleted_at IS NULL
    LIMIT 1;


    IF existing_video IS NOT NULL THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A video már létezik ezzel a YouTube ID-val';

    END IF;
    
     -- Channel keresése név alapján
    SELECT id INTO v_channel_id
    FROM channel
    WHERE channel.uploader_id = p_channel_name
    AND Deleted_at IS NULL
    LIMIT 1;


    -- Ha nincs ilyen channel
    IF v_channel_id IS NULL THEN

        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'A megadott channel nem létezik';

    END IF;
    
    
	-- Keresés név alapján
	SELECT id INTO v_category_id
	FROM categories
	WHERE name = p_category_name
	AND Deleted_at IS NULL
	LIMIT 1;


	-- Ha nincs ilyen kategória, létrehozzuk
	IF v_category_id IS NULL THEN

    	INSERT INTO categories
    	(
        	name,
        	created_at
    	)
    	VALUES
    	(
       	 	p_category_name,
        	NOW()
    	);

    	SET v_category_id = LAST_INSERT_ID();

	END IF;

    -- Videó létrehozása
    INSERT INTO video
    (
        title,
        Y_video_id,
        category_id,
        description,
        video_url,
        duration,
        duration_string,
        upload_date,
        channel_id,
        view_count,
        like_count,
        filesize,
        format_note,
        start_time,
        expired_at,
        thumbnail_url,
        audio_url,
        video_type,
        video_category_local,
        created_at
    )
    VALUES
    (
        p_title,
        p_Y_video_id,
        v_category_id,
        p_description,
        p_video_url,
        p_duration,
        p_duration_string,
        p_upload_date,
        v_channel_id,
        p_view_count,
        p_like_count,
        p_filesize,
        p_format_note,
        p_start_time,
        p_expire_at,
        p_thumbnail_url,
        p_audio_url,
        p_videoType,
        p_videoCategory,
        NOW()
    );


    SET new_video_id = LAST_INSERT_ID();


    -- visszaadjuk az új rekordot
    SELECT
        v.id AS video_id,
        v.y_video_id,
        v.title AS video_title,
        v.view_count,
        v.upload_date,
        v.thumbnail_url,
        v.duration_string,
        c.avatar_icon_url,
        c.name,
        c.is_verifield
        
    FROM video v
    JOIN channel c 
        ON v.channel_id = c.id
   	WHERE v.id = new_video_id;

END$$

DROP PROCEDURE IF EXISTS `create_channel`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `create_channel` (IN `p_name` VARCHAR(255), IN `p_uploader_id` VARCHAR(255), IN `p_description` TEXT, IN `p_follower_count` INT, IN `p_avatar_icon_url` TEXT, IN `p_is_verifield` TINYINT(1))   BEGIN

    -- Kötelező mezők validációja
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Channel name cannot be empty';
    END IF;


    IF p_uploader_id IS NULL OR TRIM(p_uploader_id) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Uploader ID cannot be empty';
    END IF;


    -- Follower szám validáció
    IF p_follower_count IS NULL OR p_follower_count < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Follower count must be a positive number';
    END IF;


    -- Verified flag validáció
    IF p_is_verifield NOT IN (0,1) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'is_verifield must be 0 or 1';
    END IF;


    -- Duplikált uploader ellenőrzése
    IF EXISTS (
        SELECT 1 
        FROM channel
        WHERE uploader_id = p_uploader_id
        AND deleted_at IS NULL
    ) THEN

        SIGNAL SQLSTATE '45067'
        SET MESSAGE_TEXT = 'Channel already exists with this uploader_id';

    END IF;


    -- Beszúrás
    INSERT INTO channel
    (
        name,
        uploader_id,
        description,
        follower_count,
        avatar_icon_url,
        is_verifield
    )
    VALUES
    (
        TRIM(p_name),
        TRIM(p_uploader_id),
        p_description,
        p_follower_count,
        p_avatar_icon_url,
        p_is_verifield
    );


    -- Új ID visszaadása
    SELECT
        id,
        name,
        uploader_id,
        description,
        follower_count,
        avatar_icon_url,
        is_verifield,
        created_at
    FROM channel
    WHERE id = LAST_INSERT_ID();


END$$

DROP PROCEDURE IF EXISTS `deleteVideo`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteVideo` (IN `p_y_video_id` VARCHAR(255))   BEGIN

    DECLARE v_video_id INT DEFAULT NULL;


    -- Videó ID lekérése
    SELECT id
    INTO v_video_id
    FROM video
    WHERE y_video_id = p_y_video_id
    LIMIT 1;


    -- Ha nincs ilyen videó
    IF v_video_id IS NULL THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A megadott YouTube video nem található';


    ELSE


        -- Video tagek törlése
        DELETE FROM video_tags
        WHERE video_id = v_video_id;


        -- Fejezetek törlése
        DELETE FROM chapters
        WHERE video_id = v_video_id;


        -- Maga a videó törlése
        DELETE FROM video
        WHERE id = v_video_id;


        -- Visszajelzés
        SELECT 
            v_video_id AS video_id,
            p_y_video_id AS youtube_id,
            'Video deleted successfully' AS message;


    END IF;


END$$

DROP PROCEDURE IF EXISTS `selectChannelWhereYId`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `selectChannelWhereYId` (IN `p_channel_id` VARCHAR(255))
BEGIN
    SELECT * FROM channel 
    WHERE uploader_id = p_channel_id
    LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `selectVideosByChannel`$$
CREATE DEFINER=`root`@`%` PROCEDURE `selectVideosByChannel` (IN `p_channel_id` VARCHAR(255))   BEGIN
    SELECT
        v.id AS video_id,
        v.y_video_id,
        v.title AS video_title,
        v.view_count,
        v.upload_date,
        v.thumbnail_url,
        v.duration_string,
        c.avatar_icon_url,
        c.name,
        c.is_verifield
    FROM video v
    JOIN channel c 
        ON v.channel_id = c.id
    WHERE c.uploader_id = p_channel_id
    ORDER BY RAND()
    LIMIT 25;
END$$

DROP PROCEDURE IF EXISTS `selectExpiredVideo`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `selectExpiredVideo` ()   BEGIN
    SELECT *
    FROM video
    WHERE deleted_at IS NULL
      AND expired_at IS NOT NULL
      AND expired_at <= UNIX_TIMESTAMP()
    LIMIT 25;
END$$

DROP PROCEDURE IF EXISTS `selectVideoByYid`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `selectVideoByYid` (IN `p_y_video_id` VARCHAR(255))   BEGIN
    SELECT
        v.id AS video_id,
        v.y_video_id,
        v.video_url,
        v.title AS video_title,
        v.description,
        v.duration_string,
        v.start_time,
        cat.name,
        v.view_count,
        v.like_count,
        v.upload_date,
        v.thumbnail_url,
        v.audio_url,
        v.filesize,
        c.avatar_icon_url,
        c.name,
        c.uploader_id,
        c.follower_count,
        c.is_verifield
    FROM video v
    JOIN channel c 
        ON v.channel_id = c.id
    JOIN categories cat
    	ON v.category_id = cat.id
    WHERE v.y_video_id = p_y_video_id
    LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `selectVideos`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `selectVideos` (IN `p_videoTypes` VARCHAR(255), IN `p_videoCategory` VARCHAR(255))   BEGIN
    SELECT
        v.id AS video_id,
        v.y_video_id,
        v.video_url,
        v.audio_url,
        v.title AS video_title,
        v.view_count,
        v.upload_date,
        v.thumbnail_url,
        v.duration_string,
        c.avatar_icon_url,
        c.name,
        c.uploader_id,
        c.is_verifield
        
    FROM video v
    JOIN channel c 
        ON v.channel_id = c.id
    WHERE v.video_type = p_videoTypes 
        AND (
            p_videoCategory IN ('Összes', '*')
            OR v.video_category_local = p_videoCategory
        )
    ORDER BY RAND()
    LIMIT 25;
END$$

DROP PROCEDURE IF EXISTS `selectMusics`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `selectMusics` ()   BEGIN
    SELECT
        v.id AS video_id,
        v.y_video_id,
        v.title AS video_title,
        v.view_count,
        v.upload_date,
        v.thumbnail_url,
        v.duration_string,
        v.audio_url,
        c.avatar_icon_url,
        c.name,
        c.uploader_id,
        c.is_verifield
        
    FROM video v
    JOIN channel c 
        ON v.channel_id = c.id
    WHERE v.video_type = "music"
    ORDER BY RAND()
    LIMIT 25;
END$$

DROP PROCEDURE IF EXISTS `sp_add_channel_tag`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_channel_tag` (IN `p_channel_name` VARCHAR(255), IN `p_tags_name` VARCHAR(255))   BEGIN
    DECLARE v_channel_id INT;
    DECLARE v_tag_id INT;

    -- Channel ID lekérése
    SELECT id
      INTO v_channel_id
      FROM channel
     WHERE channel.uploader_id = p_channel_name
     LIMIT 1;

    IF v_channel_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A csatorna nem található.';
    END IF;

    -- Tag keresése
    SELECT id
      INTO v_tag_id
      FROM tags
     WHERE name = p_tags_name
     LIMIT 1;

    -- Ha nincs ilyen tag, létrehozzuk
    IF v_tag_id IS NULL THEN
        INSERT INTO tags (name)
        VALUES (p_tags_name);

        SET v_tag_id = LAST_INSERT_ID();
    END IF;

    -- Kapcsolat létrehozása, ha még nem létezik
    IF NOT EXISTS (
        SELECT 1
          FROM channel_tags
         WHERE channel_id = v_channel_id
           AND tags_id = v_tag_id
    ) THEN

        INSERT INTO channel_tags (channel_id, tags_id)
        VALUES (v_channel_id, v_tag_id);

    END IF;

END$$

DROP PROCEDURE IF EXISTS `sp_add_video_tag`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_video_tag` (IN `p_video_name` VARCHAR(255), IN `p_tags_name` VARCHAR(255))   BEGIN
    DECLARE v_video_id INT;
    DECLARE v_tag_id INT;

    -- Videó ID lekérése
    SELECT id
      INTO v_video_id
      FROM video
     WHERE y_video_id = p_video_name
     LIMIT 1;

    IF v_video_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A videó nem található.';
    END IF;

    -- Tag keresése
    SELECT id
      INTO v_tag_id
      FROM tags
     WHERE name = p_tags_name
     LIMIT 1;

    -- Ha nincs ilyen tag, létrehozzuk
    IF v_tag_id IS NULL THEN
        INSERT INTO tags(name)
        VALUES(p_tags_name);

        SET v_tag_id = LAST_INSERT_ID();
    END IF;

    -- Kapcsolat létrehozása, ha még nem létezik
    IF NOT EXISTS (
        SELECT 1
          FROM video_tags
         WHERE video_id = v_video_id
           AND tags_id = v_tag_id
    ) THEN

        INSERT INTO video_tags(video_id, tags_id)
        VALUES(v_video_id, v_tag_id);

    END IF;

END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `channel`
--

DROP TABLE IF EXISTS `channel`;
CREATE TABLE `channel` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploader_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `follower_count` int DEFAULT NULL,
  `avatar_icon_url` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_verifield` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `channel_tags`
--

DROP TABLE IF EXISTS `channel_tags`;
CREATE TABLE `channel_tags` (
  `id` int NOT NULL,
  `channel_id` int NOT NULL,
  `tags_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `chapters`
--

DROP TABLE IF EXISTS `chapters`;
CREATE TABLE `chapters` (
  `id` int NOT NULL,
  `video_id` int NOT NULL,
  `start_time` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `end_time` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tags`
--

DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `video`
--

DROP TABLE IF EXISTS `video`;
CREATE TABLE `video` (
  `id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `y_video_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int DEFAULT NULL,
  `description` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `video_url` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` int DEFAULT NULL,
  `duration_string` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `upload_date` date DEFAULT NULL,
  `channel_id` int NOT NULL,
  `view_count` int NOT NULL,
  `like_count` int NOT NULL,
  `filesize` int DEFAULT NULL,
  `format_note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_time` int NOT NULL,
  `expired_at` int DEFAULT NULL,
  `video_type` enum('video', 'music', 'porn') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_category_local` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail_url` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `audio_url` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `video_tags`
--

DROP TABLE IF EXISTS `video_tags`;
CREATE TABLE `video_tags` (
  `id` int NOT NULL,
  `video_id` int NOT NULL,
  `tags_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `channel`
--
ALTER TABLE `channel`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `channel_tags`
--
ALTER TABLE `channel_tags`
  ADD PRIMARY KEY (`id`),
  ADD KEY `channel_id` (`channel_id`),
  ADD KEY `tags_id` (`tags_id`);

--
-- A tábla indexei `chapters`
--
ALTER TABLE `chapters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `video_id` (`video_id`);

--
-- A tábla indexei `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- A tábla indexei `video`
--
ALTER TABLE `video`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `y_video_id` (`y_video_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `channel_id` (`channel_id`);

--
-- A tábla indexei `video_tags`
--
ALTER TABLE `video_tags`
  ADD PRIMARY KEY (`id`),
  ADD KEY `video_id` (`video_id`),
  ADD KEY `tags_id` (`tags_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `channel`
--
ALTER TABLE `channel`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `channel_tags`
--
ALTER TABLE `channel_tags`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `chapters`
--
ALTER TABLE `chapters`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `video`
--
ALTER TABLE `video`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `video_tags`
--
ALTER TABLE `video_tags`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
