var neo4j = require("neo4j"),

  types = require("./types._js"),
  indexes = require("./indexes._js"),
  props = require("./properties._js"),
  consts = require("./constants._js"),
  rels = require("./relationships._js"),
  retriever = require("./retriever._js"),
  randomizer = require("./randomizer._js"),
  environment = require("./environment._js");

var db = new neo4j.GraphDatabase(environment.DB_URL);

module.exports =
{

  createNode : function( properties, _ )
  {
  var node;
  var savedNode;

  try{
    node = db.createNode( properties );
    savedNode = node.save(_);
    }catch( exc ){
      console.log( exc.message );
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

  addPath: function( game, id, startTile, endTile, nWords, cw, _ )
  { 
    var path = this.createNode({
      type: types.PATH,
      id: id,
      cw: cw,
      startTile: startTile.data[props.ID],
      endTile: endTile.data[props.ID],
      nWords: nWords
    }, _ );
    
    game.createRelationshipTo( path, rels.HAS_PATH, {}, _ );
    path.createRelationshipTo( endTile, rels.ENDS_WITH, {}, _ );
    path.createRelationshipTo( startTile, rels.STARTS_WITH, {}, _ );
  },
  
  addTile: function( game, id, x, y, angle, _ )
  {
    var tile;
    var i = 0;
    
    var image = randomizer.getRandomImage(_);
    var images = retriever.getGameTileImages( game.id, _ );
    var instruction = randomizer.getRandomInstruction(_);
    var instructions = retriever.getGameTileInstructions( game.id, _ );
    if( x == -1 ) x = randomizer.getRandomInRange( consts.MIN_X, consts.MAX_X );
    if( y == -1 ) y = randomizer.getRandomInRange( consts.MIN_Y, consts.MAX_Y );
    
    for( i = 0; i < images.length; i++ ){
      if( image.data.name == images[i].data.name )
      {
        image = randomizer.getRandomImage(_);
        i = -1;
      }
    }
    
    for( i = 0; i < instructions.length; i++ ){
      if( instruction.data.id == instructions[i].data.id )
      {
        instruction = randomizer.getRandomInstruction(_);
        i = -1;
      }
    }
    
    tile = this.createNode({
      type: types.TILE,
      id: id,
      representedImage: image.data.name,
      representedInstruction: instruction.data.id,
      angle: angle,
      x: x,
      y: y
    }, _ );
    
    game.createRelationshipTo( tile, rels.HAS_TILE, { id: game.data[props.GAME.TILE_COUNT] }, _ );
    tile.createRelationshipTo( image, rels.REPRESENTS_IMAGE, {}, _ );
    tile.createRelationshipTo( instruction, rels.REPRESENTS_INSTRUCTION, {}, _ );
    
    return tile;
  },

  saveWord: function( lemma, classes, categories, collections, versionOf, _ )
  {
    var i, j;
    var word = retriever.getWord( lemma, _ );

    if( word )
    {
      word.data[props.WORD.CLASSES] = classes;
      word.data[props.WORD.CATEGORIES] = categories;
      word.data[props.WORD.COLLECTIONS] = collections;
      word.data[props.WORD.VERSION_OF] = versionOf;
    }
    else
    {
      currentWordNode = tools.createNode({
        type: types.WORD,
        lemma: lemma,
        points: randomizer.getRandomIntegerInRange(0, 4),
        collections: collections,
        versionOf: versionOf
      }, _ );
      
      currentWordNode.index( collectionName + indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, currentWord.lemma, _ );
      
      for( i = 0; i < classes.length; i++ ){
        for( j = 0; j < collections.length; j++ ){
          currentWordNode.index( collections[j] + indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, currentWord.lemma, _ );
          currentWordNode.index( collections[j] + classes[i] + "ClassIndex", props.ID, lassCounts[collections[j]][classes[i]]++, _ );
        }
      }
    }
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
        if( pathObjs[j].id == currentPhrase[props.PATH.PATH_ID] ){
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
    if( magnets[m][props.MAGNET.OWNER] == owner ){
      var currentMagnet = magnets[m];
      for( var w = 0; w < wordsLength; w++ ){
        if( words[w][props.WORD.LEMMA] == currentMagnet[props.MAGNET.REPRESENTED_WORD] ){
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
