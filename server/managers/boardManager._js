var oz = oz || {};

var tools = require("../tools._js"),
  
  retriever = require("../retrievers/retriever._js"),
  
  types = require( "../constants/types.js" ),
  rels = require("../constants/relationships.js"),
  props = require( "../constants/properties.js" ),
  indexes = require( "../constants/indexes.js" ),
  consts = require( "../constants/constants.js" );

module.exports =
{
  getBoards: function( _ )
  {
    var i = 0;
    var board;
    var boards;
    var countNode = retriever.getCountNode( _ );
    
    var ret = [];
    
    if( countNode.data[props.COUNT_NODE.BOARD_COUNT] !== 0 ){
      boards = retriever.getAllBoards( false, _ );
      
      for( i = 0; i < boards.length; i++ ){
//         board = pretty ? boards[i].data : boards[i];
        board = boards[i].data;
        
        board.tiles = retriever.getBoardTiles( boards[i].id, true, _ );
        board.paths = retriever.getBoardPaths( boards[i].id, true, _ );
        
        ret.push( board );
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
      }
    }
    
    return ret;
  },
  
  getPublishedBoardsByLevel: function( level, pretty, _ )
  {
    var i = 0;
    var board;
    var boards;
    var countNode = retriever.getCountNode( _ );
    
    var ret = [];

    if( countNode.data[props.COUNT_NODE.BOARD_COUNT] !== 0 )
    {
      boards = retriever.getPublishedBoardsByLevel( level, false, _ );
      
      for( i = 0; i < boards.length; i++ ){
        board = pretty ? boards[i].data : boards[i];
        
        board.tiles = retriever.getBoardTiles( boards[i].id, pretty, _ );
        board.paths = retriever.getBoardPaths( boards[i].id, pretty, _ );
        
        ret.push( board );
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
    var tileObjs = {};
    
    if( id === -1 ){
      id = tools.getNewBoardID( _ );
      boardNode = tools.createNode({
        type: types.BOARD,
        id: id,
        level: level,
        draft: draft,
        modDate: Date.parse( new Date() )
      }, _ );
    boardNode.index( indexes.BOARD_INDEX, props.ID, id, _ );
    
    }else{
      boardNode = retriever.getBoardByID( id, false, _ );
      
      boardNode.data.level = level;
      boardNode.data.draft = draft;
      boardNode.data.modDate = Date.parse( new Date() );
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
    
    for( i = 0; i < tiles.length; i++ ){
      tile =  tiles[i];
      
      tileNode = tools.createNode({
        type: types.TILE,
        id: i,
        x: tile.x,
        y: tile.y,
        angle: tile.angle
      }, _ );
      
      tileObjs[tile.id] = tileNode.data;
      boardNode.createRelationshipTo( tileNode, rels.HAS_TILE, {}, _ );
    }
    
    for( i = 0; i < paths.length; i++ ){
      path = paths[i];
      
      pathNode = tools.createNode({
        type: types.PATH,
        id: i,
        cw: path.cw,
        nWords: path.nWords,
        endTile: tileObjs[path.endTile].id,
        startTile: tileObjs[path.startTile].id,
        minCurve: 0,
        maxCurve: 0
      }, _ );
      boardNode.createRelationshipTo( pathNode, rels.HAS_PATH, {}, _ );
    }
    
    return id;
  },
  
  exportBoards: function( _ )
  {
    var a, b;
    var fs = require("fs");
    var boards = this.getBoards( _ );
    
//     console.log( JSON.stringify( boards, null, 2 ) );
    
    fs.writeFile("./boards.js", JSON.stringify( boards, null, 2 ), _);  
  }
  
};