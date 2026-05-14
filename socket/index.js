const { Server } = require('socket.io');
const allowedOrigins = require('../config/allowedOrigins');

/** @type {import('socket.io').Server | null} */
let io = null;

/**
 * Attach Socket.IO to the HTTP server and register connection handlers.
 * Call once during startup before accepting traffic.
 * @param {import('http').Server} server
 * @returns {import('socket.io').Server}
 */
function initSocket(server) {
    io = new Server(server, { cors: { origin: allowedOrigins } });

    io.on('connection', (socket) => {
        console.log('client connected');
        socket.on('join-table', (tableID, userID) => {
            socket.join(tableID);
        });
    });

    return io;
}

/**
 * @returns {import('socket.io').Server}
 */
function getIo() {
    if (!io) {
        throw new Error('Socket.IO not initialized; call initSocket(server) first');
    }
    return io;
}

module.exports = { initSocket, getIo };
