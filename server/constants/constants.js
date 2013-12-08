var oz = oz || {};

module.exports =
{
  //Score
  BASE_POINTS: 0,
  RELATED_WORD_BONUS: 10,
  INSPIRATIONAL_PENALTY: 3,
  
  CLASSES: 
  [
    "noun",
    "verb",
    "adverb",
    "article",
    "pronoun",
    "adjective",
    "preposition",
    "conjunction"
  ],
  
  //Total Counts
  WORD_TOTAL: 598,
  IMAGE_TOTAL: 20,
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
    woz:
    {
      noun: 165,  //noun
      verb: 32,  //verb
      adverb: 0,  //adverb
      pronoun: 0,  //pronoun
      adjective: 18,  //adjective
      preposition: 0,  //preposition
      conjunction: 0,  //conjunction
      related: 151,  //related
      other: 0  //other
    },
    nf:
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

  COLLECTIONS:
  [
    { shortName: "basic", longName: "Basic" },
    { shortName: "woz", longName: "Words Of Oz" },
    { shortName: "nf", longName: "Nightfall" }
  ],
  
  INSTRUCTIONS :
  [
    { shortDescription : "First letter: R * 2", longDescription : "The phrase must contain (at least) two words that begins with R", condition : "begin 2 r", bonus: 15, mult: 0, level: 1 },
    { shortDescription : "First letter: S", longDescription : "The phrase must contain (at least) one word that begins with S", condition : "begin 1 s", bonus: 10, mult: 0, level: 1 },
    { shortDescription : "Adjective", longDescription : "The phrase must contain (at least) one adjective", condition : "class 1 adjective", bonus: 10, mult: 0, level: 3 },
    { shortDescription : "Two Verbs", longDescription : "The phrase must contain (at least) two verbs", condition : "class 2 verb", bonus: 15, mult: 0, level: 3 },
    { shortDescription : "Feeling", longDescription : "The phrase must contain (at least) one word that represents a feeling", condition : "category 1 feeling", bonus: 40, mult: 0, level: 2 },
    { shortDescription : "Animal", longDescription : "The phrase must contain (at least) one word that represents an animal", condition : "category 1 animal", bonus: 0, mult: 2, level: 2 },
    { shortDescription : "Color", longDescription : "The phrase must contain (at least) one word that represents a color", condition : "category 1 color", bonus: 0, mult: 2, level: 2 }
  ],
  
  LEVEL: [ "Apprentice of Poetry", "Practitioner of Poetry", "Master of Poetry" ],
  
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
    2  //other
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
    0  //other
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
  

  STARTING_BESOZ: 10
};