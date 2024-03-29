var oz = oz || {};

var tools = require("../tools._js");
  
var retriever = require("../retrievers/retriever._js");
var instructionRetriever = require( "../retrievers/instructionRetriever._js" );  

var types = require( "../constants/types.js" );
var rels = require("../constants/relationships.js");
var props = require( "../constants/properties.js" );
var indexes = require( "../constants/indexes.js" );
var consts = require( "../constants/constants.js" );

module.exports =
{

  getInstruction: function ( id, _ )
  {
    var instruction = instructionRetriever.getInstructionByID( id, true, _ );
    
    return instruction;
  },

  getAllInstructions: function ( _ )
  {
    var instructions = instructionRetriever.getAllInstructions( true, _ );
    
    return instructions;
  },
  
  setInstruction: function( id, conditions, shortDescription, longDescription, collections, bonus, mult, level, _ )
  {
    var instruction;
    
    if( id === -1 )
    {
      id = tools.getNewInstructionID(_);
      instruction = tools.createNode({
          type: types.INSTRUCTION,
          id: id,
          mult: mult,
          bonus: bonus,
          level: level,
          condition: conditions,
          collections: collections,
          longDescription: longDescription,
          shortDescription: shortDescription
          
        }, _ );
        
        instruction.index( indexes.INSTRUCTION_INDEX, props.ID, id, _ );
    }
    else
    {    
      instruction = instructionRetriever.getInstructionByID( id, false, _ );
      
      if( instruction )
      {
        instruction.data[props.INSTRUCTION.CONDITION] = conditions;
        instruction.data[props.INSTRUCTION.SHORT_DESCRIPTION] = shortDescription;
        instruction.data[props.INSTRUCTION.LONG_DESCRIPTION] = longDescription;
        instruction.data[props.INSTRUCTION.COLLECTIONS] = collections;
        instruction.data[props.INSTRUCTION.BONUS] = bonus;
        instruction.data[props.INSTRUCTION.MULT] = mult;
        instruction.data[props.INSTRUCTION.LEVEL] = level;
        
        instruction.save( _ );
      }
    }
    
    return id;
  },
  
  deleteInstruction: function( id, _ )
  {
    var instruction = instructionRetriever.getInstructionByID( id, false, _ );    
    if( instruction )
    {
      instruction.data[props.WORD.ACTIVE] = false;
      instruction.save( _ );
    }
  }
};