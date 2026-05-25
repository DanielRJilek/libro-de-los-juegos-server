/**
 * Socket.IO event names
 */
const EVENTS = {
    NOTIFICATION: 'notification',
    TABLE_UPDATE: 'table-update',
    MESSAGE_NEW: 'message:new',
};

/** `table-update` payload discriminator */
const TABLE_UPDATE_KIND = {
    GAME_START: 'game-start',
    STATE: 'state',
    PLAYER_JOINED: 'player-joined',
    GAME_ENDED: 'game-ended',
};

const NOTIFICATION_TYPE = {
    FRIEND_REQUEST: 'friend_request',
    GAME_INVITE: 'game_invite',
    FRIEND_ACCEPTED: 'friend_accepted',
    SYSTEM: 'system',
};

function userRoom(userId) {
    return `user:${String(userId)}`;
}

/**
 * @param {{ type: string, title: string, body: string, meta?: object }} p
 * @returns {{ type: string, title: string, body: string, meta: object }}
 */
function buildNotification({ type, title, body, meta = {} }) {
    return { type, title, body, meta };
}

module.exports = {EVENTS, TABLE_UPDATE_KIND, NOTIFICATION_TYPE, userRoom, buildNotification};
