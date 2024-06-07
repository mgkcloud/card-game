import { useEffect, useRef } from "react";
import classNames from "classnames";

const TronBackground = ({ startAnimation }) => {
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const animationStarted = useRef(false); // Track if animation has started
  const ridersInitialized = useRef(false); // Track if riders have been initialized

  useEffect(() => {
    if (!startAnimation || animationStarted.current) return; // Exit early if startAnimation is false or animation has already started
    animationStarted.current = true; // Mark animation as started

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCanvasRef.current = offscreenCanvas;

    const speed = 20;
    let buffer = 200; // Buffer around each node
    let lineWidth = 24; // Line width for riders
    let shadowBlur = 30; // Shadow blur for riders

    // Adjust buffer and line width for mobile devices
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      buffer = 50;
      lineWidth = 45;
      shadowBlur = 4;
    }

    let nodes = [];
    const riders = [
      {
        color: "bg-primary", // Tailwind primary color
        x: 0,
        y: 0,
        path: [],
        nodeIndex: 0,
        direction: "right",
        clockwise: true,
        completed: false,
      },
      {
        color: "bg-secondary", // Tailwind secondary color
        x: 0,
        y: 0,
        path: [],
        nodeIndex: 0,
        direction: "right",
        clockwise: false,
        completed: false,
      },
      {
        color: "bg-accent", // Tailwind accent color
        x: 0,
        y: 0,
        path: [],
        nodeIndex: 0,
        direction: "right",
        clockwise: true,
        completed: false,
      },
      {
        color: "bg-white", // Tailwind neutral color
        x: 0,
        y: 0,
        path: [],
        nodeIndex: 0,
        direction: "right",
        clockwise: false,
        completed: false,
      },
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      initializeNodes();
      if (!ridersInitialized.current) {
        initializeRiders();
        ridersInitialized.current = true;
      }
      drawNodes();
    };

    const initializeNodes = () => {
      const gridSize = 4; // Number of nodes
      const gridSpacingX = canvas.width / (gridSize + 1);
      nodes = Array.from({ length: gridSize }, (_, i) => ({
        x: (i + 1) * gridSpacingX,
        y: Math.random() * canvas.height,
      }));
    };

    const initializeRiders = () => {
      riders.forEach((rider, index) => {
        if (isMobile) {
          rider.x = canvas.width * 0.125 + (index * canvas.width * 0.75) / (riders.length - 1);
          rider.y = 0;
        } else {
          rider.x = 0;
          rider.y = canvas.height * 0.125 + (index * canvas.height * 0.75) / (riders.length - 1);
        }
        rider.path = [{ x: rider.x, y: rider.y }];
        rider.nodeIndex = 0;
        rider.direction = isMobile ? "down" : "right";
      });
    };

    const drawNodes = () => {
      offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      nodes.forEach((node) => {
        offscreenCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
        offscreenCtx.beginPath();
        offscreenCtx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        offscreenCtx.fill();
      });
    };

    const drawLine = (path, colorClass) => {
      const colorElement = document.createElement('div');
      colorElement.className = classNames(colorClass, 'hidden');
      document.body.appendChild(colorElement);
      const color = getComputedStyle(colorElement).backgroundColor;
      document.body.removeChild(colorElement);

      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = color;
      ctx.shadowBlur = shadowBlur;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    };

    const updateRider = (rider) => {
      if (rider.completed) return;

      const targetNode = nodes[rider.nodeIndex];
      const offset = rider.clockwise ? buffer : -buffer;

      if (rider.direction === "right") {
        rider.x += speed;
        if (rider.x >= targetNode.x + offset) {
          rider.direction = "down";
          rider.nodeIndex = (rider.nodeIndex + 1) % nodes.length;
        }
      } else if (rider.direction === "down") {
        rider.y += speed;
        if (rider.y >= targetNode.y + offset) {
          rider.direction = "left";
        }
      } else if (rider.direction === "left") {
        rider.x -= speed;
        if (rider.x <= targetNode.x - offset) {
          rider.direction = "up";
        }
      } else if (rider.direction === "up") {
        rider.y -= speed;
        if (rider.y <= targetNode.y - offset) {
          rider.direction = "right";
        }
      }

      // Check if rider has reached the end goal
      if (isMobile && rider.y >= canvas.height) {
        rider.completed = true;
      } else if (!isMobile && rider.x >= canvas.width) {
        rider.completed = true;
      }

      rider.path.push({ x: rider.x, y: rider.y });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreenCanvas, 0, 0);
      riders.forEach((rider) => {
        updateRider(rider);
        drawLine(rider.path, rider.color);
      });
      requestAnimationFrame(animate);
    };

    // window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      // window.removeEventListener("resize", resizeCanvas);
    };
  }, [startAnimation]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black"></canvas>;
};

export default TronBackground;
