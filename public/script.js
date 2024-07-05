var socket = io();
var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('previous messages', function(messages) {
    var messagesElement = document.getElementById('messages');
    messagesElement.innerHTML = '';
    messages.forEach(function(msg) {
        var item = document.createElement('li');
        item.textContent = msg;
        messagesElement.appendChild(item);
    });
    messagesElement.scrollTop = messagesElement.scrollHeight;
});

socket.on('chat message', function(msg) {
    var messages = document.getElementById('messages');
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('media message', function(msg) {
    var messages = document.getElementById('messages');
    var item = document.createElement('li');
    item.innerHTML = `<a href="${msg}">${msg}</a>`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});
