const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE messages (username TEXT, text TEXT, filePath TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

const addMessage = (username, text, filePath) => {
    db.run("INSERT INTO messages(username, text, filePath) VALUES(?, ?, ?)", [username, text, filePath]);
};

const getMessages = (callback) => {
    db.all("SELECT username, text, filePath, timestamp FROM messages ORDER BY timestamp ASC", [], (err, rows) => {
        if (err) {
            throw err;
        }
        callback(rows);
    });
};

module.exports = {
    addMessage,
    getMessages
};
