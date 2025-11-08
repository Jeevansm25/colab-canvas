document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawingCanvas');
    
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const clearBtn = document.getElementById('clearBtn');
    if (undoBtn) undoBtn.disabled = true;
    if (redoBtn) redoBtn.disabled = true;
    if (clearBtn) clearBtn.disabled = true;
    
    initCanvas(canvas);
    
    initWebSocket();
    
    setupUIControls();
    
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
});

function setupUIControls() {
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', (e) => {
        setBrushColor(e.target.value);
        selectBrush();
        updateToolButtons();
    });
    
    const brushSize = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    brushSize.addEventListener('input', (e) => {
        const size = e.target.value;
        setBrushSize(size);
        brushSizeValue.textContent = size;
    });
    
    const brushBtn = document.getElementById('brushBtn');
    brushBtn.addEventListener('click', () => {
        selectBrush();
        updateToolButtons();
    });
    
    const eraserBtn = document.getElementById('eraserBtn');
    eraserBtn.addEventListener('click', () => {
        selectEraser();
        updateToolButtons();
    });
    
    const undoBtn = document.getElementById('undoBtn');
    undoBtn.addEventListener('click', () => {
        undo();
    });
    
    const redoBtn = document.getElementById('redoBtn');
    redoBtn.addEventListener('click', () => {
        redo();
    });
    
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the canvas? This will affect all users.')) {
            clearCanvas();
        }
    });
    
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.addEventListener('click', () => {
        saveCanvasAsPNG();
    });
    
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.addEventListener('click', () => {
        downloadCanvasData();
    });
    
    const usersBtn = document.getElementById('usersBtn');
    const usersPanel = document.getElementById('usersPanel');
    usersBtn.addEventListener('click', () => {
        usersPanel.classList.toggle('hidden');
    });
    
    const closePanelBtn = document.getElementById('closePanelBtn');
    closePanelBtn.addEventListener('click', () => {
        usersPanel.classList.add('hidden');
    });
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        
        if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
            e.preventDefault();
            redo();
        }
        
        if (e.key === 'b' || e.key === 'B') {
            selectBrush();
            updateToolButtons();
        }
        
        if (e.key === 'e' || e.key === 'E') {
            selectEraser();
            updateToolButtons();
        }
    });
}

function updateToolButtons() {
    const brushBtn = document.getElementById('brushBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    
    if (isEraserActive()) {
        brushBtn.classList.remove('active');
        eraserBtn.classList.add('active');
    } else {
        brushBtn.classList.add('active');
        eraserBtn.classList.remove('active');
    }
}

function saveCanvasAsPNG() {
    const canvas = document.getElementById('drawingCanvas');
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `canvas-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Canvas saved as PNG', 'success');
}

function downloadCanvasData() {
    const canvas = document.getElementById('drawingCanvas');
    const dataURL = canvas.toDataURL('image/png');
    
    const data = {
        timestamp: new Date().toISOString(),
        canvasData: dataURL,
        width: canvas.width,
        height: canvas.height
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `canvas-data-${timestamp}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Canvas data downloaded', 'success');
}
