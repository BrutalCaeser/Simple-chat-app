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
        const messageWithEmojis = replaceWordsWithEmojis(message);
        socket.emit('chat message', { username, message: messageWithEmojis });
        messageInput.value = '';
    }
});

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// function sendMessage() {
//     const message = messageInput.value.trim();
//     if (message !== '') {
//         const messageWithEmojis = replaceWordsWithEmojis(message);
//         socket.emit('chat message', { username, message: messageWithEmojis });
//         messageInput.value = '';
//     }
// }

function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== '') {
        if (message.startsWith('/')) {
            const slashCommand = message.split(' ')[0].toLowerCase();
            handleSlashCommand(slashCommand);
        } else {
            const messageWithEmojis = replaceWordsWithEmojis(message);
            socket.emit('chat message', { username, message: messageWithEmojis });
        }
        messageInput.value = '';
    }
}

function handleSlashCommand(slashCommand) {
    switch (slashCommand) {
        case '/help':
            showHelpDialog();
            break;
        case '/random':
            generateRandomNumber();
            break;
        case '/clear':
            clearMessages();
            break;
        default:
            // Unknown command
            break;
    }
}

function showHelpDialog() {
    const helpMessage = 'Available Slash Commands:<br>/help - Open a small dialogue box showing all the available slash commands<br>/random - Generate a random number<br>/clear - Clear the chat';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <p>${helpMessage}</p>
        </div>
    `;

    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close');
    closeButton.addEventListener('click', () => {
        modal.remove();
    });
}

function generateRandomNumber() {
    const randomInteger = Math.floor(Math.random() * 1000);
    const messageWithEmojis = replaceWordsWithEmojis(`random generated: ${randomInteger}`);
    socket.emit('slash command', { username, message: messageWithEmojis });
}

function clearMessages() {
    messages.innerHTML = '';
}



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

socket.on('slash command', (data) => {
    if (data.username === username) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = data.message;
        messages.appendChild(messageDiv);
    }
});


function replaceWordsWithEmojis(message) {
    const wordMappings = {
        "react": "⚛️",
        "woah": "😮",
        "hey": "👋",
        "lol": "😂",
        "like": "❤️",
        "congratulations": "🎉"
    };

    const words = message.split(" ");
    const transformedWords = words.map(word => {
        const lowerCaseWord = word.toLowerCase();
        return wordMappings[lowerCaseWord] || word;
    });

    return transformedWords.join(" ");
}
