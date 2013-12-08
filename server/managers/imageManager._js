var oz = oz || {};

var tools = require("../tools._js");

var imageRetriever = require("../retrievers/imageRetriever._js");
var retriever = require("../retrievers/retriever._js");

var types = require( "../constants/types.js" );
var rels = require("../constants/relationships.js");
var props = require( "../constants/properties.js" );
var indexes = require( "../constants/indexes.js" );
var consts = require( "../constants/constants.js" );

module.exports =
{
  getImage: function ( name, _ )
  {
    var image = imageRetriever.getImageByName( name, true, _ );
    
    return image;
  },

  getAllImages: function ( _ )
  {
    var instructions = imageRetriever.getAllImages( true, _ );
    
    return instructions;
  },
  
  setImage: function( name, id, related, _ )
  {
    var i;
    var imageNode;
    
    if( id === -1 )
    {
      id = tools.getNewInstructionID(_);
      imageNode = tools.createNode({
          type: types.IMAGE,
          id: id,
          name: name,
          related: related,
          collection: collection
        }, _ );
        
      imageNode.index( indexes.IMAGE_INDEX, props.IMAGE.NAME, name, _ );
      imageNode.index( collection, collection + indexes.IMAGE_INDEX, props.IMAGE.NAME, id, _ );
    }
    else
    {
      imageNode = imageRetriever.getImageByName( name, false, _ );
      
      if( imageNode )
      {
        imageNode.unindex( indexes.IMAGE_INDEX, props.IMAGE.NAME, imageNode.data[props.IMAGE.NAME], _ );
        imageNode.unindex( collection, collection + indexes.IMAGE_INDEX, props.IMAGE.NAME, imageNode.data[props.ID], _ );
        
        imageNode.data[props.IMAGE.NAME] = name;
        imageNode.data[props.IMAGE.RELATED] = related;
        imageNode.data[props.IMAGE.COLLECTION] = collection;
        
        imageNode.index( indexes.IMAGE_INDEX, props.IMAGE.NAME, name, _ );
        imageNode.index( collection, collection + indexes.IMAGE_INDEX, props.IMAGE.NAME, id, _ );
      }
    }
  }
}