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
        item.textContent = msg.text;
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


var typing = false;
var timeout = undefined;

var form = document.getElementById('form');
var input = document.getElementById('input');
var messages = document.getElementById('messages');

input.addEventListener('keypress', function() {
    if (!typing) {
        typing = true;
        socket.emit('typing', true);
        clearTimeout(timeout);
        timeout = setTimeout(stopTyping, 3000);
    } else {
        clearTimeout(timeout);
        timeout = setTimeout(stopTyping, 3000);
    }
});

function stopTyping() {
    typing = false;
    socket.emit('typing', false);
}

socket.on('typing', function(data) {
    var typingElement = document.getElementById('typing');
    if (data) {
        if (!typingElement) {
            var item = document.createElement('li');
            item.id = 'typing';
            item.textContent = 'Someone is typing...';
            messages.appendChild(item);
        }
    } else {
        if (typingElement) {
            messages.removeChild(typingElement);
        }
    }
});
