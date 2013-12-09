var neo4j = require("neo4j");
var crypto = require("crypto-js");
  
var tools = require("./tools._js");

var retriever = require("./retrievers/retriever._js");
var userRetriever = require("./retrievers/userRetriever._js");
var friendRetriever = require("./retrievers/friendRetriever._js");

var rels = require("./constants/relationships.js");
  
module.exports =
{
  addFriend: function( username, friendUsername, _ )
  { 
    var ok = false;
    
    try
    {
      var rel = friendRetriever.getRelBetweenFriends( username, friendUsername, _ );
      
      if( !rel )
      {
        var user = userRetriever.getUserByUsername( username, _ );
        var friend = userRetriever.getUserByUsername( friendUsername, _ );
        
        user.createRelationshipTo( friend, rels.IS_FRIEND_OF, {}, _ );
        ok = true;
      }
    }
    catch( ex )
    {
      console.log( "error adding friend" );
      console.log( ex );
    }
    
    return ok;
  },
  
  deleteFriend: function( username, friendUsername, _ )
  {
    var rel;
    var ok = false;
    
    try{
      rel = friendRetriever.getRelBetweenFriends( username, friendUsername, _ );
      if( rel )
      {
        rel.del( _ );
        ok = true;
      }
    }
    catch(ex)
    {
      console.log( "error deleting friend" );
      console.log( ex );
    }
    
    return ok;
  },
  
  getFriends: function( username, _ )
  {
    var i = 0;
    var friends = [];
    var friendNodes = friendRetriever.getFriends( username, _ );
    
    for( i = 0; i < friendNodes.length; i++ ){
      friends.push({
        username: friendNodes[i].data.username,
        surname: friendNodes[i].data.surname,
        name: friendNodes[i].data.name,
      });
    }
    
    return friends;
  },
  
  search: function( username, targetUsername, _ )
  {
    var i, j, k;
    var temp = {};
    var all = this.searchAll( username, targetUsername, _ );
    var fofs = this.searchFriendOfFriend( username, targetUsername, _ );
    
    k = 0;
    for( i = 0; i < all.length; i++ ){
      for( j = 0; j < fofs.length; j++ ){
        if( all[i].username === fofs[j].username )
        {
          temp = all[k];
          all[k] = all[i];
          all[i] = temp;
          k++;
        }
      }
    }
    
    return all;
  },
  
  searchAll: function( username, targetUsername, _ )
  {
    var i = 0;
    var users = [];
    var userNodes = retriever.searchUser( targetUsername, _ );
    
    for( i = 0; i < userNodes.length; i++ ){
      if( userNodes[i].data.username !== username )
      {
        users.push({
          username: userNodes[i].data.username,
          surname: userNodes[i].data.surname,
          name: userNodes[i].data.name,
        });
      }
    }
    
    return users;
  },
  
  searchFriendOfFriend: function( username, targetUsername, _ )
  {
    var i = 0;
    var fofs = [];
    var fofNodes = retriever.searchFriendOfFriend( username, targetUsername, _ );
    
    for( i = 0; i < fofNodes.length; i++ ){
      fofs.push({
        username: fofNodes[i].data.username,
        surname: fofNodes[i].data.surname,
        name: fofNodes[i].data.name,
      });
    }
    
    return fofs;
  },
};
