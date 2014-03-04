var types = require( "./constants/types.js" );
var rels = require("./constants/relationships.js");
var props = require( "./constants/properties.js" );
var consts = require( "./constants/constants.js" );
  
var instructionRetriever = require("./retrievers/instructionRetriever._js");
var retriever = require("./retrievers/retriever._js");
var randomizer = require("./randomizer._js");

var instructions = {};

module.exports =
{
  loadInstructions: function( _ )
  {
    var a, b;
    var instruction;
    var collectionName;
    var collections = retriever.getAllCollections( true, _ );
    var tempInstructions = instructionRetriever.getAllInstructions( false, _ );
    
    instructions = {};
    
    for( a = 0; a < collections.length; a++ ){
      collectionName = collections[a][props.COLLECTION.SHORT_NAME];
      instructions[collectionName] = [];
    }
    
    for( a = 0; a < tempInstructions.length; a++ ){
      instruction = tempInstructions[a];
      if( instruction )
      {
        if( !instruction.data.hasOwnProperty( props.INSTRUCTION.COLLECTIONS ) )
        {
          instruction.data[props.INSTRUCTION.COLLECTIONS] = ["basic"];
          instruction.save(_);
        }
        
        for( b = 0; b < instruction.data[props.INSTRUCTION.COLLECTIONS].length; b++ ){
          collectionName = instruction.data[props.WORD.COLLECTIONS][b];
          instructions[collectionName].push( instruction );
        }
      }
    }
  },

  getInstructions: function()
  {
    return instructions;
  },

  getRandomInstructions: function( collectionName, nInstructions )
  {
    var a, b;
    var instruction;
    var randomInstructions = [];
    var instructionID;
    var duplicate;
    
    var basicLength = instructions["basic"].length;
    var collectionLength = instructions[collectionName].length;
    
    if( collectionLength >= nInstructions )
    {
      instructionID = randomizer.getRandomIntegerInRange( 0, collectionLength - 1 );
      randomInstructions.push( instructions[collectionName][instructionID] );
      
      for( a = 1; a < nInstructions; a++ ){
        do{
          instructionID = randomizer.getRandomIntegerInRange( 0, basicLength + collectionLength -1 );
          if( instructionID > basicLength - 1 )
          {
            instruction = instructions[ collectionName ][ instructionID - basicLength ];
          }else{
            instruction = instructions[ "basic" ][ instructionID ];
          }
          
          duplicate = false;
          
          for( b = 0; b < randomInstructions.length; b++ ){
            if( randomInstructions[b].data[props.ID] === instruction.data[props.ID] )
            {
              duplicate = true;
              break;
            }
          }
          
        }while( duplicate );
        
        randomInstructions.push( instruction );
      }
    }
    
    return randomInstructions;
  },
  
  
};

