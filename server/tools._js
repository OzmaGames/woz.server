var neo4j = require("neo4j");

var helper = require("./helper.js");
var randomizer = require("./randomizer._js");

var types = require( "./constants/types.js" );
var rels = require("./constants/relationships.js");
var props = require( "./constants/properties.js" );
var consts = require( "./constants/constants.js" );
var environment = require("./constants/environment.js");
  
var retriever = require("./retrievers/retriever._js");
  
var db = new neo4j.GraphDatabase(environment.DB_URL);

module.exports =
{

  createNode : function( properties, _ )
  {
    var node;
    var savedNode;
    
    try
    {
      node = db.createNode( properties );
      savedNode = node.save(_);
    }
    catch( ex )
    {
      console.log( "error creating node" );
      console.log( ex.message );
    }
    
    return savedNode;
  },
  
  getNewGameID : function ( _ )
  {
    var countNode = retriever.getCountNode( _ );
    var newGameID = countNode.data[props.COUNT_NODE.GAME_COUNT]++;
    
    countNode.save(_);
    
    return newGameID;
  },

  getNewBoardID: function ( _ )
  {
    var countNode = retriever.getCountNode( _ );
    var newBoardID = countNode.data[props.COUNT_NODE.BOARD_COUNT]++;
    
    countNode.save(_);
    
    return newBoardID;
  },
  
  getNewInstructionID: function ( _ )
  {
    var countNode = retriever.getCountNode( _ );
    var newInstructionID = countNode.data[props.COUNT_NODE.INSTRUCTION_COUNT]++;
    
    countNode.save(_);
    
    consts.INSTRUCTION_COUNT++;
    
    return newInstructionID;
  },
  
  getGameUpdateData: function( game, _ )
  {
    var i = 0;
    var player;
    var gameUpdateData = { players: [] };
    
    gameUpdateData.gameID = game.data[props.ID];
    gameUpdateData.over = game.data[props.GAME.OVER];
    
    for( i = 0; i < game.data[props.GAME.USERNAMES].length; i++ ){
      player = retriever.getGamePlayerByID( game.id, game.data[props.GAME.USERNAMES][i], _ );
      gameUpdateData.players.push({
        username: game.data[props.GAME.USERNAMES][i],
        score: player.data[props.PLAYER.SCORE],
        active: game.data[props.GAME.OVER] === true ?
          false :
          game.data[props.GAME.USERNAMES][i] === game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]],
        resigned: player.data[props.PLAYER.RESIGNED]
      });
    }
    
    return gameUpdateData;
  },
  
  getGameObject: function( game, usernames, _ )
  {
    var gameInfo = retriever.getGameData( game.id, _ );
    
    var gameObjs = {};
    var tileObjs = [];
    var pathObjs = [];
    var playerObjs = [];
    var phraseMagnetInfo = [];
    var playerMagnetInfo = [];
    
    var i, j = 0;
    var imageID = -1;
    var scopeUsername = -1;
    var currentTile = -1;
    var instructionID = -1;
    var currentPhrase = -1;
    var currentPlayer = -1;
    
    for( i = 0; i < gameInfo.path.length; i++ )
    {
      currentPath = gameInfo.path[i];
      
      pathObjs.push({
        id : currentPath[props.ID],
        nWords: currentPath[props.PATH.NWORDS],
        startTile: currentPath[props.PATH.START_TILE],
        endTile: currentPath[props.PATH.END_TILE],
        cw:  currentPath[props.PATH.CW]
      });
    }
    
    gameInfo.magnetPhrase.sort( helper.compareMagnetOrder );
    
    for( i = 0; i < game.data[props.GAME.PHRASE_COUNT]; i++ ){
      currentPhrase = gameInfo.phrase[i];
      
      phraseMagnetInfo = getMagnetObject( gameInfo.magnetPhrase, currentPhrase[props.ID] );
      
      for( j = 0; j < pathObjs.length; j++ ){
        if( pathObjs[j].id == currentPhrase[props.PHRASE.PATH_ID] )
        {
          pathObjs[j].phrase = {
            id : currentPhrase[props.ID],
            words : phraseMagnetInfo
          };
        }
      }
    }
    
    for( i = 0; i < gameInfo.tile.length; i++ ){
      imageID = -1;
      instructionID = -1;
      currentTile = gameInfo.tile[i];
      
      for( j = 0; j < gameInfo.image.length; j++ ){
        if( gameInfo.image[j].name == currentTile[props.TILE.REPRESENTED_IMAGE] ){
          imageID = j;
        }
      }
      
      for( j = 0; j < gameInfo.instruction.length; j++ ){
        if( gameInfo.instruction[j].id == currentTile[props.TILE.REPRESENTED_INSTRUCTION] ){
          instructionID = j;
        }
      }
      
      tileObjs.push({
        id : currentTile[props.ID],
        x : currentTile[props.TILE.X],
        y : currentTile[props.TILE.Y],
        angle : currentTile[props.TILE.ANGLE],
        imageID : gameInfo.image[imageID][props.ID],
        imageName : gameInfo.image[imageID][props.IMAGE.NAME],
        instruction : gameInfo.instruction[instructionID][props.INSTRUCTION.SHORT_DESCRIPTION],
        description : gameInfo.instruction[instructionID][props.INSTRUCTION.LONG_DESCRIPTION],
        bonus : gameInfo.instruction[instructionID][props.INSTRUCTION.BONUS],
        mult : gameInfo.instruction[instructionID][props.INSTRUCTION.MULT]
      });
    }
    
    for( i = 0; i < game.data[props.GAME.USERNAMES].length; i++ ){
      playerObjs = [];
      scopeUsername = usernames[i];
      
      for ( j = 0; j < game.data[props.GAME.USERNAMES].length; j++ ) {
        playerMagnetInfo = [];
        currentPlayer = gameInfo[types.PLAYER][j];
        
        playerObjs.push({
          username : currentPlayer[props.PLAYER.USERNAME],
          score : currentPlayer[props.PLAYER.SCORE],
          active : game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]] == currentPlayer[props.PLAYER.USERNAME]
        });
      }
      
      gameObjs[scopeUsername] = {
        id: game.data[props.ID],
        playerCount: game.data[props.GAME.PLAYER_COUNT],
        actionDone: game.data[props.GAME.ACTION_DONE],
        over: game.data[props.GAME.OVER],
        
        collection: { shortName: "woz", longName: "Words Of Oz", size: 20 },
        words: getMagnetObject( gameInfo.magnetPlayer, scopeUsername ),
        players: playerObjs,
        tiles: tileObjs,
        paths: pathObjs,
      };
    }
    
    return gameObjs;
  }
};

function getMagnetObject( mw, owner )
{
  var magnetInfo = [];
  
  for ( var a = 0; a < mw.length; a++ ){
    if( mw[a].magnet[props.MAGNET.OWNER] == owner )
    {
      var currentMagnet = mw[a].magnet;
      var currentWord = mw[a].word;
      
      magnetInfo.push({
        id: currentMagnet[props.ID],
        angle: currentMagnet[props.MAGNET.ANGLE],
        x: currentMagnet[props.MAGNET.X],
        y: currentMagnet[props.MAGNET.Y],
        isRelated: currentMagnet[props.MAGNET.IS_RELATED],
        lemma: currentWord[props.WORD.LEMMA],
        points: currentWord[props.WORD.POINTS]
      });
    }
  }
  
  return magnetInfo;
}
