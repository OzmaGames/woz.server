var types = require( "./types._js" ),
  rels = require("./relationships._js"),
  props = require( "./properties._js" ),
  consts = require( "./constants._js" ),
  
  retriever = require("./retriever._js");

var words = {};
var images = {};

module.exports =
{
//   loadWords: function( _ )
//   {
//     var i = 0;
//     
//     for( i = 0; i < consts.CLASS_NAMES.length; i++ ){
//       words[consts.CLASS_NAMES[i]] = retriever.getWordsByClass( consts.CLASS_NAMES[i], _ );
//     }
//   },

  loadWords: function( _ )
  {
    words = retriever.getAllWordsData( _ );
    
    return words;
  },

  loadImages: function( _ )
  {
    
  },

  getWords: function(){
    return words;
  }
};

