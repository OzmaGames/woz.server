var neo4j = require("neo4j"),
  consts = require("./constants._js"),
  retriever = require("./retriever._js");


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
        var randomN = Math.floor( this.getRandomInRange( 0, consts.CLASS_COUNTS[i] ) );
        word = retriever.getWordInClassIndex( consts.CLASS_NAMES[i] +  "ClassIndex", randomN, _ );
        break;
      }
    }
    return word;
  },

  getRandomWordByClass : function( className, _ )
  {
    var randomN = Math.floor( this.getRandomInRange( 0, consts.CLASS_COUNTS[className] ) );
    var word = retriever.getWordFromClassIndex( className, randomN, _ );
    
    return word;
  },
  
  getRandomImage : function( _ )
  {
    var randomN = Math.floor( Math.random() *  getTotalImageCount() );
    var image = retriever.getImageFromIndex( randomN, _ );

    return image;
  },

  getRandomInstruction : function( _ )
  {
    var randomN = Math.floor( Math.random() *  getTotalInstructionCount() );
    var instruction = retriever.getInstructionFromIndex( randomN, _ );
    
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

  
};

function getTotalWordCount()
{
  return consts.WORD_TOTAL;
}

function getTotalImageCount()
{
  return consts.IMAGE_TOTAL;
}

function getTotalInstructionCount()
{
  return consts.INSTRUCTION_TOTAL;
}

