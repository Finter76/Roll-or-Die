-- Progettazione Web 
DROP DATABASE if exists musio_690830; 
CREATE DATABASE musio_690830; 
USE musio_690830; 
-- MySQL dump 10.13  Distrib 5.7.28, for Win64 (x86_64)
--
-- Host: localhost    Database: musio_690830
-- ------------------------------------------------------
-- Server version	5.7.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `game_state` json DEFAULT NULL,
  `coins` int(11) NOT NULL DEFAULT '0',
  `kills` int(11) DEFAULT '0',
  `max_floor` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Ciao','$2y$10$Nmxzwg0GhPD2g1stYSBM.O6gYwc0GZgUslu1bxmG2PPZ2QwuhOIsK',NULL,52,13,12),(3,'Test','$2y$10$GK3YuKNC7bw3yYBFGBMZT.j5O8EOHckBD9Ydvjgy.QyGMZq9qGBxu',NULL,12,2,2),(4,'Prova','$2y$10$U8DgCROCni4vn5qjCN2wle74SWHSLRWLRCgvjIqK.oJS3gwJcDz0y',NULL,2,0,1),(5,'Luca','$2y$10$QS3uw4RueNJRQek2GlVu..ejSo2MC6Nz2mbjppHrwk5RBzheWzkh6','{\"world\": {\"levelMap\": 1}, \"player\": {\"hp\": 42, \"type\": \"Knight\", \"maxHp\": 42, \"stats\": {\"luck\": 3, \"attack\": 5, \"hpStat\": 7, \"defense\": 8, \"maxSpeed\": 120}, \"resources\": {\"xp\": 0, \"gold\": 0, \"level\": 1}, \"facingLeft\": false}}',123,18,6),(7,'Marco','$2y$10$ovoRBOoN2JclkEpxyKpl7./wXdNC.e2qyQf.LiKYyqvIEaPVUtdia',NULL,165,39,7),(8,'Guido','$2y$10$F9MXJMnDGI0QoMcXaDtXv.oXkDzixFjY.QBVI26h0D.MEDTN5lsiO','{\"world\": {\"kills\": 4, \"levelMap\": 3}, \"player\": {\"hp\": 36, \"type\": \"Knight\", \"maxHp\": 42, \"stats\": {\"luck\": 3, \"attack\": 6, \"hpStat\": 7, \"defense\": 8, \"maxSpeed\": 240}, \"inventory\": {\"armor\": null, \"weapon\": null}, \"resources\": {\"xp\": 5, \"gold\": 24, \"level\": 4, \"potionCount\": 1}}}',24,4,3),(9,'Franco','$2y$10$0D526bbQeGvUQEvsz3mEYOZt3jY75JiR13gRV7VCGqD33j9AxW08a',NULL,0,0,1),(10,'Antonio','$2y$10$MD0P3bi9sRpD5XgNduaN7.rWXVyeVZwhqgUtcpbYgOr5FwAaNrD7u',NULL,33,5,1),(11,'Lorenzo','$2y$10$k4o5xBKasNemMJLuk3m/W.QCNMHDvtLr.jcOB7OkcPmSv9EIFZcVS','{\"world\": {\"kills\": 0, \"levelMap\": 1}, \"player\": {\"hp\": 42, \"type\": \"Knight\", \"maxHp\": 42, \"stats\": {\"luck\": 3, \"attack\": 5, \"hpStat\": 7, \"defense\": 8, \"maxSpeed\": 120}, \"inventory\": {\"armor\": null, \"weapon\": null}, \"resources\": {\"xp\": 0, \"gold\": 0, \"level\": 1, \"potionCount\": 0}}}',0,0,1),(12,'Luca2','$2y$10$/npKSpRNEX43e1P3U5y1Z.bQI0rLMPDqDk85K3lR0AIXfUg9EFk9S','{\"world\": {\"kills\": 0, \"levelMap\": 1}, \"player\": {\"hp\": 12, \"type\": \"Mage\", \"maxHp\": 12, \"stats\": {\"luck\": 5, \"attack\": 10, \"hpStat\": 2, \"defense\": 2, \"maxSpeed\": 180}, \"inventory\": {\"armor\": null, \"weapon\": null}, \"resources\": {\"xp\": 0, \"gold\": 0, \"level\": 1, \"potionCount\": 0}}}',0,0,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-15 15:49:34
