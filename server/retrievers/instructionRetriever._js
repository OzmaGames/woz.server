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

  getInstructionByID: function( id, pretty, _ )
  {
    var instruction = false;
    var resultsTemp = db.getIndexedNodes( indexes.INSTRUCTION_INDEX, props.ID, id, _ );
    
    if( resultsTemp )
    {
      instruction = pretty ? resultsTemp[0].data : resultsTemp[0];
    }
    
    return instruction;
  },
  
  getAllInstructions: function( pretty, _ )
  {
    var instructions = [];
    
    var resultsTemp = db.queryNodeIndex( indexes.INSTRUCTION_INDEX, "id: (*)" , _ );
    
    for( var i = 0; i < resultsTemp.length; i++ ){
      instructions.push( pretty ? resultsTemp[i].data : resultsTemp[i] );
    }
    
    return instructions;
  },
  
  getTileInstruction: function( tileNodeID, _ )
  {
    var instruction = getEndNodesByRelType( tileNodeID, rels.REPRESENTS_INSTRUCTION, _ )[0];
    
    return instruction;
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