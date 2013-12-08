/*jslint node: true */
/*global _:false */
"use strict";

var oz = oz || {};

var neo4j = require("neo4j"),
    express = require("express.io"),
    
    adder = require("./adder._js"),
    tools = require("./tools._js"),
    users = require("./users._js"),
    loader = require("./loader._js"),
    mailer = require("./mailer._js"),
    friends = require("./friends._js"),
    actions = require("./actions._js"),
    inparser = require("./inparser._js"),
    randomizer = require("./randomizer._js"),
    operations = require("./operations._js"),
    initializer = require("./initializer._js"),
    
    wordManager = require("./managers/wordManager._js"),
    boardManager = require("./managers/boardManager._js"),
    instructionManager = require("./managers/instructionManager._js"),
    
    types = require( "./constants/types.js" ),
    indexes = require( "./constants/indexes.js" ),
    consts = require( "./constants/constants.js" ),
    props = require( "./constants/properties.js" ),
    rels = require("./constants/relationships.js"),
    environment = require("./constants/environment.js"),
    
    retriever = require("./retrievers/retriever._js"),
    userRetriever = require("./retrievers/userRetriever._js");
    
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

// both players get the new words for the player that placed the phrase
// placed phrase in the object only sends ids, needs words
// fix swap words concurrency (and some other things as well i guess)

var io = app.io();

var active = {};
var sockets = {};
var queue =  [ [], [] ];
var countNode;

var print = false;

io.set("log level", 1);

if ( environment.IS_HEROKU ) {
  app.io.configure( function() {
    app.io.set( "transports", ["xhr-polling"] );
    app.io.set( "polling duration", 10 );
  });
  app.listen( process.env.PORT );
} else {
  app.listen( 8080 );
}

try
{
  countNode = retriever.getCountNode(_);
  
//   consts.CLASS_COUNTS = {}; 
//   for( var i = 0; i < consts.COLLECTION_NAMES.length; i++ ){
//     consts.CLASS_COUNTS[ consts.COLLECTION_NAMES[i] ] = countNode.data[ consts.COLLECTION_NAMES + "ClassCounts" ];
//   }
//   console.log( consts.CLASS_COUNTS );
}
catch( exception )
{
  console.log( "initializing db." );

  initializer.initDB( _ );

  countNode = retriever.getCountNode(_);
  console.log( "done." );
}

friends.addFriend( "ali", "ali2", _ );
// friends.deleteFriend( "ali", "ali2", _ );

function createGame( usernames, collectionName, level, _ )
{
  collectionName = "woz";
  
  var now, time = 0, start = new Date().getTime();

  var player;
  var nWords;
  var randomArray;
  var a, i, j, k = 0;
  var gameID = tools.getNewGameID(_);
  var playerCount = usernames.length;
  var startDate = Date.parse( new Date() );
  
  now = new Date().getTime();
  time = now - start;
  if( print ) console.log("cg1: " + time );
  start = new Date().getTime();
  
  var game = tools.createNode({
    type: types.GAME,
    id: gameID,
    level: level,
    turn: 0,
    gameOver: false,
    actionDone: false,
    wordCount: 0,
    tileCount: 0,
    pathCount: 0,
    phraseCount: 0,
    usernames: usernames,
    playerCount: playerCount,
    collection: collectionName,
    lastMod: startDate,
    startDate: startDate,
    resignedCount: 0
  }, _ );
  
  game.index( indexes.GAME_INDEX, props.ID, gameID, _ );
  
  now = new Date().getTime(); time = now - start;
  if( print )  console.log("cg2: " + time ); start = new Date().getTime();
  
  try
  {
    randomizeBoard( game, collectionName, level, _ );
    
    now = new Date().getTime(); time = now - start;
    if( print ) console.log("cg3: " + time ); start = new Date().getTime();
    
    for( a = 0; a < playerCount; a++ )  //creates a player instance for each player
    {
      var username = usernames[a];
      var user = userRetriever.getUserByUsername( username, _ );
      
      player = tools.createNode({
        type: types.PLAYER,
        username: username,
        score: 0,
        order: a,
        resigned: false
      }, _ );
      
      user.createRelationshipTo( game, rels.PLAYS, {}, _ );
      game.createRelationshipTo( player, rels.BEING_PLAYED_BY, {}, _ );
      
      now = new Date().getTime(); time = now - start;
      console.log("cg4: " + time ); start = new Date().getTime();
      
      k = 0;
      var x = 0;
      var y = 0;
      for( i = 0; i < consts.BALANCE_BASIC.length; i++ ){
        for( j = 0; j < consts.BALANCE_BASIC[i]; j++ ){
          x = k > 9 ? (k-10) * 0.09 + 0.03: k * 0.09 + 0.03;
          y = k > 9 ? 0.1 + randomizer.getSignedRandomInRange(0, 0.01) : 0 + randomizer.getSignedRandomInRange(0, 0.01);
          
          adder.addMagnet( game, player, "basic", consts.CLASS_NAMES[i], x, y, _ );
          k++;
        }
      }
      
      for( i = 0; i < consts.BALANCE_COLLECTION.length; i++ ){
        for( j = 0; j < consts.BALANCE_COLLECTION[i]; j++ ){
          x = k > 9 ? (k-10) * 0.09 + 0.03: k * 0.09 + 0.03;
          y = k > 9 ? 0.1 + randomizer.getSignedRandomInRange(0, 0.01) : 0 + randomizer.getSignedRandomInRange(0, 0.01);
          
          adder.addMagnet( game, player, collectionName, consts.CLASS_NAMES[i], x, y, _ );
          k++;
        }
      }
    }
    
    now = new Date().getTime(); time = now - start;
    console.log("cg5: " + time );
  }
  catch( ex )
  {
    console.log( "Error creating game" );
    console.log( ex );
  }
//   console.log( "Added Game " + gameID + ". Node n. " + game.id );
  
  return game;
}

function randomizeBoard( game, collectionName, level, _ )
{
  var now, time, start = new Date().getTime();
  
  var i = 0;
  var j = 0;
  var dist = 0;
  var nWords = 0;
  var ret = false;
  
  var tiles = {};
  var connections = [];
  
  var boards = boardManager.getPublishedBoardsByLevel( level, false, _ );
  
  if( boards.length !== 0 )
  {
    var randomBoardID = randomizer.getRandomIntegerInRange( 0, boards.length - 1 );    
    var board = boards[ boards.length === 1 ? 0 : randomBoardID ];
    
    for( i = 0; i < board.tiles.length; i++ ){
      tiles[board.tiles[i].data.id] = adder.addTile( game, collectionName, board.tiles[i].data.id, board.tiles[i].data.x, board.tiles[i].data.y, board.tiles[i].data.angle, _ );
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
  
  now = new Date().getTime(); time = now - start;
  console.log("rb1: " + time );
  
  return ret;
}

function broadcastGameObject( game, eventName, jsonObjs )
{
  for( var i = 0; i < game.data[props.GAME.PLAYER_COUNT]; i++ ){
    sockets[ "game" + game.data.id ][ game.data[props.GAME.USERNAMES][i] ].emit( eventName, jsonObjs[ game.data[props.GAME.USERNAMES][i] ] );
  }
}

function broadcast( game, eventName, responseData )
{
  for( var i = 0; i < game.data[props.GAME.PLAYER_COUNT]; i++ ){
    sockets[ "game" + game.data.id ][ game.data[props.GAME.USERNAMES][i] ].emit( eventName, responseData );
  }
}

function fillGameUpdateData( game, data, _ )
{
  var i = 0;
  var player;
  var responseData = data;
  
  responseData.gameOver = game.data[props.GAME.GAME_OVER];
  
  for( i = 0; i < game.data[props.GAME.PLAYER_COUNT]; i++ ){
    player = retriever.getGamePlayerByID( game.id, game.data[props.GAME.USERNAMES][i], _ );
    responseData.playerInfo.push({
      username: game.data[props.GAME.USERNAMES][i],
      score: player.data[props.PLAYER.SCORE],
      active: game.data[props.GAME.GAME_OVER] === true ? false :
      game.data[props.GAME.USERNAMES][i] === game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]],
      resigned: player.data[props.PLAYER.RESIGNED]
    });
  }
  
  return responseData;
}

//  Randomize array element order in-place using the Fisher-Yates shuffle algorithm.*
function shuffleArray( array )
{
  for( var i = array.length - 1; i > 0; i-- ){
    var j = Math.floor( Math.random() * (i + 1) );
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

// app.get("/", function( req, res ){
//   res.sendfile( "index.html", { root: "../client/" } );
// });

app.io.route( "account:sign-up", function( req, _ ){
  var start = new Date().getTime();
  process.stdout.write("signing up ");
  
  var success = users.addUser( req.data.username, req.data.password, req.data.email, "miss", "mister", "eng", consts.STARTING_BESOZ, _ );
  req.io.respond( { success: success } );
  if( !success ){
    console.log( "Error Signing Up" );
    responseData.message = "Username/Email already in use";
  }
  
  var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
});

app.io.route( "account:login", function( req, _ )
{  
  var responseData = { success: false };
  var user = users.login( req.data.username, req.data.password, _ );
  
  if( user !== false ){
    active[ req.data.username ] = { socket: req.io, active: true, lastActive: new Date() };
    responseData = { success: true };
  }else{
    responseData.message = "Sorry, that user or password was not recognized. Please try again.";
  }
  
  req.io.respond( responseData );
});

app.io.route( "logout", function( req, _ ){
  active[ req.data.username ] = { socket: false, active: false, lastActive: new Date() };
  
  req.io.respond( true );
});

app.io.route( "recover:password", function( req, _ ){
  mailer.recoverPassword(  req.data.username, _ );
  
  req.io.respond( true );
});

app.io.route( "game:lobby", function( req, _ )
{
  var start = new Date().getTime(); process.stdout.write("lobby "); 
  
  var i, j;
  var game;
  var lastPhrase;
  var games = [];
  var phrases = [];
  var players = [];
  var responseData = { success: false, games: [] }
  var user = userRetriever.getUserByUsername( req.data.username, _ );
  
  try{
    var games = retriever.getUserGames( user.id, true, _ );
    
    for( i = 0; i < games.length; i++ ){
      game = games[i];
      
      responseData.games[i] = {};
      responseData.games[i].lastMod = game.data[props.GAME.LAST_MOD];
      responseData.games[i].startDate = game.data[props.GAME.START_DATE];
      responseData.games[i].collection = game.data[props.GAME.COLLECTION];
      
      lastPhrase = retriever.getGamePhraseByID( game.id, game.data[props.GAME.PHRASE_COUNT] - 1, _ );
      
      responseData.games[i].lastPhrase = lastPhrase ? { phrase: lastPhrase.data[props.PHRASE.PHRASE_STRING], username: lastPhrase.data[props.PHRASE.USERNAME], score: lastPhrase.data[props.PHRASE.SCORE]} : {};
      
      players = retriever.getGamePlayers( game.id, _ );
      for( j = 0; j < players.length; j++ ){
        responseData.games[i].players = [];
        responseData.games[i].players.push({
          username: players[j].data[props.PLAYER.USERNAME],
          score: players[j].data[props.PLAYER.SCORE],
          active: game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]] === players[j].data[props.PLAYER.USERNAME]
        });
      }
      
      responseData.success = true;
    }
  }catch( ex ){
    console.log( ex.message );
  }
  
  req.io.respond( responseData );
  
  var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
});

app.io.route( "game:queue", function( req, _ )
{
  var playerCount = req.data.playerCount;
  var queueType = playerCount -1;
  
  if( users.login( req.data.username, req.data.password, _ ) ){
    queue[queueType].push({ username: req.data.username, socket: req.io });
    req.io.respond({ success: true });
    
    if( queue[queueType].length >= playerCount )
    {
      var i, j = 0;
      var game;
      var jsonObjs;
      var usernames = [];
      var tempSockets = {};
      var start = new Date().getTime();
      process.stdout.write( "creating new game " );
      
      for( i = 0; i < playerCount; i++ ){
        var user = queue[queueType].pop();
        usernames.push( user[props.USER.USERNAME] );
        tempSockets[user[props.USER.USERNAME]] = user[props.PLAYER.SOCKET];
      }
      
      var start2 = new Date().getTime();
      game = createGame( usernames, "woz", 0, _ );
      var now2 = new Date().getTime();
      console.log("q: " + ( now2 - start2 ) );
      
      if( game ){
        sockets[ "game" + game.data[props.ID] ] = tempSockets;
        jsonObjs = tools.getGameObject( game, usernames, _ );
        broadcastGameObject( game, consts.START_GAME, jsonObjs );
      }
      
      var end = new Date().getTime(); var time = end - start;  console.log( "took: " + time + "ms" );
    }
  }
});

app.io.route( "game:resume", function( req, _ )
{
  var start = new Date().getTime(); process.stdout.write("resuming game ");
  
  var game = retriever.getGameByID( req.data.id, _ );
  
  if( game )
  {
    var jsonObjs = tools.getGameObject( game, game.data[props.GAME.USERNAMES], _ );
    broadcastGameObject( game, consts.START_GAME, jsonObjs );
  }
  
  var end = new Date().getTime(); var time = end - start;  console.log( "took: " + time + "ms" );
});

app.io.route( "game:place-phrase", function( req, _ )
{
  var start = new Date().getTime(); process.stdout.write("placing phrase ");

  var ret;
  var i = 0;
  
  var game = retriever.getGameByID( req.data.gameID, _ );
  var responseData = { success: false, playerInfo: [] };
  
  if( game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]] === req.data.username )
  {
    ret = actions.placePhrase( game, req.data.username, req.data.pathID, req.data.words, _ );
    responseData = fillGameUpdateData( game, responseData, _ );
    
    responseData.words = ret.words;
    responseData.success = ret.madness === 0;
    responseData.placedPhrase = responseData.success ? req.data.words : [];
  }
  
  broadcast( game, "game:update", responseData );
  
  var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
});

app.io.route( "game:move-word", function( req, _ )
{
  var start = new Date().getTime(); process.stdout.write( "moving " );
  
  var game = retriever.getGameByID( req.data.gameID, _ );
  if( game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]] == req.data.username ){
    operations.move( game.id, req.data.wordID, req.data.x, req.data.y, req.data.angle, _ );
  }
  
  var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
});

app.io.route( "game:swap-words", function( req, _ )
{
  var start = new Date().getTime(); process.stdout.write("swapping words ");

  var responseData = { success: false, words: [] };
  var game = retriever.getGameByID( req.data.gameID, _ );
  
  if( game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]] == req.data.username )
  {
    responseData.words = actions.swapWords( game, req.data.username, req.data.words, _ );
    
    responseData.success = true;
  }
  req.io.respond( responseData );
  
  var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
});

app.io.route( "end:turn", function( req, _ ) {
  operations.endTurn( req.data.game, _ );
});

app.io.route( "game:resign", function( req, _ )
{
  var start = new Date().getTime(); process.stdout.write("resigning ");
  
  var ret;
  var i = 0;
  var player;
  
  var game = retriever.getGameByID( req.data.gameID, _ );
  var responseData = { success: false, playerInfo: [] };
  
  if( game.data[props.GAME.GAME_OVER] === false )
  {
    
    player = retriever.getGamePlayerByID( game.id, game.data[props.GAME.USERNAMES][i], _ );
    
    player.data[props.PLAYER.RESIGNED] = true;
    game.data[props.GAME.RESIGNED_COUNT]++;
    
    if( game.data[props.GAME.RESIGNED_COUNT] + 1 >= game.data[props.GAME.PLAYER_COUNT] ){
      game.data[props.GAME.GAME_OVER] = true;
    }
    
    game.save(_);
    player.save(_);
    
    responseData =  fillGameUpdateData( game, responseData, _ );
    responseData.success = true;
  }
  
  broadcast( game, "game:update", responseData );
  
  var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
});

app.io.route( "manager:boards", function( req, _ )
{
  var start = new Date().getTime(); process.stdout.write( "boardManager:" + req.data.command + " " );
  
  var responseData = { success:false }
  
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
});

app.io.route( "manager:instructions", function( req, _ )
{
  var start = new Date().getTime(); process.stdout.write( "instructionManager:" + req.data.command + " " );
  
  var responseData = { success:false }
  
  if( req.data.command === "set" ){
    instructionManager.setInstruction( req.data.condition, req.data.shortDescription, req.data.longDescription, req.data.collections, req.data.bonus, req.data.mult, req.data.level, _ );
    responseData.success = true;
  }else if( req.data.command === "getAll" ){
    responseData.instructions = instructionManager.getAllInstructions( _ );
    responseData.success = true;
  }else if( req.data.command === "get" ){
    responseData.instruction = instructionManager.getInstruction( req.data.id, _ );
    responseData.success = true;
  }else if( req.data.command === "delete" ){
    
  }
  
  req.io.respond( responseData );
  
  var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
});

app.io.route( "manager:images", function( req, _ )
{
  var start = new Date().getTime(); process.stdout.write( "imageManager:" + req.data.command + " " );
  
  var responseData = { success:false }
  
  if( req.data.command === "set" ){
    imageManager.setImage( req.data.name, req.data.id, req.data.related, _ );
    responseData.success = true;
  }else if( req.data.command === "getAll" ){
    responseData.images = imageManager.getAllImages( _ );
    responseData.success = true;
  }else if( req.data.command === "get" ){
    responseData.image = imageManager.getImage( req.data.name, _ );
    responseData.success = true;
  }else if( req.data.command === "delete" ){
    
  }
  
  req.io.respond( responseData );
  
  var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
});

app.io.route( "manager:words", function( req, _ )
{
  var start = new Date().getTime(); process.stdout.write( "wordManager:" + req.data.command + " " );
  
  var responseData = { success:false }
  
  if( req.data.command === "set" ){
    wordManager.setWord( req.data.lemma, req.data.classes, req.data.categories, req.data,collections, req.data.versionOf, _ );
    responseData.success = true;
  }else if( req.data.command === "getAll" ){
    responseData.words = wordManager.getAllWords( _ );
    responseData.success = true;
  }else if( req.data.command === "get" ){
    
  }else if( req.data.command === "delete" ){
    
  }
  
  req.io.respond( responseData );
  
  var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
});

app.io.route( "friends", function( req, _ )
{
  var start = new Date().getTime(); process.stdout.write( "friends:" + req.data.command + " " );
  
  var responseData = { success:false };
  
  try{
    if( req.data.command === "add" ){
      friends.addFriend( req.data.username, req.data.friend, _ );
      responseData.success = true;
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
  catch( ex ){
    console.log( ex );
  }
  
  req.io.respond( responseData );
  
  var end = new Date().getTime(); var time = end - start; console.log( "took: " + time + "ms" );
});

console.log("server ready");
