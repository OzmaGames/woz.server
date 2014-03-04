var oz = oz || {};

module.exports =
{ 
  logError: function( err )
  {
    if(err)
    {
      console.error( err );
    }
  },
  
  compareMagnetOrder: function( a, b )
  {
    return a.magnet.order - b.magnet.order;
  }
};
