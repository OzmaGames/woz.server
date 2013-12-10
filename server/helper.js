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
  
  compareOrder: function( a, b )
  {
    return a.order > b.order;
  }
};
