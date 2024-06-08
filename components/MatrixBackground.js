import React, { useEffect, useRef } from 'react';

const MatrixBackground = ({ isVisible, onLoad }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    const resizeCanvas = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resizeCanvas();

    const debouncedResize = debounce(resizeCanvas, 100);
    window.addEventListener('resize', debouncedResize);

    const emojiGroups = {
      high: ['✅'],
      medium: ['❌', '😊', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '👍', '👎', '👌', '🤞', '🤟', '👊', '👏', '🙌', '🙏', '💪'],
      low: ['🐵', '👐', '🤲', '🍎', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥭', '🍋', '🍊', '🍈', '🍏', '🍐', '🍅', '🍆', '🥑', '🥦', '🥒', '🌽', '🥕', '🥔', '🍠', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🍞', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🍜', '🍲', '🍛', '🍣', '🍱', '🍤', '🍙', '🍚', '🍘', '🍥', '🥟', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🥛', '🍼', '☕', '🍵', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🥄', '🍴', '🍽', '🥢', '🧂']
    };

    const emojis = [
      ...Array(10).fill(emojiGroups.high).flat(),
      ...Array(3).fill(emojiGroups.medium).flat(),
      ...Array(1).fill(emojiGroups.low).flat()
    ];

    const fontSize = 40; // Reduced font size for better performance
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.random() * canvas.height / fontSize);
    const columnEmojis = Array.from({ length: columns }, () => emojis[Math.floor(Math.random() * emojis.length)]);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px Arial`;

      for (let i = 0; i < drops.length; i++) {
        for (let j = 0; j < 1; j++) { // Draw more emojis in each column
          const text = columnEmojis[i];
          const x = i * fontSize;
          const y = (drops[i] + j) * fontSize;
          ctx.fillText(text, x, y);
  
          if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
        }
    

        drops[i] += 0.01; // Increased speed for smoother animation
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isVisible) {
   
      draw(); // Start the animation
    }

    // Call the onLoad callback to indicate the canvas is running
    if (onLoad) {
      onLoad();
    }

    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, onLoad]);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const canvasStyle = {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '120%',
    height: '120%',
    opacity: '0.3',
    pointerEvents: 'none',
    // Force hardware acceleration
    transform: 'translateZ(0)',
    // Use webkit prefixes
    WebkitTransform: 'translateZ(0)',
  };

  return <canvas ref={canvasRef} style={canvasStyle} />;
};

export default MatrixBackground;

