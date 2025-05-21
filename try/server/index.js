const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const messageController = require('./controllers/messageController');

const app = express();
app.use(cors());
app.use(express.json());
// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Debug routes for static files
app.get('/styles.css', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'styles.css');
    console.log('Serving styles.css from:', filePath);
    res.sendFile(filePath);
});

app.get('/client.js', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'client.js');
    console.log('Serving client.js from:', filePath);
    res.sendFile(filePath);
});

// Connect to MongoDB
let dbConnection = null;
(async () => {
    dbConnection = await connectDB();
})();

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// REST endpoint to get messages
app.get('/messages', messageController.getMessages);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle joining a room
    socket.on('join', async (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
        
        // Send recent messages to the user if DB is connected
        if (dbConnection) {
            try {
                const messages = await messageController.getRecentMessages(room);
                socket.emit('message_history', messages);
            } catch (error) {
                console.error('Error fetching message history:', error);
                socket.emit('error', { message: 'Error fetching message history' });
            }
        }
    });

    // Handle new messages
    socket.on('send_message', async (data) => {
        // Broadcast message to all clients in the room immediately
        io.to(data.room).emit('new_message', {
            ...data,
            timestamp: new Date()
        });

        // Save to database if connected
        if (dbConnection) {
            try {
                await messageController.saveMessage(data);
            } catch (error) {
                console.error('Error saving message:', error);
                socket.emit('error', { message: 'Message sent but not saved to database' });
            }
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
