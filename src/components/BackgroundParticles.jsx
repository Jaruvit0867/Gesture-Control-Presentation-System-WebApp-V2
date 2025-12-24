import React, { useEffect, useRef } from 'react';

/**
 * Interactive Neural-Web Particles
 * Features:
 * - Particles that connect with lines when close to each other.
 * - Mouse acts as a magnetic node, connecting to nearby particles.
 * - Particles have varying sizes and "energy" (pulse).
 */
export const BackgroundParticles = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        const mouse = { x: null, y: null, radius: 180 };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.8; // Guaranteed minimum size
                this.velocity = {
                    x: (Math.random() - 0.5) * 0.4, // Faster movement
                    y: (Math.random() - 0.5) * 0.4
                };
                this.pulse = Math.random() * Math.PI;
            }

            update() {
                this.x += this.velocity.x;
                this.y += this.velocity.y;

                // Pulse size - ensure it never hits zero
                this.pulse += 0.03;
                this.currentSize = this.size + Math.sin(this.pulse) * 0.5;
                if (this.currentSize < 0.3) this.currentSize = 0.3;

                // Screen wrap with margin for smooth transition
                const margin = 50;
                if (this.x < -margin) this.x = canvas.width + margin;
                if (this.x > canvas.width + margin) this.x = -margin;
                if (this.y < -margin) this.y = canvas.height + margin;
                if (this.y > canvas.height + margin) this.y = -margin;

                // Mouse Interaction (Subtle Magnetic Pull)
                if (mouse.x !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    const activeRadius = 250;

                    if (distance < activeRadius) {
                        const force = (activeRadius - distance) / activeRadius;
                        // Drift towards mouse but keep moving
                        this.x += dx * force * 0.01;
                        this.y += dy * force * 0.01;
                    }
                }
            }

            draw() {
                // Create star-like gradient: Bright white center to Indigo outer
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.currentSize
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // Luminous center
                gradient.addColorStop(0.3, 'rgba(129, 140, 248, 0.8)'); // Inner indigo
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0)'); // Fading edge

                ctx.fillStyle = gradient;

                // Bloom effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(99, 102, 241, 0.3)';

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.currentSize * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        const initParticles = () => {
            const particleCount = Math.floor((canvas.width * canvas.height) / 18000);
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const connect = () => {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 140) {
                        const opacity = 1 - (distance / 140);
                        ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.15})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }

                // Connect to mouse with hi-tech energy aura
                if (mouse.x !== null) {
                    let dx = particles[a].x - mouse.x;
                    let dy = particles[a].y - mouse.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    const mouseRadius = 200;
                    if (distance < mouseRadius) {
                        const opacity = 1 - (distance / mouseRadius);
                        ctx.strokeStyle = `rgba(129, 140, 248, ${opacity * 0.25})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
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
        />
    );
};
