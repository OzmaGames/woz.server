var oz = oz || {};

var
  types = require( "./types._js" ),
  rels = require("./relationships._js"),
  props = require( "./properties._js" ),
  consts = require( "./constants._js" );;

module.exports =
{ 
  setActionDone: function( game, actionDone, _ )
  {
    game.data[props.GAME.ACTION_DONE] = actionDone;
    game.save(_);
  },
  
  endTurn: function( game, _ )
  {
    this.setActionDone( game, false, _ );
    game.data[props.GAME.TURN]++;
    game.save(_);
  }
};
