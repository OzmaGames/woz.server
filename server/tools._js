var neo4j = require("neo4j"),
  randomizer = require("./randomizer._js"),
  
  types = require( "./constants/types.js" ),
  rels = require("./constants/relationships.js"),
  props = require( "./constants/properties.js" ),
  consts = require( "./constants/constants.js" ),
  environment = require("./constants/environment.js"),
  
  retriever = require("./retrievers/retriever._js");
  
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
    
    return newInstructionID;
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
    
    for( i = 0; i < game.data[props.GAME.PHRASE_COUNT]; i++ ){
      currentPhrase = gameInfo.phrase[i];
      
      phraseMagnetInfo = getMagnetObject( gameInfo.magnetPhrase, gameInfo.word, currentPhrase[props.ID] );
      
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
    
    for( i = 0; i < game.data[props.GAME.PLAYER_COUNT]; i++ ){
      playerObjs = [];
      scopeUsername = usernames[i];
      
      for ( j = 0; j < game.data[props.GAME.PLAYER_COUNT]; j++ ) {
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
        collection: { name: "woz", size: 20 },
        players: playerObjs,
        gameOver: game.data[props.GAME.GAME_OVER],
        tiles: tileObjs,
        paths: pathObjs,
        words: getMagnetObject( gameInfo.magnetPlayer, gameInfo.word, scopeUsername )
      };
      
//       console.log( gameObjs[scopeUsername] )
    }
    
    return gameObjs;
  }
};

function getMagnetObject( magnets, words, owner ){
  var magnetInfo = [];
  var wordsLength = words.length;
  var magnetsLength = magnets.length;
  
  for ( var m = 0; m < magnetsLength; m++ ){
    if( magnets[m][props.MAGNET.OWNER] == owner )
    {
      var currentMagnet = magnets[m];
      for( var w = 0; w < wordsLength; w++ ){
        if( words[w][props.WORD.LEMMA] == currentMagnet[props.MAGNET.REPRESENTED_WORD] )
        {
          magnetInfo.push({
            id: currentMagnet[props.ID],
            angle: currentMagnet[props.MAGNET.ANGLE],
            x: currentMagnet[props.MAGNET.X],
            y: currentMagnet[props.MAGNET.Y],
            isRelated: currentMagnet[props.MAGNET.IS_RELATED],
            lemma: words[w][props.WORD.LEMMA],
            points: words[w][props.WORD.POINTS]
          });
          break;
        }
      }
    }
  }
  
  return magnetInfo;
}
