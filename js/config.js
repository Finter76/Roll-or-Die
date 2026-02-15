const TILE_SIZE = 64; 
const MAP_WIDTH = 40; 
const MAP_HEIGHT = 30; 

const ENTITY_HEIGHT = 24;
const ENTITY_WIDTH = 24;

const DICE_SIZE = 32;

const PLAYER_HEIGHT = 32;
const PLAYER_WIDTH = 32;

const VISION_RADIUS = 4;

const MAX_ENTITIES = 10;
const MAX_CHESTS = 2;

const HUD_ITEMS = 3;

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const CAMERA_WIDTH = 150;
const CAMERA_HEIGHT = 150;

const RECOVERY_TIME = 1000;
const FLOWFIELD_INTERVAL = 1000; 

const DISPLAY_DURATION = 1000;

const classes = [
    { name: 'Knight', image: './images/knight.png', description: 'Valoroso Cavaliere', stats: 'Difesa: 8, Vita: 7, Attacco: 5, Fortuna: 3, Velocità: 2' },
    { name: 'Rogue', image: './images/rogue.png', description: 'Scaltro Ladro', stats: 'Difesa: 2, Vita: 2, Attacco: 7, Fortuna: 8, Velocità: 4' },
    { name: 'Barbarian', image: './images/barbarian.png', description: 'Barbaro Violento', stats: 'Difesa: 0, Vita: 9, Attacco: 9, Fortuna: 3, Velocità: 2' },
    { name: 'Mage', image: './images/mage.png', description: 'Mago Esperto', stats: 'Difesa: 2, Vita: 2, Attacco: 10, Fortuna: 5, Velocità: 3' },
    { name: 'Trickster', image: './images/trickster.png', description: 'Abile Truffatore', stats: 'Difesa: 4, Vita: 4, Attacco: 4, Fortuna: 10, Velocità: 3' },
];

const TILE_MAPPING = {
    'GRASS_FLOOR' : {
        type: 'floor',
        src: './images/grass_floor.png'
    },
    'STONE_TILE' : {
        type: 'wall',
        src: './images/stone_tile.png'
    },
    'STONE_WALL' : {
        type: 'wall',
        src: './images/stone_wall.png'
    },
    'STAIRS' : {
        type: 'stairs',
        src: './images/stairs.png'
    },
}

const MAX_STAT_VALUES = {
    attack: 20,
    defense: 20,
    hp: 20,
    luck: 10,
    speed: 5
};

// Riferimenti per UI
const playerData = document.getElementById("playerData");
const levelPlayer = document.getElementById("levelPlayer");
const xp = document.getElementById("xp");
const coins = document.getElementById("coins");
const floor = document.getElementById("floor");
const kills = document.getElementById("kills");
const stats = document.getElementById("stats");
const hpStat = document.getElementById("hpStat");
const defStat = document.getElementById("defStat");
const atkStat = document.getElementById("atkStat");
const luckStat = document.getElementById("luckStat");
const spdStat = document.getElementById("spdStat");

const levelUp = document.getElementById("levelUp");
const levelHpStat = document.getElementById("levelHpStat");
const levelDefStat = document.getElementById("levelDefStat");
const levelAtkStat = document.getElementById("levelAtkStat");
const levelLuckStat = document.getElementById("levelLuckStat");
const levelSpdStat = document.getElementById("levelSpdStat");