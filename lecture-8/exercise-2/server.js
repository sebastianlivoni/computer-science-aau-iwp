const WebSocketServer = require('websocket').server;
const http = require('http')

const server = http.createServer((request, response) => {
  response.end('Hej')
})

let connections = []

server.listen(3000, () => {
  console.log('Server is live!')
})

let wsServer = new WebSocketServer({
  httpServer: server
})

wsServer.on('request', (request) => {
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' accepted.')
    let con = request.accept()
    let username = Math.floor((Math.random() * 100000)).toString()
    
    connections.push({username: username,connection: con })
    
    con.on("message", (message) => {
        console.log('Received Message: ' + message.utf8Data);
        broadCastMessage(username, message.utf8Data)
    })
})

function broadCastMessage(user, message) {
    connections.forEach((elem) => {
        elem.connection.sendUTF(user +": " + message);
    })
}