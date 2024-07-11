var socket = io();
var form = document.getElementById('form');
var nameInput = document.getElementById('name');
var messageInput = document.getElementById('input');
var fileInput = document.getElementById('fileInput');
var typingTimeout;

messageInput.addEventListener('input', function() {
    socket.emit('typing', { username: nameInput.value || 'Anonymous' });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stop typing', { username: nameInput.value || 'Anonymous' });
    }, 3000);
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (messageInput.value || fileInput.files.length > 0) {
        const message = {
            username: nameInput.value || 'Anonymous',
            text: messageInput.value,
            filePath: null
        };

        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                message.filePath = data.filePath;
                socket.emit('chat message', message);
                messageInput.value = '';
                fileInput.value = '';
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
        } else {
            socket.emit('chat message', message);
            messageInput.value = '';
        }
    }
});

socket.on('previous messages', function(messages) {
    var messagesElement = document.getElementById('messages');
    messagesElement.innerHTML = ''; // Clear previous messages to avoid duplication
    messages.forEach(function(msg) {
        var item = document.createElement('li');
        item.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
        if (msg.filePath) {
            item.innerHTML += ` <a href="${msg.filePath}" target="_blank">${msg.filePath}</a>`;
        }
        messagesElement.appendChild(item);
    });
    messagesElement.scrollTop = messagesElement.scrollHeight;
});

socket.on('chat message', function(msg) {
    var messages = document.getElementById('messages');
    var item = document.createElement('li');
    item.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
    if (msg.filePath) {
        item.innerHTML += ` <a href="${msg.filePath}" target="_blank">${msg.filePath}</a>`;
    }
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('typing', function(data) {
    var typingElement = document.getElementById('typing');
    if (!typingElement) {
        typingElement = document.createElement('div');
        typingElement.id = 'typing';
        typingElement.innerText = `${data.username} is typing...`;
        document.querySelector('.chat-messages').appendChild(typingElement);
    }
});

socket.on('stop typing', function() {
    var typingElement = document.getElementById('typing');
    if (typingElement) {
        typingElement.remove();
    }
});
