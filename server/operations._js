var oz = oz || {};

var neo4j = require( "neo4j" ),
  tools = require( "./tools._js" ),
  types = require( "./types._js" ),
  props = require( "./properties._js" ),
  consts = require( "./constants._js" ),
  retriever = require("./retriever._js"),
  rels = require( "./relationships._js" ),
  randomizer = require("./randomizer._js");

module.exports =
{

  addMagnet: function( game, player, collectionName, className, x, y, _ )
  {
    var start = new Date().getTime();
    var now;
    var time;
    
    var ret;
    var i = 0;
    var j = 0;
    var isRelated = false;
    
    var word = randomizer.getRandomWordByClass( collectionName, className, _);
    
    now = new Date().getTime();
    time = now - start;
//     console.log("am1: " + time );
    start = new Date().getTime();
    
    isRelated = retriever.getWordRelatedImages( game.id, word.id, _ ).length > 0;
    
    if( x == -1 ) x = randomizer.getRandomInRange( consts.MIN_X, consts.MAX_X );
    if( y == -1 ) y = randomizer.getRandomInRange( consts.MIN_Y, consts.MAX_Y );
    var randomAngle = randomizer.getRandomInRange( consts.MIN_ANGLE, consts.MAX_ANGLE );
    
    now = new Date().getTime();
    time = now - start;
//     console.log("am2: " + time );
    start = new Date().getTime();
    
    var magnet = tools.createNode({
      type: types.MAGNET_PLAYER,
      id: game.data[props.GAME.WORD_COUNT],
      representedWord: word.data[props.WORD.LEMMA],
      owner: player.data[props.PLAYER.USERNAME],
      isRelated: isRelated,
      angle: randomAngle,
      x: x,
      y: y,
      class: className,
      collection: collectionName
    }, _ );
    
    now = new Date().getTime();
    time = now - start;
//     console.log("am3: " + time );
    start = new Date().getTime();
    
    player.createRelationshipTo( magnet, rels.HAS_MAGNET, { id: game.data[props.GAME.WORD_COUNT] }, _ );
    magnet.createRelationshipTo( word, rels.REPRESENTS_WORD, {}, _ );
    
    ret = {
      id: game.data[props.GAME.WORD_COUNT],
      angle: randomAngle,
      x: x,
      y: y,
      isRelated: isRelated,
      lemma: word.data[props.WORD.LEMMA],
      points: word.data[props.WORD.POINTS]
    };
    
    game.data[props.GAME.WORD_COUNT]++;
    game.save(_);
    
    now = new Date().getTime();
    time = now - start;
//     console.log("am4: " + time );
    
    return ret;
  },

  move: function( gameNodeID, magnetID, x, y, angle, _ )
  {
    var magnet = retriever.getGameMagnetByID( gameNodeID, magnetID, _ );
    
    magnet.data[props.MAGNET.X] = x;
    magnet.data[props.MAGNET.Y] = y;
    magnet.data[props.MAGNET.ANGLE] = angle;
    
    magnet.save(_);
  },
  
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
