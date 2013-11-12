var neo4j = require("neo4j"),
  crypto = require("crypto-js"),
  
    tools = require("./tools._js"),
    types = require("./types._js"),  
    indexes = require("./indexes._js"),
    props = require("./properties._js"),
    consts = require("./constants._js" ),
    rels = require("./relationships._js"),
    retriever = require("./retriever._js"),
    environment = require("./environment._js");

var db = new neo4j.GraphDatabase(environment.DB_URL);
  
module.exports =
{

  addUser: function( username, password, email, name, surname, language, besoz, _ )
  {
    var ok = false;
    
    try
    {
      var salt = crypto.lib.WordArray.random(512/8).toString();
      
      password = salt + password;
      password = crypto.SHA3( password ).toString();
      
      if( !retriever.getUser( username, _ )  )
      {
        var user = tools.createNode({
          type: types.USER,
          username : username,
          salt: salt,
          password : password,
          email: email,
          name: name,
          surname: surname,
          language: language,
          gamesPlayed: 0,
          besoz: besoz,
          nGames: 0
        }, _ );
        
        user.index( indexes.USER_INDEX, props.USER.USERNAME, username, _ );
        
        ok = true;
      }
    }catch( ex ){
      console.log( ex );
    }
    
    return ok;
  },
  
  login: function( username, password, _ )
  {
    
    return true;
    
    var authed = false;
    
    try{
      var user = retriever.getUser( username, _ );
      if( user ){
        if( user.data[props.USER.PASSWORD] == crypto.SHA3( user.data[props.USER.SALT] + password ) ){
          authed = user;
        }
      }
    }catch(ex){
      console.log(ex);
    }
    
    return authed;
  }
};
