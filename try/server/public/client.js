// DOM Elements
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const usernameInput = document.getElementById('username');
const joinChatButton = document.getElementById('join-chat');

// Connect to Socket.io server
const socket = io('http://localhost:3000');

let username = '';
const room = 'general'; // Default room

// Format timestamp
function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Create message element
function createMessageElement(message, isOwnMessage) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwnMessage ? 'sent' : 'received'}`;

    const senderDiv = document.createElement('div');
    senderDiv.className = 'sender';
    senderDiv.textContent = message.sender;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.textContent = message.content;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'time';
    timeDiv.textContent = formatTime(message.timestamp);

    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);

    return messageDiv;
}

// Add message to chat
function addMessage(message) {
    const isOwnMessage = message.sender === username;
    const messageElement = createMessageElement(message, isOwnMessage);
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Handle joining chat
joinChatButton.addEventListener('click', () => {
    if (usernameInput.value.trim()) {
        username = usernameInput.value.trim();
        socket.emit('join', room);
        
        // Enable chat interface
        messageInput.disabled = false;
        sendButton.disabled = false;
        usernameInput.disabled = true;
        joinChatButton.disabled = true;
        
        // Add system message
        addMessage({
            sender: 'System',
            content: `Welcome to the chat, ${username}!`,
            timestamp: new Date()
        });
    }
});

// Handle sending messages
function sendMessage() {
    const content = messageInput.value.trim();
    if (content && username) {
        const message = {
            content,
            sender: username,
            room,
            timestamp: new Date()
        };
        socket.emit('send_message', message);
        messageInput.value = '';
    }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Socket event handlers
socket.on('message_history', (messages) => {
    messages.forEach(message => addMessage(message));
});

socket.on('new_message', (message) => {
    addMessage(message);
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
    addMessage({
        sender: 'System',
        content: 'Error: ' + error.message,
        timestamp: new Date()
    });
});

// Handle connection status
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    addMessage({
        sender: 'System',
        content: 'Disconnected from server. Trying to reconnect...',
        timestamp: new Date()
    });
});
