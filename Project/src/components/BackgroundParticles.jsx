import { useEffect, useRef } from 'react';

/**
 * Aurora Particles - Opus 4.5 Style
 * Features:
 * - Dynamic aurora waves flowing across the screen
 * - Star particles with bloom effect
 * - Neural network connections between particles
 * - Mouse interaction with magnetic pull
 * - Multi-layered depth effect
 */
export const BackgroundParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let auroraWaves = [];
    const mouse = { x: null, y: null, radius: 200 };
    let time = 0;

    // Colors
    const colors = {
      cyan: { r: 0, g: 245, b: 255 },
      purple: { r: 139, g: 92, b: 246 },
      pink: { r: 244, g: 114, b: 182 },
      blue: { r: 99, g: 102, b: 241 },
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      initAuroraWaves();
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    // Star Particle class
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseSize = Math.random() * 2 + 0.5;
        this.size = this.baseSize;
        this.velocity = {
          x: (Math.random() - 0.5) * 0.3,
          y: (Math.random() - 0.5) * 0.3
        };
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.02;

        // Random color selection
        const colorKeys = Object.keys(colors);
        const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        this.color = colors[colorKey];
        this.alpha = 0.3 + Math.random() * 0.7;
      }

      update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Pulse effect
        this.pulse += this.pulseSpeed;
        this.size = this.baseSize + Math.sin(this.pulse) * 0.5;
        if (this.size < 0.3) this.size = 0.3;

        // Screen wrap
        const margin = 50;
        if (this.x < -margin) this.x = canvas.width + margin;
        if (this.x > canvas.width + margin) this.x = -margin;
        if (this.y < -margin) this.y = canvas.height + margin;
        if (this.y > canvas.height + margin) this.y = -margin;

        // Mouse interaction
        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const activeRadius = 250;

          if (distance < activeRadius) {
            const force = (activeRadius - distance) / activeRadius;
            this.x += dx * force * 0.015;
            this.y += dy * force * 0.015;
            // Increase brightness near mouse
            this.alpha = Math.min(1, this.alpha + force * 0.3);
          }
        }
      }

      draw() {
        // Create bloom effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 4
        );

        const { r, g, b } = this.color;
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.alpha})`);
        gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.8})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core bright point
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Aurora Wave class
    class AuroraWave {
      constructor(yOffset, color, speed, amplitude) {
        this.yOffset = yOffset;
        this.color = color;
        this.speed = speed;
        this.amplitude = amplitude;
        this.phase = Math.random() * Math.PI * 2;
      }

      draw(time) {
        ctx.beginPath();

        const { r, g, b } = this.color;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, 0.03)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.08)`);
        gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, 0.03)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;

        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 5) {
          const y = this.yOffset +
            Math.sin(x * 0.003 + time * this.speed + this.phase) * this.amplitude +
            Math.sin(x * 0.001 + time * this.speed * 0.5) * this.amplitude * 0.5;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
      }
    }

    const initParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const initAuroraWaves = () => {
      auroraWaves = [
        new AuroraWave(canvas.height * 0.3, colors.cyan, 0.0003, 80),
        new AuroraWave(canvas.height * 0.4, colors.purple, 0.0004, 100),
        new AuroraWave(canvas.height * 0.5, colors.pink, 0.0002, 60),
        new AuroraWave(canvas.height * 0.6, colors.blue, 0.00035, 90),
      ];
    };

    const connect = () => {
      const maxDistance = 120;

      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.15;

            // Gradient line between two particles
            const gradient = ctx.createLinearGradient(
              particles[a].x, particles[a].y,
              particles[b].x, particles[b].y
            );

            const colorA = particles[a].color;
            const colorB = particles[b].color;

            gradient.addColorStop(0, `rgba(${colorA.r}, ${colorA.g}, ${colorA.b}, ${opacity})`);
            gradient.addColorStop(1, `rgba(${colorB.r}, ${colorB.g}, ${colorB.b}, ${opacity})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }

        // Connect to mouse with enhanced effect
        if (mouse.x !== null) {
          const dx = particles[a].x - mouse.x;
          const dy = particles[a].y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const mouseRadius = 180;

          if (distance < mouseRadius) {
            const opacity = (1 - distance / mouseRadius) * 0.4;
            const colorA = particles[a].color;

            ctx.strokeStyle = `rgba(${colorA.r}, ${colorA.g}, ${colorA.b}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    // Draw mouse glow effect
    const drawMouseGlow = () => {
      if (mouse.x === null) return;

      const gradient = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 150
      );

      gradient.addColorStop(0, 'rgba(0, 245, 255, 0.15)');
      gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.05)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 1;

      // Draw aurora waves (background layer)
      auroraWaves.forEach(wave => wave.draw(time));

      // Draw mouse glow
      drawMouseGlow();

      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Draw connections
      connect();

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'linear-gradient(180deg, #030014 0%, #0a0a1a 50%, #030014 100%)'
      }}
    />
  );
};
