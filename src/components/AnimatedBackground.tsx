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
    maxOpacity: number;
    color: string;
    pulseSpeed: number;
    pulseDirection: number;
  }>>([]);
  const orbs = useRef<Array<{
    x: number;
    y: number;
    size: number;
    maxSize: number;
    color: string;
    opacity: number;
    maxOpacity: number;
    minOpacity: number;
    pulseSpeed: number;
    pulseDirection: number;
    scale: number;
    maxScale: number;
  }>>([]);
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
      initParticlesAndOrbs();
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

    // Initialize particles and orbs
    const initParticlesAndOrbs = () => {
      // Initialize particles - 20 small glowing particles
      particles.current = [];
      for (let i = 0; i < 20; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 4, // 4px circular dots
          // Increase baseline speed substantially for faster motion
          speedX: (Math.random() - 0.5) * 1.6,
          speedY: (Math.random() - 0.5) * 1.6,
          opacity: Math.random() * 0.5,
          maxOpacity: 0.8 + Math.random() * 0.2,
          color: '#00D9FF', // Bright cyan
          pulseSpeed: 0.3 + Math.random() * 0.2, // 3-5 second pulse cycle
          pulseDirection: 1
        });
      }
      
      // Initialize orbs - 2 large glowing orbs
      orbs.current = [
        // Primary Orb (upper-left quadrant)
        {
          x: canvas.width * 0.25,
          y: canvas.height * 0.25,
          size: 256, // 256px sphere
          maxSize: 256,
          color: '#00D9FF', // Cyan/blue energy
          opacity: 0.3,
          maxOpacity: 0.5,
          minOpacity: 0.3,
          pulseSpeed: 0.25, // 4 seconds cycle
          pulseDirection: 1,
          scale: 1,
          maxScale: 1.2 // Scale between 100% and 120%
        },
        // Secondary Orb (lower-right quadrant)
        {
          x: canvas.width * 0.75,
          y: canvas.height * 0.75,
          size: 384, // 384px sphere
          maxSize: 384,
          color: '#A855F7', // Purple/magenta energy
          opacity: 0.2,
          maxOpacity: 0.4,
          minOpacity: 0.2,
          pulseSpeed: 0.2, // 5 seconds cycle
          pulseDirection: 1,
          scale: 1,
          maxScale: 1.3 // Scale between 100% and 130%
        }
      ];
    };

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw dark gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
      );
      
      gradient.addColorStop(0, '#0F0F19'); // Slightly lighter midnight tone in center
      gradient.addColorStop(1, '#0A0B14'); // Deep navy blue at edges
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw glowing orbs
      orbs.current.forEach(orb => {
        // Update orb animation
        if (orb.pulseDirection === 1) {
          orb.opacity += orb.pulseSpeed * 0.01;
          orb.scale += orb.pulseSpeed * 0.01;
          if (orb.opacity >= orb.maxOpacity || orb.scale >= orb.maxScale) {
            orb.pulseDirection = -1;
          }
        } else {
          orb.opacity -= orb.pulseSpeed * 0.01;
          orb.scale -= orb.pulseSpeed * 0.01;
          if (orb.opacity <= orb.minOpacity || orb.scale <= 1) {
            orb.pulseDirection = 1;
          }
        }
        
        // Draw the orb with glow effect
        const orbSize = orb.size * orb.scale;
        const glow = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orbSize
        );
        
        glow.addColorStop(0, `${orb.color}40`); // Inner color with 25% opacity
        glow.addColorStop(0.5, `${orb.color}20`); // Middle color with 12% opacity
        glow.addColorStop(1, `${orb.color}00`); // Outer color with 0% opacity
        
        ctx.globalAlpha = orb.opacity;
        ctx.filter = 'blur(48px)'; // Extreme blur effect
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orbSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
      });
      
      // Draw animated particles
      particles.current.forEach((particle, i) => {
        // Update particle position
        // Add gentle random drift to velocity
        particle.speedX += (Math.random() - 0.5) * 0.05;
        particle.speedY += (Math.random() - 0.5) * 0.05;
        // Clamp velocity to avoid runaway speeds
        const clamp = (v: number) => Math.max(Math.min(v, 2.0), -2.0);
        particle.speedX = clamp(particle.speedX);
        particle.speedY = clamp(particle.speedY);

        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap particles around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Update particle opacity (pulsing effect)
        if (particle.pulseDirection === 1) {
          particle.opacity += particle.pulseSpeed * 0.01;
          if (particle.opacity >= particle.maxOpacity) {
            particle.pulseDirection = -1;
          }
        } else {
          particle.opacity -= particle.pulseSpeed * 0.01;
          if (particle.opacity <= 0.1) {
            particle.pulseDirection = 1;
          }
        }
        
        // Draw particle with glow
        ctx.globalAlpha = particle.opacity;
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });
      
      // Add film grain texture
      addFilmGrain(ctx, canvas.width, canvas.height, 0.03);
      
      // Add vignette effect
      addVignette(ctx, canvas.width, canvas.height, 0.8);
      
      // Request next animation frame
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    // Helper function to add film grain texture
    const addFilmGrain = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * intensity * 255;
        data[i] = Math.min(Math.max(data[i] + noise, 0), 255);
        data[i + 1] = Math.min(Math.max(data[i + 1] + noise, 0), 255);
        data[i + 2] = Math.min(Math.max(data[i + 2] + noise, 0), 255);
      }
      
      ctx.putImageData(imageData, 0, 0);
    };

    // Helper function to add vignette effect
    const addVignette = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 1.5
      );
      
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
      
      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    };

    // Set up event listeners and start animation
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', resizeCanvas);
    
    resizeCanvas();
    animate();
    
    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resizeCanvas);
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full -z-10 ${className || ''}`}
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default AnimatedBackground;