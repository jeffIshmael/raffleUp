'use client';

import React, { useEffect, useRef } from 'react';

interface Confetti {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  delay: number;
  duration: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export default function ConfettiEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Confetti[]>([]);
  const animationIdRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#D4AF37', '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'];

    // Generate confetti particles
    const generateConfetti = () => {
      const confetti: Confetti[] = [];
      const particleCount = 100;

      for (let i = 0; i < particleCount; i++) {
        confetti.push({
          id: i,
          x: Math.random() * canvas.width,
          y: -10,
          width: Math.random() * 10 + 5,
          height: Math.random() * 10 + 5,
          delay: Math.random() * 0.5,
          duration: Math.random() * 2 + 2.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 10 - 5,
        });
      }
      return confetti;
    };

    particlesRef.current = generateConfetti();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();

      particlesRef.current.forEach((particle) => {
        const elapsed = (now / 1000 - particle.delay) / particle.duration;

        if (elapsed < 0 || elapsed > 1) {
          return;
        }

        // Position (falling with slight horizontal drift)
        const x = particle.x + Math.sin(elapsed * Math.PI * 2) * 30;
        const y = particle.y + elapsed * canvas.height * 1.2;

        // Rotation
        particle.rotation += particle.rotationSpeed;

        // Opacity (fade out at end)
        const opacity = Math.cos(elapsed * Math.PI) * 0.8 + 0.2;

        // Draw confetti
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(x + particle.width / 2, y + particle.height / 2);
        ctx.rotate((particle.rotation * Math.PI) / 180);

        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);

        // Add glow
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = opacity * 0.5;
        ctx.strokeRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);

        ctx.restore();
      });

      // Continue animation if any particles are still visible
      const allParticlesFinished = particlesRef.current.every((p) => {
        const elapsed = (now / 1000 - p.delay) / p.duration;
        return elapsed > 1;
      });

      if (!allParticlesFinished) {
        animationIdRef.current = requestAnimationFrame(animate);
      }
    };

    animationIdRef.current = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
}
