var oz = oz || {};

module.exports =
{
  ID: "id",
  TYPE: "type",

  COUNT_NODE: {
    GAME_COUNT: "gameCount",
    BOARD_COUNT: "boardCount",
    INSTRUCTION_COUNT: "instructionCount"
  },
  
  USER: {
    SALT: "salt",
    NAME: "name",
    EMAIL: "email",
    BESOZ: "besoz",
    GAMES_PLAYED: "gamesPlayed",
    SURNAME: "surname",
    USERNAME: "username",
    LANGUAGE: "language",
    PASSWORD: "password"
  },
  
  PLAYER: {
    ORDER: "order",
    SCORE: "score",
    ACTIVE: "active",
    SOCKET: "socket",
    MADNESS: "madness",
    USERNAME: "username",
    RESIGNED: "resigned"
  },
  
  GAME: {
    ID: "id",
    TURN: "turn",
    LEVEL: "level",
    LAST_MOD: "lastMod",
    GAME_OVER: "gameOver",
    USERNAMES: "usernames",
    START_DATE: "startDate",
    COLLECTION: "collection",
    ACTION_DONE: "actionDone",
    
    WORD_COUNT: "wordCount",
    TILE_COUNT: "tileCount",
    PATH_COUNT: "pathCount",
    PLAYER_COUNT: "playerCount",
    PHRASE_COUNT: "phraseCount",
    RESIGNED_COUNT: "resignedCount"
  },
  
  MAGNET: {
    X: "x",
    Y: "y",
    ANGLE: "angle",
    OWNER: "owner",
    CLASS: "class",
    ORDER: "order",
    IS_RELATED: "isRelated",
    COLLECTION: "collection",
    REPRESENTED_WORD: "representedWord"
  },
  
  TILE: {
    X: "x",
    Y: "y",
    ANGLE: "angle",
    REPRESENTED_IMAGE: "representedImage",
    REPRESENTED_INSTRUCTION: "representedInstruction",
  },
  
  PHRASE: {
    SCORE: "score",
    PATH_ID: "pathID",
    USERNAME: "username",
    WORD_COUNT: "wordCount",
    PHRASE_STRING: "phraseString"
  },
  
  COLLECTION: {
    LONG_NAME: "longName",
    SHORT_NAME: "shortName"
  },
  
  WORD: {
    LEMMA: "lemma",
    POINTS: "points",
    CLASSES: "classes",
    VERSION_OF: "versionOf",
    CATEGORIES: "categories",
    COLLECTIONS: "collections",
  },
  
  IMAGE: {
    NAME: "name",
    RELATED: "related",
    COLLECTION: "collection"
  },
  
  INSTRUCTION: {
    MULT: "mult",
    BONUS: "bonus",
    LEVEL: "level",
    CONDITION: "condition",
    INSPIRATIONAL: "inspirational",
    LONG_DESCRIPTION : "longDescription",
    SHORT_DESCRIPTION : "shortDescription"
  },
  
  PATH: {
    CW: "cw",
    NWORDS: "nWords",
    END_TILE: "endTile",
    START_TILE: "startTile"
  }
};