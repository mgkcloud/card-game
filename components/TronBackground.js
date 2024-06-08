import { useEffect, useRef } from "react";
import lottie from "lottie-web";

const TronBackground = ({ startAnimation }) => {
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const parentRef = useRef(null);
  const animationStarted = useRef(false);
  const ridersInitialized = useRef(false);
  const lottieRef = useRef(null);
  const animationFrameId = useRef(null);

  // Function to restart the animation
  const restartAnimation = () => {
    animationStarted.current = false;
    ridersInitialized.current = false;
    initializeAnimation();

    // Reset and play the Lottie animation
    if (lottieRef.current) {
      lottieRef.current.stop(); // Stop the animation
      lottieRef.current.play(); // Play the animation
    }
  };

  // Function to initialize the animation
  const initializeAnimation = () => {
    if (!startAnimation || animationStarted.current) return;
    animationStarted.current = true;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Create an offscreen canvas for drawing nodes
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCanvasRef.current = offscreenCanvas;

    // Animation settings
    const speed = 20;
    let buffer = 200;
    let lineWidth = 24;
    let shadowBlur = 30;
    let isMobile; // Declare isMobile here, but don't assign a value yet
    // Adjust settings for mobile devices
    // We'll calculate isMobile later, after resizing the canvas
    let nodes = [];
    const riders = [
      {
        color: "bg-white",
        x: 0,
        y: 0,
        path: [],
        nodeIndex: 0,
        direction: "down",
        clockwise: false,
        completed: false,
      },
      {
        color: "bg-primary",
        x: 0,
        y: 0,
        path: [],
        nodeIndex: 0,
        direction: "down",
        clockwise: true,
        completed: false,
      },
      {
        color: "bg-accent",
        x: 0,
        y: 0,
        path: [],
        nodeIndex: 0,
        direction: "down",
        clockwise: true,
        completed: false,
      },
      {
        color: "bg-secondary",
        x: 0,
        y: 0,
        path: [],
        nodeIndex: 0,
        direction: "down",
        clockwise: false,
        completed: false,
      },
    ];

    // Function to resize the canvas and reinitialize elements
    const resizeCanvas = () => {
      if (parentRef.current) {
        const parent = parentRef.current;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;

        // Resize the offscreen canvas as well
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;

        // NOW calculate isMobile after the canvas is sized correctly
        isMobile = canvas.width <= 768;

        // Adjust settings for mobile devices
        if (isMobile) {
          buffer = 25;
          lineWidth = 20;
          shadowBlur = 4;
        }

        initializeNodes();

        // Initialize riders only once
        if (!ridersInitialized.current) {
          initializeRiders();
          ridersInitialized.current = true;
        }

        drawNodes();
      }
    };

    // Function to initialize the nodes for the riders to follow
    const initializeNodes = () => {
      const gridSize = 4;
      const gridSpacingX = canvas.width / (gridSize + 1);
      nodes = Array.from({ length: gridSize }, (_, i) => ({
        x: (i + 1) * gridSpacingX,
        y: Math.random() * canvas.height,
      }));
    };

    // Function to initialize the riders' starting positions and properties
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
        rider.completed = false;
      });
    };

    // Function to draw the nodes on the offscreen canvas
    const drawNodes = () => {
      const offscreenCtx = offscreenCanvasRef.current.getContext('2d');
      offscreenCtx.clearRect(0, 0, offscreenCanvasRef.current.width, offscreenCanvasRef.current.height);
      nodes.forEach((node) => {
        offscreenCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
        offscreenCtx.beginPath();
        offscreenCtx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        offscreenCtx.fill();
      });
    };

    // Function to draw a line representing the rider's path
    const drawLine = (path, colorClass) => {
      // Create a temporary element to get the computed background color
      const colorElement = document.createElement('div');
      colorElement.className = `${colorClass} hidden`;
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

    // Function to update the rider's position and path
    const updateRider = (rider) => {
      if (rider.completed) return;

      const targetNode = nodes[rider.nodeIndex];
      const offset = rider.clockwise ? buffer : -buffer;

      // Update rider's position based on direction
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

      // Check if the rider has reached the end
      if (isMobile && rider.y >= canvas.height) {
        rider.completed = true;
      } else if (!isMobile && rider.x >= canvas.width) {
        rider.completed = true;
      }

      rider.path.push({ x: rider.x, y: rider.y });

      // Limit the path length to prevent performance issues
      if (rider.path.length > 1000) {
        rider.path.shift();
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the offscreen canvas onto the main canvas
      ctx.drawImage(offscreenCanvasRef.current, 0, 0);

      riders.forEach((rider) => {
        updateRider(rider);
        drawLine(rider.path, rider.color);
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Debounce the resize event listener to improve performance
    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    };

    const debouncedResizeCanvas = debounce(resizeCanvas, 100);

    // Event listeners for resizing and cleanup
    window.addEventListener('resize', debouncedResizeCanvas);

    // Initial setup
    resizeCanvas(); // This will also correctly calculate isMobile now
    animate();

    // Cleanup function to cancel animation frame on unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', debouncedResizeCanvas); // Remove the resize event listener
    };
  };

  useEffect(() => {
    initializeAnimation();

    // Initialize Lottie animation
    lottieRef.current = lottie.loadAnimation({
      container: document.getElementById('lottie-refresh'),
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: '/reload.json', // Make sure this path is correct
    });

    // Clean up Lottie animation on component unmount
    return () => {
      if (lottieRef.current) {
        lottieRef.current.destroy();
      }
    };
  }, [startAnimation]);

  return (
    <div ref={parentRef} className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full bg-black"></canvas>
      <button
        onClick={restartAnimation}
        className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-md"
      >
        <div id="lottie-refresh" className="w-8 h-8"></div>
      </button>
    </div>
  );
};

export default TronBackground;
