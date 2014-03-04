var types = require( "./constants/types.js" );
var rels = require("./constants/relationships.js");
var props = require( "./constants/properties.js" );
var consts = require( "./constants/constants.js" );
  
var retriever = require("./retrievers/retriever._js");
var randomizer = require("./randomizer._js");

var words = {};
var versions = {};

module.exports =
{
  loadWords: function( _ )
  {
    var a, b, c;
    var word;
    var className;
    var collectionName;
    var tempWords = retriever.getAllWords( "active", false, _ );
    var collections = retriever.getAllCollections( true, _ );
    
    words = {};
    
    for( a = 0; a < collections.length; a++ ){
      collectionName = collections[a][props.COLLECTION.SHORT_NAME];
      consts.CLASS_COUNTS[collectionName] = {};
      words[collectionName] = {};
      
      for( b = 0; b < consts.CLASS_NAMES.length; b++ ){
        className = consts.CLASS_NAMES[b];
        words[collectionName][className] = [];
        consts.CLASS_COUNTS[collectionName][className] = 0;
      }
    }
    
    for( a = 0; a < tempWords.length; a++ ){
      word = tempWords[a];
      if( word && word.data.hasOwnProperty( props.WORD.CATEGORIES ) && word.data.hasOwnProperty( props.WORD.COLLECTIONS ) )
      {  
        for( b = 0; b < word.data[props.WORD.COLLECTIONS].length; b++ ){
          collectionName = word.data[props.WORD.COLLECTIONS][b];
          
          for( c = 0; c < word.data[props.WORD.CLASSES].length; c++ ){
            className = word.data[props.WORD.CLASSES][c];
            if( words.hasOwnProperty( collectionName ) && words[collectionName].hasOwnProperty( className ) )
            {
              words[collectionName][className].push( word );
              
              consts.CLASS_COUNTS[collectionName][className]++;
            }
          }
        }
      }
    }
  },
  
  loadVersions: function ( _ )
  {
    var versions = {};
    try
    {
      versions = retriever.getAllVersions( "active", false, _ );
    }
    catch( ex )
    {
      console.log( "Error Getting Versions:" );
      console.log( ex );
    }
  },
  
  getWords: function()
  {
    return words;
  },
  
  getVersions: function()
  {
    return versions;
  },
  
//   exportWords: function( _ )
//   {
//     var exportWords = retriever.getAllWords( "all", true, _ );
//     
//     var fs = require('fs');
//     fs.writeFile("./newWords.js", JSON.stringify( exportWords, null, 2 ), _);  
//   },

  getRandomWord : function( collectionName, className, otherWords )
  {
    var a;
    var word;
    var wordID;
    var duplicate;
    
    do{
      wordID = randomizer.getRandomWordID( collectionName, className );
      word = words[collectionName][className][wordID];
      duplicate = false;
      
      for( a = 0; a < otherWords.length ; a++ ){
        if( otherWords[a].data[props.WORD.LEMMA] === word.data[props.WORD.LEMMA] )
        {
          duplicate = true;
          break;
        }
      }
    }while( duplicate );
    
    return word;
  },
  
  
};

