const { EVENTS, userRoom } = require('./events');

/**
 * @param {import('socket.io').Server} io
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {{ type: string, title: string, body: string, meta?: object }} notification
 */
function emitNotification(io, userId, notification) {
    const { type, title, body, meta = {} } = notification;
    io.to(userRoom(userId)).emit(EVENTS.NOTIFICATION, { type, title, body, meta });
}

/**
 * @param {import('socket.io').Server} io
 * @param {string|import('mongoose').Types.ObjectId} tableId
 * @param {string} kind — use TABLE_UPDATE_KIND from ./events
 * @param {Record<string, unknown>} [data]
 */
function emitTableUpdate(io, tableId, kind, data = {}) {
    io.to(String(tableId)).emit(EVENTS.TABLE_UPDATE, { kind, ...data });
}

/**
 * Direct / thread messaging 
 * @param {import('socket.io').Server} io
 * @param {string|import('mongoose').Types.ObjectId} recipientUserId
 * @param {{ threadId: string, from: object, text: string, [key: string]: unknown }} payload
 */
function emitMessageNew(io, recipientUserId, payload) {
    io.to(userRoom(recipientUserId)).emit(EVENTS.MESSAGE_NEW, payload);
}

module.exports = { emitNotification, emitTableUpdate, emitMessageNew };
