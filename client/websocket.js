let socket;
let currentUserId;
let userColor;
let userName;
let currentRoomId;

const remoteCursors = new Map();
const remoteUsers = new Map();

function getRoomIdFromURL() {
    const pathMatch = window.location.pathname.match(/\/room\/([^\/]+)/);
    if (pathMatch) return pathMatch[1];
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) return roomParam;
    return 'default';
}

function initWebSocket() {
    socket = io();

    socket.on('connect', () => {
        const roomId = getRoomIdFromURL();
        socket.emit('join:room', roomId);
    });

    socket.on('init', (data) => {
        currentUserId = data.userId;
        userColor = data.userColor;
        userName = data.userName || 'You';
        currentRoomId = data.roomId || 'default';
        updateConnectionStatus(true);
        updateRoomDisplay(currentRoomId);
        if (data.users) {
            data.users.forEach(user => {
                if (user.userId !== currentUserId) remoteUsers.set(user.userId, user);
            });
            updateUsersList();
        }
        if (data.history && data.history.length > 0) replayDrawingHistory(data.history);
        showToast(`Connected to room: ${currentRoomId}`, 'success');
    });

    socket.on('user:join', (data) => {
        remoteUsers.set(data.userId, {
            userId: data.userId,
            color: data.color,
            userName: data.userName || 'User'
        });
        updateUsersList();
        showToast(`${data.userName || 'A user'} joined`, 'info');
    });

    socket.on('user:leave', (data) => {
        const user = remoteUsers.get(data.userId);
        remoteUsers.delete(data.userId);
        removeCursor(data.userId);
        updateUsersList();
        if (user) showToast(`${user.userName} left`, 'info');
    });

    socket.on('draw:start', (data) => remoteDrawStart(data));
    socket.on('draw:move', (data) => remoteDrawMove(data));
    socket.on('draw:end', (data) => remoteDrawEnd(data));
    socket.on('cursor:move', (data) => updateRemoteCursor(data));
    socket.on('undo', () => performRemoteUndo());
    socket.on('redo', () => performRemoteRedo());
    socket.on('clear', () => performRemoteClear());

    socket.on('disconnect', () => {
        updateConnectionStatus(false);
        showToast('Disconnected from server', 'error');
    });

    socket.on('reconnect', () => {
        updateConnectionStatus(true);
        showToast('Reconnected to server', 'success');
    });
}

function emitDrawStart(x, y, color, size) {
    if (socket && socket.connected) socket.emit('draw:start', { x, y, color, size });
}

function emitDrawMove(x, y, color, size) {
    if (socket && socket.connected) socket.emit('draw:move', { x, y, color, size });
}

function emitDrawEnd(path) {
    if (socket && socket.connected) socket.emit('draw:end', { path });
}

function emitCursorMove(x, y) {
    if (socket && socket.connected) socket.emit('cursor:move', { x, y });
}

function emitUndo() {
    if (socket && socket.connected) socket.emit('undo');
}

function emitRedo() {
    if (socket && socket.connected) socket.emit('redo');
}

function emitClear() {
    if (socket && socket.connected) socket.emit('clear');
}

function replayDrawingHistory(history) {
    if (typeof replayHistory === 'function') replayHistory(history);
}

function remoteDrawStart(data) {
    if (typeof handleRemoteDrawStart === 'function') handleRemoteDrawStart(data);
}

function remoteDrawMove(data) {
    if (typeof handleRemoteDrawMove === 'function') handleRemoteDrawMove(data);
}

function remoteDrawEnd(data) {
    if (typeof handleRemoteDrawEnd === 'function') handleRemoteDrawEnd(data);
}

function performRemoteUndo() {
    if (typeof handleRemoteUndo === 'function') handleRemoteUndo();
}

function performRemoteRedo() {
    if (typeof handleRemoteRedo === 'function') handleRemoteRedo();
}

function performRemoteClear() {
    if (typeof handleRemoteClear === 'function') handleRemoteClear();
}

function updateRemoteCursor(data) {
    if (!remoteCursors.has(data.userId)) {
        const user = remoteUsers.get(data.userId) || { userName: 'User', color: data.color };
        createCursorElement(data.userId, user.color, user.userName);
    }
    const cursor = remoteCursors.get(data.userId);
    if (cursor) {
        cursor.style.left = data.x + 'px';
        cursor.style.top = (data.y + 64) + 'px';
        cursor.style.display = 'block';
    }
}

function createCursorElement(userId, color, userName) {
    const cursorContainer = document.createElement('div');
    cursorContainer.className = 'remote-cursor';
    cursorContainer.style.position = 'absolute';
    cursorContainer.style.pointerEvents = 'none';
    cursorContainer.style.zIndex = '9999';
    cursorContainer.style.transition = 'left 0.05s, top 0.05s';
    cursorContainer.style.display = 'none';
    const dot = document.createElement('div');
    dot.style.width = '14px';
    dot.style.height = '14px';
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = color;
    dot.style.border = '2px solid white';
    dot.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    const label = document.createElement('div');
    label.className = 'cursor-label';
    label.textContent = userName;
    label.style.backgroundColor = color;
    cursorContainer.appendChild(dot);
    cursorContainer.appendChild(label);
    document.body.appendChild(cursorContainer);
    remoteCursors.set(userId, cursorContainer);
}

function removeCursor(userId) {
    const cursor = remoteCursors.get(userId);
    if (cursor) {
        cursor.remove();
        remoteCursors.delete(userId);
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    const messageEl = document.createElement('span');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    toast.appendChild(icon);
    toast.appendChild(messageEl);
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s, transform 0.3s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateConnectionStatus(isConnected) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const clearBtn = document.getElementById('clearBtn');
    if (statusDot && statusText) {
        if (isConnected) {
            statusDot.classList.remove('offline');
            statusDot.classList.add('online');
            statusText.textContent = 'Connected';
            if (undoBtn) {
                undoBtn.removeAttribute('data-disconnected');
                undoBtn.disabled = false;
            }
            if (redoBtn) {
                redoBtn.removeAttribute('data-disconnected');
                redoBtn.disabled = false;
            }
            if (clearBtn) clearBtn.disabled = false;
        } else {
            statusDot.classList.remove('online');
            statusDot.classList.add('offline');
            statusText.textContent = 'Disconnected';
            if (undoBtn) {
                undoBtn.setAttribute('data-disconnected', 'true');
                undoBtn.disabled = true;
            }
            if (redoBtn) {
                redoBtn.setAttribute('data-disconnected', 'true');
                redoBtn.disabled = true;
            }
            if (clearBtn) clearBtn.disabled = true;
        }
    }
}

function updateUsersList() {
    const usersList = document.getElementById('usersList');
    const userCount = document.getElementById('userCount');
    if (!usersList) return;
    usersList.innerHTML = '';
    const currentUserItem = document.createElement('div');
    currentUserItem.className = 'user-item';
    currentUserItem.innerHTML = `
        <div class="user-color" style="background: ${userColor}"></div>
        <div class="user-info">
            <div class="user-name">You</div>
            <div class="user-status">Drawing</div>
        </div>
    `;
    usersList.appendChild(currentUserItem);
    remoteUsers.forEach((user) => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-color" style="background: ${user.color}"></div>
            <div class="user-info">
                <div class="user-name">${user.userName}</div>
                <div class="user-status">Online</div>
            </div>
        `;
        usersList.appendChild(userItem);
    });
    if (userCount) userCount.textContent = remoteUsers.size + 1;
}

function updateRoomDisplay(roomId) {
    const logo = document.querySelector('.logo');
    if (logo && roomId !== 'default') {
        logo.textContent = `Canvas - Room: ${roomId}`;
        logo.title = `You are in room: ${roomId}`;
    }
}
