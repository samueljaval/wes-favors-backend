// sample code for using twilio to using send text messages
require("dotenv").config()
//
const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
//
client.messages
  .create({
     body: 'hi marnie... please tell alex i have his money... hell know what to do',
     from: process.env.TWILIO_PHONE_NUMBER,
     to: '+19176974797'
   })
  .then(message => console.log(message))

// 'Hi Jacob, we noticed a recent sign-in to your google account (piazzajacob@gmail.com) in Albany, New York. If this seems suspicious to you click the link below to check it out. https://tmssl.akamaized.net/images/portrait/originals/157509-1500645606.jpg'
// message will look like the followin
//   {
//   "account_sid": "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
//   "api_version": "2010-04-01",
//   "body": "This is the ship that made the Kessel Run in fourteen parsecs?",
//   "date_created": "Thu, 30 Jul 2015 20:12:31 +0000",
//   "date_sent": "Thu, 30 Jul 2015 20:12:33 +0000",
//   "date_updated": "Thu, 30 Jul 2015 20:12:33 +0000",
//   "direction": "outbound-api",
//   "error_code": null,
//   "error_message": null,
//   "from": "+15017122661",
//   "messaging_service_sid": "MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
//   "num_media": "0",
//   "num_segments": "1",
//   "price": null,
//   "price_unit": null,
//   "sid": "SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
//   "status": "sent",
//   "subresource_uris": {
//     "media": "/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages/SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Media.json"
//   },
//   "to": "+15558675310",
//   "uri": "/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages/SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.json"
// }
