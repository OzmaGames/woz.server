var oz = oz || {};

var neo4j = require("neo4j"),
  tools = require("./tools._js"),
  consts = require("./constants._js"),
  randomizer = require("./randomizer._js"),
  environment = require("./environment._js"),
  
  tiles = require("./sets/starterTiles.js"),
  basic = require("./sets/basicWords.js");
  starter = require("./sets/starterWords.js");
  nightfall = require("./sets/nightfallWords.js");
  
var db = new neo4j.GraphDatabase(environment.DB_URL);

var collections = {};
var collectionNames = [ "basic", "starter", "nightfall" ];

var defaultClasses = [ "noun", "verb", "adverb", "article", "pronoun", "adjective", "preposition", "conjunction" ];

collections.basic = basic.basic;
collections.starter = starter.starter;
collections.nightfall= nightfall.nightfall;

var defaultImages = tiles.tiles;

var defaultInstructions = [
  { shortDescription : "First letter: R * 2", longDescription : "The phrase must contain (at least) two words that begins with R", condition : "begin 2 r", bonus: 15, mult: 0, level: 1 },
  { shortDescription : "First letter: S", longDescription : "The phrase must contain (at least) one word that begins with S", condition : "begin 1 s", bonus: 10, mult: 0, level: 1 },
  { shortDescription : "Adjective", longDescription : "The phrase must contain (at least) one adjective", condition : "class 1 adjective", bonus: 10, mult: 0, level: 3 },
  { shortDescription : "Two Verbs", longDescription : "The phrase must contain (at least) two verbs", condition : "class 2 verb", bonus: 15, mult: 0, level: 3 },
  { shortDescription : "Feeling", longDescription : "The phrase must contain (at least) one word that represents a feeling", condition : "category 1 feeling", bonus: 40, mult: 0, level: 2 },
  { shortDescription : "Animal", longDescription : "The phrase must contain (at least) one word that represents an animal", condition : "category 1 animal", bonus: 0, mult: 2, level: 2 },
  { shortDescription : "Color", longDescription : "The phrase must contain (at least) one word that represents a color", condition : "category 1 color", bonus: 0, mult: 2, level: 2 }
];

var classCounts = {};

var print = true;

module.exports =
{
  initDB : function( _ )
  {
    var i, j, k;
    var currentWordNode = false;
    var countNode = tools.createNode( { gameCount : 0 }, _ );
    
    try{
      for( j = 0; j < collectionNames.length; j++ ){
        
        var collectionName = collectionNames[j];
        var collection = collections[ collectionName ];
        console.log( "\n" + collectionName + ": " + collection.length );
        
        classCounts[collectionName] = {
          noun: 0,
          verb: 0,
          adverb: 0,
          pronoun: 0,
          adjective: 0,
          preposition: 0,
          conjunction: 0,
          related: 0,
          other: 0
        };
        
        for( i = 0; i < collection.length; i++ ){
          currentWordNode = false;
          
          var currentWord = collection[i];
          
          if( j !== 0 ){
            currentWordNode = db.getIndexedNodes( consts.WORD_LEMMA_INDEX, consts.LEMMA, currentWord.lemma, _ )[0];
          }
          
          if( currentWordNode ){
            if( print ) console.log( "word " + currentWordNode.data.lemma + " already exists");
            currentWordNode.data.collections.push( collectionName );
          }else{
            currentWordNode = tools.createNode({
              type: consts.WORD,
              lemma: currentWord.lemma,
              points: randomizer.getRandomIntegerInRange(0, 4),
              collections: [collectionName],
              categories: [""],
              versionOf: ""
            }, _ );
            
            currentWordNode.index( consts.WORD_LEMMA_INDEX, consts.LEMMA, currentWord.lemma, _ );
            currentWordNode.index( collectionName + consts.WORD_LEMMA_INDEX, consts.LEMMA, currentWord.lemma, _ );
            
            var categories = currentWord.categories.split(', ');
            if( categories.length > 0 && categories[0] !== "" ){
              currentWordNode.data.categories = categories;
              currentWordNode.save(_);
            }
            
            var classes = currentWord.classes.split(', ');
            
            for( k = 0; k < classes.length; k++ ){
              currentWordNode.index( collectionName + classes[k] + "ClassIndex", consts.ID, classCounts[collectionName][classes[k]]++, _ );
            }
            currentWordNode.data.classes = classes;
            currentWordNode.save(_);
            
            if( print ) console.log( "added word: " + currentWord.lemma );
          }
        }
      }
    }
    catch( ex )
    {
      console.log( "ooops" );
      console.log( ex.message );
    }
    
    for( i = 0; i < defaultImages.length; i++ ){
      var currentImage = defaultImages[i];
      var currentImageNode = tools.createNode({
        type: consts.IMAGE,
        name: currentImage.name,
        collection: "starter",
        related: currentImage.related
      }, _ );
      currentImageNode.index( consts.IMAGE_INDEX, consts.ID, i, _ );
      
      var relatedWordsIDs =[];
      var relatedWords = currentImage.related.split(', ');
      for( j = 0; j < relatedWords.length; j++ ){
        try{
          var relatedWordNode = db.getIndexedNodes( consts.WORD_LEMMA_INDEX, consts.LEMMA, relatedWords[j], _ )[0];
          relatedWordNode.data.classes.push( "related" );
          relatedWordNode.save(_);
          
          currentImageNode.createRelationshipTo( relatedWordNode, consts.RELATES_TO, {}, _ );
          relatedWordNode.index( "relatedClassIndex", consts.ID, classCounts.starter.related++, _ );
        }catch( ex ){
          console.log( "didnt work for " + relatedWords[j] );
        }
      }
      
      currentImageNode.save(_);
      
      if( print ) console.log( "added image: " + currentImage.name );
    }
    
    for( i = 0; i < defaultInstructions.length; i++ ){
      var currentInstruction = defaultInstructions[i];
      var currentInstructionNode = tools.createNode({
        type: consts.INSTRUCTION,
        id: i,
        mult: currentInstruction.mult,
        bonus: currentInstruction.bonus,
        condition: currentInstruction.condition,
        shortDescription: currentInstruction.shortDescription,
        longDescription: currentInstruction.longDescription
      }, _ );
      currentInstructionNode.index( consts.INSTRUCTION_INDEX, consts.ID, i, _ );
      
      if( print ) console.log( "added instruction: " + currentInstruction.condition );
    }
    
    console.log( classCounts );
//     for( j = 0; j < collectionNames.length; j++ ){
//       countNode.data[collectionNames[j] + "classCounts" ] = classCounts[ collectionNames[j] ];
//     }
//     console.log( defaultWords.length );
    
//     countNode.save(_);
  }
};
