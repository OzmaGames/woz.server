var neo4j = require("neo4j"),
  crypto = require("crypto-js"),
  
  tools = require("./tools._js"),
  
  types = require( "./constants/types.js" ),
  indexes = require( "./constants/indexes.js" ),
  consts = require( "./constants/constants.js" ),
  props = require( "./constants/properties.js" ),
  rels = require("./constants/relationships.js"),
  environment = require("./constants/environment.js"),
  
  retriever = require("./retrievers/retriever._js"),
  userRetriever = require("./retrievers/userRetriever._js");

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
      
      if( !userRetriever.getUserByUsername( username, _ ) &&  !retriever.getUserByEmail( email, _ ) )
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
      var user = userRetriever.getUserByUsername( username, _ );
      if( user ){
        if( user.data[props.USER.PASSWORD] == crypto.SHA3( user.data[props.USER.SALT] + password ) ){
          ret = user;
        }
      }
    }catch(ex){
      console.log(ex);
    }
    
    return ret;
  }
};
