var oz = oz || {};

var neo4j = require( "neo4j" ),
  consts = require( "./constants._js" ),
  retriever = require("./retriever._js"),
  retriever = require("./retriever._js"),
  randomizer = require("./randomizer._js");
  


module.exports =
{

  swapWords: function( game, username, magnetIDs, _ )
  {
    var ret = [];
    console.log( "gonna swap" + game.data[consts.ACTION_DONE] );
    if( game.data[consts.ACTION_DONE] === false ){
      this.setActionDone( game, true, _ );
      console.log( "im swapping" );
      var mw;
      
      var words = [];
      var magnets = [];
      
      var randomClass;
      var currentWord;
      var currentMagnet;
      
      console.log( "1" );
      var player = retriever.getGamePlayerByID( game.id, username, _ );
      mw = retriever.getPlayerMagnetsAndWordsByID( player.id, magnetIDs, _ );
      console.log( "2" );
      for( i = 0; i < mw.length; i ++ )
      {
        words.push( mw[i].word );
        magnets.push( mw[i].magnet );
      }
      
      for( var i = magnets.length - 1; i >= 0; i-- )
      {
      console.log( "3" );
        try
        {
          currentWord = words[i];
          currentMagnet = magnets[i];

          currentMagnet.outgoing( consts.REPRESENTS_WORD, _ )[0]["delete"](_);
          randomClass = currentWord.data.classes[ Math.floor( randomizer.getRandomInRange( 0, currentWord.data.classes.length ) ) ];

          currentWord = randomizer.getRandomWordByClass( randomClass , _);

          ret.push({
            id: currentMagnet.data[consts.ID],
            angle: currentMagnet.data[consts.ANGLE],
            x: currentMagnet.data[consts.X],
            y: currentMagnet.data[consts.Y],
            isRelated: currentMagnet.data[consts.IS_RELATED],
            lemma: currentWord.data[consts.LEMMA],
            points: currentWord.data[consts.POINTS]
          });
          console.log( "4" );
          currentMagnet.data[ consts.REPRESENTED_WORD ] = currentWord.data[consts.ID];
          currentMagnet.createRelationshipTo( currentWord, consts.REPRESENTS_WORD, {}, _ );
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
  
  move: function( gameNodeID, magnetID, x, y, angle, _ )
  {
    var magnet = retriever.getGameMagnetByID( gameNodeID, magnetID, _ );
    
    entity.data[consts.X] = x;
    entity.data[consts.Y] = y;
    entity.data[consts.ANGLE] = angle;
    entity.save(_);
  },
  
  setActionDone: function( game, actionDone, _ ){
    game.data[consts.ACTION_DONE] = actionDone;
    game.save(_);
  },
  
  endTurn: function( game, _ ){
    this.setActionDone( game, false, _ );
    game.data[consts.TURN]++;
    game.save(_);
  }
};
