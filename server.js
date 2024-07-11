const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { addMessage, getMessages, addUser, getUser } = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ filePath: `/uploads/${req.file.filename}` });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    addUser(username, password, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Registration failed' });
        }
        res.json({ success: true });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    getUser(username, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.user = user;
                res.json({ success: true });
            } else {
                res.status(401).json({ error: 'Authentication failed' });
            }
        });
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/auth-status', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, username: req.session.user.username });
    } else {
        res.json({ authenticated: false });
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    getMessages((messages) => {
        socket.emit('previous messages', messages);
    });

    socket.on('chat message', (msg) => {
        addMessage(msg.username, msg.text, msg.filePath); // Adjusted to save messages with file paths
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
