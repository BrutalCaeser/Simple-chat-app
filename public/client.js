const socket = io(); // Connect to the Socket.io server

const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');
const userList = document.getElementById('user-list');

let username = '';

// Prompt user for username
while (!username) {
    username = prompt('Please enter your username:');
}

socket.emit('set username', username);

sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message !== '') {
        socket.emit('chat message', { username, message });
        messageInput.value = '';
    }
});

socket.on('user list', (users) => {
    userList.innerHTML = '';
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.textContent = user;
        userList.appendChild(userDiv);
    });
});

socket.on('chat message', (data) => {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${data.username}: ${data.message}`;
    messages.appendChild(messageDiv);
});
