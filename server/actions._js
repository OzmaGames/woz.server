var oz = oz || {};

var neo4j = require( "neo4j" ),
  consts = require( "./constants._js" ),
  props = require( "./properties._js" ),
  retriever = require("./retriever._js"),
  randomizer = require("./randomizer._js");

module.exports =
{
 swapWords: function( game, username, magnetIDs, _ )
  { 
    var ret = [];
    var words = [];
    var magnets = [];
    
    var mw; 
    var player;
    var randomClass;
    var currentWord;
    var currentMagnet;
    var collectionName;
    
    if( game.data[props.GAME.ACTION_DONE] === false ){
      this.setActionDone( game, true, _ );
      
      player = retriever.getGamePlayerByID( game.id, username, _ );
      mw = retriever.getPlayerMagnetsAndWordsByID( player.id, magnetIDs, _ );
      
      for( i = 0; i < mw.length; i ++ ){
        words.push( mw[i].word );
        magnets.push( mw[i].magnet );
      }
      
      for( var i = magnets.length - 1; i >= 0; i-- ){
        try
        {
          currentWord = words[i];
          currentMagnet = magnets[i];
          collectionName = currentMagnet.data[props.MAGNET.COLLECTION];
          
          currentMagnet.outgoing( rels.REPRESENTS_WORD, _ )[0]["delete"](_);
          randomClass = currentMagnet.data.class;
          
          currentWord = randomizer.getRandomWordByClass( collectionName, randomClass , _);
          
          ret.push({
            id: currentMagnet.data.id,
            angle: currentMagnet.data[props.MAGNET.ANGLE],
            x: currentMagnet.data[props.MAGNET.X],
            y: currentMagnet.data[props.MAGNET.Y],
            isRelated: currentMagnet.data[props.MAGNET.IS_RELATED],
            lemma: currentWord.data[props.WORD.LEMMA],
            points: currentWord.data[props.WORD.POINTS]
          });
          
          currentMagnet.data[ props.MAGNET.REPRESENTED_WORD ] = currentWord.data.id;
          currentMagnet.createRelationshipTo( currentWord, rels.REPRESENTS_WORD, {}, _ );
          currentMagnet.save(_);
        }
        catch( ex )
        {
          console.log( "Error swapping words: " );
          console.log( ex );
        }
      }
    }
    return ret;
  },
};
