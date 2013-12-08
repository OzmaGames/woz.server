var oz = oz || {};

var inparser = require( "./inparser._js" ),

  types = require( "./constants/types.js" ),
  rels = require("./constants/relationships.js"),
  props = require( "./constants/properties.js" ),
  consts = require( "./constants/constants.js" ),  
  
  retriever = require( "./retrievers/retriever._js" );

module.exports =
{
  scoringTime: function( words, tiles, _ )
  {
    var i, j;
    var mult = 0;
    var score = consts.BASE_POINTS;
    
    var firstTileImage = retriever.getTileImage( tiles[0].id, _ );
    var secondTileImage = retriever.getTileImage( tiles[1].id, _ );
    var firstTileInstruction = retriever.getTileInstruction( tiles[0].id, _ );
    var secondTileInstruction = retriever.getTileInstruction( tiles[1].id, _ );
    var satisfiedFirstInstruction = inparser.checkInstruction( firstTileInstruction.data[props.INSTRUCTION.CONDITION], words, _ );
    var satisfiedSecondInstruction = inparser.checkInstruction( secondTileInstruction.data[props.INSTRUCTION.CONDITION], words, _ );

    for( i = 0; i < words.length; i++ ){
      var currentWord = words[i];
      
      score += currentWord.data[props.WORD.POINTS];
      
      for( j = 0; j < firstTileImage.data.related.length; j++ ){
      console.log( firstTileImage.data.related[j] );
        if( firstTileImage.data.related[j] == currentWord.data[props.WORD.LEMMA] ){
          score += consts.RELATED_WORD_BONUS;
        }
      }
      
      for( j = 0; j < secondTileImage.data.related.length; j++ ){
      
        if( secondTileImage.data.related[j] == currentWord.data[props.WORD.LEMMA] ){
          score += consts.RELATED_WORD_BONUS;
        }
      }
    }
    
    if( satisfiedFirstInstruction ){
      score += firstTileInstruction.data[props.INSTRUCTION.BONUS];
    }
    
    if( satisfiedSecondInstruction ){
      score += secondTileInstruction.data[props.INSTRUCTION.BONUS];
    }
    
    if( satisfiedFirstInstruction ){
      mult += firstTileInstruction.data[props.INSTRUCTION.MULT];
    }
    
    if( satisfiedSecondInstruction ){
      mult += secondTileInstruction.data[props.INSTRUCTION.MULT];
    }
    
    if( mult !== 0 ){
      score = score * mult;
    }
    
    return score;
  },

  isTheGameOver: function( game, _ )
  {
    var over = false;
    
    if( game.data[props.GAME.PHRASE_COUNT] == game.data[props.GAME.PATH_COUNT] ){
      over = true;
    }
    
    return over;
  },

  canIPlayWithMadness: function( words, wordCount, _ )
  {
    var madness = 0;
    
    if( words.length === 0 ){
      madness = 1;
    }else if( words.length != wordCount ){
      madness = 2;
    }
    
    if( madness !== 0 ) console.log( "madness? " + madness );
    
    return madness;
  },
  
  setActionDone: function( game, actionDone, _ )
  {
    game.data[props.GAME.ACTION_DONE] = actionDone;
    game.save(_);
  },
  
  endTurn: function( game, _ )
  {
    this.setActionDone( game, false, _ );
    game.data[props.GAME.TURN]++;
    game.save(_);
  }
};
