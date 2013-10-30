var oz = oz || {};

module.exports =
{
  //Score
  BASE_POINTS: 0,
  UNCONNECTED_BONUS: 4,
  RELATED_WORD_BONUS: 6,
  INSPIRATIONAL_PENALTY: 3,

  //Total Counts
  WORD_TOTAL: 598,
  IMAGE_TOTAL: 25,
  INSTRUCTION_TOTAL: 7,

  RELATED_ARRAY_INDEX: 7,

  LEVEL_SETTINGS: [
    { minTiles: 3, maxTiles: 4, minPaths: 3, maxPaths: 4, instructions: [ 0.7, 0.3, 0 ] },
    { minTiles: 3, maxTiles: 4, minPaths: 3, maxPaths: 4, instructions: [ 0.7, 0.3, 0 ] },
    { minTiles: 3, maxTiles: 4, minPaths: 3, maxPaths: 4, instructions: [ 0.7, 0.3, 0 ] }
  ],

  MIN_TILES: "minTiles",
  
  MIN_PATHS: "minPaths",
  MAX_PATHS: "maxPaths",

  //Word Balance
  BALANCE: [
    3,  //noun
    5,  //verb
    1,  //adverb
    2,  //pronoun
    4,  //adjective
    2,  //preposition
    1,  //conjunction
    5,  //related
    2  //other
  ],

  CLASS_NAMES: [
    "noun",
    "verb",
    "adverb",
    "pronoun",
    "adjective",
    "preposition",
    "conjunction",
    "related",
    "other"
  ],

  //Indexes
  COUNT_NODE_ID : 1,
  WORD_ID_INDEX : "wordIDIndex",
  WORD_LEMMA_INDEX : "wordLemmaIndex",

  GAME_INDEX : "gameIndex",
  IMAGE_INDEX : "imageIndex",
  INSTRUCTION_INDEX : "instructionIndex",

  USER_INDEX : "userIndex",

  //Class Indexes
  RELATED_CLASS_INDEX: "relatedClassIndex",

  //Game Constants
  //Max Values
  MAX_TILES: 5,
  MAX_WORDS: 25,

  //Placement
  MIN_X: 0,
  MAX_X: 0.95,
  MIN_Y: 0,
  MAX_Y: 0.2,
  MIN_DIFF: 0.075,
  MAX_ANGLE: 5,
  MIN_ANGLE: -5,
  FIRST_TILE_X: 0.15,
  FIRST_TILE_Y: 0.3,
  SECOND_TILE_X: 0.85,
  SECOND_TILE_Y: 0.3,
  THIRD_TILE_X: 0.4,
  THIRD_TILE_Y: 0.8,
  TILE_ID_OFFSET: 2500,

  //Event Names
  REFRESH: "refresh:game",
  END_TURN: "end:turn",
  START_GAME: "game:start",
  QUEUE: "game:queue",

  //Relationships
  //Player
  PLAYS : "plays",
  WROTE : "wrote",
  BEING_PLAYED_BY : "beingPlayedBy",

  //Magnets & Tiles
  ENDS_WITH: "endsWith",
  RELATES_TO: "relatesTo",
  STARTS_WITH: "startsWith",
  REPRESENTS_WORD: "representsWord",
  REPRESENTS_IMAGE: "representsImage",
  REPRESENTS_INSTRUCTION: "representsInstruction",

  //Has
  HAS_TILE : "hasTile",
  HAS_PATH : "hasPath",
  HAS_PHRASE : "hasPhrase",
  HAS_MAGNET : "hasMagnet",

  //Properties
  //Common
  ID : "id",
  TYPE: "type",
  NAME : "name",

  TYPES: {
    GAME: "game",
    WORD: "word",
    PATH: "path",
    TILE: "tile",
    USER: "user",
    WORDS: "words",
    IMAGE: "image",
    PHRASE: "phrase",
    PLAYER: "player",
    
    INSTRUCTION: "instruction",
    MAGNET_PLAYER: "magnetPlayer",
    MAGNET_PHRASE: "magnetPhrase"
  },

  //Count Node
  GAME_COUNT: "gameCount",
  PATHS: {
    CW: "cw",
    NWORDS: "nWords",
    END_TILE: "endTile",
    START_TILE: "startTile"
  },
  //Path & Phrases

  phrases: {
    PATH_ID: "pathID"
  },

  //Game
  GAMES: {
    ID: "id",
    TURN: "turn",
    LEVEL: "level",
    GAME_OVER: "gameOver",
    USERNAMES: "usernames",
    ACTION_DONE: "actionDone",
    
    WORD_COUNT: "wordCount",
    TILE_COUNT: "tileCount",
    PATH_COUNT: "pathCount",
    PLAYER_COUNT: "playerCount",
    PHRASE_COUNT: "phraseCount"
  },
  
    ORDER: "order",
    SCORE: "score",
    ACTIVE: "active",
    SOCKET: "socket",
    MADNESS: "madness",
    USERNAME: "username",
    
  WORDS: {
    TYPE: "type",
    LEMMA: "lemma",
    POINTS: "points",
    CLASSES: "classes",
    CATEGORIES: "categories"
  },
  
  MAGNETS: {
    X: "x",
    Y: "y",
    ID: "id",
    ANGLE: "angle",
    OWNER: "owner",
    IS_RELATED: "isRelated",
    REPRESENTED_WORD: "representedWord"
  },
  
  IMAGE: {
    NAME: "name",
    RELATED: "related"
  },
  
  CONNECTED_TO: "connectedTo",
  REPRESENTED_WORD: "representedWord",
  REPRESENTED_IMAGE: "representedImage",
  REPRESENTED_INSTRUCTION: "representedInstruction",
  
  INSTRUCTIONS: {
    MULT: "mult",
    BONUS: "bonus",
    LEVEL: "level",
    CONDITION: "condition"
  },
  
  SHORT_DESCRIPTION : "shortDescription",
  LONG_DESCRIPTION : "longDescription",
  INSPIRATIONAL: "inspirational",
  CONDITION: "condition",

  //Users
  USERS: {
    SALT: "salt",
    NAME: "name",
    EMAIL: "email",
    BESOZ: "besoz",
    SURNAME: "surname",
    USERNAME: "username",
    LANGUAGE: "language",
    PASSWORD: "password",
    
    STARTING_BESOZ: 10
  }

  //End of Constants
};


// var limit = 100;
// var time = 0;
//
// for( var z = 0; z < limit; z++ ){
//   var start = new Date().getTime();
//
//   OP
//
//   var end = new Date().getTime();
//   time = time + (end - start);
// }
// console.log("op took: " + time/limit + "ms on average.");
