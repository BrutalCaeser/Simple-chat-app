const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

const users = {}; // Track connected users

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            const username = users[socket.id];
            delete users[socket.id];
            io.emit('user list', getUserList());
            console.log(`${username} disconnected`);
        }
    });

    socket.on('set username', (username) => {
        socket.username = username;
        users[socket.id] = username;
        io.emit('user list', getUserList());
    });

    socket.on('chat message', (data) => {
        io.emit('chat message', data); // Broadcast the message to all connected clients
    });
});

function getUserList() {
    return Object.values(users);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
