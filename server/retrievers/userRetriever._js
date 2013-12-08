var neo4j = require("neo4j"),
  
  types = require( "./../constants/types.js" ),
  indexes = require( "./../constants/indexes.js" ),
  consts = require( "./../constants/constants.js" ),
  props = require( "./../constants/properties.js" ),
  rels = require("./../constants/relationships.js"),
  environment = require("./../constants/environment.js");

var db = new neo4j.GraphDatabase(environment.DB_URL);

module.exports =
{
  getUserByUsername: function( username, _ )
  {
    var users = db.getIndexedNodes( indexes.USER_USERNAME_INDEX, props.USER.USERNAME, username, _ );
    
    return users[0];
  },
  
  getUserByEmail: function( email, _ )
  {
    var users = db.getIndexedNodes( indexes.USER_EMAIL_INDEX, props.USER.EMAIL, email, _ );
    
    return users[0];
  },
  
  searchUser: function( keyword, _ )
  {
    var i, j;
    var add = true;
    var users = [];
    
    var resultsTempEmail = db.queryNodeIndex( indexes.USER_EMAIL_INDEX, "email: (" + keyword + "*)" , _ );
    var resultsTempUsername = db.queryNodeIndex( indexes.USER_USERNAME_INDEX, "username: (" + keyword + "*)" , _ );
    
    for( i = 0; i < resultsTempUsername.length; i++ ){
      users.push( resultsTempUsername[i] );
    }
    
    for( i = 0; i < resultsTempEmail.length; i++ ){
      add = true;
      for( j = 0; j < resultsTempUsername.length; j++ ){
        if( resultsTempUsername[j].data.username === resultsTempEmail[i].data.username )
        {
          add = false;
        }
      }
      if( add )
      {
        users.push( resultsTempEmail[i] );
      }
    }
    
    return users;
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