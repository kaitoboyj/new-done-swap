import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const scrollPosition = useRef(0);
  const particles = useRef<Array<{
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    hue: number;
    pulseSpeed: number;
    pulseDirection: number;
  }>>([]);
  const gradientOffset = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    // Track scrolling
    const handleScroll = () => {
      scrollPosition.current = window.scrollY;
    };

    // Initialize particles
    const initParticles = () => {
      particles.current = [];
      // Reduce particle count for better performance
      const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 25000), 60);
      
      for (let i = 0; i < particleCount; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: -Math.random() * 0.3 - 0.1,
          opacity: Math.random() * 0.5 + 0.2,
          hue: Math.random() * 60 + 240, // Blue to purple range
          pulseSpeed: Math.random() * 0.01 + 0.005,
          pulseDirection: Math.random() > 0.5 ? 1 : -1
        });
      }
    };

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient background
      gradientOffset.current += 0.002;
      const gradient = ctx.createLinearGradient(
        0, 0, 
        canvas.width, canvas.height
      );
      
      // Shift hues based on time
      const time = Date.now() * 0.0001;
      const hue1 = (240 + Math.sin(time) * 20) % 360; // Deep blue base
      const hue2 = (280 + Math.cos(time) * 20) % 360; // Purple base
      const hue3 = (320 + Math.sin(time + 2) * 20) % 360; // Pink base
      
      gradient.addColorStop(0, `hsla(${hue1}, 70%, 20%, 1)`);
      gradient.addColorStop(0.5, `hsla(${hue2}, 70%, 25%, 1)`);
      gradient.addColorStop(1, `hsla(${hue3}, 70%, 20%, 1)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw flowing waves
      drawWaves(ctx, canvas, time, hue2);
      
      // Draw geometric shapes
      drawGeometricShapes(ctx, canvas, time, hue1);
      
      // Update and draw particles
      updateParticles(canvas);
      drawParticles(ctx);
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    // Draw flowing waves
    const drawWaves = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, hue: number) => {
      const mouseInfluenceX = (mousePosition.current.x / canvas.width - 0.5) * 50;
      
      // Reduce number of waves for better performance
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        
        const waveHeight = 15 + i * 10;
        const waveSpeed = 0.0003 + i * 0.0001;
        const waveFrequency = 0.004 - i * 0.001;
        const opacity = 0.04 - i * 0.01;
        const hueOffset = i * 30;
        
        ctx.strokeStyle = `hsla(${(hue + hueOffset) % 360}, 80%, 60%, ${opacity})`;
        ctx.lineWidth = 40 + i * 20;
        
        // Increase step size for better performance
        for (let x = 0; x < canvas.width; x += 10) {
          const y = Math.sin(x * waveFrequency + time + i) * waveHeight + 
                   Math.cos(x * waveFrequency * 0.5 + time * 0.7) * waveHeight * 0.5 +
                   canvas.height * (0.4 + i * 0.2) + mouseInfluenceX;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      }
    };
    
    // Draw geometric shapes
    const drawGeometricShapes = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, hue: number) => {
      const shapes = 3;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < shapes; i++) {
        const size = 100 + i * 50;
        const rotation = time * (0.1 + i * 0.05);
        const opacity = (Math.sin(time * 0.5 + i) * 0.3 + 0.3) * 0.15;
        
        ctx.strokeStyle = `hsla(${(hue + i * 40) % 360}, 80%, 60%, ${opacity})`;
        ctx.lineWidth = 2;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        
        // Draw polygon
        const sides = 3 + i;
        ctx.beginPath();
        for (let j = 0; j < sides; j++) {
          const angle = (j / sides) * Math.PI * 2;
          const x = Math.cos(angle) * size;
          const y = Math.sin(angle) * size;
          
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
      }
    };
    
    // Update particle positions
    const updateParticles = (canvas: HTMLCanvasElement) => {
      // Mouse influence calculation
      const mouseInfluenceRadius = 150;
      const mouseInfluenceStrength = 0.5;
      
      particles.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY * (1 + scrollPosition.current * 0.0005);
        
        // Pulse effect
        particle.opacity += particle.pulseSpeed * particle.pulseDirection;
        if (particle.opacity > 0.8 || particle.opacity < 0.2) {
          particle.pulseDirection *= -1;
        }
        
        // Mouse influence
        const dx = mousePosition.current.x - particle.x;
        const dy = mousePosition.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouseInfluenceRadius) {
          const influence = (1 - distance / mouseInfluenceRadius) * mouseInfluenceStrength;
          particle.x -= dx * influence * 0.05;
          particle.y -= dy * influence * 0.05;
        }
        
        // Reset particles that go off screen
        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
        }
        if (particle.x < -10) {
          particle.x = canvas.width + 10;
        }
        if (particle.x > canvas.width + 10) {
          particle.x = -10;
        }
      });
    };
    
    // Draw particles
    const drawParticles = (ctx: CanvasRenderingContext2D) => {
      particles.current.forEach(particle => {
        ctx.beginPath();
        
        // Create radial gradient for glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, ${particle.opacity})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 50%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Set up event listeners and start animation
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    resizeCanvas();
    animate();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full -z-10 ${className || ''}`}
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default AnimatedBackground;