const WebSocket = require('ws');

let wss;
const init = (server, path) => {
    wss = new WebSocket.Server({server, path: '/ws'});
    console.log("Websocket server running");
    return wss;
}

const get = () => {
    return wss;
}

module.exports = {init, get};