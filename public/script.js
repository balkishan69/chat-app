var socket = io();
var form = document.getElementById('form');
var input = document.getElementById('input');
var username = document.getElementById('username');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value && username.value) {
        const message = {
            username: username.value,
            text: input.value
        };
        socket.emit('chat message', message);
        input.value = '';
    }
});

socket.on('previous messages', function(messages) {
    var messagesElement = document.getElementById('messages');
    messagesElement.innerHTML = '';
    messages.forEach(function(msg) {
        var item = document.createElement('li');
        item.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
        messagesElement.appendChild(item);
    });
    messagesElement.scrollTop = messagesElement.scrollHeight;
});

socket.on('chat message', function(msg) {
    var messages = document.getElementById('messages');
    var item = document.createElement('li');
    item.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});
