/*jslint node: true */
/*global _:false */
"use strict";

var oz = oz || {};

var neo4j = require("neo4j"),
    express = require("express.io"),
    
    tools = require("./tools._js"),
    users = require("./users._js"),
    types = require("./types._js"),
    loader = require("./loader._js"),
    mailer = require("./mailer._js"),
    actions = require("./actions._js"),
    props = require("./properties._js"),
    consts = require("./constants._js"),
    indexes = require("./indexes._js"),
    inparser = require("./inparser._js"),
    rels = require("./relationships._js"),
    retriever = require("./retriever._js"),
    randomizer = require("./randomizer._js"),
    operations = require("./operations._js"),
    environment = require("./environment._js"),
    initializer = require("./initializer._js"),
    boardManager = require("./boardManager._js");

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

// fix swap words concurrency (and some other things as well i guess)
// fix getWordfromClassIndex
// fix collections in placing phrases
// fix games played

var io = app.io();

var active = {};
var sockets = {};
var queue =  [ [], [] ];
var countNode;

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
  console.log( consts.CLASS_COUNTS );
}
catch( exception )
{
  console.log( "initializing db." );

  initializer.initDB( _ );

  countNode = retriever.getCountNode(_);
  console.log( "done." );
}

var allWords;
allWords = loader.loadWords( _ );

var managerWords = [];
var versions = {};
var word;
var i = 0 ;

for( i = 0; i < allWords.length; i++ ){
  word = allWords[i];
  
  if( word[props.WORD.VERSION_OF].length === 0 ){
    managerWords.push( word );
  }else{
    if( versions.hasOwnProperty( word.lemma ) ){
      versions[ word.lemma ].push( word );
    }else{
      versions[ word.lemma ] = [ word ];
    }
  }
  
  for( i = 0; i < managerWords.length; i++ ){
    word  = managerWords[i];
    if( versions.hasOwnProperty( word.lemma ) ){
      word.versions = versions[word.lemma];
    }
  }
  
  for( i = 0; i < managerWords.length; i++ ){
    word  = managerWords[i];
    if( word.hasOwnProperty( "versions" ) && word.versions.length > 0 ){
      console.log( word );
    }
  }
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
  
  ret.madness = canIPlayWithMadness( words, wordCount, _ );
  
  if( ret.madness === 0 )
  {
    phrase = tools.createNode({
      type: types.PHRASE,
      id: game.data[props.GAME.PHRASE_COUNT],
      wordCount: wordCount
    }, _ );
    
    player.createRelationshipTo( phrase, rels.WROTE, {}, _ );
    game.createRelationshipTo( phrase, rels.HAS_PHRASE, {}, _ );
    
    for( i = 0; i < wordCount; i++ )  //disconnect from the player, connect to the phrase. replace with new magnets
    {  
      var currentWord = words[i];
      var currentMagnet = magnets[i];
      var rToPlayer = currentMagnet.incoming( rels.HAS_MAGNET, _ )[0];
      rToPlayer["delete"](_);
      
      phrase.createRelationshipTo( currentMagnet, rels.HAS_MAGNET, { order : i }, _ );
      currentMagnet.data[props.MAGNET.OWNER] = phrase.data[props.ID];
      currentMagnet.data[props.MAGNET.TYPE] = types.MAGNET_PHRASE;
      currentMagnet.save(_);
      
      ret.words.push( opearations.addMagnet( game, player, currentWord.data.collections[0],currentWord.data.classes[ Math.floor( randomizer.getRandomInRange( 0, currentWord.data.classes.length ) ) ], currentMagnet.data.x, currentMagnet.data.y, _ ) );  //replace it with a new magnet
    }
    
    score = scoringTime( words, tiles, _ );
    
    player.data[props.PLAYER.SCORE] += score;
    ret[props.PLAYER.SCORE] = player.data[props.PLAYER.SCORE];
    
    game.data[props.GAME.ACTION_DONE] = false;
    game.data[props.GAME.PHRASE_COUNT]++;
    
    game.data[props.GAME.GAME_OVER] = isTheGameOver( game, _ );
    if( !game.data[props.GAME.GAME_OVER] ) game.data[props.GAME.TURN]++;
    
    player.save(_);
    game.save(_);
    
//     console.log( "Placed phrase " + phrase.data[props.ID] + " on node n. " + phrase.id );
  }
  else
    console.log( "Hold on mister, respect the rules!" );
  
  return ret;
}

function scoringTime( words, tiles, _ )
{
  var i, j;
  var mult = 0;
  var score = consts.BASE_POINTS;
  var firstTileImage = retriever.getTileImage( tiles[0].id, _ );
  var secondTileImage = retriever.getTileImage( tiles[1].id, _ );
  var firstTileInstruction = retriever.getTileInstruction( tiles[0].id, _ );
  var secondTileInstruction = retriever.getTileInstruction( tiles[1].id, _ );
  var satisfiedFirstInstruction = inparser.checkInstruction( firstTileInstruction.data[props.INSTRUCTION.CONDITION], words, _ );
  var satisfiedSecondInstruction = inparser.checkInstruction( secondTileInstruction.data[props.INSTRUCTION.CONDITION], words, _ );
  
  for( i = 0; i < words.length; i++ ){
    var currentWord = words[i];
    
    score += currentWord.data[props.WORD.POINTS];
    
    for( j = 0; j < firstTileImage.data.related.length; j++ ){
      if( firstTileImage.data.related[j] == currentWord.data[props.WORD.ID] ){
        score += consts.RELATED_WORD_BONUS;
      }
    }
    
    for( j = 0; j < secondTileImage.data.related.length; j++ ){
      if( secondTileImage.data.related[j] == currentWord.data[props.WORD.ID] ){
        score += consts.RELATED_WORD_BONUS;
      }
    }
  }
  
  if( satisfiedFirstInstruction ){
    score += firstTileInstruction.data[props.INSTRUCTION.BONUS];
  }
  
  if( satisfiedSecondInstruction ){
    score += secondTileInstruction.data[props.INSTRUCTION.BONUS];
  }
  
  if( satisfiedFirstInstruction ){
    mult += firstTileInstruction.data[props.INSTRUCTION.MULT];
  }
  
  if( satisfiedSecondInstruction ){
    mult += secondTileInstruction.data[props.INSTRUCTION.MULT];
  }
  
  if( mult !== 0 ){
    score = score * mult;
  }
  
  return score;
}

function isTheGameOver( game, _ )
{
  var over = false;
  
  if( game.data[props.GAME.PHRASE_COUNT] == game.data[props.GAME.PATH_COUNT] ){
    over = true;
  }
  
  return over;
}

function canIPlayWithMadness( words, wordCount, _ ){
  var madness = 0;
  
  if( words.length === 0 ){
    madness = 1;
  }else if( words.length != wordCount ){
    madness = 2;
  }
  
  if( madness !== 0 ) console.log( "madness? " + madness );
  
  return madness;
}

function createGame( usernames, collectionName, level, _ )
{
  collectionName = "starter";
  
  var now;
  var time = 0;
  var start = new Date().getTime();

  var player;
  var nWords;
  var randomArray;
  var a, i, j, k = 0;
  var gameID = tools.getNewGameID(_);
  var playerCount = usernames.length;
  var startDate = Date.parse( new Date() );
  
  now = new Date().getTime();
  time = now - start;
  console.log("cg1: " + time );
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
  
  now = new Date().getTime();
  time = now - start;
  console.log("cg2: " + time );
  start = new Date().getTime();
  
  game.index( indexes.GAME_INDEX, props.ID, gameID, _ );
  
  now = new Date().getTime();
  time = now - start;
  console.log("cg3: " + time );
  start = new Date().getTime();
  
  try
  {
    randomizeBoard( game, level, _ );
    
    now = new Date().getTime();
    time = now - start;
    console.log("cg4: " + time );
    start = new Date().getTime();
    
    for( a = 0; a < playerCount; a++ )  //creates a player instance for each player
    {
      var username = usernames[a];
      var user = retriever.getUser( username, _ ); 
      
      if( !user.data.hasOwnProperty( user.data[props.USER.NGAMES] ) ){
        user.data[props.USER.NGAMES] = 0;
      }
      user.data[props.USER.NGAMES]++;
      user.save( _ );
      
      player = tools.createNode({
        type: types.PLAYER,
        username: username,
        score: 0,
        order: a,
        resigned: false
      }, _ );
      
      user.createRelationshipTo( game, rels.PLAYS, {}, _ );
      game.createRelationshipTo( player, rels.BEING_PLAYED_BY, {}, _ );
      
      now = new Date().getTime();
      time = now - start;
      console.log("cg5: " + time );
      start = new Date().getTime();
      
      k = 0;
      for( i = 0; i < consts.BALANCE_BASIC.length; i++ ){
        for( j = 0; j < consts.BALANCE_BASIC[i]; j++ ){
          operations.addMagnet( game, player, "basic", consts.CLASS_NAMES[i], k > 9 ? (k-10) * 0.09 + 0.03: k * 0.09 + 0.03, k > 9 ? 0.1 + randomizer.getSignedRandomInRange(0, 0.01) : 0 + randomizer.getSignedRandomInRange(0, 0.01), _ );
          k++;
        }
      }
      
      for( i = 0; i < consts.BALANCE_COLLECTION.length; i++ ){
        for( j = 0; j < consts.BALANCE_COLLECTION[i]; j++ ){
          operations.addMagnet( game, player, collectionName, consts.CLASS_NAMES[i], k > 9 ? (k-10) * 0.09 + 0.03: k * 0.09 + 0.03, k > 9 ? 0.1 + randomizer.getSignedRandomInRange(0, 0.01) : 0 + randomizer.getSignedRandomInRange(0, 0.01), _ );
          k++;
        }
      }
    }
    
    now = new Date().getTime();
    time = now - start;
    console.log("cg6: " + time );
  }
  catch( ex )
  {
    console.log( "Error creating game" );
    console.log( ex );
  }
//   console.log( "Added Game " + gameID + ". Node n. " + game.id );
  
  return game;
}

function randomizeBoard( game, level, _ )
{
  var start = new Date().getTime();
  var now;
  var time;
  
  var i = 0;
  var j = 0;
  var dist = 0;
  var nWords = 0;

  now = new Date().getTime();
  time = now - start;
  console.log("rb1: " + time );
  start = new Date().getTime();
  
  var tiles = [];
  var connections = [];

  var first = tools.addTile( game, consts.FIRST_TILE_X, consts.FIRST_TILE_Y, _ );
  var second = tools.addTile( game, consts.SECOND_TILE_X, consts.SECOND_TILE_Y, _ );
  var third = tools.addTile( game, consts.THIRD_TILE_X, consts.THIRD_TILE_Y, _ );

  now = new Date().getTime();
  time = now - start;
  console.log("rb2: " + time );
  start = new Date().getTime();
  
//   tools.addPath( game, first, second, 5, true, _ );
  tools.addPath( game, first, second, 0, true, _ );
  tools.addPath( game, third, second, 3, true, _ );
  tools.addPath( game, third, second, 5, false, _ );
  tools.addPath( game, first, third, 4, false, _ );

  now = new Date().getTime();
  time = now - start;
  console.log("rb3: " + time );
}

function broadcastGameObject( game, eventName, jsonObjs )
{
  console.log( "bgo1" );
  console.log( jsonObjs );
  for( var i = 0; i < game.data[props.GAME.PLAYER_COUNT]; i++ ){
    console.log( "bgo2" );
    sockets[ "game" + game.data.id ][ game.data[props.GAME.USERNAMES][i] ].emit( eventName, jsonObjs[ game.data[props.GAME.USERNAMES][i] ] );
    console.log( "bgo3" );
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
  
  responseData.gameOver = game.data[consts.GAME_OVER];
  
  for( i = 0; i < game.data[consts.PLAYER_COUNT]; i++ ){
    player = retriever.getGamePlayerByID( game.id, game.data[props.GAME.USERNAMES][i], _ );
    responseData.playerInfo.push({
      username: game.data[props.GAME.USERNAMES][i],
      score: player.data[props.PLAYER.SCORE],
      active: game.data[props.GAME.GAME_OVER] === true ? false :
      game.data[consts.USERNAMES][i] === game.data[props.GAME.USERNAMES][game.data[props.GAME.TURN] % game.data[props.GAME.PLAYER_COUNT]],
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
  console.log( "signing up" );
  var success = users.addUser( req.data.username, req.data.password, "ozma@oz.ma", "pedrils", "karbob", "eng", consts.STARTING_BESOZ, _ );
  console.log( success );
  req.io.respond( { success: success } );
  console.log( "signed up" );
});

app.io.route( "account:login", function( req, _ )
{  
  var responseData = { success: false };
  var user = users.login( req.data.username, req.data.password, _ );
  
  if( user !== false ){
    active[ req.data[consts.USERNAME] ] = { socket: req.io, active: true, lastActive: new Date() };
    responseData = { success: true };
  }else{
    responseData.message = "Sorry, that user or password was not recognized. Please try again.";
  }
  
  req.io.respond( responseData );
});

app.io.route( "logout", function( req, _ ){
  active[ req.data[consts.USERNAME] ] = { socket: false, active: false, lastActive: new Date() };
  
  req.io.respond( true );
});

app.io.route( "recover:password", function( req, _ ){
  mailer.recoverPassword(  req.data.username, _ );
  
  req.io.respond( true );
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
      game = createGame( usernames, "starter", 0, _ );
      var now2 = new Date().getTime();
      console.log("q: " + ( now2 - start2 ) );
      console.log( "1" );
      if( game ){
        console.log( "2" );
        sockets[ "game" + game.data[props.ID] ] = tempSockets;
        console.log( "3" );
        jsonObjs = tools.getGameObject( game, usernames, _ );
        console.log( "4" );
        broadcastGameObject( game, consts.START_GAME, jsonObjs );
        console.log( "5" );
      }
      
      var end = new Date().getTime();
      var time = end - start;
      console.log( "took: " + time + "ms" );
    }
  }
});

app.io.route( "game:place-phrase", function( req, _ )
{
  var start = new Date().getTime();
  process.stdout.write("placing phrase ");

  var ret;
  var i = 0;
  var game = retriever.getGame( req.data.gameID, _ );
  var responseData = { success: false, playerInfo: [] };
  
  if( game.data[consts.USERNAMES][game.data[consts.TURN] % game.data[consts.PLAYER_COUNT]] === req.data[consts.USERNAME] )
  {
    ret = placePhrase( game, req.data[consts.USERNAME], req.data.pathID, req.data.words, _ );
    
    responseData = fillGameUpdateData( game, responseData, _ );
    
    responseData.words = ret[consts.WORDS];
    responseData.success = ret[consts.MADNESS] === 0;
    responseData.placedPhrase = responseData.success ? req.data.words : [];
  }
  
  broadcast( game, "game:update", responseData );
  
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

app.io.route( "game:swap-words", function( req, _ )
{
  var start = new Date().getTime();
  process.stdout.write("swapping words ");

  var responseData = { success: false, words: [] };
  var game = retriever.getGame( req.data.gameID, _ );
  
  if( game.data[consts.USERNAMES][game.data[consts.TURN] % game.data[consts.PLAYER_COUNT]] == req.data[consts.USERNAME] )
  {
    responseData.words = operations.swapWords( game, req.data[consts.USERNAME], req.data.words, _ );
    
    responseData.success = true;
  }
  req.io.respond( responseData );
  
  var end = new Date().getTime();
  var time = end - start;
  console.log( "took: " + time + "ms" );
});

app.io.route( "end:turn", function( req, _ ) {
  operations.endTurn( req.data.game, _ );
});

app.io.route( "game:resign", function( req, _ )
{
  var start = new Date().getTime();
  process.stdout.write("resigning ");
  
  var ret;
  var i = 0;
  var player;
  var game = retriever.getGame( req.data.gameID, _ );
  var responseData = { success: false, playerInfo: [] };
  
  if( game.data[consts.GAME_OVER] === false )
  {
    player = retriever.getGamePlayerByID( game.id, game.data[consts.USERNAMES][i], _ );
    player.data[consts.RESIGNED] = true;
    game.data[consts.RESIGNED_COUNT]++;
    
    if( game.data[consts.RESIGNED_COUNT] + 1 >= game.data[consts.PLAYER_COUNT] ){
      game.data[consts.GAME_OVER] = true;
    }
    
    game.save(_);
    player.save(_);
    
    responseData =  fillGameUpdateData( game, responseData, _ );
    responseData.success = true;
  }
  broadcast( game, "game:update", responseData );

  var end = new Date().getTime();
  var time = end - start;
  console.log( "took: " + time + "ms" );
});

app.io.route( "manager:saveWord", function( req, _ )
{
  var start = new Date().getTime();
  process.stdout.write("saving word ");

  tools.saveWord( req.data.lemma, req.data.classes, req.data.categories, req.data,collections, req.data.versionOf, _ );
  
  var end = new Date().getTime();
  var time = end - start;
  console.log( "took: " + time + "ms" );
});

app.io.route( "manager:getAllWords", function( req, _ )
{
  var start = new Date().getTime();
  process.stdout.write("getting all words ");
  var responseData = { success:false, words: [] }
  
  responseData.words = allWords;
  responseData.success = true;
  req.io.respond( responseData );
  
  var end = new Date().getTime();
  var time = end - start;
  console.log( "took: " + time + "ms" );
});

app.io.route( "manager:manageBoards", function( req, _ )
{
  var start = new Date().getTime();
  process.stdout.write( req.data.command + " " );
  
  var responseData = { success:false }
  
  if( req.data.command === "set" ){
    responseData = boardManager.setBoard( req.data.id, req.data.level, req.data.tiles, req.data.paths, _ );
  }else if( req.data.command === "getAll" ){
    responseData = boardManager.getBoards( countNode, _ );
  }else if( req.data.command === "get" ){
    
  }else if( req.data.command === "delete" ){
    responseData = boardManager.deleteBoard( req.data.id, _ );
  }

  req.io.respond( responseData );

  var end = new Date().getTime();
  var time = end - start;
  console.log( "took: " + time + "ms" );
});

console.log("server ready");