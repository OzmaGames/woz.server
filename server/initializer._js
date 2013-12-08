var oz = oz || {};

var neo4j = require("neo4j"),
  
  tools = require("./tools._js"),
  randomizer = require("./randomizer._js"),
  
  types = require( "./constants/types.js" ),
  indexes = require( "./constants/indexes.js" ),
  consts = require( "./constants/constants.js" ),
  props = require( "./constants/properties.js" ),
  rels = require("./constants/relationships.js"),
  environment = require("./constants/environment.js"),
  
  words = require( "./resources/words.js" ).words,
  nfImages = require("./resources/nfImages.js").images,
  wozImages = require("./resources/wozImages.js").images,
  instructions = require("./resources/instructions.js").instructions;
  
var db = new neo4j.GraphDatabase(environment.DB_URL);

var classCounts = {};

var print = true;

module.exports =
{
  initDB : function( _ )
  {
    var a, b, c, d, e;
    var wordNode = false;
    var countNode = tools.createNode( { gameCount : 0, boardCount: 0 }, _ );
    var collectionImages = [ [], wozImages, nfImages ];
    
    var word;
    var classes;
    var categories;
    var collectionName;
    
    for( a = 0; a < consts.COLLECTIONS.length; a++ ){
      classCounts[ consts.COLLECTIONS[a].shortName ] = {
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
      
      try{
      
        if( print ) console.log( "adding collection: " + consts.COLLECTIONS[a].longName );
        var collectionNode = tools.createNode({
          type: types.COLLECTION,
          longName: consts.COLLECTIONS[a].longName,
          shortName: consts.COLLECTIONS[a].shortName
        }, _ );
        
        collectionNode.index( indexes.COLLECTION_INDEX, props.COLLECTION.SHORT_NAME, consts.COLLECTIONS[a].shortName, _ );
      }catch( ex ){
        console.log( "failed adding collection: " + consts.COLLECTIONS[a].longName );
        console.log( ex );
      }
    }
    
    if( print ) console.log( "all collections added " );
    
    for( a = 0; a < words.length; a++ ){
      word = words[a];
      
      try{
        if( print ) console.log( "adding word: " + word.lemma );
        wordNode = tools.createNode({
          type: types.WORD,
          lemma: word.lemma,
          points: word.points,
          classes: word.classes,
          categories: word.categories,
          collections: words.collections,
        }, _ );
        
        wordNode.index( indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, word.lemma, _ );
        
        for( b = 0; b < word.collections.length; b++ ){
          wordNode.index( word.collections[b] + indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, word.lemma, _ );
          for( c = 0; c < word.classes.length; c++ ){
            wordNode.index( word.collections[b] + word.classes[c] + "ClassIndex", props.ID, classCounts[word.collections[b]][word.classes[c]]++, _ );
          }
        }
      }catch( ex ){
        console.log( "failed adding word: " + word.lemma );
        console.log( ex );
      }
    }
    
    if( print ) console.log( "all words added " );
    
    for( a = 0; a < collectionImages.length; a++ ){
      var collectionName = consts.COLLECTIONS[a][props.COLLECTION.SHORT_NAME];
      
      for( b = 0; b < collectionImages[a].length; b++ ){
        var image = collectionImages[a][b];
        
        try
        {
          if( print ) console.log( "adding image: " + image.name );
          var imageNode = tools.createNode({
            type: types.IMAGE,
            id:  image.id,
            name: image.name,
            related: image.related,
            collection: collectionName
          }, _ );
          
          imageNode.index( indexes.IMAGE_INDEX, props.IMAGE.NAME, image.name, _ );
          imageNode.index( collectionName + indexes.IMAGE_INDEX, props.ID, image.id, _ );
        }
        catch( ex )
        {
          console.log( "failed adding image: " + image.name );
          console.log( ex );
        }
        
        for( c = 0; c < image.related.length; c++ ){
          try
          {
            var relatedWordNode = db.getIndexedNodes( indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, image.related[c], _ )[0];
            relatedWordNode.data.classes.push( "related" );
            relatedWordNode.save(_);
            
            imageNode.createRelationshipTo( relatedWordNode, rels.RELATES_TO, {}, _ );
            
            relatedWordNode.index( collectionName + "relatedClassIndex", props.ID, classCounts[collectionName].related++, _ );
          }
          catch( ex )
          {
            console.log( "failed relating " + image.related[c] + " to " + image.name );
            console.log( ex );
          }
        }
      }
    }
    
    if( print ) console.log( "all images added " );
    
    for( a = 0; a < instructions.length; a++ ){
      var instruction = instructions[a];
      
      try{
        if( print ) console.log( "adding instruction: " + instruction.condition );
        var instructionNode = tools.createNode({
          type: types.INSTRUCTION,
          id: a,
          mult: instruction.mult,
          bonus: instruction.bonus,
          condition: instruction.condition,
          shortDescription: instruction.shortDescription,
          longDescription: instruction.longDescription
        }, _ );
        instructionNode.index( indexes.INSTRUCTION_INDEX, props.ID, a, _ );
      }catch( ex ){
        console.log( "failed adding " + instruction.shortDescription );
        console.log( ex );
      }
    }
    
    if( print ) console.log( "all instructions added " );
    
    var user = tools.createNode({
      type: types.USER,
      username : "ozma",
      salt: "ozma",
      password : "ozma",
      email: "ozma@ozma.com",
      name: "ozma",
      surname: "ozma",
      language: "ozma",
      gamesPlayed: 0,
      besoz: 0
    }, _ );
    
    user.index( indexes.USER_USERNAME_INDEX, props.USER.USERNAME, "ozma", _ );
    user.index( indexes.USER_EMAIL_INDEX, props.USER.EMAIL, "ozma@ozma.com", _ );
    
    console.log( classCounts );
//   for( j = 0; j < collectionNames.length; j++ ){
//     countNode.data[collectionNames[j] + "classCounts" ] = classCounts[ collectionNames[j] ];
//   }
//   console.log( defaultWords.length );
//   countNode.save(_);
  }
};
