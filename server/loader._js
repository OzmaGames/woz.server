var neo4j = require("neo4j"),
  consts = require("./constants._js"),
  retriever = require("./retriever._js"),
  randomizer = require("./randomizer._js"),
  environment = require("./environment._js");

var db = new neo4j.GraphDatabase(environment.DB_URL);

var words;
var images;

module.exports =
{
  loadWords: function( _ )
  {
    words = 0;
    words = db.queryNodeIndex( consts.WORD_LEMMA_INDEX, "lemma: (*)" , _ );
    console.log( words );

    for( var i = 0; i < words.length; i++ ){
      console.log( words[i].data );

    }
    
  },

  loadImages: function( _ )
  {
    iamges = 0;
  },

};

