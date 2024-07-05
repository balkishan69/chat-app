const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE messages (text TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

const addMessage = (text) => {
    db.run(`INSERT INTO messages(text) VALUES(?)`, [text]);
};

const getMessages = (callback) => {
    db.all(`SELECT text, timestamp FROM messages ORDER BY timestamp ASC`, [], (err, rows) => {
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
