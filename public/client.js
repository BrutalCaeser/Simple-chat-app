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
const valuesMap = {};
function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== '') {
        if (message.startsWith('/')) {
            const parts = message.split(' ');
            const slashCommand = message.split(' ')[0].toLowerCase();
            const args = parts.slice(1);
            handleSlashCommand(slashCommand,args);
        } else {
            const messageWithEmojis = replaceWordsWithEmojis(message);
            socket.emit('chat message', { username, message: messageWithEmojis });
        }
        messageInput.value = '';
    }
}

function handleSlashCommand(command,args) {
   
    switch (command) {
        case '/help':
            showHelpDialog();
            break;
        case '/random':
            generateRandomNumber();
            break;
        case '/clear':
            clearMessages();
            break;
        case '/rem':
            handleRemCommand(args);
            break;
        case '/calc':
            handleCalcCommand(args);
            break;
        default:
            // Unknown command
            break;
    }
}

function showHelpDialog() {
    const helpMessage = 'Available Slash Commands:<br>/help - Open a small dialogue box showing all the available slash commands<br>/random - Generate a random number<br>/clear - Clear the chat<br>/rem - Store name value pair<br>/calc - Your Chat Calculator' ;

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

function handleRemCommand(args) {
    const name = args[0];
    const value = args.slice(1).join(' ');

    if (!name) {
        
        return;
    }

    if (value) {
        // Set value
        valuesMap[name] = value;
        const message = `Stored ${name}: ${value}`;
        displayMessage(message);
    } else {
         // Recall value
         const storedValue = valuesMap[name];
         if (storedValue !== undefined) {
             const message = `${name}: ${storedValue}`;
             displayMessage(message);
         } else {
             const message = `${name} not found`;
             displayMessage(message);
         }
     }
 }

 function handleCalcCommand(args) {
    const expression = args.join(' ');

    try {
        const result = eval(expression);
        if (result !== undefined) {
            const message = `Result: ${expression} = ${result}`;
            displayMessage(message);
        } else {
            const message = `Invalid calculation`;
            displayMessage(message);
        }
    } catch (error) {
        const message = `Error: ${error.message}`;
        displayMessage(message);
    }
}

 function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messages.appendChild(messageElement);
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

socket.on('user count', (count) => {
    const userCountElement = document.getElementById('user-count');
    userCountElement.textContent = `Online Users: ${count}`;
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
