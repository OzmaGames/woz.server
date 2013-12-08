var oz = oz || {};

var neo4j = require( "neo4j" ),

  tools = require( "./tools._js" ),
  randomizer = require("./randomizer._js"),
  
  types = require( "./constants/types.js" ),
  indexes = require( "./constants/indexes.js" ),
  consts = require( "./constants/constants.js" ),
  props = require( "./constants/properties.js" ),
  rels = require("./constants/relationships.js"),
  
  retriever = require("./retrievers/retriever._js");

var print = false;
  
module.exports =
{

  addMagnet: function( game, player, collectionName, className, x, y, _ )
  {
    var start = new Date().getTime(); var now; var time;
    
    var ret;
    var i = 0;
    var j = 0;
    var isRelated = false;
    
    var word = randomizer.getRandomWordByClass( collectionName, className, _);
    
    now = new Date().getTime(); time = now - start;
    if( print ) console.log("am1: " + time ); start = new Date().getTime();
    
    isRelated = retriever.getWordRelatedImages( game.id, word.id, _ ).length > 0;
    
    if( x == -1 ) x = randomizer.getRandomInRange( consts.MIN_X, consts.MAX_X );
    if( y == -1 ) y = randomizer.getRandomInRange( consts.MIN_Y, consts.MAX_Y );
    var randomAngle = randomizer.getRandomInRange( consts.MIN_ANGLE, consts.MAX_ANGLE );
    
    now = new Date().getTime(); time = now - start;
    if( print ) console.log("am2: " + time ); start = new Date().getTime();
    
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
    
    now = new Date().getTime(); time = now - start;
    if( print ) console.log("am3: " + time ); start = new Date().getTime();
    
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
    
    now = new Date().getTime(); time = now - start;
    if( print ) console.log("am4: " + time );
    
    return ret;
  },
  
  addTile: function( game, collectionName, id, x, y, angle, _ )
  {
    var tile;
    var i = 0;
    
    var image = randomizer.getRandomImage( collectionName, _ );
    var images = retriever.getGameTileImages( game.id, _ );
    var instruction = randomizer.getRandomInstruction(_);
    var instructions = retriever.getGameTileInstructions( game.id, _ );
    if( x == -1 ) x = randomizer.getRandomInRange( consts.MIN_X, consts.MAX_X );
    if( y == -1 ) y = randomizer.getRandomInRange( consts.MIN_Y, consts.MAX_Y );
    
    for( i = 0; i < images.length; i++ ){  
      if( image.data.name == images[i].data.name )
      {
        image = randomizer.getRandomImage( collectionName, _ );
        i = -1;
      }
    }
    
    for( i = 0; i < instructions.length; i++ ){
      if( instruction.data.id == instructions[i].data.id )
      {
        instruction = randomizer.getRandomInstruction(_);
        i = -1;
      }
    }
    
    tile = tools.createNode({
      type: types.TILE,
      id: id,
      representedImage: image.data.name,
      representedInstruction: instruction.data.id,
      angle: angle,
      x: x,
      y: y
    }, _ );
    
    game.createRelationshipTo( tile, rels.HAS_TILE, { id: game.data[props.GAME.TILE_COUNT] }, _ );
    tile.createRelationshipTo( image, rels.REPRESENTS_IMAGE, {}, _ );
    tile.createRelationshipTo( instruction, rels.REPRESENTS_INSTRUCTION, {}, _ );
    
    return tile;
  },
  
  addPath: function( game, id, startTile, endTile, nWords, cw, _ )
  { 
    var path = tools.createNode({
      type: types.PATH,
      id: id,
      cw: cw,
      startTile: startTile.data[props.ID],
      endTile: endTile.data[props.ID],
      nWords: nWords
    }, _ );
    
    game.createRelationshipTo( path, rels.HAS_PATH, {}, _ );
    path.createRelationshipTo( endTile, rels.ENDS_WITH, {}, _ );
    path.createRelationshipTo( startTile, rels.STARTS_WITH, {}, _ );
  }
};
