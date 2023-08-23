const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

const users = new Set(); // Track connected users
const chatHistory = []; // Store chat history

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        if (socket.username) {
            users.delete(socket.username);
            io.emit('user list', getUserList());
            console.log(`${socket.username} disconnected`);
        }
    });

    socket.on('set username', (username) => {
        socket.username = username;
        users.add(username);
        io.emit('user list', getUserList());
        sendChatHistory(socket);
    });

    socket.on('chat message', (data) => {
        chatHistory.push(data);
        io.emit('chat message', data); // Broadcast the message to all connected clients
    });
});

function getUserList() {
    return Array.from(users);
}

function sendChatHistory(socket) {
    chatHistory.forEach(message => {
        socket.emit('chat message', message);
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
