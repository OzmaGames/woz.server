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
    var a, i, j;
    var mult = 0;
    var score = { total: consts.BASE_POINTS, words: [], startTile: { satisfied: false }, endTile: { satisfied: false } };
    var firstTileImage = retriever.getTileImage( tiles[0].id, _ );
    var secondTileImage = retriever.getTileImage( tiles[1].id, _ );
    var firstTileInstruction = retriever.getTileInstruction( tiles[0].id, _ );
    var secondTileInstruction = retriever.getTileInstruction( tiles[1].id, _ );
    var satisfiedFirstInstruction = inparser.checkInstruction( firstTileInstruction.data[props.INSTRUCTION.CONDITION], words, _ );
    var satisfiedSecondInstruction = inparser.checkInstruction( secondTileInstruction.data[props.INSTRUCTION.CONDITION], words, _ );

    for( i = 0; i < words.length; i++ ){
      var currentWord = words[i];
      
      score.total += currentWord.data[props.WORD.POINTS];
      score.words.push({ lemma: currentWord.data[props.WORD.LEMMA], points: currentWord.data[props.WORD.POINTS], related: false });
      
      for( j = 0; j < firstTileImage.data.related.length; j++ ){
        if( firstTileImage.data.related[j] === currentWord.data[props.WORD.LEMMA] )
        {  
          for( a = 0; a < score.words.length; a++ ){
            if( score.words[a].lemma === currentWord.data.lemma )
            {
              score.words[a].related = true;
              score.words[a].points += consts.RELATED_WORD_BONUS;
            }
          }
          
          score.total+= consts.RELATED_WORD_BONUS;
        }
      }
      
      for( j = 0; j < secondTileImage.data.related.length; j++ ){
        if( secondTileImage.data.related[j] == currentWord.data[props.WORD.LEMMA] )
        {  
          for( a = 0; a < score.words.length; a++ ){
            if( score.words[a].lemma === currentWord.data.lemma )
            {
              score.words[a].related = true;
              score.words[a].points += consts.RELATED_WORD_BONUS;
            }
          }
          
          score.total += consts.RELATED_WORD_BONUS;
        }
      }
    }
    
    if( satisfiedFirstInstruction.satisfied ){
      console.log( "satisfied 1st" );
      score.startTile.satisfied = true;
      score.startTile.words = satisfiedFirstInstruction.words;
      score.total += firstTileInstruction.data[props.INSTRUCTION.BONUS];
      
      mult += firstTileInstruction.data[props.INSTRUCTION.MULT];
    }
    
    if( satisfiedSecondInstruction.satisfied ){
      console.log( "satisfied 2nd" );
      score.endTile.satisfied = true;
      score.endTile.words = satisfiedSecondInstruction.words;
      score.total += secondTileInstruction.data[props.INSTRUCTION.BONUS];
      
      mult += secondTileInstruction.data[props.INSTRUCTION.MULT];
    }
    
    if( mult !== 0 ){
      score.total = score.total * mult;
    }
    
    return score;
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
