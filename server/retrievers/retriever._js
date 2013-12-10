var neo4j = require("neo4j");
  
var types = require( "./../constants/types.js" );
var indexes = require( "./../constants/indexes.js" );
var consts = require( "./../constants/constants.js" );
var props = require( "./../constants/properties.js" );
var rels = require("./../constants/relationships.js");
var environment = require("./../constants/environment.js");

var userRetriever = require("./userRetriever._js");

var db = new neo4j.GraphDatabase(environment.DB_URL);

module.exports =
{
  
  getCountNode: function( _ )
  {
    return db.getNodeById( 1, _ );
  },
  
  getGameByID: function( id, pretty, _ )
  {
    var game = false;
    
    var tempResults = db.getIndexedNodes( indexes.GAME_INDEX, props.GAME.ID, id, _ );
    
    if( tempResults && tempResults.length > 0 )
    {
      game = pretty ? tempResults[0].data : tempResults[0];
    }
    
    return game;
  },

  getUserGames: function( userNodeID, ongoing, _ )
  {
    var games = [];
    
    var query =
      "START m = node(" + userNodeID + ") " +
      "MATCH m -[:" + rels.PLAYS + "]-> game " +
      "WHERE game." + props.GAME.GAME_OVER + " = " + !ongoing + " " +
      "RETURN game;";
    
    var tempResults = db.query(query, {}, _ );
    
    for( var i = 0; i < tempResults.length; i++ ){
      games.push( tempResults[i].game );
    }
    
    return games;
  },
  
  getWord: function( lemma, _ )
  {
    var word;
    
    try{
      var results = db.getIndexedNodes( indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, lemma, _ );
      if( results && results.length > 0 ){
        word = results[0]
      }
    }catch( ex ){
      console.log( "couldn't find word in " + indexes.WORD_LEMMA_INDEX );
      console.log( ex.message );
    }
    
    return word;
  },
  
  getWordFromClassIndex: function( collectionName, className, id, _ )
  { 
    var word = db.getIndexedNodes( collectionName + className + "ClassIndex", props.ID, id, _ )[0];
    
    return word;
  },
  
  getWordsFromClassIndex: function( className, ids, _ )
  {
    var i = 0;
    var words;
    var query = "id: ";
    
    for( i = 0; i < ids.length; i++ ){
      query += ids[i];
      if( i < ids.length - 1 ){
        query += " || id: ";
      }
    }
    
    try{
      words = db.queryNodeIndex( className + "ClassIndex", query , _ );
      
    }catch( ex ){
      console.log( "couldn't find word in class index" );
      console.log( ex );
    }
    
    return words;
  },

   //Gets the phrases for a given game
  getGamePhrases: function( gameNodeID, _ ){
    var phrases = [];
    
    var query =
      "START m = node(" + gameNodeID + ") " +
      "MATCH m -[:" + rels.HAS_PHRASE + "]-> phrase " +
      "RETURN phrase;"
      
    
    var tempResults = db.query(query, {}, _ );
    
    for( i = 0; i < tempResults.length; i++ ){
      phrases.push( tempResults[i].phrase );
    }
    
    return phrases;
  },
  
  //Gets the last phrase
  getGamePhraseByID: function( gameNodeID, phraseID, _ ){
    var phrase;
    
    var query =
      "START m = node(" + gameNodeID + ") " +
      "MATCH m -[:" + rels.HAS_PHRASE + "]-> phrase " +
      "WHERE phrase.id = " + phraseID + " " +
      "RETURN phrase;"
      
    
    var tempResults = db.query(query, {}, _ );
    
    if( tempResults.length == 0 ){
      phrase = false;
    }else{
      phrase = tempResults[0].phrase;
    }
    
    return phrase;
  },
  
  //Gets the players of a given game
  getGamePlayers: function( gameNodeID, _ ){
    var players = [];
    
    var query =
      "START m = node(" + gameNodeID + ") " +
      "MATCH m -[:" + rels.BEING_PLAYED_BY + "]-> player " +
      "RETURN player;";
    
    var tempResults = db.query(query, {}, _ );
    
    for( i = 0; i < tempResults.length; i++ ){
      players.push( tempResults[i].player );
    }
    
    return players;
  },
  
  //Gets the player instance of the player with the given username for a given game
  getGamePlayerByID: function( gameNodeID, username, _ )
  {
    var player = false;
    
    var query =
      "START m = node(" + gameNodeID + ") " +
      "MATCH m -[:" + rels.BEING_PLAYED_BY + "]-> player " +
      "WHERE player." + props.PLAYER.USERNAME + " = \'" + username + "\' " +
      "RETURN player;";
    
    var tempResults = db.query(query, {}, _ );
    
    if( tempResults && tempResults.length > 0 )
    {
      player = db.query(query, {}, _ )[0].player;
    }
    
    return player;
  },

  //Gets the path with the given pathID for a given game
  getGamePathByID: function( gameNodeID, pathID, _ )
  {
    var query =
      "START m = node(" + gameNodeID + ") " +
      "MATCH m -[:" + rels.HAS_PATH + "]-> path " +
      "WHERE path." + props.ID + " = " + pathID + " " +
      "RETURN path;";
    
    var path = db.query(query, {}, _ )[0].path;
    
    return path;
  },

  //Gets the tiles for a given path
  getPathTiles: function( pathNodeID, _ ){
    var i = 0;
    var tiles = [];
    
    var query =
      "START m = node(" + pathNodeID + ") " +
      "MATCH m -[r]-> tile " +
      "WHERE type(r) = \"" + rels.STARTS_WITH + "\" OR type(r) = \"" + rels.ENDS_WITH + "\" " +
      "RETURN tile;";
    
    var tempResults = db.query(query, {}, _ );
    
    for( i = 0; i < tempResults.length; i++ ){
      tiles.push( tempResults[i].tile);
    }
    
    return tiles;
  },
  
  //Gets the start tile for a given path
  getPathStartTile: function( pathNodeID, _ )
  {
    var query =
      "START m = node(" + pathNodeID + ") " +
      "MATCH m -[:" + rels.STARTS_WITH + "]-> tile " +
      "RETURN tile;";
    
    var tile = db.query(query, {}, _ )[0].tile;
    
    return tile;
  },

  //Gets the end tile for a given path
  getPathEndTile: function( pathNodeID, _ )
  {
    var query =
      "START m = node(" + pathNodeID + ") " +
      "MATCH m -[:" + rels.ENDS_WITH + "]-> tile " +
      "RETURN tile;";

    var tile = db.query(query, {}, _ )[0].tile;

    return tile;
  },
  
  //Gets the tiles for a given game
  getGameTilesByID: function( gameNodeID, tileIDs, _ ){
    var tiles = [];
    
    var query =
      "START m = node(" + gameNodeID + ") " +
      "MATCH m -[r]-> tile " +
      "WHERE type(r) = \'hasTile\' and ( ";
    for( var i = 0; i < tileIDs.length; i++ ){
      if( i === 0 ){
        query += "r.id = " + tileIDs[i];
      }else{
        query += " or r.id = " + tileIDs[i];
      }
    }
      query += " ) RETURN tile;";
    
    var tempResults = db.query(query, {}, _ );
    
    var a = tempResults.length;
    while( a-- )
    {
      tiles.push( tempResults[a].tile );
    }
    
    return tiles;
  },
  
  //Gets the tiles for a given game
  getGameTiles: function( gameNodeID, _ ) {
    var tiles = [];
    
    var query =
    "START m = node(" + gameNodeID + ") " +
    "MATCH m -[:hasTile]-> tile " +
    "RETURN tile;";
    
    var tempResults = db.query(query, {}, _ );
    
    var a = tempResults.length;
    while( a-- )
    {
      tiles.push( tempResults[a].tile );
    }
    
    return tiles;
  },
  
  //Gets the tile images for a given game
  getGameTileImages: function( gameNodeID, _ ) {
    var images = [];
    
    var query =
    "START m = node(" + gameNodeID + ") " +
    "MATCH m -[:" + rels.HAS_TILE + "]-> t -[:" + rels.REPRESENTS_IMAGE + "]-> image " +
    "RETURN image;";
    
    var tempResults = db.query(query, {}, _ );
    
    var a = tempResults.length;
    while( a-- ){
      images.push( tempResults[a].image );
    }
    
    return images;
  },
  
  //Gets the tile instructions for a given game
  getGameTileInstructions: function( gameNodeID, _ ) {
    var instructions = [];
    
    var query =
      "START m = node(" + gameNodeID + ") " +
      "MATCH m -[:" + rels.HAS_TILE + "]-> t -[:" + rels.REPRESENTS_INSTRUCTION + "]-> instruction " +
      "RETURN instruction;";
    
    var tempResults = db.query(query, {}, _ );
    
    var a = tempResults.length;
    while( a-- ){
      instructions.push( tempResults[a].instruction );
    }
    
    return instructions;
  },
  
  getGameMagnetByID: function( gameNodeID, magnetID, pretty, _ )
  {
    var magnet = false;
    
    var query =
      "START m = node(" + gameNodeID + ") " +
      "MATCH m -[:" + rels.BEING_PLAYED_BY + "]-> player -[:" + rels.HAS_MAGNET + "]-> magnet " +
      "WHERE magnet.id = " + magnetID + " " +
      "RETURN magnet;";
    
    var tempResults = db.query(query, {}, _ );
    
    if( tempResults && tempResults.length > 0 )
    {
      magnet = pretty ? tempResults[0].magnet.data : tempResults[0].magnet;
    }
    
    return magnet;
  },

  getWordRelatedImages: function( gameNodeID, wordNodeID, _ ){
    var i = 0;
    var images = [];
    var tempResults;
    
    var query =
      "START game = node(" + gameNodeID + "), word = node(" + wordNodeID + ") " +
      "MATCH game -[:hasTile]-> tile -[:" + rels.REPRESENTS_IMAGE + "]-> image -[:" + rels.RELATES_TO + "]-> word " +
      "RETURN image;";
    
    tempResults = db.query(query, {}, _ );
    
    for( i = 0; i < tempResults.length; i++ ){
      images.push( tempResults[i].tile );
    }
    
    return images;
  },

//   getWordRelatedImages: function( gameNodeID, wordID, _ ){
//     var i = 0;
//     var images = [];
//     var tempResults;
//     
//     var query =
//       "START game = node(" + gameNodeID + ") " +
//       "MATCH game -[:hasTile]-> tile -[:representsImage]-> image -[:relatesTo]-> word " +
//       "WHERE word.id = " + wordID + " " +
//       "RETURN image;";
//     
//     tempResults = db.query(query, {}, _ );
//     
//     for( i = 0; i < tempResults.length; i++ ){
//       images.push( tempResults[i].tile );
//     }
//     
//     return images;
//   },
  
  getPlayerMagnets: function( playerNodeID, _ ){
    var magnets = [];
    
    var query =
      "START m = node(" + playerNodeID + ") " +
      "MATCH m -[:" + rels.HAS_MAGNET + "]-> magnet " +
      "RETURN distinct magnet;";
    
    var tempResults = db.query( query, {}, _ );
    
    var a = tempResults.length;
    while( a-- ){
      magnets.push( tempResults[a].magnet );
    }
    
    return magnets;
  },

  getPlayerMagnetsByID: function( playerNodeID, magnetIDs, _ ){
    var results = [];
    
    var query =
      "START m = node(" + playerNodeID + ") " +
      "MATCH m -[:" + rels.HAS_MAGNET + "]-> magnet ";
    
    for( var a = 0; a < magnetIDs.length; a++ ){
      if( a === 0 ){
        query += "WHERE ";
      }else{
        query += " OR ";
      }
      query += " magnet.id = " + magnetIDs[a];
    }
    query += " RETURN magnet;";
    
    var tempResults = db.query(query, {}, _ );

    var b = tempResults.length;
    while( b-- ){
      results.push( tempResults[b].magnet );
    }
    
    return results;
  },
  
  getPlayerMagnetsAndWordsByID: function( playerNodeID, magnetIDs, _ ){
    var mw = [];
    var i = 0;
    
    if( magnetIDs.length > 0 )
    {
      var query =
      "START m = node(" + playerNodeID + ") " +
      "MATCH m -[r]-> magnet -[:" + rels.REPRESENTS_WORD + "]-> word " +
      "WHERE type(r) = \'" + rels.HAS_MAGNET + "\' and ( ";
      for( i = 0; i < magnetIDs.length; i++ ){
        if( i === 0 ){
          query += "r.id = " + magnetIDs[i];
        }else{
          query += " or r.id = " + magnetIDs[i];
        }
      }
      query += " ) RETURN distinct magnet, word;";
      
      var tempResults = db.query(query, {}, _ );
      
      for( i = 0; i < tempResults.length; i++ ){
        mw.push({ magnet: tempResults[i].magnet, word: tempResults[i].word });
      }
    }
    return mw;
  },
  
  getPlayerMagnetWordsByID: function( playerNodeID, magnetIDs, _ )
  {
    var words = [];
    var i = 0;
    
    var query =
    "START m = node(" + playerNodeID + ") " +
    "MATCH m -[r]-> magnet -[:" + rels.REPRESENTS_WORD + "]-> word " +
    "WHERE type(r) = \'" + rels.HAS_MAGNET + "\' and ( ";
    for( i = 0; i < magnetIDs.length; i++ ){
      if( i === 0 ){
        query += "r.id = " + magnetIDs[i];
      }else{
        query += " or r.id = " + magnetIDs[i];
      }
    }
    query += " ) RETURN word;";
    
    var tempResults = db.query(query, {}, _ );
    
    for( i = 0; i < tempResults.length; i++ ){
      words.push( tempResults[a].word );
    }
    
    return words;
  },
  
  getPhraseMagnetWordsByID: function( gameNodeID, magnetIDs, _ )
  {
    var tiles = [];
    
    var query =
    "START m = node(" + gameNodeID + ") " +
    "MATCH m -[r]-> magnet " +
    "WHERE type(r) = \'representsWord\' and ( ";
    for( var i = 0; i < tileIDs.length; i++ ){
      if( i === 0 ){
        query += "r.id = " + tileIDs[i];
      }else{
        query += " or r.id = " + tileIDs[i];
      }
    }
    query += " ) RETURN tile;";
    
    var tempResults = db.query(query, {}, _ );
    
    var a = tempResults.length;
    while( a-- ){
      tiles.push( tempResults[a].tile );
    }
    
    return tiles;
  },
  
  getTileImage: function( tileNodeID, _ )
  {
    var image = getEndNodesByRelType( tileNodeID, rels.REPRESENTS_IMAGE, _ )[0];
    
    return image;
  },
  
  getTileInstruction: function( tileNodeID, _ )
  {
    var instruction = getEndNodesByRelType( tileNodeID, rels.REPRESENTS_INSTRUCTION, _ )[0];
    
    return instruction;
  },
  
  getGameData: function( gameNodeID, _ )
  {
    var gameData = {
      player: [],
      phrase: [],
      magnetPlayer: [],
      magnetPhrase: [],
      word: [],
      path: [],
      tile: [],
      image: [],
      instruction: []
    };
    var query =
    "START m = node(" + gameNodeID + ") " +
    "MATCH m -[*]-> result " +
    "RETURN distinct result;";
    
    var queryResults = db.query(query, {}, _ );
    var resultsCount = queryResults.length;
    
    for( var q = 0; q < resultsCount; q++ ){
      try{
        var queryResult = queryResults.pop().result;
        gameData[ queryResult.data.type ].push( queryResult.data );
      }catch( e ){
        console.log( "Error Getting GameInfo:" );
        console.log( queryResult.data );
        console.log( e.stack );
      }
    }
    
    return gameData;
  },
  
  getMagnetObject: function( magnets, words, owner )
  {
    var magnetInfo = [];
    var wordsLength = words.length;
    var magnetsLength = magnets.length;
    
    for ( var m = 0; m < magnetsLength; m++ ){
      if( magnets[m][props.MAGNET.OWNER] == owner ){
        var currentMagnet = magnets[m];
        for( var w = 0; w < wordsLength; w++ ){
          if( words[w][props.ID] == currentMagnet[props.WORD.REPRESENTED_WORD] ){
            magnetInfo.push({
              id: currentMagnet[props.ID],
              angle: currentMagnet[props.MAGNET.ANGLE],
              x: currentMagnet[props.MAGNET.X],
              y: currentMagnet[props.MAGNET.Y],
              word: words[w]
            });
            break;
          }
        }
      }
    }
    
    return magnetInfo;
  },

  getWordsByClass: function( className, _ )
  {
    var words = [];
    var tempResults = db.queryNodeIndex( className + "ClassIndex", "id: (*)" , _ );
    
    for( var i = 0; i < tempResults.length; i++ ){
      words.push( tempResults[i] );
    }
    
    return words;
  },

  getAllWords: function( pretty, _ )
  {
    var words = [];
    
    var tempResults = db.queryNodeIndex( indexes.WORD_LEMMA_INDEX, "lemma: (*)" , _ );
    
    for( var i = 0; i < tempResults.length; i++ ){
      words.push( pretty ? tempResults[i].data : tempResults[i] );
    }
    
    return words;
  },

  getAllBoards: function( pretty, _ )
  {
  var i = 0;
    var boards = [];
    var tempResults = db.queryNodeIndex( indexes.BOARD_INDEX, "id: (*)" , _ );
    
    for( i = 0; i < tempResults.length; i++ ){
      boards.push( pretty ? tempResults[i].data : tempResults[i] );
    }
    
    return boards;
  },

  getAllPublishedBoards: function( pretty, _ )
  {
  var i = 0;
    var boards = [];
    var tempResults = db.queryNodeIndex( indexes.BOARD_INDEX, "id: (*)" , _ );
    
    for( i = 0; i < tempResults.length; i++ ){
      if( tempResults[i].data.draft === false ){
        boards.push( pretty ? tempResults[i].data : tempResults[i] );
      }
    }
    
    return boards;
  },
  
  getPublishedBoardsByLevel: function( level, pretty, _ )
  {
  var i = 0;
    var boards = [];
    var tempResults = db.queryNodeIndex( indexes.BOARD_INDEX, "id: (*)" , _ );
    
    for( i = 0; i < tempResults.length; i++ ){
      if( tempResults[i].data.draft == false && tempResults[i].data.level === level ){
        boards.push( pretty ? tempResults[i].data : tempResults[i] );
      }
    }
    
    return boards;
  },
  
  getBoardByID: function( id, pretty, _ )
  {
    var board;
    
    try{
      var results= db.getIndexedNodes( indexes.BOARD_INDEX, props.ID, id, _ );
      if( results && results.length > 0 ){
        board = pretty ? results[0].data : results[0];
      }
    }catch( ex ){
      console.log( "couldn't find board in " + indexes.BOARD_INDEX);
      console.log( ex.message );
    }
    
    return board;
  },
  
  getBoardPaths: function( boardNodeID, pretty, _ )
  {
    var paths = [];

    var query =
      "START m = node(" + boardNodeID + ") " +
      "MATCH m -[:" + rels.HAS_PATH + "]-> path " +
      "RETURN path;";

    var tempResults = db.query(query, {}, _ );

    for( var i = 0; i < tempResults.length; i++ ){
      paths.push( pretty ? tempResults[i].path.data : tempResults[i].path );
    }
    
    return paths;
  },

  getBoardTiles: function( boardNodeID, pretty, _ )
  {
    var tiles = [];
    
    var query =
      "START m = node(" + boardNodeID + ") " +
      "MATCH m -[:" + rels.HAS_TILE + "]-> tile " +
      "RETURN tile;";
    
    var tempResults = db.query(query, {}, _ );
    
    for( var i = 0; i < tempResults.length; i++ ){
      tiles.push( pretty ? tempResults[i].tile.data : tempResults[i].tile );
    }
    
    return tiles;
  },
  
  getCollectionByShortName: function( shortName, _ )
  {
    return db.getIndexedNodes( indexes.COLLECTION_INDEX, props.COLLECTION.SHORT_NAME, shortName, _ )[0];
  }
};

  function getEndNodesByRelType( nodeID, relationshipType, _ )
  {
    var results = [];
    if( checkAlpha( nodeID ) && checkAlpha( relationshipType ) )
    {
      var query =
      "START m = node(" + nodeID + ") " +
      "MATCH m -[:" + relationshipType + "]-> result " +
      "RETURN result;";
      
      var tempResults = db.query(query, {}, _ );
      
      var a = tempResults.length;
      while( a-- )
      {
        results.push( tempResults[a].result );
      }
    }
    
    return results;
  }

  function checkAlpha( source )
  {
    var isAlpha = true;
    
    var lowerBoundNum = '0'.charCodeAt( 0 );
    var upperBoundNum = '9'.charCodeAt( 0 );
    var upperBoundLower = 'z'.charCodeAt( 0 );
    var lowerBoundLower = 'a'.charCodeAt( 0 );
    var upperBoundUpper = 'Z'.charCodeAt( 0 );
    var lowerBoundUpper = 'A'.charCodeAt( 0 );
    
    var stringLength = source.length;
    for ( var i = 0; i < stringLength; i++ )
    {
      var ch = source.charCodeAt(i);
      
      if ( ! (
        ( ch <= upperBoundNum && ch >= lowerBoundNum ) ||
        ( ch <= upperBoundUpper && ch >= lowerBoundUpper ) ||
        ( ch <= upperBoundLower && ch >= lowerBoundLower ) ) )
      {
        isAlpha = false;
        break;
      }
    }
    
    return isAlpha;
  }