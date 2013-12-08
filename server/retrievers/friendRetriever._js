var neo4j = require("neo4j"),
  
  types = require( "./../constants/types.js" ),
  indexes = require( "./../constants/indexes.js" ),
  consts = require( "./../constants/constants.js" ),
  props = require( "./../constants/properties.js" ),
  rels = require("./../constants/relationships.js"),
  environment = require("./../constants/environment.js"),
  
  userRetriever = require("./userRetriever._js");

var db = new neo4j.GraphDatabase(environment.DB_URL);

module.exports =
{
  getFriends: function( username, _ )
  {
    var friends = [];
    var user = userRetriever.getUserByUsername( username, _ );
    
    var query =
      "START m = node(" + user.id + ") " +
      "MATCH m -[:" + rels.IS_FRIEND_OF + "]-> friend " +
      "RETURN friend;";
    
    var resultsTemp = db.query(query, {}, _ );
    
    for( var i = 0; i < resultsTemp.length; i++ ){
      friends.push( resultsTemp[i].friend );
    }
    
    return friends;
  },

  getRelBetweenFriends: function( username, friendUsername, _ )
  {
    var rel = false;
    var user = userRetriever.getUserByUsername( username, _ );
    
    var query =    
      "START m = node(" + user.id + ") " +
      "MATCH m -[rel]-> friend " +
      "WHERE type(rel) = \"" + rels.IS_FRIEND_OF + "\" AND friend.username = \"" + friendUsername + "\" " +
      "RETURN rel;";
    
    var resultsTemp = db.query( query, {}, _ );
    
    if( resultsTemp.length > 0 )
    {
      rel = resultsTemp[0].rel;
    }
    
    
    return rel;
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