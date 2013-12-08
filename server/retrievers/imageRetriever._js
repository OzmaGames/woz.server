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

  getImageByName: function( name, pretty, _ )
  {
    var image = false;
    var resultsTemp = db.getIndexedNodes( indexes.IMAGE_INDEX, props.IMAGE.NAME, name, _ );
    
    if( resultsTemp )
    {
      image = pretty ? resultsTemp[0].data : resultsTemp[0];
    }
    
    return image;
  },

  getImageByCollectionAndID: function( collectionName, id, pretty, _ )
  {
    var image = false;
    var resultsTemp = db.getIndexedNodes( collectionName + indexes.IMAGE_INDEX, props.ID, id, _ );
    
    if( resultsTemp )
    {
      image = pretty ? resultsTemp[0].data : resultsTemp[0];
    }
    
    return image;
  },

  getAllImages: function( pretty, _ )
  {
    var images = [];
    
    var resultsTemp = db.queryNodeIndex( indexes.IMAGE_INDEX, "name: (*)" , _ );
    
    for( var i = 0; i < resultsTemp.length; i++ ){
      images.push( pretty ? resultsTemp[i].data : resultsTemp[i] );
    }
    
    return images;
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