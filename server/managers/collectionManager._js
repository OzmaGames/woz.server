var oz = oz || {};

var tools = require("../tools._js"),
  wordLoader = require( "../wordLoader._js" ),
  
  retriever = require("../retrievers/retriever._js"),
  
  types = require( "../constants/types.js" ),
  rels = require("../constants/relationships.js"),
  props = require( "../constants/properties.js" ),
  indexes = require( "../constants/indexes.js" ),
  consts = require( "../constants/constants.js" );

module.exports =
{

  setCollection: function( shortName, longName, _ )
  {
    var collection = tools.createNode({
      type: types.COLLECTION,
      longName: longName,
      shortName: shortName
    }, _ );
    
    collection.index( indexes.COLLECTION_INDEX, props.COLLECTION.SHORT_NAME, shortName, _ );  
  },

  getAllCollections: function ( _ )
  {
    var collections = [];
    
    collections = retriever.getAllCollections( true, _ );
    
    return collections;
  }
};