var neo4j = require("neo4j"),
  crypto = require("crypto-js"),
  environment = require("./environment._js"),
  
  types = require( "./types._js" ),
  rels = require("./relationships._js"),
  props = require( "./properties._js" ),
  consts = require( "./constants._js" ),
  
  tools = require("./tools._js"),
  retriever = require("./retriever._js");

var db = new neo4j.GraphDatabase(environment.DB_URL);
  
module.exports =
{
  addUser: function( username, password, email, name, surname, language, besoz, _ )
  {
    var ret = false;
    
    try
    {
      var salt = crypto.lib.WordArray.random(512/8).toString();
      
      password = salt + password;
      password = crypto.SHA3( password ).toString();
      
      if( !retriever.getUserByUsername( username, _ ) &&  !retriever.getUserByEmail( email, _ ) )
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
        
        user.index( indexes.USER_USERNAME_INDEX, props.USER.USERNAME, username, _ );
        user.index( indexes.USER_EMAIL_INDEX, props.USER.EMAIL, email, _ );
        
        ret = true;
      }
    }catch( ex ){
      console.log( ex );
    }
    
    return ret;
  },
  
  login: function( username, password, _ )
  {
    
    return true;
    
    var ret = false;
    
    try{
      var user = retriever.getUserByUsername( username, _ );
      if( user ){
        if( user.data[props.USER.PASSWORD] == crypto.SHA3( user.data[props.USER.SALT] + password ) ){
          ret = user;
        }
      }
    }catch(ex){
      console.log(ex);
    }
    
    return ret;
  },
  
  addFriend: function( username, friendUsername, _ )
  { 
    var ret = false;
    
    try{
      var user = retriever.getUserByUsername( username, _ );
      var friend = retriever.getUserByUsername( friendUsername, _ );
      
      user.createRelationship( friend, rels.IS_FRIEND, {}, _ );
      ret = true;
    }catch(ex){
      console.log(ex);
    }
    
    return ret;
  },
  
  searchFriendOfFriend: function( username, friendUsername, _ )
  {
    var ret = false;
    
    try{
      var user = retriever.getUserByUsername( username, _ );
      
      
    }catch(ex){
      console.log(ex);
    }
    
    return ret;
  },
};
