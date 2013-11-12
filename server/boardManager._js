var oz = oz || {};

var tools = require("./tools._js"),
    consts = require("./constants._js"),
    retriever = require("./retriever._js");

module.exports =
{
  getBoards: function( countNode, _ )
  {
    var i = 0;
    var board;
    var boards;
    var responseData = { success:false, boards: [] }
    
    if( countNode.data[consts.BOARD_COUNT] !== 0 ){
      boards = retriever.getAllBoards( _ );
      
      for( i = 0; i < boards.length; i++ ){
        board = boards[i].data;
        
        board.tiles = retriever.getBoardTilesData( boards[i].id, _ );
        board.paths = retriever.getBoardPathsData( boards[i].id, _ );
        
        responseData.boards.push( board );
      }
    }
    
    responseData.success = true;
    return responseData;
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
    var responseData = { success:false };
    
    boardNode = retriever.getBoard( id, _ );
    
    tempPaths = retriever.getBoardPaths( boardNode.id, _ );
    for( i = 0; i < tempPaths.length; i++ ){
      tempPaths[i].delete( _, true );
    }
    
    tempTiles = retriever.getBoardTiles( boardNode.id, _ );
    for( i = 0; i < tempTiles.length; i++ ){
      tempTiles[i].delete( _, true );
    }
    
    boardNode.delete( _, true );
    
    responseData.success = true;
    return responseData;
  },
  
  setBoard: function( id, level, tiles, paths, _ )
  {    
    var i;
    var path;
    var tile;
    var tileNode;
    var pathNode;
    var boardNode;
    var tempPaths;
    var tempTiles;
    var responseData = { success:false };
    
    if( id === -1 ){
      id = tools.getNewBoardID( _ );
      boardNode = tools.createNode({
        type: consts.BOARD,
        id: id,
        level: level,
        lastMod: Date.parse( new Date() )
      }, _ );
    
    boardNode.index( consts.BOARD_INDEX, consts.ID, id, _ );
    }else{
      boardNode = retriever.getBoard( id, _ );
      
      boardNode.data.level = level;
      boardNode.data.lastMod = Date.parse( new Date() )
      boardNode.save( _ );
      
      tempPaths = retriever.getBoardPaths( boardNode.id, _ );
      for( i = 0; i < tempPaths.length; i++ ){
        tempPaths[i].delete( _, true );
      }
      
      tempTiles = retriever.getBoardTiles( boardNode.id, _ );
      for( i = 0; i < tempTiles.length; i++ ){
        tempTiles[i].delete( _, true );
      }
    }
    
    for( i = 0; i < paths.length; i++ ){
      path = paths[i];
      
      pathNode = tools.createNode({
        type: consts.PATH,
        id: id,
        cw: path.cw,
        nWords: path.nWords,
        endTile: path.endTile,
        startTile: path.startTile,
        minCurve: 0,
        maxCurve: 0
      }, _ );
      boardNode.createRelationshipTo( pathNode, consts.HAS_PATH, {}, _ );
    }
    
    for( i = 0; i < tiles.length; i++ ){
      tile = tiles[i];
      
      tileNode = tools.createNode({
        type: consts.TILE,
        id: id,
        x: tile.x,
        y: tile.y,
        angle: tile.angle
      }, _ );
      boardNode.createRelationshipTo( tileNode, consts.HAS_TILE, {}, _ );
    }
    
    responseData.success = true;
    return responseData;
  }
}