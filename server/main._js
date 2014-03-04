/*jslint node: true */
/*global _:false */
"use strict";

var oz = oz || {};

var neo4j = require("neo4j");
var express = require("express.io");

var adder = require("./adder._js");
var tools = require("./tools._js");
var users = require("./users._js");
var helper = require("./helper.js");
var mailer = require("./mailer._js");
var sup = require( "./supporter._js" );
var friends = require("./friends._js");
var actions = require("./actions._js");
var inparser = require("./inparser._js");

var randomizer = require("./randomizer._js");
var operations = require("./operations._js");
var initializer = require("./initializer._js");

var wordManager = require("./managers/wordManager._js");
var boardManager = require("./managers/boardManager._js");
var imageManager = require("./managers/imageManager._js");
var categoryManager = require("./managers/categoryManager._js");
var collectionManager = require("./managers/collectionManager._js");
var instructionManager = require("./managers/instructionManager._js");

var types = require( "./constants/types.js" );
var indexes = require( "./constants/indexes.js" );
var consts = require( "./constants/constants.js" );
var props = require( "./constants/properties.js" );
var rels = require("./constants/relationships.js");
var environment = require("./constants/environment.js");

var wordLoader = require("./wordLoader._js");
var instructionLoader = require("./instructionLoader._js");

var retriever = require("./retrievers/retriever._js");
var userRetriever = require("./retrievers/userRetriever._js");
var instructionRetriever = require("./retrievers/instructionRetriever._js");

var db = new neo4j.GraphDatabase(environment.DB_URL);
var app = express();

if( environment.IS_HEROKU ){
  app.use( express.static( "./client" ) );
}else{
  app.use( express.static( "../client/" ) );
}

app.use( express.cookieParser() );
// app.use( express.session({ secret: "ozmaisgreat" }) );

app.http();

// optimise lobby!
// optimise inparser, some instructions do more than they really need
// getuserlobbyinfo doesnt really do anything
// swap words concurrency (and some other things as well i guess)
// indexing and removing bogus nodes fixes the first index node problem
// if we ever use the word constructor it might collide with the versions object. it will most likely be harmless though since I dont care about the original constructor in that case but have to take care not to send it as the version array to the manager.

var io = app.io();

var active = {};
var sockets = {};
var queue =  [];

var print = false;

io.set("log level", 1);

if ( environment.IS_HEROKU ) {
  
  var allowCrossDomain = function(req, res, next) {
    res.header( "Access-Control-Allow-Origin", "*" );
    res.header( "Access-Control-Allow-Methods", "GET,PUT,POST,DELETE" );
    res.header( "Access-Control-Allow-Headers", "Content-Type" );
    res.end();
  }
  
  app.io.configure( function() {
    app.io.set( "transports", ["xhr-polling"] );
    app.io.set( "polling duration", 10 );
    app.use( allowCrossDomain );
  });
  app.listen( process.env.PORT );
} else {
  app.listen( 8080 );
}

app.get("/test", function( req, res ){

  console.log( "1" );
  console.log( res );
  res.write( "{ ali: \"This is a test\" }" );
  
  console.log( "2" );
  
});

try
{
  var countNode = retriever.getCountNode(_);
  
  wordLoader.loadWords( _ );
  wordLoader.loadVersions( _ );
  instructionLoader.loadInstructions( _ );
}
catch( exception )
{
//   console.log( "initialising db." );
//   initializer.initDB( _ );
//   console.log( "done." );
  console.log( "need to initialise the db." );
  console.log( exception );
}

// var limit = 100;
// var start = new Date().getTime();
// for ( var a = 0; a < limit; a++ ){
// }
// var end = new Date().getTime(); var time = end - start;
// console.log("average time: " + time/limit );

function createGame( playerCount, collectionName, level, _ )
{
  
  var now, time = 0, start = new Date().getTime();
  
  var a, b, c = 0;
  
  var x = 0;
  var y = 0;
  var row = 0;
  var indexInRow = 0;
  var nextRow = consts.WORDS_IN_FIRST_ROW;
  
  var word;
  var nWords;
  var words = [];
  var randomArray;
  
  var gameID = tools.getNewGameID(_);
  var creationDate = Date.parse( new Date() );
  
  console.log( "cg1" );
  var game = tools.createNode({
    type: types.GAME,
    
    id: gameID,
    level: level,
    collection: collectionName,
    
    over: false,
    actionDone: false,
    
    turn: 0,
    wordCount: 0,
    tileCount: 0,
    pathCount: 0,
    phraseCount: 0,
    resignedCount: 0,
    playerCount: playerCount,
    
    endDate: false,
    modDate: creationDate,
    creationDate: creationDate
  }, _ );
  
  game.index( indexes.GAME_INDEX, props.ID, gameID, _ );
  console.log( "cg2" );
  try
  {
    console.log( "cg3" );
    randomizeBoard( game, collectionName, level, _ );
    console.log( "cg4" );
    now = new Date().getTime(); time = now - start;
    if( print ) console.log("cg: " + time );
  }
  catch( ex )
  {
    console.log( "Error creating game" );
    console.log( ex );
  }
  //   console.log( "Added Game " + gameID + ". Node n. " + game.id );
  
  return game;
  
}

function addPlayer( game, user, _ )
{
  var now, time = 0, start = new Date().getTime();
  
  var a, b, c = 0;
  
  var x = 0;
  var y = 0;
  var row = 0;
  var nWords = 0;
  var indexInRow = 0;
  var nextRow = consts.WORDS_IN_FIRST_ROW;
  
  var word;
  var player;
  
  var words = [];
  
  var creationDate = Date.parse( new Date() );
  console.log( "ap1" );
  try
  { 
    if( !game.data.hasOwnProperty( props.GAME.USERNAMES ) ) game.data[props.GAME.USERNAMES] = [];
    console.log( "ap2" );
    if( game.data[props.GAME.USERNAMES].length < game.data[props.GAME.PLAYER_COUNT] )
    {
      player = tools.createNode({
        type: types.PLAYER,
        username: user.data[props.USER.USERNAME],
        score: 0,
        order: a,
        resigned: false,
        resignationDate: false
      }, _ );
      
      console.log( "ap3" );
      user.createRelationshipTo( game, rels.PLAYS, {}, _ );
      game.createRelationshipTo( player, rels.BEING_PLAYED_BY, {}, _ );
      game.data[props.GAME.USERNAMES].push( user.data[props.USER.USERNAME] );
      console.log( "ap4" );
      game.save(_);
      
      now = new Date().getTime(); time = now - start;
      if( print ) console.log("cg4: " + time ); start = new Date().getTime();
      console.log( "ap5" );
      row = 0;
      indexInRow = 0;
      nextRow = consts.WORDS_IN_FIRST_ROW;
      for( b = 0; b < consts.BALANCE_BASIC.length; b++ ){
        for( c = 0; c < consts.BALANCE_BASIC[b]; c++ ){
          if( indexInRow == nextRow )
          {
            row++;
            indexInRow = 0;
            nextRow = consts.WORDS_IN_OTHER_ROWS;
          }
          x = row === 0 ? indexInRow * 0.1 + 0.15 : indexInRow * 0.125 + 0.175;
          y = row * 0.1 + randomizer.getSignedRandomInRange(0, 0.01);
          
          word = wordLoader.getRandomWord( "basic", consts.CLASS_NAMES[b], words );
          adder.addMagnet( game, player, "basic", consts.CLASS_NAMES[b], word, x, y, _ );
          
          indexInRow++;
          words.push( word );
        }
      }
      console.log( "ap6" );
      for( b = 0; b < consts.BALANCE_COLLECTION.length; b++ ){
        for( c = 0; c < consts.BALANCE_COLLECTION[b]; c++ ){
          if( indexInRow == nextRow )
          {
            row++;
            indexInRow = 0;
          }
          x = row === 0 ? indexInRow * 0.1 + 0.15 : indexInRow * 0.125 + 0.175;
          y = row * 0.1 + randomizer.getSignedRandomInRange(0, 0.01);
          
          word = wordLoader.getRandomWord( game.data[props.GAME.COLLECTION], consts.CLASS_NAMES[b], words );
          adder.addMagnet( game, player, game.data[props.GAME.COLLECTION], consts.CLASS_NAMES[b], word, x, y, _ );
          
          indexInRow++;
          words.push( word );
        }
      }
    }
  }
  catch( ex )
  {
    console.log( "Error creating game" );
    console.log( ex );
  }
  console.log( "ap7" );
  now = new Date().getTime(); time = now - start;
  if( print ) console.log("cg5: " + time );
  
  return game;
}

function randomizeBoard( game, collectionName, level, _ )
{ 
  var i, j;
  var board;
  var dist = 0;
  var nWords = 0;
  var ret = false;
  var randomBoardID;
  
  var tiles = {};
  var connections = [];
  var instructions = [];
  
  var boards = boardManager.getPublishedBoardsByLevel( level, false, _ );
  
  if( boards.length !== 0 )
  {
    randomBoardID = randomizer.getRandomIntegerInRange( 0, boards.length - 1 );    
    board = boards[ boards.length === 1 ? 0 : randomBoardID ];
    
    instructions = instructionLoader.getRandomInstructions( collectionName, board.tiles.length );
    
    for( i = 0; i < board.tiles.length; i++ ){
      tiles[board.tiles[i].data.id] = adder.addTile( game, collectionName, board.tiles[i].data.id, instructions[i], board.tiles[i].data.x, board.tiles[i].data.y, board.tiles[i].data.angle, _ );
    }
    
    for( i = 0; i < board.paths.length; i++ ){
      adder.addPath( game, i,
        tiles[ board.paths[i].data[props.PATH.START_TILE] ],
        tiles[ board.paths[i].data[props.PATH.END_TILE] ],
        board.paths[i].data[props.PATH.NWORDS],
        board.paths[i].data[props.PATH.CW], _ );
    }
    
    game.data[props.GAME.PATH_COUNT] = board.paths.length;
    game.save( _ );
    
    ret = true;
  }
  else
  {
    console.log( "No Game Boards Found" );
  }
  
  return ret;
}

function broadcastDiff( game, eventName, responseData )
{
  for( var i = 0; i < game.data[props.GAME.USERNAMES].length; i++ ){
    if(  sockets.hasOwnProperty( game.data[props.GAME.USERNAMES][i] ) )
    {
      sockets[ game.data[props.GAME.USERNAMES][i] ].emit( eventName, responseData[ game.data[props.GAME.USERNAMES][i] ] );
    }
  }
}

function broadcast( game, eventName, responseData )
{
  for( var i = 0; i < game.data[props.GAME.USERNAMES].length; i++ ){
    if(  sockets.hasOwnProperty( game.data[props.GAME.USERNAMES][i] ) )
    {
      sockets[ game.data[props.GAME.USERNAMES][i] ].emit( eventName, responseData );
    }
  }
}

app.io.route( "account:sign-up", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write("signing up ");
    
    var responseData = { success : false };
    var success = false;
    
    success = users.addUser( req.data.username, req.data.password, req.data.email, "miss", "mister", "eng", consts.STARTING_BESOZ, _ );
    if( !success )
    {
      responseData.message = "Username/Email already in use";
    }
    
    responseData.success = success;
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "account:login", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write("logging in "); 
    
    var responseData = { success: false };
    var user = users.login( req.data.username, req.data.password, _ );
    
    if( user !== false )
    {  
      sockets[ req.data.username ] = req.io;
      active[ req.data.username ] = { socket: req.io, active: true, lastActive: new Date() };
      responseData = { username: user.data[props.USER.USERNAME], success: true };
    }else
    {
      responseData.message = "Sorry, that username or password was not recognized. Please try again.";
    }
    
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
  
});

app.io.route( "logout", function( req )
{
  active[ req.data.username ] = { socket: false, active: false, lastActive: new Date() };
  
  req.io.respond({ success: true });
});

app.io.route( "recover:password", function( req )
{
  var start = new Date().getTime(); process.stdout.write("recovering password "); 
  
  (function(_)
  {
    mailer.recoverPassword(  req.data.username, _ );
    req.io.respond( true );
  })( helper.logError );
  
  var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
});

app.io.route( "game:lobby", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write("lobby "); 
    
    var i, j;
    var user;
    var game;
    var lastPhrase;
    var games = [];
    var phrases = [];
    var players = [];
    var responseData = { success: false, games: [] };
    
    try
    {
      user = users.getUser( req.data.username, false, _ );
      console.log( user.data );
      if( user )
      {
        sockets[ user.data[props.USER.USERNAME] ] = req.io;
      }
      
      games = retriever.getUserGames( user.id, true, _ );
      
      for( i = 0; i < games.length; i++ ){
        game = games[i];
        
        responseData.games[i] = {};
        responseData.games[i].gameID = game.data[props.ID];
        responseData.games[i].modDate = game.data[props.GAME.MOD_DATE];
        responseData.games[i].creationDate = game.data[props.GAME.CREATION_DATE];
        responseData.games[i].collection = game.data[props.GAME.COLLECTION];
        
        lastPhrase = retriever.getGamePhraseByID( game.id, game.data[props.GAME.PHRASE_COUNT] - 1, _ );
        responseData.games[i].lastPhrase = lastPhrase ? { phrase: lastPhrase.data[props.PHRASE.PHRASE_STRING], username: lastPhrase.data[props.PHRASE.USERNAME], score: lastPhrase.data[props.PHRASE.SCORE]} : {};
        
        players = retriever.getGamePlayers( game.id, _ );
        responseData.games[i].players = [];
        
        for( j = 0; j < players.length; j++ ){
          responseData.games[i].players.push({
            username: players[j].data[props.PLAYER.USERNAME],
            score: players[j].data[props.PLAYER.SCORE],
            active: game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]] === players[j].data[props.PLAYER.USERNAME]
          });
        }
      }
      
      responseData.success = true;
    }
    catch( ex )
    {
      console.log( ex.message );
    }
    
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "game:archive", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write("lobby "); 
    
    var i, j;
    var user;
    var game;
    var games;
    var lastPhrase;
    
    var phrases = [];
    var players = [];
    var responseData = { success: false, games: [] };
    
    try
    {
      user = userRetriever.getUserByUsername( req.data.username, false, _ );
      if( user )
      {  
        sockets[ req.data.username ] = req.io;
      }
      
      games = retriever.getUserNonResignedGames( user.id, false, _ );
      
      for( i = 0; i < games.length; i++ ){
        game = games[i];
        
        responseData.games[i] = {};
        responseData.games[i].gameID = game.data[props.ID];
        responseData.games[i].modDate = game.data[props.GAME.MOD_DATE];
        responseData.games[i].creationDate = game.data[props.GAME.CREATION_DATE];
        responseData.games[i].collection = game.data[props.GAME.COLLECTION];
        
        lastPhrase = retriever.getGamePhraseByID( game.id, game.data[props.GAME.PHRASE_COUNT] - 1, _ );   
        responseData.games[i].lastPhrase = lastPhrase ? { phrase: lastPhrase.data[props.PHRASE.PHRASE_STRING], username: lastPhrase.data[props.PHRASE.USERNAME], score: lastPhrase.data[props.PHRASE.SCORE]} : {};
        
        players = retriever.getGamePlayers( game.id, _ );
        responseData.games[i].players = [];
        
        for( j = 0; j < players.length; j++ ){
          responseData.games[i].players.push({
            username: players[j].data[props.PLAYER.USERNAME],
            score: players[j].data[props.PLAYER.SCORE],
            active: game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]] === players[j].data[props.PLAYER.USERNAME]
          });
        }
      }
      
      responseData.success = true;
    }
    catch( ex )
    {
      console.log( ex.message );
    }
    
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "game:request", function( req )
{ 
  (function(_)
  {
    var type = req.data.type;
    var username = req.data.username;
    var playerCount = req.data.type === consts.SINGLE ? 1 : 2;
    
    var a;
    var user;
    var game;
    var friend;
    var jsonObjs;
    var usernames = [];
    var tempSockets = {};
    
    var now, time, start;
    user = userRetriever.getUserByUsername( username, false, _ );
    
    req.io.respond({ success: user ? true : false });
    
    if( user )
    {
      sockets[ username ] = req.io;
      console.log( req.data );
      if( type === consts.RANDOM && queue.length > 0 )
      {
        game = queue[0];
        queue.splice( 0, 1 );
      }
      else
      {
        start = new Date().getTime();
        game = createGame( playerCount, req.data.collection, 0, _ );
        
        now = new Date().getTime(); time = now - start;
        if( print ) console.log("took: " + time ); start = new Date().getTime();
      } 
      
      start = new Date().getTime();
      process.stdout.write( "adding player(s) to game " );
      
      game = addPlayer( game, user, _ );
      if( type === consts.FRIEND ){
        friend = userRetriever.getUserByUsername( req.data.friendUsername, false, _ );
        if( friend ) game = addPlayer( game, friend, _ );
      }
      
      now = new Date().getTime(); time = now - start;
      if( print ) console.log("took: " + time ); start = new Date().getTime();
      
      if( game && type === consts.RANDOM && game.data[props.GAME.PLAYER_COUNT] !== game.data[props.GAME.USERNAMES].length )
      {
        queue.push( game );
      }
        
      jsonObjs = tools.getGameObject( game, game.data[props.GAME.USERNAMES], _ );
      broadcastDiff( game, consts.START_GAME, jsonObjs );
    }
      
    //send lobby event also to the creator of the game
    //send lobby object to the other player so the client can update the lobby with the new game
    
    now = new Date().getTime(); time = now - start;
    if( print ) console.log("broadcast: " + time );
    
    var end = new Date().getTime(); time = end - start;  console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "game:resume", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write("resuming game ");
    
    try
    {
      var game = retriever.getGameByID( req.data.id, false, _ );
      
      sockets[ req.data.username ] = req.io;
      
      if( game )
      {
        var jsonObjs = tools.getGameObject( game, game.data[props.GAME.USERNAMES], _ );
        req.io.respond( jsonObjs[req.data.username] );
      }
    }
    catch( ex )
    {
      console.log( "error resuming game " );
      console.log( ex );
    }
    
    var end = new Date().getTime(); var time = end - start;  console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "game:place-phrase", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write("placing phrase ");
    
    var ret;
    var user;
    var a, b;
    var username;
    var gameUpdateData;
    var levelUp = false;
    var responseData = {  };
    var game = retriever.getGameByID( req.data.gameID, false, _ );
    
    sockets[ req.data.username ] = req.io;
    
    if( game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]] === req.data.username )
    {
      ret = actions.placePhrase( game, req.data.username, req.data.pathID, req.data.words, _ );
      
      gameUpdateData = tools.getGameUpdateData( game, _ );
      
      for( a = 0; a < game.data[props.GAME.USERNAMES].length; a++ ){
        username = game.data[props.GAME.USERNAMES][a];
        
        responseData[username] = {};
        responseData[username].path = ret.path;
        responseData[username].gameID = game.data[props.ID];
        responseData[username].players = gameUpdateData.players;
        responseData[username].over = game.data[props.GAME.OVER];
        
        if( game.data[props.GAME.OVER] )
        {
          user = userRetriever.getUserByUsername( username, false, _ );
          user.data[props.USER.GAMES_PLAYED]++;
          user.save(_);
          
          levelUp = false;
          
          for( b = consts.LEVELS.length - 1; b > 0; b-- ){
            if( user.data[props.USER.GAMES_PLAYED] >= consts.LEVELS[b].gamesReq )
            {
              if( user.data[props.USER.GAMES_PLAYED] === consts.LEVELS[b].gamesReq ) levelUp = true;
              break;
            }
          }
          
          responseData[username].stats = {
            xp: 0,
            level: consts.LEVELS[b].title,
            levelUp: levelUp
          };
        }
        
        if( username === req.data.username )
        {
          responseData[username].words = ret.words;
        }
        responseData[username].success = ret.madness === 0;
      }
    }
    try
    {
      broadcastDiff( game, consts.GAME_UPDATE, responseData );
    }
    catch( ex )
    {
      console.log( "error updating" );
      console.log( ex );
    }
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "game:move-word", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write( "moving " );
    
    var game = retriever.getGameByID( req.data.gameID, false, _ );
    operations.move( game.id, req.data.word.id, req.data.word.x, req.data.word.y, _ );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "game:swap-words", function( req )
{
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write("swapping words ");
    
    var responseData = { success: false, words: [] };
    var game = retriever.getGameByID( req.data.gameID, false, _ );
    
    sockets[ req.data.username ] = req.io;
    
    if( game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]] == req.data.username )
    {
      responseData.words = actions.swapWords( game, req.data.username, req.data.words, _ );
      responseData.success = true;
    }
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "game:get-versions", function( req )
{
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write("swapping words ");
    
    var responseData = { success: false, versions: [] };
    var game = retriever.getGameByID( req.data.gameID, false, _ );
    
    sockets[ req.data.username ] = req.io;
    
    if( game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]] == req.data.username )
    {
      responseData.words = actions.swapWords( game, req.data.username, req.data.words, _ );
      responseData.success = true;
    }
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "end:turn", function( req )
{
  (function(_)
  {
    sup.endTurn( req.data.game, _ );
  })
  ( helper.logError );
});

app.io.route( "game:resign", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write("resigning ");
    
    var ret;
    var game;
    var player;
    var responseData = { success: false };
    console.log( "1" );
    if( req.data.hasOwnProperty( "gameID" ) && req.data.hasOwnProperty( "username" ) )
    {
      game = retriever.getGameByID( req.data.gameID, false, _ );
      sockets[ req.data.username ] = req.io;
      req.io.respond({});
      console.log( "2" );
      if( game && game.data[props.GAME.OVER] === false )
      {
        console.log( "3" );
        player = retriever.getGamePlayerByID( game.id, req.data.username, _ );
        console.log( "4" );
        if( player && !player.data[props.PLAYER.RESIGNED] )
        {
          console.log( "5" );
          player.data[props.PLAYER.RESIGNED] = true;
          player.data[props.PLAYER.RESIGNATION_DATE] = Date.parse( new Date() );
          game.data[props.GAME.RESIGNED_COUNT]++;
          console.log( "6" );
          if( game.data[props.GAME.RESIGNED_COUNT] + 1 >= game.data[props.GAME.PLAYER_COUNT] )
          {
            console.log( "7" );
            game.data[props.GAME.OVER] = true;
            game.data[props.GAME.OVER_DATE] = Date.parse( new Date() );
          }
          console.log( "8" );
          game.save(_);
          player.save(_);
          
          responseData = tools.getGameUpdateData( game, _ );
          responseData.success = true;
        }
      }
      
      broadcast( game, consts.GAME_UPDATE, responseData );
    }
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError ); 
});

app.io.route( "manager:boards", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write( "boardManager:" + req.data.command + " " );
    console.log( req.data );
    
    var responseData = { success:false };
    
    if( req.data.command === "set" ){
      responseData.id = boardManager.setBoard( req.data.id, req.data.level, req.data.draft, req.data.tiles, req.data.paths, _ );
      responseData.success = true;
    }else if( req.data.command === "getAll" ){
      responseData.boards = boardManager.getBoards( _ );
      responseData.success = true;
    }else if( req.data.command === "get" ){
      responseData.board = boardManager.getBoard( req.data.id, true, _ );
      responseData.success = true;
    }else if( req.data.command === "delete" ){
      responseData = boardManager.deleteBoard( req.data.id, _ );
    }
    
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "manager:instructions", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write( "instructionManager:" + req.data.command + " " );
    
    var responseData = { success:false };
    
    console.log( req.data );
    
    if( req.data.command === "set" ){
      if( req.data.hasOwnProperty( props.ID ) )
      {
        responseData.id = instructionManager.setInstruction( req.data.instruction.id, req.data.instruction.conditions, req.data.instruction.shortDescription, req.data.instruction.longDescription, req.data.instruction.collections, req.data.instruction.bonus, req.data.instruction.mult, req.data.instruction.level, _ );
        responseData.success = true;
        
        instructionLoader.loadInstructions( _ );
      }
    }else if( req.data.command === "getAll" ){
      responseData.instructions = instructionManager.getAllInstructions( _ );
      responseData.success = true;
    }else if( req.data.command === "get" ){
      if( req.data.hasOwnProperty( props.ID ) )
      {
        responseData.instruction = instructionManager.getInstruction( req.data.id, _ );
        responseData.success = true;
      }
    }else if( req.data.command === "delete" ){
      if( req.data.hasOwnProperty( props.ID ) )
      {
        instructionManager.deleteInstruction( req.data.id, _ );
        responseData.success = true;
        
        instructionLoader.loadInstructions( _ );
      }
    }
    
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "manager:images", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write( "imageManager:" + req.data.command + " " );
    
    var responseData = { success:false };
    console.log( req.data );
    
    if( req.data.command === "set" ){
      responseData.id = imageManager.setImage( req.data.name, req.data.id, req.data.related, _ );
      responseData.success = true;
    }else if( req.data.command === "getAll" ){
      responseData.images = imageManager.getAllImages( _ );
      responseData.success = true;
    }else if( req.data.command === "get" ){
      responseData.image = imageManager.getImage( req.data.name, _ );
      responseData.success = true;
    }else if( req.data.command === "delete" ){
      
    }else if( req.data.command === "getRelated" ){
      responseData.related = imageManager.getRelatedWords( req.data.name, _ );
      responseData.success = true;
    }else if( req.data.command === "setRelated" ){
      imageManager.setRelatedWords( req.data.name, req.data.related, _ );
      responseData.success = true;
    }
    
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "manager:categories", function( req )
{
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write( "categoryManager:" + req.data.command + " " );
    
    var responseData = { success:false };
    
    if( req.data.command === "getAll" ){
      responseData.categories = categoryManager.getAllCategories( _ );
      responseData.success = true;
    }
    
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "manager:collections", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write( "collectionManager:" + req.data.command + " " );
    
    var responseData = { success:false };
    
    if( req.data.command === "getAll" ){
      responseData.collections = collectionManager.getAllCollections( _ );
      responseData.success = true;
    }else if( req.data.command === "set" ){
      collectionManager.setCollection( req.data.shortName, req.data.longName, _ );
      responseData.success = true;
    }
    
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

app.io.route( "manager:words", function( req )
{ 
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write( "wordManager:" + req.data.command + " " );
    console.log( req.data );
    
    var responseData = { success:false };
    
    if( req.data.command === "getAll" )
    {
      responseData.words = wordManager.getAllWords( "active", true, _ );
      responseData.success = true;
    }
    else if( req.data.command === "set" )
    {
      wordManager.setWord( req.data.lemma, req.data.oldLemma, req.data.classes, req.data.categories, req.data.collections, _ );
      responseData.success = true;

      wordLoader.loadWords( _ );
      wordLoader.loadVersions( _ );
    }
    else if( req.data.command === "setVersions" )
    {
      responseData.success = wordManager.setVersions( req.data.lemma, req.data.versions, _ );
      
      wordLoader.loadVersions( _ );
    }
    else if( req.data.command === "delete" )
    {
      if( req.data.lemma )
      {
        wordManager.deleteWord( req.data.lemma, _ );
        responseData.success = true;
        
        wordLoader.loadWords( _ );
        wordLoader.loadVersions( _ );
      }
    }
    
    console.log( responseData );
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
  
  
});

app.io.route( "friends", function( req )
{
  (function(_)
  {
    var start = new Date().getTime(); process.stdout.write( "friends:" + req.data.command + " " );
    
    var responseData = { success:false };
    
    try
    {
      if( req.data.command === "add" ){
        responseData.success = friends.addFriend( req.data.username, req.data.friendUsername, _ );
      }else if( req.data.command === "getAll" ){
        responseData.friends = friends.getFriends( req.data.username, _ );
        responseData.success = true;
      }else if( req.data.command === "get" ){
        responseData.success = true;
      }else if( req.data.command === "delete" ){
        responseData.success = friends.deleteFriend( req.data.username, req.data.friendUsername, _ );
      }else if( req.data.command === "search" ){
        responseData.users = friends.search( req.data.username, req.data.friendUsername, _ );
        responseData.success = true;
      }
    }
    catch( ex )
    {
      console.log( ex );
    }
    
    req.io.respond( responseData );
    
    var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
  })( helper.logError );
});

console.log("server ready");