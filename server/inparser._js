var oz = oz || {};

var types = require( "./constants/types.js" ),
  rels = require("./constants/relationships.js"),
  props = require( "./constants/properties.js" ),
  consts = require( "./constants/constants.js" );

module.exports =
{
  checkInstruction: function( conditions, words, _ )
  {
    var a = 0;
    var tempRet;
    var condition;
    var ret = { satisfied: true, words: [] };
    
    for( a = 0; a < conditions.length; a++ )
    {
      condition = conditions[a];
      while( condition.indexOf("  ") != -1 ){
        condition = condition.replace( "  ", " " );
      }
      console.log( condition );
      var matches = condition.split(" ");
      var expType = matches[0];
      var n = matches[1];
      var where = matches[2];
      
      if( n == "all" ){
        n = words.length;
      }
      
      if( expType == "begin" ){
        tempRet = checkLetters( n, where, words, true, _ );
      }
      else if( expType == "end" ){
        tempRet = checkLetters( n, where, words, false, _ );
      }
      else if( expType == "count" ){
        tempRet = checkCount( n, where, words, _ );
      }
      else if( expType == "class" ){
        tempRet = checkClass( n, where, words, _ );
      }
      else if( expType == "category" ){
        tempRet = checkCategory( n, where, words, _ );
      }
      else if( expType == "syllables" ){
        tempRet = checkSyllables( n, words, _ );
      }
      else{
        tempRet = { satisfied: false, words: [] };
      }
      console.log( "tempRet" );
      console.log( tempRet );
      ret.satisfied = ret.satisfied && tempRet.satisfied;
      ret.words = ret.words.concat( tempRet.words );
      console.log( "ret" );
      console.log( ret );
    }
    
    return ret;
  }
};

function checkLetters( n, where, words, isBegin, _ ) //if not begin -> end
{
  var i;
  var ret = { satisfied: false, words:[] };
  var letters = [];
  var lettersCount = {};
  var isSame = where == "same" ? true : false;
  var isDiff = where == "diff" ? true : false;

  for( i = 0; i < words.length; i++ )
  {
    var currentWord = words[i];

    var currentLetter = currentWord.data[props.WORD.LEMMA].substr( isBegin ? 0 : currentWord.data[props.WORD.LEMMA].length - 1, 1);
    
    if( !lettersCount.hasOwnProperty( currentLetter ) )
    {
      letters.push(currentLetter);
      lettersCount[currentLetter] = { count: 0, words: [] };
    }
    
    lettersCount[currentLetter].count++;
    lettersCount[currentLetter].words.push( i );
  }
  
  if( isSame )  //2 words starting with the same letter, f. ex.
  {
    for( var b = 0; b < letters.length; b++ ){
      if( lettersCount[ letters[b] ] == n )
      {
        ret.words = lettersCount[ letters[b] ].words;
        ret.satisfied = true;
        break;
      }
    }
  }
  else if( isDiff && letters.length == n)  //2 words starting with different letters, f. ex.
  {
    ret.satisfied = true;
  }
  else if( lettersCount.hasOwnProperty( where ) && lettersCount[where].count >= n )  //1 word starting with r. f. ex.
  {
    ret.words = lettersCount[where].words;
    ret.satisfied = true;
  }
  
  return ret;
}

function checkCount( n, where, words, _ )
{
  var ret = { satisfied: false, words: [] };
  var currentWord;
  var count = 0;
  
  for( var i = 0; i < words.length; i++ ){
    currentWord = words[i];
    if( currentWord.data[props.WORD.LEMMA].length == where )
    {
      count++;
      ret.words.push( i );
    }
  }

  ret.satisfied = count >= n;
  
  return ret;
}

function checkSyllables( n, words, _ )  //no syllables atm
{
  return { satisfied: false, words: [] };
}

function checkClass( n, where, words, _ )
{
  var i, j;
  var classCount = {};
  var ret = { satisfied: false, words: [] };
  
  for( i = 0; i < words.length; i++ ){
    var currentWord = words[i];
    var currentClasses = currentWord.data.classes;
    for( j = 0; j < currentClasses.length; j++ ){
      if( !classCount.hasOwnProperty( currentClasses[j] ) )
      {
        classCount[ currentClasses[j] ] = { count: 0, words: [] };
      }
      
      classCount[ currentClasses[j] ].count++;
      classCount[ currentClasses[j] ].words.push( i );
    }
  }
  
  if( classCount.hasOwnProperty( where ) && classCount[where] >= n )
  {
    ret.satisfied = true;
    ret.words = classCount[where].words;
  }
  
  return ret;
}

function checkCategory( n, where, words, _ )
{
  var categoryCount = {};
  var ret = { satisfied: false, words: [] };
  
  for( var i = 0; i < words.length; i++ )
  {
    var currentWord = words[i];
    if( currentWord.data.hasOwnProperty( "categories" ) ){
      var currentCategories = currentWord.data.categories;
      for( var j = 0; j < currentCategories.length; j++ ){
      
      if( !categoryCount.hasOwnProperty( currentCategories[j] ) )
      {
        categoryCount[ currentCategories[j] ] = { count: 0, words: [] };
      }
      
      categoryCount[ currentCategories[j] ].count++;
      categoryCount[ currentCategories[j] ].words.push( i );
      
      }
    }
  }
  
  if( categoryCount.hasOwnProperty( where ) &&  categoryCount[ where ] >= n )
  {
    ret.satisfied = true;
    ret.words = categoryCount[where].words;
  }
  
  return ret;
}
