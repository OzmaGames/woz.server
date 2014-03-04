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
    var images = imageRetriever.getAllImages( true, _ );
    
    return images;
  },
  
  setImage: function( name, id, related, _ )
  {
    var i;
    var image;
    
    image = imageRetriever.getImageByName( name, false, _ );
    
    if( image )
    {
      image.unindex( indexes.IMAGE_INDEX, props.IMAGE.NAME, image.data[props.IMAGE.NAME], _ );
      image.unindex( collection, collection + indexes.IMAGE_INDEX, props.IMAGE.NAME, image.data[props.ID], _ );
      
      image.data[props.IMAGE.NAME] = name;
      image.data[props.IMAGE.RELATED] = related;
      image.data[props.IMAGE.COLLECTION] = collection;
      
      image.index( indexes.IMAGE_INDEX, props.IMAGE.NAME, name, _ );
      image.index( collection, collection + indexes.IMAGE_INDEX, props.IMAGE.NAME, id, _ );
    }
    else if( id === -1 )
    {
      id = tools.getNewInstructionID(_);
      image = tools.createNode({
          type: types.IMAGE,
          id: id,
          name: name,
          related: related,
          collection: collection
        }, _ );
        
      image.index( indexes.IMAGE_INDEX, props.IMAGE.NAME, name, _ );
      image.index( collection, collection + indexes.IMAGE_INDEX, props.IMAGE.NAME, id, _ );
    }
    
    return id;
  },
  
  getRelatedWords: function( name, _ )
  {
    var image = imageRetriever.getImageByName( name, false, _ );
    
    return image.data[props.IMAGE.RELATED];
  },
  
  setRelatedWords: function( name, relatedWords, _ )
  {
    var a, b;
    var relatedWord;
    var relatedImages;
    var oldRelatedImages;
    
    var image = imageRetriever.getImageByName( name, false, _ );
    var oldRelatedWords = imageRetriever.getImageRelatedWords( image.id, false, _ );
    var oldRelatedRels = imageRetriever.getRelBetweenImageAndRelatedWords( image.id, false, _ );
    
    for( a = 0; a < oldRelatedRels.length; a++ ){
      oldRelatedRels[a].del(_);
    }
    
    for( a = 0; a < oldRelatedWords.length; a++ ){
      relatedWord = oldRelatedWords[a];
      
      oldRelatedImages = imageRetriever.getWordRelatedImages( relatedWord.id, _ );
      
      if( oldRelatedImages.length === 0 )
      {
        for( b = 0; b < relatedWord.data[props.WORD.CLASSES].length; b++ ){
          
          if( relatedWord.data[props.WORD.CLASSES][b] === "related" )
          {
            relatedWord.data[props.WORD.CLASSES].splice( b, 1 );
            relatedWord.save( _ );
            break;
          }
        }
      }
    }
    
    for( a = 0; a < relatedWords.length; a++ ){
      try
      {
        relatedWord = retriever.getWord( relatedWords[a], _ );
        image.createRelationshipTo( relatedWord, rels.RELATES_TO, {}, _ );
        
        alreadyRelated = false;
        for( b = 0; b < relatedWord.data[props.WORD.CLASSES].length; b++ ){
          if( relatedWord.data[props.WORD.CLASSES][b] === "related" )
          {
            alreadyRelated = true;
            break;
          }
        }
        
        if( !alreadyRelated )
        {
          relatedWord.data.classes.push( "related" );
          relatedWord.save(_);
        }
        
        image.data[props.IMAGE.RELATED] = relatedWords;
        image.save(_);
      }
      catch( ex )
      {
        console.log( "failed relating " + relatedWords[a] + " to " + name );
        console.log( ex );
      }
    }
  }
};