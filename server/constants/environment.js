var oz = oz || {};

module.exports =
{
  IS_HEROKU: false,
  DB_URL: "http://localhost:7474"
};

if ( process.env.IS_HEROKU )
{
  console.log( "environment is heroku" );
  module.exports.IS_HEROKU = true;

  switch( process.env.ENVIRONMENT )
  {
    case "development":
      console.log( "environment is development" );
      module.exports.DB_URL = "http://9b185eb71:190a55498@948891172.hosted.neo4j.org:7759";
      break;
    
    case "testing":
      console.log( "environment is testing" );
      module.exports.DB_URL = "http://023028cba:cc90afdd5@582127fb2.hosted.neo4j.org:7262";
      break;
    
    default:
      console.log( "Environment is something else (probably demo)." );
      module.exports.DB_URL = "http://d4f8ce8e5:1a8cb35f8@508dff18e.hosted.neo4j.org:7758";
      break;
  }
}
else
{
  console.log( "environment is local" );
}
