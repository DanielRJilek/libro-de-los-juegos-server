const WebSocket = require('ws');

let wss;

const init = (server, path) => {
    wss = new WebSocket.Server({server, path: '/ws'});
    console.log("Websocket server running");
    wss.on('connection', function connection(ws) {
        console.log("Client connected");
        ws.send("Hello client!");
        ws.on('error', console.error);
    
        ws.on('message', function message(data) {
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        });
        
    });
    wss.broadcast = function broadcast(data){
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
    wss.on('close', () => {
        console.log("client disconnected");
    });
    
    return wss;
}

const get = () => {
    if (wss) {
        return wss;
    }
}

module.exports = {init, get};