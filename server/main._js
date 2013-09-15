/*jslint node: true */
/*global _:false */
"use strict";

var oz = oz || {};

var neo4j = require("neo4j"),
    express = require("express.io"),
    
    tools = require("./tools._js"),
    users = require("./users._js"),
    mailer = require("./mailer._js"),
    actions = require("./actions._js"),
    consts = require("./constants._js"),
    inparser = require("./inparser._js"),
    retriever = require("./retriever._js"),
    randomizer = require("./randomizer._js"),
    operations = require("./operations._js"),
    environment = require("./environment._js"),
    initializer = require("./initializer._js");
    var db = new neo4j.GraphDatabase(environment.DB_URL);
var app = express();

if ( environment.IS_HEROKU ) {
  app.use( express.static( "./client" ) );
}else{
  app.use( express.static( "../client/" ) );
}

app.use( express.cookieParser() );
// app.use( express.session({ secret: "ozmaisgreat" }) );

app.http();

var io = app.io();

var active = {};
var sockets = {};
var queue =  [ [], [] ];

// performance stuff
// order without having to get the players object
// getPlayerMagnetsAndWordsByID doesnt work with [].length == 0;

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
  retriever.getCountNode(_);
}
catch( exception )
{
  console.log( "initializing db." );

  initializer.initDB( _ );
  users.addUser( "ali", "12345", "", "", "", "eng", consts.STARTING_BESOZ, _ );
  users.addUser( "pedro", "12345", "", "", "", "eng", consts.STARTING_BESOZ, _ );

  console.log( "done." );
}

function placePhrase( game, username, pathID, magnetIDs, _ )
{
  var i, j = 0;
  var score = 0;
  
  var mw;
  var phrase;
  var endTileImage;
  var startTileImage;
  var endTileInstruction;
  var startTileInstruction;
  
  var words = [];
  var magnets = [];

  var ret = { madness: -1, score: 0, words: [] };
  
  var path = retriever.getGamePathByID( game.id, pathID, _);
  var tiles = retriever.getPathTiles( path.id, _ );
  
  var wordCount = magnetIDs.length;
  var player = retriever.getGamePlayerByID( game.id, username, _ );
  
  mw = retriever.getPlayerMagnetsAndWordsByID( player.id, magnetIDs, _ );
  for( i = 0; i < mw.length; i ++ ){
    words.push( mw[i].word );
    magnets.push( mw[i].magnet );
  }
  
  ret[consts.MADNESS] = canIPlayWithMadness( words, wordCount, _ );
  
  if( ret[consts.MADNESS] == 0 )
  {
    phrase = tools.createNode({
      type: consts.PHRASE,
      id: game.data[consts.PHRASE_COUNT],
      wordCount: wordCount
    }, _ );
    
    player.createRelationshipTo( phrase, consts.WROTE, {}, _ );
    game.createRelationshipTo( phrase, consts.HAS_PHRASE, {}, _ );
    
    for( var i = 0; i < wordCount; i++ )  //disconnect from the player, connect to the phrase. replace with new magnets
    {  
      var currentWord = words[i];
      var currentMagnet = magnets[i];
      var rToPlayer = currentMagnet.incoming( consts.HAS_MAGNET, _ )[0];
      rToPlayer["delete"](_);
      
      phrase.createRelationshipTo( currentMagnet, consts.HAS_MAGNET, { order : i }, _ );
      currentMagnet.data[consts.OWNER] = phrase.data[consts.ID];
      currentMagnet.data[consts.TYPE] = consts.MAGNET_PHRASE;
      currentMagnet.save(_);
      
      ret[consts.WORDS].push( currentWord.data[consts.LEMMA] );
      tools.addMagnet( game, player, currentWord.data.classes[ Math.floor( randomizer.getRandomInRange( 0, currentWord.data.classes.length ) ) ], _ );  //replace it with a new magnet
    }
    
    score = scoringTime( words, tiles, _ );
    player.data[consts.SCORE] += score;
    ret[consts.SCORE] = player.data[consts.SCORE];
    
    game.data[consts.GAME_OVER] = isTheGameOver( game, _ );
    game.data[consts.ACTION_DONE] = false;
    game.data[consts.PHRASE_COUNT]++;
    game.data[consts.TURN]++;
    
    player.save(_);
    game.save(_);

//     console.log( "Placed phrase " + phrase.data[consts.ID] + " on node n. " + phrase.id );
  }
  else
    console.log( "Hold on mister, respect the rules!" );
  
  return ret;
}

function scoringTime( words, tiles, _ ){
  var i, j;
  var mult = 0;
  var score = consts.BASE_POINTS;
  var firstTileImage = retriever.getTileImage( tiles[0].id, _ );
  var secondTileImage = retriever.getTileImage( tiles[1].id, _ );
  var firstTileInstruction = retriever.getTileInstruction( tiles[0].id, _ );
  var secondTileInstruction = retriever.getTileInstruction( tiles[1].id, _ );
  var satisfiedFirstInstruction = inparser.checkInstruction( firstTileInstruction.data[consts.CONDITION], words, _ );
  var satisfiedSecondInstruction = inparser.checkInstruction( secondTileInstruction.data[consts.CONDITION], words, _ );
  
  for( i = 0; i < words.length; i++ ){
    var currentWord = words[i];
    
    score += currentWord.data[consts.POINTS];
    for( j = 0; j < firstTileImage.data.related.length; j++ ){
      if( firstTileImage.data.related[j] == currentWord.data[consts.REPRESENTED_WORD] ){
        score += consts.RELATED_WORD_BONUS;
      }
    }
    
    for( j = 0; j < secondTileImage.data.related.length; j++ ){
      if( secondTileImage.data.related[j] == currentWord.data[consts.REPRESENTED_WORD] ){
        score += consts.RELATED_WORD_BONUS;
      }
    }
  }
  
  if( satisfiedFirstInstruction ){
    score += firstTileInstruction.data[consts.BONUS];
  }
  
  if( satisfiedSecondInstruction ){
    score += secondTileInstruction.data[consts.BONUS];
  }
  
  if( satisfiedFirstInstruction ){
    mult += firstTileInstruction.data[consts.MULT];
  }
  
  if( satisfiedSecondInstruction ){
    mult += secondTileInstruction.data[consts.MULT];
  }
  
  if( mult != 0 ){
    score = score * mult;
  }
  
  return score;
}

function isTheGameOver( game, _ )
{
  var over = false;
  
  if( game.data[consts.PHRASE_COUNT] == game.data[consts.PATH_COUNT] ){
    over = true;
  }
  
  return over;
}

function canIPlayWithMadness( words, wordCount, _ ){
  var madness = 0;
  
  if( words.length == 0 ){
    madness = 1;
  }else if( words.length != wordCount ){
    madness = 2;
  }
  
  if( madness != 0 ) console.log( "madness? " + madness );
  
  return madness;
}

function createGame( usernames, level, _ )
{
  var i, j = 0;
  var gameID = tools.getNewGameID(_);
  var playerCount = usernames.length;

  var game = tools.createNode({
    type: consts.GAME,
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
    playerCount: playerCount
  }, _ );
  
  game.index( consts.GAME_INDEX, consts.ID, gameID, _ );
  for( var a = 0; a < playerCount; a++ )  //creates a player instance for each player
  {
    var username = usernames[a];
    var user = retriever.getUser( username, _ );
    
    var player = tools.createNode({
      type: consts.PLAYER,
      username: username,
      score: 0,
      order: a
    }, _ );
    
    user.createRelationshipTo( game, consts.PLAYS, {}, _ );
    game.createRelationshipTo( player, consts.BEING_PLAYED_BY, {}, _ );
  }
  try
  {
    randomizeBoard( game, level, _ );
    
    for( i = 0; i < consts.BALANCE.length; i++ ){
      for( j = 0; j < consts.BALANCE[i]; j++ ){
        tools.addMagnet( game, player, consts.CLASS_NAMES[i], _ );
      }
    }
  }
  catch( ex )
  {
    console.log( "Error creating initial tiles" );
    console.log( ex );
  }
//   console.log( "Added Game " + gameID + ". Node n. " + game.id );
  
  return game;
}

function randomizeBoard( game, level, _ )
{
  var i = 0;
  var j = 0;
  var dist = 0;
  var nWords = 0;
  var nPaths = randomizer.getRandomIntegerInRange( consts.LEVEL_SETTINGS[level][consts.MIN_PATHS], consts.LEVEL_SETTINGS[level][consts.MAX_PATHS] );
  
  var tiles = [];
  var connections = [];
  
  var first = tools.addTile( game, _ );
  first.data[consts.X] = consts.FIRST_TILE_X + randomizer.getSignedRandomInRange( 0, 0.1 );
  first.data[consts.Y] = consts.FIRST_TILE_Y  + randomizer.getSignedRandomInRange( 0, 0.1 );
  
  var second = tools.addTile( game, _ );
  second.data[consts.X] = consts.SECOND_TILE_X  + randomizer.getSignedRandomInRange( 0, 0.1 );
  second.data[consts.Y] = consts.SECOND_TILE_Y + randomizer.getSignedRandomInRange( 0, 0.1 );
  
  var third = tools.addTile( game, _ );
  third.data[consts.X] = consts.THIRD_TILE_X + randomizer.getSignedRandomInRange( 0, 0.1 );
  third.data[consts.Y] = consts.THIRD_TILE_Y + randomizer.getSignedRandomInRange( 0, 0.1 );
  
  first.save(_);
  second.save(_);
  third.save(_);
  
  tiles.push( third );
  tiles.push( second );
  tiles.push( first );
  
  for( i = 0; i < tiles.length; i++ ){
    for( j = 0; j < tiles.length; j++ ){
      if( j != i ){
        if( tiles[j].data[consts.X] - tiles[i].data[consts.X] >= consts.MIN_DIFF ){
          dist = Math.sqrt( Math.pow( tiles[j].data[consts.X] - tiles[i].data[consts.X], 2 ) + Math.pow( tiles[j].data[consts.Y] - tiles[i].data[consts.Y], 2 ) );
          connections.push({ startTile: i, endTile: j, dist: dist });
        }
      }
    }
  }
  
  for( i = 0; i < connections.length && i < nPaths; i++ )
  {
    var nWords = Math.floor( connections[i].dist * 10 );
    console.log("creating path from " + tiles[connections[i].startTile].data.id + " to " + tiles[connections[i].endTile].data.id );
    tools.addPath( game, tiles[connections[i].startTile], tiles[connections[i].endTile], nWords, true, _ );
  }

  shuffleArray( connections );
  for( j = 0; j < connections.length && j + i < nPaths; j++ )
  {
    var nWords = Math.floor( connections[j].dist * 10 );
    console.log("creating path from " + tiles[connections[j].startTile].data.id + " to " + tiles[connections[j].endTile].data.id );
    tools.addPath( game, tiles[connections[j].startTile], tiles[connections[j].endTile], nWords, false, _ );
  }
  
}

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function operate( op, requestData, requestIO, broadcastEvent, isAction, isEndTurn, _ ) {
  var start = new Date().getTime();
  process.stdout.write( op );
  
  var game = retriever.getGame( requestData.gameID, _ );
  if( game.data[consts.USERNAMES][game.data[consts.TURN] % game.data[consts.PLAYER_COUNT]] == requestData[consts.USERNAME] ){
    if( !isAction || ( isAction && !game.data[consts.ACTION_DONE] ) ){
      if( op != "end:turn" ){
        runOperation( op, game, requestData, _ );
      }
      
      if( isAction ){
        operations.setActionDone( game, true, _ );
      }
      
      if( isEndTurn ){
        operations.endTurn( game, _ );
      }
      
      var jsonObjs = tools.getGameObject( game, game.data[consts.USERNAMES], 0, _ );
      
      if( requestIO != false ){
        requestIO.respond( jsonObjs[ requestData[consts.USERNAME] ] );
      }
      
      if( broadcastEvent != false ){
        broadcast( game, requestData[consts.USERNAME], broadcastEvent, jsonObjs );
      }
      var end = new Date().getTime();
      var time = end - start;
      console.log( " took: " + time + "ms" );
    }
  }
};

function runOperation( op, game, data, _ )
{  
  if( op == "swap:words" ){
    actions.swapWords( game, data[consts.USERNAME], data.magnetIDs, _ );
  }
};

function broadcast( game, eventName, jsonObjs )
{
  for( var i = 0; i < game.data[consts.PLAYER_COUNT]; i++ ){
    sockets[ "game" + game.data.id ][ game.data[consts.USERNAMES][i] ].emit( eventName, jsonObjs[ game.data[consts.USERNAMES][i] ] );
  }
};

// app.get("/", function( req, res ){
//   res.sendfile( "index.html", { root: "../client/" } );
// });

app.io.route( "account:sign-up", function( req, _ ){
  users.addUser( req.data.username, req.data[consts.PASSWORD], "ozma@oz.ma", "pedrils", "karbob", "eng", consts.STARTING_BESOZ, _ );
});

app.io.route( "account:login", function( req, _ )
{  
  var responseData = { success: false };
  var user = users.login( req.data.username, req.data[consts.PASSWORD], _ );
  
  if( user != false ){
    active[ req.data[consts.USERNAME] ] = { socket: req.io, active: true, lastActive: new Date() };
    responseData = { success: true };
  }
  
  req.io.respond( responseData );
});

app.io.route( "logout", function( req, _ ){
  active[ req.data[consts.USERNAME] ] = { socket: false, active: false, lastActive: new Date() };
  
  req.io.respond( true );
});

app.io.route( "recover:password", function( req, _ ){
  mailer.recoverPassword(  req.data[ consts.USERNAME ], _ );
  
  req.io.respond( true );
});

app.io.route( "game:queue", function( req, _ )
{
  var playerCount = req.data[consts.PLAYER_COUNT];
  var queueType = playerCount -1;
  
  if( users.login( req.data[consts.USERNAME], req.data[consts.PASSWORD], _ ) ){
    console.log( "queued " + req.data[consts.USERNAME] );
    
    queue[queueType].push({ username: req.data[consts.USERNAME], socket: req.io });
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
        usernames.push( user[consts.USERNAME] );
        tempSockets[user[consts.USERNAME]] = user[consts.SOCKET];
      }
      
      game = createGame( usernames, 0, _ );
      
      if( game )
      {
        sockets[ "game" + game.data[consts.ID] ] = tempSockets;
        jsonObjs = tools.getGameObject( game, usernames, _ );
        broadcast( game, consts.START_GAME, jsonObjs );
      }
      
      var end = new Date().getTime();
      var time = end - start;
      console.log( "took: " + time + "ms" );
    }
  }
});

app.io.route( "game:place-phrase", function( req, _ )
{
  req.data.username = "ali";
  
  var start = new Date().getTime();
  process.stdout.write("placing phrase ");
  
  var ret;
  var responseData = {};
  var game = retriever.getGame( req.data.gameID, _ );
  
  if( game.data[consts.USERNAMES][game.data[consts.TURN] % game.data[consts.PLAYER_COUNT]] == req.data[consts.USERNAME] ){
    
    ret = placePhrase( game, req.data[consts.USERNAME], req.data.pathID, req.data.words, _ );
    
    responseData.score = ret.score;
    responseData.active = game.data[consts.USERNAMES][game.data[consts.TURN] % game.data[consts.PLAYER_COUNT]];
    responseData.success = ret[consts.MADNESS] == 0;
    
    req.io.respond( responseData );
    broadcast( game, req.data[consts.USERNAME], responseData );
  }
  
  var end = new Date().getTime();
  var time = end - start;
  console.log( "took: " + time + "ms" );
});

app.io.route( "game:move-word", function( req, _ )
{
  var start = new Date().getTime();
  process.stdout.write( "moving " );
  
  var game = retriever.getGame( req.data.gameID, _ );
  if( game.data[consts.USERNAMES][game.data[consts.TURN] % game.data[consts.PLAYER_COUNT]] == req.data[consts.USERNAME] ){
    operations.move( game.id, req.data.wordID, req.data.x, req.data.y, req.data.angle, _ );
  }
  var end = new Date().getTime();
  var time = end - start;
  console.log( "took: " + time + "ms" );
});

app.io.route( "game:swap-words", function( req, _ ) {
  operate( "swap:words", req.data, req.io, false, true, false, _ );
});

app.io.route( "swap:tile", function( req, _ ) {
  operate( "swap:tile", req.data, req.io, consts.REFRESH, true, false, _ );
});

app.io.route( "add:tile", function( req, _ ) {
  operate( "add:tile", req.data, req.io, consts.REFRESH, true, false, _ );
});

app.io.route( "end:turn", function( req, _ ) {
  operate( "end:turn", req.data, req.io, consts.END_TURN, false, true, _ );
});

console.log("server ready");