var neo4j = require("neo4j"),
  mailer = require("nodemailer"),

  consts = require("./constants._js"),
  retriever = require("./retriever._js");

var smtp = mailer.createTransport( "SMTP",{
  service: "gmail",
  auth: {
    user: "ozmatheprincess@gmail.com",
    pass: "ozmaisgreat"
  }
});



module.exports =
{

  recoverPassword: function( username, _ ){
    var player = retriever.getUser( username, _ );
    var text = "Oh, you silly, here is your password: " + player.data[consts.PASSWORD] + ". Now don't go and lose it again.";
    var options = {
      from: "Princess Ozma <ozmatheprincess@gmail.com>",
      to: player.data[consts.EMAIL],
      subject: "Your marvelous password",
      text: text,
      html: "<b>" + text + "</b>"
    }
    
    smtp.sendMail( options, function( error, response ){
      if( error ){
        console.log( error );
      }else{
        console.log( "sent password recovery email to " + username );
      }
      
      smtp.close();
    });
  }
}