var oz = oz || {};
  
var adder = require("./adder._js");
var tools = require( "./tools._js" );
var wordLoader = require("./wordLoader._js");
var sup = require( "./supporter._js" );
var operations = require("./operations._js");
var randomizer = require("./randomizer._js");

var retriever = require("./retrievers/retriever._js");

var types = require( "./constants/types.js" );
var rels = require("./constants/relationships.js");
var props = require( "./constants/properties.js" );
var consts = require( "./constants/constants.js" );

module.exports =
{

  placePhrase: function( game, username, pathID, magnetIDs, _ )
  {
    var i, j;
    var score = { total: 0 };
    
    var mw;
    var word;
    var magnet;
    var phrase;
    var rToPlayer;
    var endTileImage;
    var startTileImage;
    var endTileInstruction;
    var startTileInstruction;
    
    var users = [];
    var tiles = [];
    var words = [];
    var magnets = [];
    
    var phraseString = "";
    
    var ret = { madness: -1, score: 0, words: [], path: { id: -1, phrase: [], username: username } };
    var path = retriever.getGamePathByID( game.id, pathID, _ );
    
    var wordCount = magnetIDs.length;
    var player = retriever.getGamePlayerByID( game.id, username, _ );
    var otherWords = retriever.getPlayerWordsExcludedByMagnetID( player.id, magnetIDs, false, _ );
    
    mw = retriever.getPlayerMagnetsAndWordsByID( player.id, magnetIDs, _ );
    
    tiles.push( retriever.getPathStartTile( path.id, _ ) );
    tiles.push( retriever.getPathEndTile( path.id, _ ) );
    
    for( j = 0; j < magnetIDs.length; j++ ){
      if( phraseString.length > 0 ) phraseString += " ";
      
      for( i = 0; i < mw.length; i ++ ){
        if( mw[i].magnet.data.id == magnetIDs[j] )
        {
          console.log( mw[i].word.data.lemma );
          console.log( mw[i].magnet.data.id);
          
          words.push( mw[i].word );
          magnets.push( mw[i].magnet );
          phraseString += mw[i].word.data[props.WORD.LEMMA];
          
          ret.path.phrase.push({
            id: magnetIDs[j],
            lemma: mw[i].word.data[props.WORD.LEMMA],
            points: mw[i].word.data[props.WORD.POINTS],
            isRelated: mw[i].magnet.data[props.MAGNET.IS_RELATED],
            x: mw[i].magnet.data[props.MAGNET.X],
            y: mw[i].magnet.data[props.MAGNET.Y],
            angle: mw[i].magnet.data[props.MAGNET.ANGLE],
          });
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
        pathID: pathID,
        phraseString: phraseString,
        creationDate: Date.parse( new Date() )
      }, _ );
      
      ret.path.id = pathID;
      player.createRelationshipTo( phrase, rels.WROTE, {}, _ );
      game.createRelationshipTo( phrase, rels.HAS_PHRASE, {}, _ );
      
      for( i = 0; i < wordCount; i++ )  //disconnect from the player, connect to the phrase. replace with new magnets
      {  
        magnet = magnets[i];
        rToPlayer = magnet.incoming( rels.HAS_MAGNET, _ )[0];
        rToPlayer["delete"](_);
        
        phrase.createRelationshipTo( magnet, rels.HAS_MAGNET, { order : i }, _ );
        magnet.data[props.MAGNET.OWNER] = phrase.data[props.ID];
        magnet.data[props.TYPE] = types.MAGNET_PHRASE;
        magnet.data[props.MAGNET.ORDER] = i;
        magnet.save(_);
        
        word = wordLoader.getRandomWord( magnet.data[props.MAGNET.COLLECTION], magnet.data[props.MAGNET.CLASS], otherWords );
        otherWords.push( word );
        
        ret.words.push( adder.addMagnet(
          game,
          player,
          magnet.data[props.MAGNET.COLLECTION],
          magnet.data[props.MAGNET.CLASS],
          word,
          magnet.data[props.MAGNET.X],
          magnet.data[props.MAGNET.Y],
        _ ) );
      }
      
      score = sup.scoringTime( words, tiles, _ );
      phrase.data[props.PHRASE.SCORE] = score.total;
      player.data[props.PLAYER.SCORE] += score.total;
      ret.path.score = score;
      
      game.data[props.GAME.PHRASE_COUNT]++;
      game.data[props.GAME.ACTION_DONE] = false;
      game.data[props.GAME.MOD_DATE] = Date.parse( new Date() );
      
      if( game.data[props.GAME.PHRASE_COUNT] == game.data[props.GAME.PATH_COUNT] ){
        game.data[props.GAME.OVER] = true;
        game.data[props.GAME.OVER_DATE] = Date.parse( new Date() );
      }
      
      if( !game.data[props.GAME.OVER] )
      {
        game.data[props.GAME.TURN]++;
      }
      
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
    var a, b, c;
    var ret = [];
    var words = [];
    var magnets = [];
    
    var mw; 
    var word;
    var magnet;
    var player;
    var isRelated;
    var otherWords;
    var collectionName;
    
    if( game.data[props.GAME.ACTION_DONE] === false ){
      sup.setActionDone( game, true, _ );
      player = retriever.getGamePlayerByID( game.id, username, _ );
      mw = retriever.getPlayerMagnetsAndWordsByID( player.id, magnetIDs, _ );
      
      otherWords = retriever.getPlayerWordsExcludedByMagnetID( player.id, magnetIDs, false, _ );
      
      for( i = 0; i < mw.length; i ++ ){
        words.push( mw[i].word );
        magnets.push( mw[i].magnet );
      }
      
      for( var i = magnets.length - 1; i >= 0; i-- ){
        try
        {
          word = words[i];
          magnet = magnets[i];
          collectionName = magnet.data[props.MAGNET.COLLECTION];
          
          magnet.outgoing( rels.REPRESENTS_WORD, _ )[0]["delete"](_);
          
          word = wordLoader.getRandomWord( collectionName, magnet.data[props.MAGNET.CLASS], otherWords );
          otherWords.push( word );
          
          isRelated = retriever.getWordRelatedTiles( game.id, word.id, _ ).length > 0;
          magnet.data[props.MAGNET.IS_RELATED] = isRelated;
          magnet.save(_);
          
          magnet.createRelationshipTo( word, rels.REPRESENTS_WORD, {}, _ );
          
          ret.push({
            id: magnet.data.id,
            angle: magnet.data[props.MAGNET.ANGLE],
            x: magnet.data[props.MAGNET.X],
            y: magnet.data[props.MAGNET.Y],
            isRelated: isRelated,
            lemma: word.data[props.WORD.LEMMA],
            points: word.data[props.WORD.POINTS]
          });
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
  
  addWord: function( game, username, lemma, x, y, _ )
  {
    var word;
    var magnet;
    var player;
    
    if( game.data[props.GAME.ACTION_DONE] === false ){
      sup.setActionDone( game, true, _ );
      
      player = retriever.getGamePlayerByID( game.id, username, _ );
      word = retriever.getWord( lemma, _ );
      
      magnet = adder.addMagnet( game, player, word.data[props.WORD.COLLECTIONS][0], word.data[props.WORD.CASSES][0], word, _ );
    }
    
    return magnet;
  },
};
