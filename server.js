const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { addMessage, getMessages } = require('./database');
const multer = require('multer');
const fs = require('fs');

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

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ filePath: `/uploads/${req.file.filename}` });
});

io.on('connection', (socket) => {
    console.log('New client connected');

    getMessages((messages) => {
        socket.emit('previous messages', messages);
    });

    socket.on('chat message', (msg) => {
        addMessage(msg);
        io.emit('chat message', msg);
    });

    socket.on('media message', (msg) => {
        addMessage(msg);
        io.emit('media message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
