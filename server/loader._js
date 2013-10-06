var neo4j = require("neo4j"),
  consts = require("./constants._js"),
  retriever = require("./retriever._js"),
  randomizer = require("./randomizer._js"),
  environment = require("./environment._js");

var db = new neo4j.GraphDatabase(environment.DB_URL);

var words = {};
var images = {};

module.exports =
{
  loadWords: function( _ )
  {
    var i = 0;
    
    for( i = 0; i < consts.CLASS_NAMES.length; i++ ){
      words[consts.CLASS_NAMES[i]] = retriever.getWordsByClass( consts.CLASS_NAMES[i], _ );
    }
  },

  loadImages: function( _ )
  {
    
  },

};

