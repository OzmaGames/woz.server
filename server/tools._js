var neo4j = require("neo4j"),
  consts = require("./constants._js"),
  retriever = require("./retriever._js"),
  randomizer = require("./randomizer._js"),
  environment = require("./environment._js");

var db = new neo4j.GraphDatabase(environment.DB_URL);

module.exports =
{

  createNode : function( properties, _ )
  {
    var node = db.createNode( properties );
    var savedNode = node.save(_);
    
    return savedNode;
  },
  
  getNewGameID : function ( _ )
  {
    var countNode = retriever.getCountNode( _ );
    var newGameID = countNode.data[consts.GAME_COUNT]++;
    
    countNode.save(_);
    
    return newGameID;
  },

  addPath: function( game, startTile, endTile, nWords, cw, _ ){
    var id = game.data[consts.PATH_COUNT];
    
    var path = this.createNode({
      type: consts.PATH,
      id: id,
      cw: cw,
      startTile: startTile.data[consts.ID],
      endTile: endTile.data[consts.ID],
      nWords: nWords
    }, _ );

    game.data[consts.PATH_COUNT]++;
    
    game.createRelationshipTo( path, consts.HAS_PATH, {}, _ );
    path.createRelationshipTo( endTile, consts.ENDS_WITH, {}, _ );
    path.createRelationshipTo( startTile, consts.STARTS_WITH, {}, _ );
    
    game.save(_);
  },
  
  addMagnet: function( game, player, className, _ )
  {
    var i = 0;
    var j = 0;
    var isRelated = false;
    var magnets = retriever.getPlayerMagnets( player.id, _ );
    var word = randomizer.getRandomWordByClass( className, _);
    
    for( i = 0; i < magnets.length; i ++ ){
      if( magnets[i].data[consts.REPRESENTED_WORD] == word.data[consts.ID] ){
        i = -1;
        word = randomizer.getRandomWordByClass( className, _);
      }
    }
    
    isRelated = retriever.getWordRelatedImages( game.id, word.id, _ ).length > 0;
    var randomX = randomizer.getRandomInRange( consts.MIN_X, consts.MAX_X );
    var randomY = randomizer.getRandomInRange( consts.MIN_Y, consts.MAX_Y );
    var randomAngle = randomizer.getRandomInRange( consts.MIN_ANGLE, consts.MAX_ANGLE );
    
    var magnet = this.createNode({
      type: consts.MAGNET_PLAYER,
      id: game.data[consts.WORD_COUNT],
      representedWord: word.data[consts.ID],
      owner: player.data[consts.USERNAME],
      isRelated: isRelated,
      angle: randomAngle,
      x: randomX,
      y: randomY
    }, _ );
    
    player.createRelationshipTo( magnet, consts.HAS_MAGNET, { id: game.data[consts.WORD_COUNT] }, _ );
    magnet.createRelationshipTo( word, consts.REPRESENTS_WORD, {}, _ );
    
    game.data[consts.WORD_COUNT]++;
    game.save(_);
  },
  
  addTile: function( game, _ )
  {
    var tile;
    var i = 0;
    
    if( game.data[consts.TILE_COUNT] < consts.MAX_TILES ){
      var image = randomizer.getRandomImage(_);
      var images = retriever.getGameTileImages( game.id, _ );
      var instruction = randomizer.getRandomInstruction(_);
      var instructions = retriever.getGameTileInstructions( game.id, _ );
      var randomX = randomizer.getRandomInRange( consts.MIN_X, consts.MAX_X );
      var randomY = randomizer.getRandomInRange( consts.MIN_Y, consts.MAX_Y );
      
      for( i = 0; i < images.length; i++ ){
        if( image.data.id == images[i].data.id ){
          image = randomizer.getRandomImage(_);
          i = -1;
        }
      }
      
      for( i = 0; i < instructions.length; i++ ){
        if( instruction.data.id == instructions[i].data.id ){
          instruction = randomizer.getRandomInstruction(_);
          i = -1;
        }
      }
      
      tile = this.createNode({
        type: consts.TILE,
        id: game.data[consts.TILE_COUNT],
        representedImage: image.data.id,
        representedInstruction: instruction.data.id,
        connectedTo: [ 0, 0, 0, 0, 0 ],
        angle: 0,
        x: randomX,
        y: randomY
      }, _ );
      
      game.createRelationshipTo( tile, consts.HAS_TILE, { id: game.data[consts.TILE_COUNT] }, _ );
      tile.createRelationshipTo( image, consts.REPRESENTS_IMAGE, {}, _ );
      tile.createRelationshipTo( instruction, consts.REPRESENTS_INSTRUCTION, {}, _ );
      
      game.data[consts.TILE_COUNT]++;
      game.save(_);
    }
    
    return tile;
  },
  
  getGamesObjects: function( games, usernames, _ ){
    var gameObjs = [];
    
    for( var i = 0; i < games.length; i++ ){
      gameObjs.push( this.getGameObject( games[i], usernames, _ ) );
    }
  },
  
  getGameObject: function( game, usernames, _ )
  {
    var gameInfo = retriever.getGameData( game.id, _ );
    
    var gameObjs = {};
    var tileObjs = [];
    var pathObjs = [];
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

    for( i = 0; i < game.data[consts.PATH_COUNT]; i++ )
    {
      currentPath = gameInfo.path[i];
      
      pathObjs.push({
        id : currentPath[consts.ID],
        nWords: currentPath[consts.NWORDS],
        startTile: currentPath[consts.START_TILE],
        endTile: currentPath[consts.END_TILE],
        cw:  currentPath[consts.CW],
      });
    }
    
    for( i = 0; i < game.data[consts.PHRASE_COUNT]; i++ ){
      currentPhrase = gameInfo.phrase[i];
      phraseMagnetInfo = getMagnetObject( gameInfo.magnetPhrase, gameInfo.word, currentPhrase[consts.ID] );
      
      for( j = 0; j < game.data[consts.PATH_COUNT]; j++ ){
        if( pathObjs[j].id == currentPhrase[consts.PATH_ID] ){
          pathObjs[j].phrase = {
            id : currentPhrase[consts.ID],
            words : phraseMagnetInfo
          };
        }
      }
    }
    
    for( i = 0; i < game.data[consts.TILE_COUNT]; i++ ){
      imageID = -1;
      instructionID = -1;
      currentTile = gameInfo.tile[i];
      
      for( j = 0; j < gameInfo.image.length; j++ ){
        if( gameInfo.image[j].id == currentTile[consts.REPRESENTED_IMAGE] ){
          imageID = j;
        }
      }
      for( j = 0; j < gameInfo.instruction.length; j++ ){
        if( gameInfo.instruction[j].id == currentTile[consts.REPRESENTED_INSTRUCTION] ){
          instructionID = j;
        }
      }
      tileObjs.push({
        id : currentTile[consts.ID],
        x : currentTile[consts.X],
        y : currentTile[consts.Y],
        imageID : imageID,
        imageName : gameInfo.image[imageID][consts.NAME],
        instruction : gameInfo.instruction[instructionID][consts.SHORT_DESCRIPTION],
        bonus : gameInfo.instruction[instructionID][consts.BONUS],
        mult : gameInfo.instruction[instructionID][consts.MULT]
      });
    }
    
    for( i = 0; i < game.data[consts.PLAYER_COUNT]; i++ ){
      playerObjs = [];
      scopeUsername = usernames[i];
      for ( j = 0; j < game.data[consts.PLAYER_COUNT]; j++ ) {
        playerMagnetInfo = [];
        currentPlayer = gameInfo[consts.PLAYER][j];
        
        if( currentPlayer[consts.USERNAME] == scopeUsername ){
          playerMagnetInfo = getMagnetObject( gameInfo.magnetPlayer, gameInfo.word, scopeUsername );
        }
        
        playerObjs.push({
          username : currentPlayer[consts.USERNAME],
          score : currentPlayer[consts.SCORE],
          active : game.data[consts.USERNAMES][game.data[consts.TURN] % game.data[consts.PLAYER_COUNT]] == currentPlayer[consts.USERNAME]
        });
      }
      
      gameObjs[scopeUsername] = {
        id: game.data[consts.ID],
        players: playerObjs,
        gameOver: game.data[consts.GAME_OVER],
        tiles: tileObjs,
        paths: pathObjs,
        words: playerMagnetInfo
      }
    }
    
    return gameObjs;
  },

};

function getMagnetObject( magnets, words, owner ){
  var magnetInfo = [];
  var wordsLength = words.length;
  var magnetsLength = magnets.length;

  for ( var m = 0; m < magnetsLength; m++ ){
    if( magnets[m][consts.OWNER] == owner ){
      var currentMagnet = magnets[m];
      for( var w = 0; w < wordsLength; w++ ){
        if( words[w][consts.ID] == currentMagnet[consts.REPRESENTED_WORD] ){
          magnetInfo.push({
            id: currentMagnet[consts.ID],
            angle: currentMagnet[consts.ANGLE],
            x: currentMagnet[consts.X],
            y: currentMagnet[consts.Y],
            isRelated: currentMagnet[consts.IS_RELATED],
            lemma: words[w][consts.LEMMA],
            points: words[w][consts.POINTS],
          });
          break;
        }
      }
    }
  }

  return magnetInfo;
}
