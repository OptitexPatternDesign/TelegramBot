const TelegramServer = require('telegram-test-api');
const { Api } = require('telegram-test-api')

let serverConfig = {port: 9000};
let server = new TelegramServer(serverConfig);

const token = '5918167728:AAFjT8iWDU3AvtELf1kOmgLTWYlFh3TZcHA'

let client;
server.start().then(() => {
  client = server.getClient(token);
  //
  client.sendMessage(client.makeCommand('start')).then((res) => {
    console.log(res)
  })
})