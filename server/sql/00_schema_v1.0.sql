/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `character`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `character` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `lodestoneId` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `race` enum('hyur','elezen','lalafell','miqote','roegadyn','aura','hrothgar','viera') NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `verifiedAt` datetime DEFAULT NULL,
  `serverId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `appearance` mediumtext NOT NULL DEFAULT '',
  `background` mediumtext NOT NULL DEFAULT '',
  `occupation` varchar(255) NOT NULL DEFAULT '',
  `age` varchar(255) NOT NULL DEFAULT '',
  `birthplace` varchar(255) NOT NULL DEFAULT '',
  `residence` varchar(255) NOT NULL DEFAULT '',
  `title` varchar(255) NOT NULL DEFAULT '',
  `nickname` varchar(255) NOT NULL DEFAULT '',
  `carrdProfile` varchar(255) NOT NULL DEFAULT '',
  `showAvatar` tinyint(4) NOT NULL DEFAULT 1,
  `showInfoboxes` tinyint(4) NOT NULL DEFAULT 1,
  `combinedDescription` tinyint(4) NOT NULL DEFAULT 0,
  `verificationCode` varchar(255) DEFAULT NULL,
  `bannerId` int(11) DEFAULT NULL,
  `active` tinyint(4) DEFAULT 1,
  `freeCompanyId` int(11) DEFAULT NULL,
  `newsRole` enum('none','author','editor') NOT NULL DEFAULT 'none',
  `newsPseudonym` varchar(255) DEFAULT NULL,
  `motto` varchar(1000) NOT NULL DEFAULT '',
  `loves` varchar(1000) NOT NULL DEFAULT '',
  `hates` varchar(1000) NOT NULL DEFAULT '',
  `friends` varchar(1000) NOT NULL DEFAULT '',
  `relatives` varchar(1000) NOT NULL DEFAULT '',
  `enemies` varchar(1000) NOT NULL DEFAULT '',
  `motivation` varchar(1000) NOT NULL DEFAULT '',
  `currently` varchar(1000) NOT NULL DEFAULT '',
  `oocInfo` varchar(1000) NOT NULL DEFAULT '',
  `pronouns` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_1226c55ae490317721ca21da4e` (`name`,`serverId`),
  UNIQUE KEY `IDX_d0ed6c8ae841188f7efed1632a` (`lodestoneId`,`active`),
  KEY `FK_08d60dd5c95c9f43d68cd1c1bda` (`serverId`),
  KEY `FK_04c2fb52adfa5265763de8c4464` (`userId`),
  KEY `FK_87df1c632fbc541657ec7e0e274` (`bannerId`),
  KEY `FK_db34b3b15df07016bbeff46ae6d` (`freeCompanyId`),
  FULLTEXT KEY `IDX_4cdf8ae9d45a37b8ad85f94d86` (`name`,`title`,`nickname`,`occupation`,`appearance`,`background`,`birthplace`,`residence`,`loves`,`hates`,`friends`,`relatives`,`enemies`,`motto`),
  CONSTRAINT `FK_04c2fb52adfa5265763de8c4464` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_08d60dd5c95c9f43d68cd1c1bda` FOREIGN KEY (`serverId`) REFERENCES `server` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_87df1c632fbc541657ec7e0e274` FOREIGN KEY (`bannerId`) REFERENCES `image` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_db34b3b15df07016bbeff46ae6d` FOREIGN KEY (`freeCompanyId`) REFERENCES `free_company` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=513 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `community`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `community` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `foundedAt` date DEFAULT NULL,
  `description` mediumtext NOT NULL DEFAULT '',
  `website` varchar(255) NOT NULL DEFAULT '',
  `discord` varchar(255) NOT NULL DEFAULT '',
  `goal` varchar(255) NOT NULL DEFAULT '',
  `status` varchar(255) NOT NULL DEFAULT '',
  `recruitingOfficers` varchar(255) NOT NULL DEFAULT '',
  `carrdProfile` varchar(255) NOT NULL DEFAULT '',
  `ownerId` int(11) NOT NULL,
  `bannerId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_696fdadbf0a710efbbf9d98ad9` (`name`),
  KEY `FK_ddec3b3aea291d8d701c3dbf2d5` (`ownerId`),
  KEY `FK_08a0232344ff002217e5a59c9c9` (`bannerId`),
  FULLTEXT KEY `IDX_f1b4e46a2501f0bf81fc81f257` (`name`,`description`,`goal`,`recruitingOfficers`),
  CONSTRAINT `FK_08a0232344ff002217e5a59c9c9` FOREIGN KEY (`bannerId`) REFERENCES `image` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ddec3b3aea291d8d701c3dbf2d5` FOREIGN KEY (`ownerId`) REFERENCES `character` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `community_membership`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `community_membership` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `status` enum('applied','confirmed','rejected') NOT NULL DEFAULT 'applied',
  `canEdit` tinyint(4) NOT NULL DEFAULT 0,
  `canManageMembers` tinyint(4) NOT NULL DEFAULT 0,
  `characterId` int(11) NOT NULL,
  `communityId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a424a55a69fb5dbcfc7ec3d1ff` (`characterId`,`communityId`),
  KEY `FK_dbdbd4e184bc9504120f25d6897` (`communityId`),
  CONSTRAINT `FK_1d7a6e7599e30ddd2b850d58651` FOREIGN KEY (`characterId`) REFERENCES `character` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_dbdbd4e184bc9504120f25d6897` FOREIGN KEY (`communityId`) REFERENCES `community` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `community_tag`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `community_tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `communityId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_c6de44feb5094566092433c64d3` (`communityId`),
  CONSTRAINT `FK_c6de44feb5094566092433c64d3` FOREIGN KEY (`communityId`) REFERENCES `community` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `details` mediumtext NOT NULL DEFAULT '',
  `oocDetails` mediumtext NOT NULL DEFAULT '',
  `startDateTime` datetime NOT NULL,
  `endDateTime` datetime DEFAULT NULL,
  `link` varchar(255) NOT NULL DEFAULT '',
  `contact` varchar(255) NOT NULL DEFAULT '',
  `externalSourceLink` varchar(255) DEFAULT NULL,
  `source` enum('website','api','crescent_moon_publishing','chocobo_chronicle') NOT NULL,
  `hidden` tinyint(4) NOT NULL DEFAULT 0,
  `ownerId` int(11) DEFAULT NULL,
  `bannerId` int(11) DEFAULT NULL,
  `recurring` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2e3b1673ebfb9e9affcd7b8223` (`externalSourceLink`),
  KEY `FK_e4abcb418e46db776e920a05a16` (`ownerId`),
  KEY `FK_6597441f078156b81eacbfbf170` (`bannerId`),
  FULLTEXT KEY `IDX_06f08f9dd4c0f24b131b71ebdf` (`title`,`details`,`oocDetails`,`contact`),
  CONSTRAINT `FK_6597441f078156b81eacbfbf170` FOREIGN KEY (`bannerId`) REFERENCES `image` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_e4abcb418e46db776e920a05a16` FOREIGN KEY (`ownerId`) REFERENCES `character` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=509 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_announcement`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event_announcement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `minutesBefore` int(11) NOT NULL,
  `postAt` datetime NOT NULL,
  `eventId` int(11) NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_9c7b145fa4a5940223c252645e6` (`eventId`),
  CONSTRAINT `FK_9c7b145fa4a5940223c252645e6` FOREIGN KEY (`eventId`) REFERENCES `event` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_location`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event_location` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `tags` varchar(255) NOT NULL,
  `serverId` int(11) NOT NULL,
  `eventId` int(11) NOT NULL,
  `link` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `FK_3b448331e10187d1b3ab7de6258` (`serverId`),
  KEY `FK_37ef7757c1867d1136126feaf46` (`eventId`),
  CONSTRAINT `FK_37ef7757c1867d1136126feaf46` FOREIGN KEY (`eventId`) REFERENCES `event` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_3b448331e10187d1b3ab7de6258` FOREIGN KEY (`serverId`) REFERENCES `server` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1337 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `free_company`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `free_company` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `lodestoneId` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `tag` varchar(5) NOT NULL,
  `crest` text NOT NULL DEFAULT '',
  `foundedAt` datetime NOT NULL,
  `claimedAt` datetime DEFAULT NULL,
  `description` mediumtext NOT NULL DEFAULT '',
  `website` varchar(255) NOT NULL DEFAULT '',
  `goal` varchar(255) NOT NULL DEFAULT '',
  `status` varchar(255) NOT NULL DEFAULT '',
  `carrdProfile` varchar(255) NOT NULL DEFAULT '',
  `serverId` int(11) NOT NULL,
  `leaderId` int(11) DEFAULT NULL,
  `bannerId` int(11) DEFAULT NULL,
  `areaOfOperations` varchar(255) NOT NULL DEFAULT '',
  `recruitingOfficers` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2dddb33e6720af87afe857ac6f` (`lodestoneId`),
  UNIQUE KEY `IDX_cbc819e2b7d34cf41a793a8cc3` (`name`,`serverId`),
  KEY `FK_3a452a4249903e82867174db9de` (`serverId`),
  KEY `FK_017d7b7029b988a783c47fa55ab` (`leaderId`),
  KEY `FK_af84f4a8f7f67a860a6c2b8497f` (`bannerId`),
  FULLTEXT KEY `IDX_45121a8e32162362fceb06b5e3` (`name`,`description`,`goal`,`areaOfOperations`,`recruitingOfficers`),
  CONSTRAINT `FK_017d7b7029b988a783c47fa55ab` FOREIGN KEY (`leaderId`) REFERENCES `character` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_3a452a4249903e82867174db9de` FOREIGN KEY (`serverId`) REFERENCES `server` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_af84f4a8f7f67a860a6c2b8497f` FOREIGN KEY (`bannerId`) REFERENCES `image` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `image`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `image` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `width` int(11) NOT NULL,
  `height` int(11) NOT NULL,
  `size` int(11) NOT NULL,
  `hash` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `category` enum('artwork','screenshot','unlisted') NOT NULL,
  `format` enum('png','jpeg') NOT NULL,
  `ownerId` int(11) NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT '',
  `description` mediumtext NOT NULL DEFAULT '',
  `credits` varchar(255) NOT NULL DEFAULT '',
  `eventId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_3096ae901448b6b23e1485f309` (`hash`,`ownerId`),
  KEY `FK_132fcc8d44e719a21ac7a372c33` (`ownerId`),
  KEY `FK_042895d4be7cf838f0f89949705` (`eventId`),
  FULLTEXT KEY `IDX_2d29266f1dcc946a888ccc0303` (`title`,`description`,`credits`),
  CONSTRAINT `FK_042895d4be7cf838f0f89949705` FOREIGN KEY (`eventId`) REFERENCES `event` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_132fcc8d44e719a21ac7a372c33` FOREIGN KEY (`ownerId`) REFERENCES `character` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1895 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `news`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` mediumtext NOT NULL DEFAULT '',
  `publishedAt` datetime DEFAULT NULL,
  `ownerId` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `status` enum('draft','submitted','published') NOT NULL,
  `issueId` int(11) DEFAULT NULL,
  `imageId` int(11) DEFAULT NULL,
  `summary` text NOT NULL DEFAULT '',
  `subtitle` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_d09152c44881b7620e12d6df09` (`slug`),
  KEY `FK_7c5c864c9e4523ef9ff19507471` (`ownerId`),
  KEY `FK_12a76d9b0f635084194b2c6aa01` (`categoryId`),
  KEY `FK_a1eacfadf12f611524591b8f0ba` (`issueId`),
  KEY `FK_b1e5a455558381ffcf46be9eeee` (`imageId`),
  CONSTRAINT `FK_12a76d9b0f635084194b2c6aa01` FOREIGN KEY (`categoryId`) REFERENCES `news_category` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_7c5c864c9e4523ef9ff19507471` FOREIGN KEY (`ownerId`) REFERENCES `character` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a1eacfadf12f611524591b8f0ba` FOREIGN KEY (`issueId`) REFERENCES `news_issue` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_b1e5a455558381ffcf46be9eeee` FOREIGN KEY (`imageId`) REFERENCES `image` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `news_category`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2aef5338fc92183edcfe619c04` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `news_issue`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news_issue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `publishedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `noticeboard_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `noticeboard_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` mediumtext NOT NULL DEFAULT '',
  `location` enum('multiple_locations','vesper_bay','limsa_lominsa','gridania','uldah','ishgard','revenants_toll','old_sharlayan','radz_at_han','kugane') NOT NULL,
  `ownerId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_048983f1033f778c3859372d88d` (`ownerId`),
  FULLTEXT KEY `IDX_b35add5048261086ed4afae5df` (`title`,`content`),
  CONSTRAINT `FK_048983f1033f778c3859372d88d` FOREIGN KEY (`ownerId`) REFERENCES `character` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `server`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `server` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `datacenter` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `story`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `story` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` mediumtext NOT NULL DEFAULT '',
  `type` enum('published_work','diary','poetry','ic_happening','conceptual') NOT NULL,
  `ownerId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_07fb425a48f0c809bf2be4253a8` (`ownerId`),
  FULLTEXT KEY `IDX_0950c494b6431378a460e7f3ce` (`title`,`content`),
  CONSTRAINT `FK_07fb425a48f0c809bf2be4253a8` FOREIGN KEY (`ownerId`) REFERENCES `character` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `story_tag`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `story_tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `storyId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_fbe772eae7bedc2989708e754fe` (`storyId`),
  CONSTRAINT `FK_fbe772eae7bedc2989708e754fe` FOREIGN KEY (`storyId`) REFERENCES `story` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=255 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `role` enum('unverified','user','trusted','moderator','admin') NOT NULL DEFAULT 'unverified',
  `verifiedAt` datetime DEFAULT NULL,
  `verificationCode` varchar(255) DEFAULT NULL,
  `newEmail` varchar(255) DEFAULT NULL,
  `newEmailVerificationCode` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=377 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `venue`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `venue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `foundedAt` date DEFAULT NULL,
  `description` mediumtext NOT NULL DEFAULT '',
  `website` varchar(255) NOT NULL DEFAULT '',
  `purpose` varchar(255) NOT NULL DEFAULT '',
  `status` varchar(255) NOT NULL DEFAULT '',
  `carrdProfile` varchar(255) NOT NULL DEFAULT '',
  `location` enum('open_world','house','apartment') NOT NULL,
  `address` varchar(255) NOT NULL DEFAULT '',
  `housingArea` enum('mist','lavender_beds','goblet','shirogane','empyreum') DEFAULT NULL,
  `ward` int(11) DEFAULT NULL,
  `plot` int(11) DEFAULT NULL,
  `subdivision` tinyint(4) DEFAULT NULL,
  `serverId` int(11) NOT NULL,
  `ownerId` int(11) NOT NULL,
  `bannerId` int(11) DEFAULT NULL,
  `room` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_68e0be92c14f552d6aacac5337` (`name`,`serverId`),
  KEY `FK_c449670c30a73f1a7fb2566fa9c` (`serverId`),
  KEY `FK_e40bd027ed8edfcb34d4ba2bb80` (`ownerId`),
  KEY `FK_d4fc45181e580e7ce7150ff8f60` (`bannerId`),
  FULLTEXT KEY `IDX_aa8bf32988fc2e71394db1b76b` (`name`,`description`,`purpose`),
  CONSTRAINT `FK_c449670c30a73f1a7fb2566fa9c` FOREIGN KEY (`serverId`) REFERENCES `server` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_d4fc45181e580e7ce7150ff8f60` FOREIGN KEY (`bannerId`) REFERENCES `image` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_e40bd027ed8edfcb34d4ba2bb80` FOREIGN KEY (`ownerId`) REFERENCES `character` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `venue_tag`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `venue_tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `venueId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_b1103d3ba687c2ad6452fa8daba` (`venueId`),
  CONSTRAINT `FK_b1103d3ba687c2ad6452fa8daba` FOREIGN KEY (`venueId`) REFERENCES `venue` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `violation`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `violation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `pageType` enum('profile','free_company','community','venue','event','story','noticeboard_item','wiki_page','image') NOT NULL,
  `pageId` int(11) NOT NULL,
  `reason` text NOT NULL DEFAULT '',
  `open` tinyint(4) DEFAULT 1,
  `reportedById` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_cf2a3fddb2dfc58638d32d5767` (`pageId`,`pageType`,`reportedById`,`open`),
  KEY `FK_dea95362ed267c3e01baef22dd4` (`reportedById`),
  CONSTRAINT `FK_dea95362ed267c3e01baef22dd4` FOREIGN KEY (`reportedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `wiki_page`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wiki_page` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` mediumtext NOT NULL DEFAULT '',
  `ownerId` int(11) NOT NULL,
  `editPermission` enum('me','everyone') NOT NULL DEFAULT 'me',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_3eda55c0ac59b929347f88d2dc` (`title`),
  KEY `FK_2210a1bc502cf3af2534efb0621` (`ownerId`),
  FULLTEXT KEY `IDX_7685cdc423a0a1636396b9bb3d` (`title`,`content`),
  CONSTRAINT `FK_2210a1bc502cf3af2534efb0621` FOREIGN KEY (`ownerId`) REFERENCES `character` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'chaosarchives'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-06-24 17:54:56
