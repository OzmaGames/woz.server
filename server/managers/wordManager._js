var oz = oz || {};

var tools = require("../tools._js"),
  loader = require( "../loader._js" ),
  
  retriever = require("../retrievers/retriever._js"),
  
  types = require( "../constants/types.js" ),
  rels = require("../constants/relationships.js"),
  props = require( "../constants/properties.js" ),
  indexes = require( "../constants/indexes.js" ),
  consts = require( "../constants/constants.js" );

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
      
      if( !word.hasOwnProperty( props.WORD.VERSION_OF ) ) word[props.WORD.VERSION_OF] = "";
      
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
  },
  
  setWord: function( lemma, classes, categories, collections, versionOf, _ )
  {
    var i, j;
    var word = retriever.getWord( lemma, _ );
    
    if( word )
    {
      word.data[props.WORD.CLASSES] = classes;
      word.data[props.WORD.CATEGORIES] = categories;
      word.data[props.WORD.COLLECTIONS] = collections;
      word.data[props.WORD.VERSION_OF] = versionOf;
    }
    else
    {
      currentWordNode = tools.createNode({
        type: types.WORD,
        lemma: lemma,
        points: randomizer.getRandomIntegerInRange(0, 4),
        collections: collections,
        versionOf: versionOf
      }, _ );
      
      currentWordNode.index( collectionName + indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, currentWord.lemma, _ );
      
      for( i = 0; i < classes.length; i++ ){
        for( j = 0; j < collections.length; j++ ){
          currentWordNode.index( collections[j] + indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, currentWord.lemma, _ );
          currentWordNode.index( collections[j] + classes[i] + "ClassIndex", props.ID, lassCounts[collections[j]][classes[i]]++, _ );
        }
      }
    }
  }
}