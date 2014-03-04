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
      module.exports.DB_URL = "http://WozDevel:p4Fsf0BhTQ0qs36O8Guv@wozdevel.sb01.stations.graphenedb.com:24789";
      break;
    
    case "testing":
      console.log( "environment is testing" );
      module.exports.DB_URL = "http://WozTesting:jxE98rlWtUhDOlZEJrTO@woztesting.sb01.stations.graphenedb.com:24789";
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
