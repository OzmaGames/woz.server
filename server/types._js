var oz = oz || {};

module.exports =
{ 
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
  VERSION_OF: "versionOf",
  COLLECTION: "collection",
  COLLECTIONS: "collections",
  GAMES_PLAYED: "gamesPlayed",
  
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
