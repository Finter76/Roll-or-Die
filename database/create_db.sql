CREATE DATABASE IF NOT EXISTS musio_690830;
USE musio_690830;

CREATE TABLE Users (
    id INT AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    game_state JSON DEFAULT NULL,
    coins INT DEFAULT 0,
    kills INT DEFAULT 0,
    max_floor INT DEFAULT 0,
    PRIMARY KEY (id)
);