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
  
  getCountNode: function(_){
    return db.getNodeById( 1, _ );
  },
  
  getGameByID: function( id, _ ){
    return db.getIndexedNodes( indexes.GAME_INDEX, props.GAME.ID, id, _ )[0];
  },

  getUserGames: function( userNodeID, ongoing, _ )
  {
    var games = [];
    
    var query =
      "START m = node(" + userNodeID + ") " +
      "MATCH m -[:" + rels.PLAYS + "]-> game " +
      "WHERE game." + props.GAME.GAME_OVER + " = " + !ongoing + " " +
      "RETURN game;";
    
    var resultsTemp = db.query(query, {}, _ );
    
    for( var i = 0; i < resultsTemp.length; i++ ){
      games.push( resultsTemp[i].game );
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
      
    
    var resultsTemp = db.query(query, {}, _ );
    
    for( i = 0; i < resultsTemp.length; i++ ){
      phrases.push( resultsTemp[i].phrase );
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
      
    
    var resultsTemp = db.query(query, {}, _ );
    
    if( resultsTemp.length == 0 ){
      phrase = false;
    }else{
      phrase = resultsTemp[0].phrase;
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
    
    var resultsTemp = db.query(query, {}, _ );
    
    for( i = 0; i < resultsTemp.length; i++ ){
      players.push( resultsTemp[i].player );
    }
    
    return players;
  },
  
  //Gets the player instance of the player with the given username for a given game
  getGamePlayerByID: function( gameNodeID, username, _ )
  {
  
    var query =
      "START m = node(" + gameNodeID + ") " +
      "MATCH m -[:" + rels.BEING_PLAYED_BY + "]-> player " +
      "WHERE player." + props.PLAYER.USERNAME + " = \'" + username + "\' " +
      "RETURN player;";
    
    var player = db.query(query, {}, _ )[0].player;
    
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
    
    var resultsTemp = db.query(query, {}, _ );
    
    for( i = 0; i < resultsTemp.length; i++ ){
      tiles.push( resultsTemp[i].tile);
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
    
    var resultsTemp = db.query(query, {}, _ );
    
    var a = resultsTemp.length;
    while( a-- )
    {
      tiles.push( resultsTemp[a].tile );
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
    
    var resultsTemp = db.query(query, {}, _ );
    
    var a = resultsTemp.length;
    while( a-- )
    {
      tiles.push( resultsTemp[a].tile );
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
    
    var resultsTemp = db.query(query, {}, _ );
    
    var a = resultsTemp.length;
    while( a-- ){
      images.push( resultsTemp[a].image );
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
    
    var resultsTemp = db.query(query, {}, _ );
    
    var a = resultsTemp.length;
    while( a-- ){
      instructions.push( resultsTemp[a].instruction );
    }
    
    return instructions;
  },
  
  getGameMagnetByID: function( gameNodeID, magnetID, _ ){
    var query =
      "START m = node(" + gameNodeID + ") " +
      "MATCH m -[:" + indexes.BEING_PLAYED_BY + "]-> player -[:" + indexes.HAS_MAGNET + "]-> magnet " +
      "WHERE magnet.id = " + magnetID + " " +
      "RETURN magnet;";
    
    return db.query(query, {}, _ )[0].magnet;
  },

  getWordRelatedImages: function( gameNodeID, wordNodeID, _ ){
    var i = 0;
    var images = [];
    var resultsTemp;
    
    var query =
      "START game = node(" + gameNodeID + "), word = node(" + wordNodeID + ") " +
      "MATCH game -[:hasTile]-> tile -[:" + rels.REPRESENTS_IMAGE + "]-> image -[:" + rels.RELATES_TO + "]-> word " +
      "RETURN image;";
    
    resultsTemp = db.query(query, {}, _ );
    
    for( i = 0; i < resultsTemp.length; i++ ){
      images.push( resultsTemp[i].tile );
    }
    
    return images;
  },

//   getWordRelatedImages: function( gameNodeID, wordID, _ ){
//     var i = 0;
//     var images = [];
//     var resultsTemp;
//     
//     var query =
//       "START game = node(" + gameNodeID + ") " +
//       "MATCH game -[:hasTile]-> tile -[:representsImage]-> image -[:relatesTo]-> word " +
//       "WHERE word.id = " + wordID + " " +
//       "RETURN image;";
//     
//     resultsTemp = db.query(query, {}, _ );
//     
//     for( i = 0; i < resultsTemp.length; i++ ){
//       images.push( resultsTemp[i].tile );
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
    
    var resultsTemp = db.query( query, {}, _ );
    
    var a = resultsTemp.length;
    while( a-- ){
      magnets.push( resultsTemp[a].magnet );
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
    
    var resultsTemp = db.query(query, {}, _ );

    var b = resultsTemp.length;
    while( b-- ){
      results.push( resultsTemp[b].magnet );
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
      
      var resultsTemp = db.query(query, {}, _ );
      
      for( i = 0; i < resultsTemp.length; i++ ){
        mw.push({ magnet: resultsTemp[i].magnet, word: resultsTemp[i].word });
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
    
    var resultsTemp = db.query(query, {}, _ );
    
    for( i = 0; i < resultsTemp.length; i++ ){
      words.push( resultsTemp[a].word );
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
    
    var resultsTemp = db.query(query, {}, _ );
    
    var a = resultsTemp.length;
    while( a-- ){
      tiles.push( resultsTemp[a].tile );
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
    var resultsTemp = db.queryNodeIndex( className + "ClassIndex", "id: (*)" , _ );
    
    for( var i = 0; i < resultsTemp.length; i++ ){
      words.push( resultsTemp[i] );
    }
    
    return words;
  },

  getAllWords: function( pretty, _ )
  {
    var words = [];
    
    var resultsTemp = db.queryNodeIndex( indexes.WORD_LEMMA_INDEX, "lemma: (*)" , _ );
    
    for( var i = 0; i < resultsTemp.length; i++ ){
      words.push( pretty ? resultsTemp[i].data : resultsTemp[i] );
    }
    
    return words;
  },

  getAllBoards: function( pretty, _ )
  {
  var i = 0;
    var boards = [];
    var resultsTemp = db.queryNodeIndex( indexes.BOARD_INDEX, "id: (*)" , _ );
    
    for( i = 0; i < resultsTemp.length; i++ ){
      boards.push( pretty ? resultsTemp[i].data : resultsTemp[i] );
    }
    
    return boards;
  },

  getAllPublishedBoards: function( pretty, _ )
  {
  var i = 0;
    var boards = [];
    var resultsTemp = db.queryNodeIndex( indexes.BOARD_INDEX, "id: (*)" , _ );
    
    for( i = 0; i < resultsTemp.length; i++ ){
      if( resultsTemp[i].data.draft === false ){
        boards.push( pretty ? resultsTemp[i].data : resultsTemp[i] );
      }
    }
    
    return boards;
  },
  
  getPublishedBoardsByLevel: function( level, pretty, _ )
  {
  var i = 0;
    var boards = [];
    var resultsTemp = db.queryNodeIndex( indexes.BOARD_INDEX, "id: (*)" , _ );
    
    for( i = 0; i < resultsTemp.length; i++ ){
      if( resultsTemp[i].data.draft == false && resultsTemp[i].data.level === level ){
        boards.push( pretty ? resultsTemp[i].data : resultsTemp[i] );
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

    var resultsTemp = db.query(query, {}, _ );

    for( var i = 0; i < resultsTemp.length; i++ ){
      paths.push( pretty ? resultsTemp[i].path.data : resultsTemp[i].path );
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
    
    var resultsTemp = db.query(query, {}, _ );
    
    for( var i = 0; i < resultsTemp.length; i++ ){
      tiles.push( pretty ? resultsTemp[i].tile.data : resultsTemp[i].tile );
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
      
      var resultsTemp = db.query(query, {}, _ );
      
      var a = resultsTemp.length;
      while( a-- )
      {
        results.push( resultsTemp[a].result );
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