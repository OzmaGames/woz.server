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
    var newGameID = countNode.data[consts.GAME_COUNT]++;
    
    countNode.save(_);
    
    return newGameID;
  },

  getNewBoardID: function ( _ )
  {
    var countNode = retriever.getCountNode( _ );
    var newBoardID = countNode.data[consts.BOARD_COUNT]++;

    countNode.save(_);

    return newBoardID;
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

  addMagnets: function( game, player, className, wordIDs, x, y, _ )
  {
    var i = 0;
    for( i = 0; i < wordIDs.length; i++ ){
      this.addMagnet( game, player, className, wordIDs[i], x, y, _ );
    }
  
  },
  
  addMagnet: function( game, player, collectionName, className, x, y, _ )
  {
    var start = new Date().getTime();
    var now;
    var time;
    
    var ret;
    var i = 0;
    var j = 0;
    var isRelated = false;
    console.log( "am1" );
    console.log( collectionName );
    console.log( className );
    var word = randomizer.getRandomWordByClass( collectionName, className, _);
    console.log( "am2" );
    now = new Date().getTime();
    time = now - start;
//     console.log("am1: " + time );
    start = new Date().getTime();
    console.log( "am3" );
    console.log( "game: " ); console.log( game.data );
    console.log( "word: " ); console.log( word.data );
    isRelated = retriever.getWordRelatedImages( game.id, word.id, _ ).length > 0;
    if( x == -1 ) x = randomizer.getRandomInRange( consts.MIN_X, consts.MAX_X );
    if( y == -1 ) y = randomizer.getRandomInRange( consts.MIN_Y, consts.MAX_Y );
    var randomAngle = randomizer.getRandomInRange( consts.MIN_ANGLE, consts.MAX_ANGLE );
console.log( "am4" );
    now = new Date().getTime();
    time = now - start;
//     console.log("am2: " + time );
    start = new Date().getTime();
    console.log( "am5" );
    var magnet = this.createNode({
      type: consts.MAGNET_PLAYER,
      id: game.data[consts.WORD_COUNT],
      representedWord: word.data[consts.ID],
      owner: player.data[consts.USERNAME],
      isRelated: isRelated,
      angle: randomAngle,
      x: x,
      y: y
    }, _ );
    console.log( "am6" );
    now = new Date().getTime();
    time = now - start;
//     console.log("am3: " + time );
    start = new Date().getTime();
    console.log( "am6" );
    player.createRelationshipTo( magnet, consts.HAS_MAGNET, { id: game.data[consts.WORD_COUNT] }, _ );
    magnet.createRelationshipTo( word, consts.REPRESENTS_WORD, {}, _ );
    console.log( "am7" );
    ret = {
      id: game.data[consts.WORD_COUNT],
      angle: randomAngle,
      x: x,
      y: y,
      isRelated: isRelated,
      lemma: word.data[consts.LEMMA],
      points: word.data[consts.POINTS]
    };
    console.log( "am8" );
    game.data[consts.WORD_COUNT]++;
    game.save(_);
    
    now = new Date().getTime();
    time = now - start;
//     console.log("am4: " + time );
    
    return ret;
  },
  
  addTile: function( game, x, y, _ )
  {
    var tile;
    var i = 0;
    console.log( "at1" );
    if( game.data[consts.TILE_COUNT] < consts.MAX_TILES ){
      var image = randomizer.getRandomImage(_);
      var images = retriever.getGameTileImages( game.id, _ );
      var instruction = randomizer.getRandomInstruction(_);
      var instructions = retriever.getGameTileInstructions( game.id, _ );
      if( x == -1 ) x = randomizer.getRandomInRange( consts.MIN_X, consts.MAX_X );
      if( y == -1 ) y = randomizer.getRandomInRange( consts.MIN_Y, consts.MAX_Y );

      console.log( images.length );
      console.log( "at2" );

for( i = 0; i < images.length; i++ ){
console.log( images[i].data );
}
      
      for( i = 0; i < images.length; i++ ){
        if( image.data.name == images[i].data.name ){
          image = randomizer.getRandomImage(_);
          i = -1;
        }
      }
      console.log( "at3" );
      for( i = 0; i < instructions.length; i++ ){
        if( instruction.data.id == instructions[i].data.id ){
          instruction = randomizer.getRandomInstruction(_);
          i = -1;
        }
      }
      console.log( "at4" );
      
      console.log( "imagem" );
      console.log( image.data );
      
      tile = this.createNode({
        type: consts.TILE,
        id: game.data[consts.TILE_COUNT],
        representedImage: image.data.name,
        representedInstruction: instruction.data.id,
        connectedTo: [ 0, 0, 0, 0, 0 ],
        angle: 0,
        x: x,
        y: y
      }, _ );
      console.log( "at5" );
      game.createRelationshipTo( tile, consts.HAS_TILE, { id: game.data[consts.TILE_COUNT] }, _ );
      tile.createRelationshipTo( image, consts.REPRESENTS_IMAGE, {}, _ );
      tile.createRelationshipTo( instruction, consts.REPRESENTS_INSTRUCTION, {}, _ );
      console.log( "at6" );
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

  saveWord: function( lemma, classes, categories, collections, versionOf, _ )
  {
    var i, j;
    var word = retriever.getWord( lemma, _ );

    if( word )
    {
      word.data[consts.CLASSES] = classes;
      word.data[consts.CATEGORIES] = categories;
      word.data[consts.COLLECTIONS] = collections;
      word.data[consts.versionOf] = versionOf;
    }
    else
    {
      currentWordNode = tools.createNode({
        type: consts.WORD,
        lemma: lemma,
        points: randomizer.getRandomIntegerInRange(0, 4),
        collections: collections,
        versionOf: versionOf
      }, _ );
      
      currentWordNode.index( collectionName + consts.WORD_LEMMA_INDEX, consts.LEMMA, currentWord.lemma, _ );
      
      for( i = 0; i < classes.length; i++ ){
        for( j = 0; j < collections.length; j++ ){
          currentWordNode.index( collections[j] + consts.WORD_LEMMA_INDEX, consts.LEMMA, currentWord.lemma, _ );
          currentWordNode.index( collections[j] + classes[i] + "ClassIndex", consts.ID, lassCounts[collections[j]][classes[i]]++, _ );
        }
      }
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

    for( i = 0; i < game.data[consts.PATH_COUNT]; i++ )
    {
      currentPath = gameInfo.path[i];
      
      pathObjs.push({
        id : currentPath[consts.ID],
        nWords: currentPath[consts.NWORDS],
        startTile: currentPath[consts.START_TILE],
        endTile: currentPath[consts.END_TILE],
        cw:  currentPath[consts.CW]
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
        imageName : gameInfo.image[imageID][consts.NAME],
        instruction : gameInfo.instruction[instructionID][consts.SHORT_DESCRIPTION],
        description : gameInfo.instruction[instructionID][consts.LONG_DESCRIPTION],
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
            points: words[w][consts.POINTS]
          });
          break;
        }
      }
    }
  }
  
  return magnetInfo;
}
