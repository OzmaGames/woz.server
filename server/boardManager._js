var oz = oz || {};

var tools = require("./tools._js"),
    types = require("./types._js"),
    indexes = require("./indexes._js"),
    consts = require("./constants._js"),
    props = require("./properties._js"),
    rels = require("./relationships._js"),
    retriever = require("./retriever._js");

module.exports =
{
  getBoards: function( pretty, _ )
  {
    var i = 0;
    var board;
    var boards;
    var countNode = retriever.getCountNode( _ );
    
    var ret = [];
    
    if( countNode.data[props.COUNT_NODE.BOARD_COUNT] !== 0 ){
      boards = retriever.getAllBoards( false, _ );
      
      for( i = 0; i < boards.length; i++ ){
        board = pretty ? boards[i].data : boards[i];
        
        board.tiles = retriever.getBoardTiles( boards[i].id, pretty, _ );
        board.paths = retriever.getBoardPaths( boards[i].id, pretty, _ );
        
        ret.push( board );
        
        console.log( board );
      }
    }
    
    return ret;
  },
  
  getPublishedBoards: function( pretty, _ )
  {
    var i = 0;
    var board;
    var boards;
    var countNode = retriever.getCountNode( _ );
    
    var ret = [];
    
    if( countNode.data[props.COUNT_NODE.BOARD_COUNT] !== 0 ){
      boards = retriever.getAllPublishedBoards( false, _ );
      
      for( i = 0; i < boards.length; i++ ){
        board = pretty ? boards[i].data : boards[i];
        
        board.tiles = retriever.getBoardTiles( boards[i].id, pretty, _ );
        board.paths = retriever.getBoardPaths( boards[i].id, pretty, _ );
        
        ret.push( board );
        
        console.log( board );
      }
    }
    
    return ret;
  },
  
  getBoard: function( boardID, pretty, _ )
  {
    var boardNode;
    var board = {};
    
    boardNode = retriever.getBoardByID( boardID, false, _ );
    
    board = boardNode.data;
    board.tiles = retriever.getBoardTiles( boardNode.id, pretty, _ );
    board.paths = retriever.getBoardPaths( boardNode.id, pretty, _ );
    
    return board;
  },
  
  deleteBoard: function( id, _ )
  {
    var i;
    var path;
    var tile;
    var tileNode;
    var pathNode;
    var boardNode;
    var tempPaths;
    var tempTiles;
    var countNode;
    var responseData = { success:false };
    
    boardNode = retriever.getBoardByID( id, false, _ );
    
    tempPaths = retriever.getBoardPaths( boardNode.id, false, _ );
    for( i = 0; i < tempPaths.length; i++ ){
      tempPaths[i].delete( _, true );
    }
    
    tempTiles = retriever.getBoardTiles( boardNode.id, false,_ );
    for( i = 0; i < tempTiles.length; i++ ){
      tempTiles[i].delete( _, true );
    }
    
    boardNode.delete( _, true );
    
    countNode = retriever.getCountNode( _ );
    countNode.data[props.COUNT_NODE.BOARD_COUNT]--;
    countNode.save(_);
    
    responseData.success = true;
    return responseData;
  },
  
  setBoard: function( id, level, draft, tiles, paths, _ )
  {
    var i;
    var path;
    var tile;
    var tileNode;
    var pathNode;
    var boardNode;
    var tempPaths;
    var tempTiles;
    var countNode;
    var responseData = { success:false };
    
    if( id === -1 ){
      id = tools.getNewBoardID( _ );
      boardNode = tools.createNode({
        type: types.BOARD,
        id: id,
        level: level,
        draft: draft,
        lastMod: Date.parse( new Date() )
      }, _ );
    
    countNode = retriever.getCountNode( _ );
    countNode.data[props.COUNT_NODE.BOARD_COUNT]++;
    countNode.save(_);
    
    boardNode.index( indexes.BOARD_INDEX, props.ID, id, _ );
    }else{
      boardNode = retriever.getBoardByID( id, false, _ );
      
      boardNode.data.level = level;
      boardNode.data.draft = draft;
      boardNode.data.lastMod = Date.parse( new Date() )
      boardNode.save( _ );
      
      tempPaths = retriever.getBoardPaths( boardNode.id, false, _ );
      for( i = 0; i < tempPaths.length; i++ ){
        tempPaths[i].delete( _, true );
      }
      
      tempTiles = retriever.getBoardTiles( boardNode.id, false, _ );
      for( i = 0; i < tempTiles.length; i++ ){
        tempTiles[i].delete( _, true );
      }
    }
    
    for( i = 0; i < paths.length; i++ ){
      path = paths[i];
      
      pathNode = tools.createNode({
        type: types.PATH,
        id: path.id,
        cw: path.cw,
        nWords: path.nWords,
        endTile: path.endTile,
        startTile: path.startTile,
        minCurve: 0,
        maxCurve: 0
      }, _ );
      boardNode.createRelationshipTo( pathNode, rels.HAS_PATH, {}, _ );
    }
    
    for( i = 0; i < tiles.length; i++ ){
      tile = tiles[i];
      
      tileNode = tools.createNode({
        type: types.TILE,
        id: tile.id,
        x: tile.x,
        y: tile.y,
        angle: tile.angle
      }, _ );
      boardNode.createRelationshipTo( tileNode, rels.HAS_TILE, {}, _ );
    }
    
    responseData.success = true;
    return responseData;
  }
}