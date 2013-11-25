var oz = oz || {};
  
var
  types = require( "./types._js" ),
  rels = require("./relationships._js"),
  props = require( "./properties._js" ),
  consts = require( "./constants._js" ),
  
  sup = require("./supporter._js"),
  retriever = require("./retriever._js");  

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
