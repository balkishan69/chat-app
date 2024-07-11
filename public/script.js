var socket = io();
var form = document.getElementById('form');
var input = document.getElementById('input');
var fileInput = document.getElementById('fileInput');
var registerForm = document.getElementById('register-form');
var loginForm = document.getElementById('login-form');
var logoutButton = document.getElementById('logout-button');
var username = '';

function toggleAuthUI(authenticated) {
    document.querySelector('.auth-container').style.display = authenticated ? 'none' : 'block';
    document.querySelector('.chat-container').style.display = authenticated ? 'block' : 'none';
    logoutButton.style.display = authenticated ? 'block' : 'none';
}

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var username = document.getElementById('register-username').value;
    var password = document.getElementById('register-password').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Registration successful! Please log in.');
        } else {
            alert('Registration failed. Try a different username.');
        }
    });
});

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var loginUsername = document.getElementById('login-username').value;
    var password = document.getElementById('login-password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: loginUsername, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Login successful!');
            username = loginUsername; // Set the username after successful login
            toggleAuthUI(true);
        } else {
            alert('Login failed. Check your credentials.');
        }
    });
});

logoutButton.addEventListener('click', function() {
    fetch('/logout', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Logged out successfully.');
            username = ''; // Clear the username on logout
            toggleAuthUI(false);
        }
    });
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value || fileInput.files.length > 0) {
        const message = {
            username: username || 'Anonymous',
            text: input.value,
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

fetch('/auth-status')
    .then(response => response.json())
    .then(data => {
        toggleAuthUI(data.authenticated);
        if (data.authenticated) {
            username = data.username;
        }
    });
