var oz = oz || {};

module.exports =
{
  //Score
  BASE_POINTS: 0,
  RELATED_WORD_BONUS: 10,
  INSPIRATIONAL_PENALTY: 3,
  
  //Total Counts
  WORD_TOTAL: 598,
  IMAGE_TOTAL: 25,
  INSTRUCTION_TOTAL: 7,
  
  RELATED_ARRAY_INDEX: 7,
  
  CLASS_COUNTS: {
    basic:{
      noun: 134,  //noun
      verb: 161,  //verb
      adverb: 77,  //adverb
      pronoun: 42,  //pronoun
      adjective: 113,  //adjective
      preposition: 36,  //preposition
      conjunction: 20,  //conjunction
      related: 0,  //related
      other: 5  //other
    },
    starter:
    {
      noun: 165,  //noun
      verb: 32,  //verb
      adverb: 0,  //adverb
      pronoun: 0,  //pronoun
      adjective: 18,  //adjective
      preposition: 0,  //preposition
      conjunction: 0,  //conjunction
      related: 183,  //related
      other: 0  //other
    },
    nightfall:
    {
      noun: 73,  //noun
      verb: 21,  //verb
      adverb: 1,  //adverb
      pronoun: 0,  //pronoun
      adjective: 25,  //adjective
      preposition: 0,  //preposition
      conjunction: 0,  //conjunction
      related: 0,  //related
      other: 0  //other
    }
  },

  COLLECTION_NAMES:  [ "basic", "starter", "nightfall" ],
  
  //Word Balance
  BALANCE: [
    1,  //noun
    4,  //verb
    1,  //adverb
    2,  //pronoun
    3,  //adjective
    2,  //preposition
    1,  //conjunction
    4,  //related
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
  BOARD_INDEX: "boardIndex",
  WORD_ID_INDEX : "WordIDIndex",
  WORD_LEMMA_INDEX : "WordLemmaIndex",
  
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
  FIRST_TILE_X: 0.1,
  FIRST_TILE_Y: 0.35,
  SECOND_TILE_X: 0.9,
  SECOND_TILE_Y: 0.35,
  THIRD_TILE_X: 0.4,
  THIRD_TILE_Y: 0.85,
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
  
  //Types
  GAME: "game",
  WORD: "word",
  PATH: "path",
  TILE: "tile",
  USER: "user",
  LEMMA: "lemma",
  WORDS: "words",
  IMAGE: "image",
  BOARD: "board",
  PHRASE: "phrase",
  PLAYER: "player",
  
  INSTRUCTION: "instruction",
  MAGNET_PLAYER: "magnetPlayer",
  MAGNET_PHRASE: "magnetPhrase",
  
  //Count Node
  GAME_COUNT: "gameCount",
  BOARD_COUNT: "boardCount",

  //Path & Phrases
  CW: "cw",
  NWORDS: "nWords",
  NBOARDS: "nBoards",
  PATH_ID: "pathID",
  END_TILE: "endTile",
  START_TILE: "startTile",
  WORD_COUNT: "wordCount",
  
  //Game
  TURN: "turn",
  ORDER: "order",
  SCORE: "score",
  ACTIVE: "active",
  SOCKET: "socket",
  MADNESS: "madness",
  USERNAME: "username",
  RESIGNED: "resigned",
  GAME_OVER: "gameOver",
  USERNAMES: "usernames",
  TILE_COUNT: "tileCount",
  PATH_COUNT: "pathCount",
  ACTION_DONE: "actionDone",
  PLAYER_COUNT: "playerCount",
  PHRASE_COUNT: "phraseCount",
  RESIGNED_COUNT: "resignedCount",

  //Magnets & Tiles
  X: "x",
  Y: "y",
  MULT: "mult",
  OWNER: "owner",
  ANGLE: "angle",
  BONUS: "bonus",
  POINTS: "points",
  IS_RELATED: "isRelated",
  CONNECTED_TO: "connectedTo",
  REPRESENTED_WORD: "representedWord",
  REPRESENTED_IMAGE: "representedImage",
  REPRESENTED_INSTRUCTION: "representedInstruction",

  //Instructions
  SHORT_DESCRIPTION : "shortDescription",
  LONG_DESCRIPTION : "longDescription",
  INSPIRATIONAL: "inspirational",
  CONDITION: "condition",

  //Users
  SALT: "salt",
  EMAIL: "email",
  BESOZ: "besoz",
  SURNAME: "surname",
  LANGUAGE: "language",
  PASSWORD: "password",
  STARTING_BESOZ: 10

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
