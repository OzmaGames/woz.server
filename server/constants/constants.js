var oz = oz || {};

module.exports =
{
  //Game Types
  SINGLE: "single",
  RANDOM: "random",
  FRIEND: "friend",
  
  //Score
  BASE_POINTS: 0,
  RELATED_WORD_BONUS: 15,
  
  //Total Counts
  IMAGE_TOTAL: 20,
  
  RELATED_ARRAY_INDEX: 7,
  
  //Indexes
  COUNT_NODE_ID : 1,
  
  //Game Constants
  //Max Values
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
  WORDS_IN_FIRST_ROW: 8,
  WORDS_IN_OTHER_ROWS: 6,
  
  CLASS_COUNTS: {},

  COLLECTIONS:
  [
    { shortName: "basic", longName: "Basic" },
    { shortName: "woz", longName: "Words Of Oz" },
    { shortName: "nf", longName: "Nightfall" }
  ],
  
  LEVELS: [
    { gamesReq: 0, title: "Apprentice of Poetry" },
    { gamesReq: 5, title: "Practitioner of Poetry" },
    { gamesReq: 10, title: "Master of Poetry" }
  ],

  //Event Names
  
  REFRESH: "refresh:game",
  END_TURN: "end:turn",
  START_GAME: "game:start",
  QUEUE: "game:queue",
  GAME_UPDATE: "game:update",

  STARTING_BESOZ: 10,
  
  CLASS_NAMES: [
    "noun",
    "verb",
    
    "adverb",
    "pronoun",
    "adjective",
    "preposition",
    "conjunction",
    "related",
    "interjection",
    "important"
  ],
  
  //Word Balance
  BALANCE_BASIC: [
    1,  //noun
    1,  //verb
    1,  //adverb
    2,  //pronoun
    1,  //adjective
    2,  //preposition
    1,  //conjunction
    0,  //related
    0,  //interjection
    2  //important
  ],
  
  BALANCE_COLLECTION: [
    2,  //noun
    2,  //verb
    0,  //adverb
    0,  //pronoun
    2,  //adjective
    0,  //preposition
    0,  //conjunction
    3,  //related
    0,  //interjection
    0  //important
  ]
};