let canvas, ctx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

let currentStrokePath = [];

const remoteDrawingState = new Map();

let lastCursorEmit = 0;
const CURSOR_THROTTLE = 50;

let undoStack = [];
let redoStack = [];
const MAX_HISTORY = 50;

function initCanvas(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    resizeCanvas();
    
    setupEventListeners();
    
    saveState();
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    
    const width = window.innerWidth;
    const height = window.innerHeight - 64;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    ctx.scale(dpr, dpr);
    
    ctx.putImageData(imageData, 0, 0);
    
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

function setupEventListeners() {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;
    
    currentStrokePath = [{ x: pos.x, y: pos.y }];
    
    if (typeof emitDrawStart === 'function') {
        emitDrawStart(pos.x, pos.y, getCurrentColor(), getCurrentSize());
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    e.preventDefault();
    
    const pos = getMousePos(e);
    
    ctx.strokeStyle = getCurrentColor();
    ctx.lineWidth = getCurrentSize();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    currentStrokePath.push({ x: pos.x, y: pos.y });
    
    if (typeof emitDrawMove === 'function') {
        emitDrawMove(pos.x, pos.y, getCurrentColor(), getCurrentSize());
    }
    
    const now = Date.now();
    if (typeof emitCursorMove === 'function' && now - lastCursorEmit > CURSOR_THROTTLE) {
        emitCursorMove(pos.x, pos.y);
        lastCursorEmit = now;
    }
    
    lastX = pos.x;
    lastY = pos.y;
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        
        if (typeof emitDrawEnd === 'function' && currentStrokePath.length > 0) {
            emitDrawEnd({
                path: currentStrokePath,
                color: getCurrentColor(),
                size: getCurrentSize()
            });
        }
        
        currentStrokePath = [];
        saveState();
    }
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function saveState() {
    redoStack = [];
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(imageData);
    
    if (undoStack.length > MAX_HISTORY) {
        undoStack.shift();
    }
    
    updateUndoRedoButtons();
}

function undo() {
    if (undoStack.length <= 1) return;
    
    const currentState = undoStack.pop();
    redoStack.push(currentState);
    
    const previousState = undoStack[undoStack.length - 1];
    ctx.putImageData(previousState, 0, 0);
    
    if (typeof emitUndo === 'function') {
        emitUndo();
    }
    
    updateUndoRedoButtons();
}

function redo() {
    if (redoStack.length === 0) return;
    
    const state = redoStack.pop();
    undoStack.push(state);
    
    ctx.putImageData(state, 0, 0);
    
    if (typeof emitRedo === 'function') {
        emitRedo();
    }
    
    updateUndoRedoButtons();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (typeof emitClear === 'function') {
        emitClear();
    }
    
    saveState();
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn && !undoBtn.hasAttribute('data-disconnected')) {
        undoBtn.disabled = undoStack.length <= 1;
    }
    if (redoBtn && !redoBtn.hasAttribute('data-disconnected')) {
        redoBtn.disabled = redoStack.length === 0;
    }
}

function handleRemoteDrawStart(data) {
    remoteDrawingState.set(data.userId, {
        isDrawing: true,
        lastX: data.x,
        lastY: data.y,
        color: data.color,
        size: data.size
    });
}

function handleRemoteDrawMove(data) {
    const state = remoteDrawingState.get(data.userId);
    if (!state || !state.isDrawing) return;
    
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(state.lastX, state.lastY);
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
    
    state.lastX = data.x;
    state.lastY = data.y;
}

function handleRemoteDrawEnd(data) {
    remoteDrawingState.delete(data.userId);
    saveState();
}

function handleRemoteUndo() {
    if (undoStack.length <= 1) return;
    
    undoStack.pop();
    const previousState = undoStack[undoStack.length - 1];
    ctx.putImageData(previousState, 0, 0);
    
    updateUndoRedoButtons();
}

function handleRemoteRedo() {
    saveState();
}

function handleRemoteClear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack = [];
    redoStack = [];
    saveState();
}

function replayHistory(history) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    history.forEach(action => {
        if (action.path && action.path.length > 0) {
            ctx.strokeStyle = action.color || '#000000';
            ctx.lineWidth = action.size || 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(action.path[0].x, action.path[0].y);
            
            for (let i = 1; i < action.path.length; i++) {
                ctx.lineTo(action.path[i].x, action.path[i].y);
            }
            
            ctx.stroke();
        }
    });
    
    saveState();
}
