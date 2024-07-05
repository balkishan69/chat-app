var socket = io();
var form = document.getElementById('form');
var input = document.getElementById('input');
var username = document.getElementById('username');
var fileInput = document.getElementById('fileInput');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value || fileInput.files.length > 0) {
        const message = {
            username: username.value || 'Anonymous',
            text: input.value
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
                input.value = '';
                fileInput.value = '';
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
        } else {
            socket.emit('chat message', message);
            input.value = '';
        }
    }
});

socket.on('previous messages', function(messages) {
    var messagesElement = document.getElementById('messages');
    messagesElement.innerHTML = ''; // Clear previous messages to avoid duplication
    messages.forEach(function(msg) {
        var item = document.createElement('li');
        if (msg.filePath) {
            item.innerHTML = `<strong>${msg.username}:</strong> <a href="${msg.filePath}" target="_blank">${msg.filePath}</a>`;
        } else {
            item.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
        }
        messagesElement.appendChild(item);
    });
    messagesElement.scrollTop = messagesElement.scrollHeight;
});

socket.on('chat message', function(msg) {
    var messages = document.getElementById('messages');
    var item = document.createElement('li');
    if (msg.filePath) {
        item.innerHTML = `<strong>${msg.username}:</strong> <a href="${msg.filePath}" target="_blank">${msg.filePath}</a>`;
    } else {
        item.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
    }
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});
