var oz = oz || {};

var tools = require("../tools._js"),
  wordLoader = require( "../wordLoader._js" ),
  
  retriever = require("../retrievers/retriever._js"),
  
  types = require( "../constants/types.js" ),
  rels = require("../constants/relationships.js"),
  props = require( "../constants/properties.js" ),
  indexes = require( "../constants/indexes.js" ),
  consts = require( "../constants/constants.js" );

module.exports =
{
  getAllCategories: function ( _ )
  {
    var word;
    var a, b, c;
    var category;
    var categories = [];
    var alreadyListed = false;
    var words = retriever.getAllWords( "all", true, _ );
    
    for( a = 0; a < words.length; a++ ){
      word = words[a];
      if( word && word.hasOwnProperty( props.WORD.CATEGORIES ) )
      {
        for( b = 0; b < word.categories.length; b++ ){
          alreadyListed = false;
          category = word.categories[b];
          for( c = 0; c < categories.length; c++ ){
            if( category === categories[c] )
            {
              alreadyListed = true;
              break;
            }
          }
          if( !alreadyListed && category.length > 0 )
          {
            categories.push( category );
          }
        }
      }
    }
    return categories;
  }
};