var oz = oz || {};

var tools = require("./tools._js"),
    types = require("./types._js"),
    indexes = require("./indexes._js"),
    props = require("./properties._js"),
    consts = require("./constants._js"),
    rels = require("./relationships._js"),
    retriever = require("./retriever._js");

module.exports =
{
 
  getAllWords: function ( _ )
  {
    var i = 0;
    
    var word;
    var words = [];
    var versions = {};
    var allWordsArray = loader.loadWords( _ );
    
    for( i = 0; i < allWordsArray.length; i++ ){
      word = allWordsArray[i];
      
      if( word[props.WORD.VERSION_OF].length === 0 ){
        words.push( word );
      }else{
        if( versions.hasOwnProperty( word.lemma ) ){
          versions[ word.lemma ].push( word );
        }else{
          versions[ word.lemma ] = [ word ];
        }
      }
      
      for( i = 0; i < words.length; i++ ){
        word  = words[i];
        if( versions.hasOwnProperty( word.lemma ) ){
          word.versions = versions[word.lemma];
        }
      }
    }
    
    return words;
  }
}