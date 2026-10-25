// Injected on every toggle. If the laser is already running, stop it; otherwise start it.
// The drawing logic is a vanilla-JS port of the useEffect in laser-draw's Draw.tsx.
(() => {
  if (window.__laserDrawStop) {
    window.__laserDrawStop();
    return;
  }

  const canvas = document.createElement("canvas");

  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "2147483647";

  const cursorStyle = document.createElement("style");
  cursorStyle.textContent = "* { cursor: none !important; }";

  document.documentElement.appendChild(canvas);
  document.documentElement.appendChild(cursorStyle);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let raf;
  let points = [];

  let mouseX = -100;
  let mouseY = -100;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  resize();
  window.addEventListener("resize", resize);

  const handleMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    points.push({ x: mouseX, y: mouseY, age: 0 });
    if (points.length > 40) points.shift();
  };

  const handleKey = (e) => {
    if (e.key === "Escape") stop();
  };

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    points = points.filter((p) => {
      p.age += 0.06;
      return p.age < 1;
    });

    ctx.fillStyle = "rgba(255, 60, 60, 0.9)";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(255, 60, 60, 0.9)";

    if (points.length > 2) {
      const left = [];
      const right = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const prev = points[i - 1] || p;
        const next = points[i + 1] || p;

        let dx = next.x - prev.x;
        let dy = next.y - prev.y;

        if (dx === 0 && dy === 0) dx = 1;

        const dist = Math.hypot(dx, dy);
        const nx = -dy / dist;
        const ny = dx / dist;

        const width = 6 * (1 - p.age);

        left.push({ x: p.x + nx * width, y: p.y + ny * width });
        right.unshift({ x: p.x - nx * width, y: p.y - ny * width });
      }

      const shape = [...left, ...right];

      ctx.beginPath();
      ctx.moveTo(shape[0].x, shape[0].y);
      for (let i = 1; i < shape.length; i++) {
        ctx.lineTo(shape[i].x, shape[i].y);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);
    ctx.fill();

    raf = requestAnimationFrame(render);
  };

  const stop = () => {
    cancelAnimationFrame(raf);
    document.removeEventListener("mousemove", handleMove);
    document.removeEventListener("keydown", handleKey);
    window.removeEventListener("resize", resize);
    canvas.remove();
    cursorStyle.remove();
    delete window.__laserDrawStop;
  };

  document.addEventListener("mousemove", handleMove);
  document.addEventListener("keydown", handleKey);
  raf = requestAnimationFrame(render);

  window.__laserDrawStop = stop;
})();
