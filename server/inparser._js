var oz = oz || {};

var
  types = require( "./types._js" ),
  rels = require("./relationships._js"),
  props = require( "./properties._js" ),
  consts = require( "./constants._js" );

module.exports =
{
  checkInstruction: function( rule, words, _ )
  {
    var ret = false;

    while( rule.indexOf("  ") != -1 ){
      rule = rule.replace( "  ", " " );
    }
    
    var matches = rule.split(" ");
    var expType = matches[0];
    var n = matches[1];
    var where = matches[2];

    if( n == "all" ){
      n = words.length;
    }
    
    if( expType == "inspirational" ){
      ret = true;
    }else{
      if( expType == "begin" ){
        ret = checkLetters( n, where, words, true, _ );
      }
      else if( expType == "end" ){
        ret = checkLetters( n, where, words, false, _ );
      }
      else if( expType == "count" ){
        ret = checkCount( n, where, words, _ );
      }
      else if( expType == "class" ){
        ret = checkClass( n, where, words, _ );
      }
      else if( expType == "category" ){
        ret = checkCategory( n, where, words, _ );
      }
      else if( expType == "syllables" ){
        ret = checkSyllables( n, words, _ );
      }
    }

    return ret;
  }
};

function checkLetters( n, where, words, isBegin, _ ) //if not begin -> end
{
  var ret = false;
  var letters = [];
  var lettersCount = {};
  var isSame = where == "same" ? true : false;
  var isDiff = where == "diff" ? true : false;

  for( var i = 0; i < words.length; i++ )
  {
    var currentWord = words[i];

    var currentLetter = currentWord.data[props.WORD.LEMMA].substr( isBegin ? 0 : currentWord.data[props.WORD.LEMMA].length - 1, 1);
    
    if( lettersCount.hasOwnProperty( currentLetter ) ){
      lettersCount[currentLetter]++;
    }else{
      letters.push(currentLetter);
      lettersCount[currentLetter] = 1;
    }
  }
  
  if( isSame ){
    for( var b = 0; b < letters.length; b++ ){
      if( lettersCount[ letters[b] ] == n )
      {
        ret = true;
        break;
      }
    }
  }
  else if( isDiff && letters.length == n)
  {
    ret = true;
  }
  else if( lettersCount.hasOwnProperty( where ) && lettersCount[where] >= n )
  {
    ret = true;
  }
  
  return ret;
}

function checkCount( n, where, words, _ )
{
  var matches = 0;

  for( var i = 0; i < words.length; i++ ){
    var currentWord = words[i];
    if( currentWord.data[props.WORD.LEMMA].length == where )
    {
      matches++;
    }
  }

  return matches >= n;
}

function checkSyllables( n, words, _ )
{
  var matches = 0;

  for( var i = 0; i < words.length; i++ )
  {
    var currentWord = words[i];
    matches = matches + currentWord.syllables;
  }

  return matches >= n;
}

function checkClass( n, where, words, _ )
{
  var i, j;
  var classCount = {};
  
  for( i = 0; i < words.length; i++ ){
    var currentWord = words[i];
    var currentClasses = currentWord.data.classes;
    for( j = 0; j < currentClasses.length; j++ ){
      classCount[ currentClasses[j] ] = classCount.hasOwnProperty( currentClasses[j] ) ? classCount[ currentClasses[j] ] + 1 : 1;
    }
  }
  
  return classCount[ where ] >= n;
}

function checkCategory( n, where, words, _ )
{
  var categoryCount = {};
  
  for( var i = 0; i < words.length; i++ )
  {
    var currentWord = words[i];
    if( currentWord.data.hasOwnProperty( "categories" ) ){
      var currentCategories = currentWord.data.categories;
      for( var j = 0; j < currentCategories.length; j++ ){
        categoryCount[ currentCategories[j] ] = categoryCount.hasOwnProperty( currentCategories[j] ) ? categoryCount[ currentCategories[j] ] + 1 : 1;
      }
    }
  }
  
  return categoryCount.hasOwnProperty( where ) ? categoryCount[ where ] >= n : false;
}
