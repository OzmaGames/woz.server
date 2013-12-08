var types = require( "./constants/types.js" ),
  rels = require("./constants/relationships.js"),
  props = require( "./constants/properties.js" ),
  consts = require( "./constants/constants.js" ),
  
  retriever = require("./retrievers/retriever._js");

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

//   fixWords: function( _ )
//   {
//     words = retriever.getAllWords( false, _ );
//     
//     for( var i = 0; i < words.length; i++ ){
//       var alreadyRelated = false;
//       var classes = [];
//       if( words[i].data.hasOwnProperty( "classes" ) )
//       {
//         for( var j = 0; j < words[i].data.classes.length; j++ ){
//           if( words[i].data.classes[j] !== "related" || (!alreadyRelated && words[i].data.classes[j] == "related") )
//           {
//             if( words[i].data.classes[j] === "related" ) alreadyRelated = true;
//             classes.push( words[i].data.classes[j] );
//           }
//         }
//         words[i].data.classes = classes;
//         words[i].save( _ );
//       }
//     }
//   },

//   fixWords: function( _ )
//   {
//     var fs = require('fs');
//     var words = require('./resources/words.js').words;
//     
//     for( var i = 0; i < words.length; i++ ){
//       var collections = [];
//       if( words[i].hasOwnProperty( "collections" ) )
//       {
//         for( var j = 0; j < words[i].collections.length; j++ ){
//           if( words[i].collections[j] === "basic" )
//           {
//             collections.push( "basic" );
//           }
//           else if( words[i].collections[j] === "starter" )
//           {
//             collections.push( "woz" );
//           }
//           else if( words[i].collections[j] === "nightfall" )
//           {
//             collections.push( "nf" );
//           }
//         }
//         words[i].collections = collections;
//       }
//     }
//     fs.writeFile("./newWords.js", JSON.stringify( words, null, 2 ), _);  
//   },
// 
  loadWords: function( _ )
  {
    words = retriever.getAllWords( true, _ );
    
    return words;
  },
  
//   exportWords: function( _ )
//   {
//     var exportWords = retriever.getAllWords( true, _ );
//     
//     var fs = require('fs');
//     fs.writeFile("./newWords.js", JSON.stringify( exportWords, null, 2 ), _);  
//   },

  loadImages: function( _ )
  {
    
  },

  getWords: function(){
    return words;
  }
};

