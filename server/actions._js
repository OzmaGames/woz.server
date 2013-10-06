var oz = oz || {};

var neo4j = require( "neo4j" ),
  tools = require( "./tools._js" ),
  consts = require( "./constants._js" ),
  retriever = require("./retriever._js"),
  randomizer = require( "./randomizer._js" );

module.exports =
{
  swapWords: function( game, username, magnetIDs, _ ){
    var mw;
    var ret = [];
    var words = [];
    var magnets = [];

    var randomClass;
    var currentWord;
    var currentMagnet;
    
    var player = retriever.getGamePlayerByID( game.id, username, _ );
    mw = retriever.getPlayerMagnetsAndWordsByID( player.id, magnetIDs, _ );
    for( i = 0; i < mw.length; i ++ ){
      words.push( mw[i].word );
      magnets.push( mw[i].magnet );
    }
    
    for( var i = magnets.length - 1; i >= 0; i-- ){
      try{
        currentMagnet = magnets[i];
        currentWord = words[i];
        
        currentMagnet.outgoing( consts.REPRESENTS_WORD, _ )[0]["delete"](_);
        
        randomClass = currentWord.data.classes[ Math.floor( randomizer.getRandomInRange( 0, currentWord.data.classes.length ) ) ];
        currentWord = randomizer.getRandomWordByClass( randomClass , _);
        
        currentMagnet.data[ consts.REPRESENTED_WORD ] = currentWord.data[consts.ID];
        currentMagnet.createRelationshipTo( currentWord, consts.REPRESENTS_WORD, {}, _ );
        currentMagnet.save(_);
      }catch( ex ){
        console.log( "Error swapping words: " );
        console.log( ex );
      }
    }

    return ret;
  }
};
