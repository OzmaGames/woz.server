var loader = require("./loader._js"),

  types = require( "./constants/types.js" ),
  rels = require("./constants/relationships.js"),
  props = require( "./constants/properties.js" ),
  consts = require( "./constants/constants.js" ),  
  
  retriever = require("./retrievers/retriever._js");

module.exports =
{
  getRandomWord : function( _ )
  {
    var word;
    var total = 0;
    var randomC = Math.random();
    for( var i = 0; i < consts.BALANCE.length; i ++ ){
      total += consts.BALANCE[i];
      if( randomC < total ){
        var randomN = Math.floor( this.getRandomIntegerInRange( 0, consts.CLASS_COUNTS[i] - 1 ) );
//         word = retriever.getWordFromClassIndex( consts.CLASS_NAMES[i], randomN, _ );
        word = loader.getWords()[className][randomN];
        break;
      }
    }
    return word;
  },

  getRandomWordByClass : function( collectionName, className, _ )
  { 
    var randomN = Math.floor( this.getRandomIntegerInRange( 0, consts.CLASS_COUNTS[collectionName][className] - 1 ) );
    var word = retriever.getWordFromClassIndex( collectionName, className, randomN, _ );
    
    return word;
  },

  getRandomWordByClassWithLoader : function( collectionName, className, _ )
  {
    var randomN = Math.floor( this.getRandomIntegerInRange( 0, consts.CLASS_COUNTS[collectionName][className] - 1 ) );
    var word = loader.getWords()[className][randomN];
    
    return word;
  },
  
  getRandomImage : function( collectionName, _ )
  {
    var randomN = Math.floor( Math.random() *  20 );
    var image = retriever.getImageByCollectionAndID( collectionName, randomN, _ );
    
    return image;
  },
  
  getRandomInstruction : function( _ )
  {
    var randomN = Math.floor( Math.random() *  consts.INSTRUCTION_TOTAL );
    var instruction = retriever.getInstructionByID( randomN, false, _ );
    
    return instruction;
  },
  
  getRandomInRange: function( min, max )
  {
    return Math.random() * ( max - min ) + min;
  },
  
  getRandomIntegerInRange: function( min, max )
  {
    return Math.round( this.getRandomInRange( min, max ) );
  },
  
  getSignedRandomInRange: function( min, max )
  {
    var random = Math.random() * ( max - min ) + min;
    return (Math.random() > 0.5) ? random : (0 - random);
  },
  
  getArrayOfUniqueRandomIntegerInRange: function( size, min, max )
  {
    var i = 0;
    var j = 0;
    var temp = 0;
    var ret = [];
    
    for( i = 0; i < size; i++ ){
      temp = this.getRandomIntegerInRange( min, max );
      if( i > 0 ){
        for( j = 0; j < ret.length; j++ ){
          if( ret[j] === temp ){
            i--;
            break;
          }
        }
      }
      if( j === ret.length ){
        ret.push( temp );
      }
    }
    
    return ret;
  }  
};
