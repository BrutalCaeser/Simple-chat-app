const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('set username', (username) => {
        socket.username = username;
        io.emit('user list', getUserList());
    });

    socket.on('chat message', (data) => {
        io.emit('chat message', data); // Broadcast the message to all connected clients
    });
});

function getUserList() {
    const users = [];
    io.sockets.sockets.forEach(socket => {
        if (socket.username) {
            users.push(socket.username);
        }
    });
    return users;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
