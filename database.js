const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE messages (username TEXT, text TEXT, filePath TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)");
});

const addMessage = (username, text, filePath) => {
    db.run("INSERT INTO messages(username, text, filePath) VALUES(?, ?, ?)", [username || 'Anonymous', text, filePath]);
};

const getMessages = (callback) => {
    db.all("SELECT username, text, filePath, timestamp FROM messages ORDER BY timestamp ASC", [], (err, rows) => {
        if (err) {
            throw err;
        }
        callback(rows);
    });
};

const addUser = (username, password, callback) => {
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return callback(err);
        }
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], callback);
    });
};

const getUser = (username, callback) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            return callback(err);
        }
        callback(null, row);
    });
};

module.exports = {
    addMessage,
    getMessages,
    addUser,
    getUser
};
