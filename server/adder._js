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
  
  addTile: function( game, id, x, y, angle, _ )
  {
    var tile;
    var i = 0;
    
    var image = randomizer.getRandomImage(_);
    var images = retriever.getGameTileImages( game.id, _ );
    var instruction = randomizer.getRandomInstruction(_);
    var instructions = retriever.getGameTileInstructions( game.id, _ );
    if( x == -1 ) x = randomizer.getRandomInRange( consts.MIN_X, consts.MAX_X );
    if( y == -1 ) y = randomizer.getRandomInRange( consts.MIN_Y, consts.MAX_Y );
    
    for( i = 0; i < images.length; i++ ){  
      if( image.data.name == images[i].data.name )
      {
        image = randomizer.getRandomImage(_);
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
    
    tile = this.createNode({
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
    var path = this.createNode({
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
  },

  saveWord: function( lemma, classes, categories, collections, versionOf, _ )
  {
    var i, j;
    var word = retriever.getWord( lemma, _ );

    if( word )
    {
      word.data[props.WORD.CLASSES] = classes;
      word.data[props.WORD.CATEGORIES] = categories;
      word.data[props.WORD.COLLECTIONS] = collections;
      word.data[props.WORD.VERSION_OF] = versionOf;
    }
    else
    {
      currentWordNode = tools.createNode({
        type: types.WORD,
        lemma: lemma,
        points: randomizer.getRandomIntegerInRange(0, 4),
        collections: collections,
        versionOf: versionOf
      }, _ );
      
      currentWordNode.index( collectionName + indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, currentWord.lemma, _ );
      
      for( i = 0; i < classes.length; i++ ){
        for( j = 0; j < collections.length; j++ ){
          currentWordNode.index( collections[j] + indexes.WORD_LEMMA_INDEX, props.WORD.LEMMA, currentWord.lemma, _ );
          currentWordNode.index( collections[j] + classes[i] + "ClassIndex", props.ID, lassCounts[collections[j]][classes[i]]++, _ );
        }
      }
    }
  }
};
