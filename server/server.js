const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../client')));

const roomHistories = new Map();
const MAX_HISTORY = 1000;
const roomUsers = new Map();

function generateUserColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
        '#FF8A80', '#82B1FF', '#B9F6CA', '#FFD180'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function generateUserName(roomId) {
    const roomUserMap = roomUsers.get(roomId);
    if (!roomUserMap) return 'User 1';
    const usedNumbers = new Set();
    roomUserMap.forEach(user => {
        const match = user.userName.match(/User (\d+)/);
        if (match) usedNumbers.add(parseInt(match[1]));
    });
    let userNumber = 1;
    while (usedNumbers.has(userNumber)) userNumber++;
    return `User ${userNumber}`;
}

function getRoomHistory(roomId) {
    if (!roomHistories.has(roomId)) roomHistories.set(roomId, []);
    return roomHistories.get(roomId);
}

function getRoomUsers(roomId) {
    if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
    return roomUsers.get(roomId);
}

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    let currentRoom = 'default';
    let userColor = generateUserColor();
    let userName = '';
    
    socket.on('join:room', (roomId) => {
        currentRoom = roomId || 'default';
        socket.join(currentRoom);
        console.log(`User ${socket.id} joined room: ${currentRoom}`);
        const roomHistory = getRoomHistory(currentRoom);
        const connectedUsers = getRoomUsers(currentRoom);
        userName = generateUserName(currentRoom);
        connectedUsers.set(socket.id, { 
            userId: socket.id,
            color: userColor,
            userName: userName,
            roomId: currentRoom
        });
        const users = Array.from(connectedUsers.values());
        socket.emit('init', {
            history: roomHistory,
            userId: socket.id,
            userColor: userColor,
            userName: userName,
            users: users,
            roomId: currentRoom
        });
        socket.to(currentRoom).emit('user:join', {
            userId: socket.id,
            color: userColor,
            userName: userName
        });
    });
    
    socket.on('draw:start', (data) => {
        const drawData = { ...data, userId: socket.id, timestamp: Date.now() };
        socket.to(currentRoom).emit('draw:start', drawData);
    });
    
    socket.on('draw:move', (data) => {
        const drawData = { ...data, userId: socket.id, timestamp: Date.now() };
        socket.to(currentRoom).emit('draw:move', drawData);
    });
    
    socket.on('draw:end', (data) => {
        const drawData = { ...data, userId: socket.id, timestamp: Date.now() };
        const roomHistory = getRoomHistory(currentRoom);
        roomHistory.push(drawData);
        if (roomHistory.length > MAX_HISTORY) roomHistory.shift();
        socket.to(currentRoom).emit('draw:end', drawData);
    });
    
    socket.on('cursor:move', (data) => {
        socket.to(currentRoom).emit('cursor:move', {
            userId: socket.id,
            x: data.x,
            y: data.y,
            color: data.color || '#000000'
        });
    });
    
    socket.on('undo', () => {
        const roomHistory = getRoomHistory(currentRoom);
        if (roomHistory.length > 0) {
            const removed = roomHistory.pop();
            io.to(currentRoom).emit('undo', { removed });
        }
    });
    
    socket.on('redo', () => {
        socket.to(currentRoom).emit('redo');
    });
    
    socket.on('clear', () => {
        const roomHistory = getRoomHistory(currentRoom);
        roomHistory.length = 0;
        io.to(currentRoom).emit('clear');
    });
    
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const connectedUsers = getRoomUsers(currentRoom);
        connectedUsers.delete(socket.id);
        socket.to(currentRoom).emit('user:leave', { userId: socket.id });
        if (connectedUsers.size === 0) {
            roomUsers.delete(currentRoom);
            roomHistories.delete(currentRoom);
            console.log(`Room ${currentRoom} cleaned up (empty)`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server ready for connections`);
});
