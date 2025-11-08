const ToolState = {
    currentTool: 'brush',
    brushColor: '#000000',
    brushSize: 5,
    eraserSize: 20
};

function setBrushColor(color) {
    ToolState.brushColor = color;
}

function setBrushSize(size) {
    ToolState.brushSize = parseInt(size);
}

function getCurrentSize() {
    return ToolState.currentTool === 'eraser' ? ToolState.eraserSize : ToolState.brushSize;
}

function getCurrentColor() {
    return ToolState.currentTool === 'eraser' ? '#ffffff' : ToolState.brushColor;
}

function selectBrush() {
    ToolState.currentTool = 'brush';
}

function selectEraser() {
    ToolState.currentTool = 'eraser';
}

function isEraserActive() {
    return ToolState.currentTool === 'eraser';
}
