var oz = oz || {};
  
var sup = require("./supporter._js"),

  types = require( "./constants/types.js" ),
  rels = require("./constants/relationships.js"),
  props = require( "./constants/properties.js" ),
  consts = require( "./constants/constants.js" ),  
  
  retriever = require("./retrievers/retriever._js");  

module.exports =
{
  move: function( gameNodeID, magnetID, x, y, angle, _ )
  {
    var magnet = retriever.getGameMagnetByID( gameNodeID, magnetID, _ );
    
    magnet.data[props.MAGNET.X] = x;
    magnet.data[props.MAGNET.Y] = y;
    magnet.data[props.MAGNET.ANGLE] = angle;
    
    magnet.save(_);
  },
  
  endTurn: function( game, _ )
  {
    sup.setActionDone( game, false, _ );
    game.data[props.GAME.TURN]++;
    game.save(_);
  }
};
