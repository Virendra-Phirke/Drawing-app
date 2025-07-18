const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const sizeEl = document.getElementById("size");
const sizeVal = document.getElementById("size-value");
const colorEl = document.getElementById("color");
const bgColorEl = document.getElementById("bg-color");

const penTool = document.getElementById("pen-tool");
const rectTool = document.getElementById("rect-tool");
const circleTool = document.getElementById("circle-tool");

const eraserBtn = document.getElementById("eraser");
const clearBtn = document.getElementById("clear");
const downloadBtn = document.getElementById("download");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
const modeToggleBtn = document.getElementById("mode-toggle");

let isDrawing = false;
let size = 5;
let color = '#000000';
let bgColor = '#ffffff';
let isEraser = false;
let tool = 'pen';

let startX = 0;
let startY = 0;
let savedImage = null;
let undoStack = [];
let redoStack = [];

// Set initial background
ctx.fillStyle = bgColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

function saveState() {
  undoStack.push(canvas.toDataURL());
  redoStack = [];
}

function restoreState(dataURL) {
  let img = new Image();
  img.src = dataURL;
  img.onload = () => ctx.drawImage(img, 0, 0);
}

[penTool, rectTool, circleTool].forEach(btn => {
  btn.addEventListener("click", () => {
    tool = btn.id.split("-")[0];
    document.querySelectorAll(".toolbar button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    isEraser = false;
    eraserBtn.textContent = "Eraser";
  });
});

sizeEl.addEventListener("input", () => {
  size = sizeEl.value;
  sizeVal.textContent = size;
});

colorEl.addEventListener("input", () => {
  color = colorEl.value;
  isEraser = false;
});

bgColorEl.addEventListener("input", () => {
  bgColor = bgColorEl.value;
  canvas.style.backgroundColor = bgColor;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveState();
});

eraserBtn.addEventListener("click", () => {
  isEraser = !isEraser;
  eraserBtn.textContent = isEraser ? "Brush" : "Eraser";
});

clearBtn.addEventListener("click", () => {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveState();
});

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "drawing.png";
  link.href = canvas.toDataURL();
  link.click();
});

undoBtn.addEventListener("click", () => {
  if (undoStack.length > 0) {
    redoStack.push(canvas.toDataURL());
    restoreState(undoStack.pop());
  }
});

redoBtn.addEventListener("click", () => {
  if (redoStack.length > 0) {
    undoStack.push(canvas.toDataURL());
    restoreState(redoStack.pop());
  }
});

modeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  modeToggleBtn.textContent = isDark ? "🌙" : "🌞";
});

function getPos(e) {
  return e.touches ? 
    { x: e.touches[0].clientX - canvas.offsetLeft, y: e.touches[0].clientY - canvas.offsetTop } : 
    { x: e.offsetX, y: e.offsetY };
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("touchstart", startDraw);

canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("touchend", endDraw);

canvas.addEventListener("mousemove", draw);
canvas.addEventListener("touchmove", draw);

function startDraw(e) {
  isDrawing = true;
  const pos = getPos(e);
  startX = pos.x;
  startY = pos.y;
  savedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function draw(e) {
  if (!isDrawing) return;
  const pos = getPos(e);

  if (tool === 'pen') {
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.strokeStyle = isEraser ? bgColor : color;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  } else {
    ctx.putImageData(savedImage, 0, 0);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;

    const width = pos.x - startX;
    const height = pos.y - startY;

    if (tool === 'rect') {
      ctx.strokeRect(startX, startY, width, height);
    } else if (tool === 'circle') {
      ctx.beginPath();
      ctx.ellipse(startX + width / 2, startY + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
}

function endDraw() {
  isDrawing = false;
  ctx.beginPath();
  saveState();
}
