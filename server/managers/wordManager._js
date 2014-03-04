 var oz = oz || {};

var tools = require("../tools._js");
var wordLoader = require( "../wordLoader._js" );  
var randomizer = require("../randomizer._js");

var retriever = require("../retrievers/retriever._js");
  
var types = require( "../constants/types.js" );
var rels = require("../constants/relationships.js");
var props = require( "../constants/properties.js" );
var indexes = require( "../constants/indexes.js" );
var consts = require( "../constants/constants.js" );

module.exports =
{

  getAllVersions: function ( active, pretty, _ )
  {
    var versions = {};
    try
    {
      versions = retriever.getAllVersions( active, pretty, _ );
    }
    catch( ex )
    {
      console.log( "Error Getting Versions:" );
      console.log( ex );
    }
    
    return versions;
  },

  getAllWords: function ( active, pretty, _ )
  {
    var i = 0;
    
    var word;
    var words = [];
    var versions = this.getAllVersions( active, pretty, _ );
    var allWordsArray = retriever.getAllWords( active, pretty, _ );
    
    
    for( i = 0; i < allWordsArray.length; i++ ){
      word = allWordsArray[i];
      
        if( word[props.WORD.CATEGORIES] && word[props.WORD.CATEGORIES].length > 0 && word[props.WORD.CATEGORIES][0] === "" )
        {
          word[props.WORD.CATEGORIES] = [];
        }
        
        if( versions.hasOwnProperty( word[props.WORD.LEMMA] ) )
        {
          word.versions = versions[ word[props.WORD.LEMMA] ];
        }
        else
        {
          word.versions = [];
        }
        
        words.push( word );
      }
    
    return words;
  },
  
  setWord: function( lemma, oldLemma, classes, categories, collections, _ )
  {
    var i, j;
    var word;
    var isLemmaUpdate = false;
    
    if( lemma )
    {
      if( !classes ) classes = [""];
      if( !categories ) categories = [""];
      if( !collections ) collections = [""];
      
      if( classes.length === 0 ) classes = [""];
      if( categories.length === 0 ) categories = [""];
      if( collections.length === 0 ) collections = [""];
      
      if( !word ) word = retriever.getWord( oldLemma, _ );
      if( !word ){
        word = retriever.getWord( lemma, _  );
      }
      else
      {
        isLemmaUpdate = true;
      }
      
      if( word )
      {
        word.data[props.WORD.LEMMA] = lemma;
        word.data[props.WORD.CLASSES] = classes;
        word.data[props.WORD.CATEGORIES] = categories;
        word.data[props.WORD.COLLECTIONS] = collections;
        word.data[props.WORD.ACTIVE] = true;
        
        if( isLemmaUpdate ){
          word.unindex( indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, oldLemma, _ );
          word.index( indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, lemma, _ );
        }
        
        word.save(_);
      }
      else
      {
        word = tools.createNode({
          type: types.WORD,
          lemma: lemma,
          points: randomizer.getRandomIntegerInRange(1, 4),
          classes: classes,
          categories: categories,
          collections: collections,
          active: true
        }, _ );
        
        word.index( indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, lemma, _ );
      }
    }
    
    return word;
  },
  
  setVersions: function( lemma, versions, _ )
  {
    var a;
    var version;
    var motherWord;
    var success = false;
    
    if( lemma )
    {
      motherWord = retriever.getWord( lemma, _ );
      if( motherWord )
      {
        console.log( "1" );
        retriever.deleteAllRelsBetweenWordAndVersions( motherWord, _ );
        console.log( "2" );
        for( a = 0; a < versions.length; a++ )
        {
          console.log( "3" );
          version = versions[a];
          console.log( "4" );
          word = this.setWord( version.lemma, "", version.classes, version.categories, version.collections, _ );
          console.log( "5" );
          console.log( motherWord.data );
          console.log( word.data );
          console.log( rels.IS_VERSION_OF );
          word.createRelationshipTo( motherWord, rels.IS_VERSION_OF, {}, _ );
          console.log( "6" );
        }
        success = true;
      }
    }
    return success;
  },
  
  deleteWord: function( lemma, _ )
  {
    var word = retriever.getWord( lemma, _ );
    
    if( word )
    {
      word.data[props.WORD.ACTIVE] = false;
      word.save( _ );
    }
  }
};