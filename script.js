const canvas = document.getElementById('vennCanvas');
const ctx = canvas.getContext('2d');
const saveButton = document.getElementById('saveButton');

let draggingCircle = null;

let circles = [
  { x: canvas.width / 2, y: canvas.height / 2, r: 50, color: 'rgba(255, 0, 0, 0.5)', label: 'Me' },
  { x: 150, y: 100, r: 50, color: 'rgba(0, 0, 255, 0.5)', label: 'Agent' },
  { x: 300, y: 100, r: 50, color: 'rgba(130, 240, 0, 0.5)', label: 'GM1' },
  { x: 100, y: 300, r: 50, color: 'rgba(150, 240, 0, 0.5)', label: 'GM2' }
];

function drawCircles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  circles.forEach(circle => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
    ctx.fillStyle = circle.color;
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.font = "bold 14px sans-serif";
    const textSize = ctx.measureText(circle.label);
    ctx.fillText(circle.label, circle.x - textSize.width / 2, circle.y + 5);
  });
}

function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  const touch = evt.touches ? evt.touches[0] : evt;
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
}

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('touchstart', handleStart, { passive: false });
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchend', handleEnd, { passive: false });

function handleStart(e) {
  const pos = getMousePos(canvas, e);
  circles.forEach(circle => {
    if (Math.hypot(circle.x - pos.x, circle.y - pos.y) < circle.r) {
      draggingCircle = circle;
    }
  });
  e.preventDefault();
}

function handleMove(e) {
  if (draggingCircle) {
    const pos = getMousePos(canvas, e);
    draggingCircle.x = pos.x;
    draggingCircle.y = pos.y;
    drawCircles();
  }
  e.preventDefault();
}

function handleEnd(e) {
  draggingCircle = null;
  e.preventDefault();
}

saveButton.addEventListener('click', () => {
  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `group_canvas_${Date.now()}.png`;
  link.href = image;
  link.click();
});

drawCircles();
