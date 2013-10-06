var neo4j = require("neo4j"),
  crypto = require("crypto-js"),
  
    tools = require("./tools._js"),
    consts = require("./constants._js" ),
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
          type: consts.USER,
          username : username,
          salt: salt,
          password : password,
          email: email,
          name: name,
          surname: surname,
          language: language,
          besoz: besoz
        }, _ );
        user.index( consts.USER_INDEX, consts.USERNAME, username, _ );
        ok = true;
      }
    }catch( ex ){
      console.log( ex );
    }
    
    return ok;
  },
  
  login: function( username, password, _ )
  {
    var authed = false;
    try{
      var user = retriever.getUser( username, _ );
      if( user ){
        if( user.data[consts.PASSWORD] == crypto.SHA3( user.data[consts.SALT] + password ) ){
          authed = user;
        }
      }
    }catch(ex){
      console.log(ex);
    }
    
    return authed;
  }
};
