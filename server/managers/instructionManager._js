var oz = oz || {};

var tools = require("../tools._js"),
  
  retriever = require("../retrievers/retriever._js"),
  
  types = require( "../constants/types.js" ),
  rels = require("../constants/relationships.js"),
  props = require( "../constants/properties.js" ),
  indexes = require( "../constants/indexes.js" ),
  consts = require( "../constants/constants.js" );
  


module.exports =
{

  getInstruction: function ( id, _ )
  {
    var instruction = retriever.getInstructionByID( id, true, _ );
    
    return instruction;
  },

  getAllInstructions: function ( _ )
  {
    var instructions = retriever.getAllInstructions( true, _ );
    
    return instructions;
  },
  
  setInstruction: function( id, condition, shortDescription, longDescription, collections, bonus, mult, level, _ )
  {
    var instruction;
    
    if( id === -1 )
    {
      id = tools.getNewInstructionID(_);
      var instructionNode = tools.createNode({
          type: types.INSTRUCTION,
          id: id,
          mult: mult,
          bonus: bonus,
          condition: condition,
          shortDescription: shortDescription,
          longDescription: longDescription
        }, _ );
        
        instructionNode.index( indexes.INSTRUCTION_INDEX, props.ID, id, _ );
    }
    else
    {
      instruction = this.getInstruction( id, _ );
      
      if( instruction )
      {
        instruction.data[props.INSTRUCTION.CONDITION] = condition;
        instruction.data[props.INSTRUCTION.SHORT_DESCRIPTION] = shortDescription;
        instruction.data[props.INSTRUCTION.LONG_DESCRIPTION] = longDescription;
        instruction.data[props.INSTRUCTION.COLLECTIONS] = collections;
        instruction.data[props.INSTRUCTION.BONUS] = bonus;
        instruction.data[props.INSTRUCTION.MULT] = mult;
        instruction.data[props.INSTRUCTION.LEVEL] = level;
      }
    }
  }
}