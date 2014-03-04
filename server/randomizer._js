var types = require( "./constants/types.js" );
var rels = require("./constants/relationships.js");
var props = require( "./constants/properties.js" );
var consts = require( "./constants/constants.js" );

var retriever = require("./retrievers/retriever._js");
var imageRetriever = require("./retrievers/imageRetriever._js");
var instructionRetriever = require("./retrievers/instructionRetriever._js");

module.exports =
{

  getRandomWordID: function( collectionName, className )
  {
    return Math.floor( this.getRandomIntegerInRange( 0, consts.CLASS_COUNTS[collectionName][className] - 1 ) );
  },
  
  getRandomImage : function( collectionName, _ )
  {
    var randomN = Math.floor( Math.random() *  20 );
    var image = imageRetriever.getImageByCollectionAndID( collectionName, randomN, false, _ );
    
    return image;
  },
  
  getRandomInRange: function( min, max )
  {
    return Math.random() * ( max - min ) + min;
  },
  
  getRandomIntegerInRange: function( min, max )
  {
    return Math.round( this.getRandomInRange( min, max ) );
  },
  
  getSignedRandomInRange: function( min, max )
  {
    var random = Math.random() * ( max - min ) + min;
    return (Math.random() > 0.5) ? random : (0 - random);
  },
  
  getArrayOfUniqueRandomIntegerInRange: function( size, min, max )
  {
    var i = 0;
    var j = 0;
    var temp = 0;
    var ret = [];
    
    for( i = 0; i < size; i++ ){
      temp = this.getRandomIntegerInRange( min, max );
      if( i > 0 ){
        for( j = 0; j < ret.length; j++ ){
          if( ret[j] === temp ){
            i--;
            break;
          }
        }
      }
      if( j === ret.length ){
        ret.push( temp );
      }
    }
    
    return ret;
  }  
};
