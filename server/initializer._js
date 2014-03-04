var oz = oz || {};

var neo4j = require("neo4j");
  
var tools = require("./tools._js");
var randomizer = require("./randomizer._js");

var boardManager = require("./managers/boardManager._js");

var types = require( "./constants/types.js" );
var indexes = require( "./constants/indexes.js" );
var consts = require( "./constants/constants.js" );
var props = require( "./constants/properties.js" );
var rels = require("./constants/relationships.js");
var environment = require("./constants/environment.js");

var words = require( "./resources/words.js" ).words;
var boards = require( "./resources/boards.js").boards;
var nfImages = require("./resources/nfImages.js").images;
var wozImages = require("./resources/wozImages.js").images;
var instructions = require("./resources/instructions.js").instructions;
  
var db = new neo4j.GraphDatabase(environment.DB_URL);

var classCounts = {};

var print = true;

module.exports =
{
  initDB : function( _ )
  {
    var a, b, c, d, e;
    var alreadyRelated;
    var wordNode = false;
    var countNode = tools.createNode( { gameCount : 0, boardCount: 0, instructionCount: 0 }, _ );
    var collectionImages = [ [], wozImages, nfImages ];
    
    var word;
    var image;
    var classes;
    var imageNode;
    var categories;
    var collectionName;
    var collectionNode;
    
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
        interjection: 0,
        important: 0
      };
      
      try
      {
        if( print ) console.log( "adding collection: " + consts.COLLECTIONS[a].longName );
        collectionNode = tools.createNode({
          type: types.COLLECTION,
          longName: consts.COLLECTIONS[a].longName,
          shortName: consts.COLLECTIONS[a].shortName
        }, _ );
        
        collectionNode.index( indexes.COLLECTION_INDEX, props.COLLECTION.SHORT_NAME, consts.COLLECTIONS[a].shortName, _ );  
      }
      catch( ex ){
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
          active: true,
          lemma: word.lemma,
          points: word.points,
          classes: word.classes,
          categories: word.categories,
          collections: word.collections,
        }, _ );
        
        wordNode.index( indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, word.lemma, _ );
        
      }catch( ex ){
        console.log( "failed adding word: " + word.lemma );
        console.log( ex );
      }
    }
    
    if( print ) console.log( "all words added " );
    
    for( a = 0; a < collectionImages.length; a++ ){
      collectionName = consts.COLLECTIONS[a][props.COLLECTION.SHORT_NAME];
      
      for( b = 0; b < collectionImages[a].length; b++ ){
        image = collectionImages[a][b];
        
        try
        {
          if( print ) console.log( "adding image: " + image.name );
          imageNode = tools.createNode({
            type: types.IMAGE,
            active: true,
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
            if( image.related[c] )
            {
              var relatedWordNode = db.getIndexedNodes( indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, image.related[c], _ )[0];
              imageNode.createRelationshipTo( relatedWordNode, rels.RELATES_TO, {}, _ );
              
              alreadyRelated = false;
              for( d = 0; d < relatedWordNode.data[props.WORD.CLASSES].length; d++ ){
                if( relatedWordNode.data[props.WORD.CLASSES][d] === "related" )
                {
                  alreadyRelated = true;
                  break;
                }
              }
              
              if( !alreadyRelated )
              {
                relatedWordNode.data.classes.push( "related" );
                relatedWordNode.save(_);
              }
            }
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
          id: tools.getNewInstructionID( _ ),
          active: true,
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
      username : "ali",
      salt: "ali",
      password : "12345",
      email: "ali@ali.com",
      name: "ali",
      surname: "ali",
      language: "ali",
      gamesPlayed: 0,
      besoz: 0
    }, _ );
    
    user.index( indexes.USER_USERNAME_INDEX, props.USER.USERNAME, "ali", _ );
    user.index( indexes.USER_EMAIL_INDEX, props.USER.EMAIL, "ali@ali.com", _ );
    
    console.log( classCounts );
//   for( j = 0; j < collectionNames.length; j++ ){
//     countNode.data[collectionNames[j] + "classCounts" ] = classCounts[ collectionNames[j] ];
//   }
//   console.log( defaultWords.length );
//   countNode.save(_);

    for( var i = 0; i < boards.length; i++ ){
      boardManager.setBoard( -1, boards[i].level, boards[i].draft, boards[i].tiles, boards[i].paths, _ );
    }
  }
};
