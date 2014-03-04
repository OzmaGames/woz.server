var oz = oz || {};
  
var sup = require("./supporter._js"),

  types = require( "./constants/types.js" ),
  rels = require("./constants/relationships.js"),
  props = require( "./constants/properties.js" ),
  consts = require( "./constants/constants.js" ),  
  
  retriever = require("./retrievers/retriever._js");  

module.exports =
{
  move: function( gameNodeID, magnetID, x, y, _ )
  {
    var magnet = retriever.getGameMagnetByID( gameNodeID, magnetID, false, _ );
    
    magnet.data[props.MAGNET.X] = x;
    magnet.data[props.MAGNET.Y] = y;
    
    magnet.save(_);
  }
};
