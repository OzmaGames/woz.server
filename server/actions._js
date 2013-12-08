var oz = oz || {};
  
var adder = require("./adder._js"),
  tools = require( "./tools._js" ),
  sup = require( "./supporter._js" ),
  operations = require("./operations._js"),
  randomizer = require("./randomizer._js"),
  
  retriever = require("./retrievers/retriever._js"),
  
  types = require( "./constants/types.js" ),
  rels = require("./constants/relationships.js"),
  props = require( "./constants/properties.js" ),
  consts = require( "./constants/constants.js" );
  
  

module.exports =
{

  placePhrase: function( game, username, pathID, magnetIDs, _ )
  {
    var i, j;
    var score = 0;
    
    var mw;
    var phrase;
    var endTileImage;
    var startTileImage;
    var endTileInstruction;
    var startTileInstruction;
    
    var words = [];
    var magnets = [];
    
    var phraseString = "";
    
    var ret = { madness: -1, score: 0, words: [] };
    var path = retriever.getGamePathByID( game.id, pathID, _);
    
    var wordCount = magnetIDs.length;
    var tiles = retriever.getPathTiles( path.id, _ );
    var player = retriever.getGamePlayerByID( game.id, username, _ );
    
    mw = retriever.getPlayerMagnetsAndWordsByID( player.id, magnetIDs, _ );
    
    for( j = 0; j < magnetIDs.length; j++ ){
      if( phraseString.length > 0 ) phraseString += " ";
      for( i = 0; i < mw.length; i ++ ){
        if( mw[i].magnet.data.id == magnetIDs[j] ){
          words.push( mw[i].word );
          magnets.push( mw[i].magnet );
          phraseString += mw[i].word.data[props.WORD.LEMMA];
        }
      }
    }
    
    ret.madness = sup.canIPlayWithMadness( words, wordCount, _ );
    
    if( ret.madness === 0 )
    {
      phrase = tools.createNode({
        type: types.PHRASE,
        id: game.data[props.GAME.PHRASE_COUNT],
        wordCount: wordCount,
        username: username,
        phraseString: phraseString,
      }, _ );
      
      player.createRelationshipTo( phrase, rels.WROTE, {}, _ );
      game.createRelationshipTo( phrase, rels.HAS_PHRASE, {}, _ );
      
      for( i = 0; i < wordCount; i++ )  //disconnect from the player, connect to the phrase. replace with new magnets
      {  
        var currentWord = words[i];
        var currentMagnet = magnets[i];
        var rToPlayer = currentMagnet.incoming( rels.HAS_MAGNET, _ )[0];
        rToPlayer["delete"](_);
        
        phrase.createRelationshipTo( currentMagnet, rels.HAS_MAGNET, { order : i }, _ );
        currentMagnet.data[props.MAGNET.OWNER] = phrase.data[props.ID];
        currentMagnet.data[props.MAGNET.TYPE] = types.MAGNET_PHRASE;
        currentMagnet.save(_);
        
        ret.words.push( adder.addMagnet(
          game,
          player,
          currentMagnet.data[props.MAGNET.COLLECTION],
          currentMagnet.data[props.MAGNET.CLASS],
          currentMagnet.data[props.MAGNET.X],
          currentMagnet.data[props.MAGNET.Y],
        _ ) );
      }
      
      score = sup.scoringTime( words, tiles, _ );
      
      phrase.data[props.PHRASE.SCORE] = score;
      player.data[props.PLAYER.SCORE] += score;
      ret[props.PLAYER.SCORE] = player.data[props.PLAYER.SCORE];
      
      game.data[props.GAME.PHRASE_COUNT]++;
      game.data[props.GAME.ACTION_DONE] = false;
      game.data[props.GAME.LAST_MOD] = Date.parse( new Date() );
      game.data[props.GAME.GAME_OVER] = sup.isTheGameOver( game, _ );
      if( !game.data[props.GAME.GAME_OVER] ) game.data[props.GAME.TURN]++;
      
      phrase.save(_);
      player.save(_);
      game.save(_);
    }
    else
    {
      console.log( "Hold on mister, respect the rules!" );
    }
    
    return ret;
  },

 swapWords: function( game, username, magnetIDs, _ )
  { 
    var ret = [];
    var words = [];
    var magnets = [];
    
    var mw; 
    var player;
    var currentWord;
    var currentMagnet;
    var collectionName;
    
    if( game.data[props.GAME.ACTION_DONE] === false ){
      sup.setActionDone( game, true, _ );
      
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
          currentWord = randomizer.getRandomWordByClass( collectionName, currentMagnet.data[props.MAGNET.CLASS] , _);
          
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
