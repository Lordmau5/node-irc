class Channel {
    constructor(channelName) {
        this._users = Set();
        this.userModePrefix = [];
        this.key = channelName.toLowerCase();
        this.serverName = channelName;
        this.created = null;
        this.mode = "";
        this.topic = null;
        this.topicBy = null;
    }

    get users() {
        return this.userModePrefix;
    }

    setUserPrefix(nick, mode) {
        this.userModePrefix[nick] = mode;
    }

    clearUserPrefix(nick, mode) {
        this.userModePrefix[nick] = "";
    }

    addUserPrefix(nick, mode) {
        if (!this._users.has(nick)) {
            return;
        }
        if (!this.userModePrefix[nick].includes(mode)) {
            this.userModePrefix += mode;
        }
    }

    removeUserPrefix(nick, mode) {
        if (!this._users.has(nick)) {
            return;
        }
        this.userModePrefix[nick] = this.userModePrefix[nick].replace(mode, '');
    }

    changeUserNick(oldNick, newNick) {
        this._users.add(newNick);
        // If we didn't delete the old nick, then we don't need to change the mode.
        if (!this._users.delete(oldNick)) {
            return;
        }
        this.userModePrefix[newNick] = this.userModePrefix[oldNick];
        delete this.userModePrefix[oldNick];
    }

    userInChannel(nick) {
        return this._users.has(nick);
    }

    addUser(nick) {
        if (this._users.add(nick)) {
            this.userModePrefix[nick] = "";
            return true;
        }
        return false;
    }

    removeUser(nick) {
        if (this._users.delete(nick)) {
            delete this.userModePrefix[nick];
            return true;
        }
        return false;
    }
}

/* A class to be shared between client instances to reduce memory footprint */
class ChannelCache {
    constructor() {
        this.channels = new Map(); /* channelname -> Channel */
        this.clientChannels = new Map(); /* client_id:Set(channelname) */
    }

    /**
     * Mark the client as joined to the channel.
     * @param {number} clientId The ID of the connection.
     * @param {string} channelName The IRC channel name.
     */
    markClientJoined(clientId, channelName) {
        let channelSet = this.clientChannels.get(clientId);
        if (channelSet === undefined) {
            channelSet = new Set();
            this.clientChannels.set(clientId, channelSet);
        }
        const key = channelName.toLowerCase();
        return channelSet.add(key);
    }
    /**
     * Mark the client as left from the channel.
     * @param {number} clientId The ID of the connection.
     * @param {string} channelName The IRC channel name.
     */
    markClientLeft(clientId, channelName) {
        let channelSet = this.clientChannels.get(clientId);
        if (channelSet === undefined) {
            return;
        }
        const key = channelName.toLowerCase();
        let res = channelSet.delete(key);
        if (res && channelSet.size === 0) {
            this.clientChannels.delete(clientId);
        }
        return res;
    }
    
    createChannel(channelName) {
        const key = channelName.toLowerCase();
        if (this.channels.has(key)) {
            return false;
        }
        this.channels.set({
            users: new Set(),
            serverName: channelName,
            key,
            mode: ""
        });
    }

    addUserToChannel(channelName, user) {
        const key = channelName.toLowerCase();
        let chan = this.channels.get(key)
        if (chan === undefined) {
            return; //Dropping this because we don't know about the channel yet.
        }
    }

    removeUserFromChannel(channel, user) {

    }

    setChannelMode() {

    }

    getChannelList(clientId) {
        return [...this.clientChannels.get(clientId)];
    }

    getChannels(clientId) {
        return this.clientChannels.get(clientId).map((chan) => this.channels.get(chan));
    }

    getChannelForClient(clientId, channelName) {
        const key = channelName.toLowerCase();
        if (this.clientChannels.get(clientId).has(key)) {
            return this.channels.get(key);
        }
    }
}

module.exports = ChannelCache;