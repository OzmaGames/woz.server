var oz = oz || {};

var neo4j = require( "neo4j" ),
  consts = require( "./constants._js" ),
  retriever = require("./retriever._js");


module.exports =
{
  move: function( gameNodeID, magnetID, x, y, angle, _ )
  {
    var magnet = retriever.getGameMagnetByID( gameNodeID, magnetID, _ );
    
    entity.data[consts.X] = x;
    entity.data[consts.Y] = y;
    entity.data[consts.ANGLE] = angle;
    entity.save(_);
  },
  
  setActionDone: function( game, actionDone, _ ){
    game.data[consts.ACTION_DONE] = actionDone;
    game.save(_);
  },
  
  endTurn: function( game, _ ){
    this.setActionDone( game, false, _ );
    game.data[consts.TURN]++
    game.save(_);
  }
};
