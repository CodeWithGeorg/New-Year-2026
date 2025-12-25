import React, { useEffect, useRef } from 'react';

export const RealisticFireworks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- Sizing ---
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // --- Configuration ---
    // Standard physics
    const defaultGravity = 0.04;
    const defaultFriction = 0.99; 
    
    // Counts
    const particlesPerExplosion = 70; 
    const particlesPerClick = 200; 

    // Timers
    // Approx 2 seconds assuming 60fps (2 * 60 = 120)
    const centralExplosionTimerTotal = 120; 
    
    // --- State ---
    let fireworks: Firework[] = [];
    let particles: Particle[] = [];
    let mouse = { x: 0, y: 0, isMoving: false };

    // --- Utility ---
    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    // --- Classes ---
    class Firework {
      x: number; y: number; sx: number; sy: number; tx: number; ty: number;
      distanceToTarget: number; distanceTraveled: number;
      coordinates: [number, number][];
      angle: number; speed: number; acceleration: number; brightness: number; targetRadius: number; hue: number;

      constructor(sx: number, sy: number, tx: number, ty: number) {
        this.x = sx; this.y = sy; this.sx = sx; this.sy = sy; this.tx = tx; this.ty = ty;
        this.distanceToTarget = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = random(50, 70);
        this.targetRadius = 1;
        this.hue = random(0, 360);
        for (let i = 0; i < 3; i++) this.coordinates.push([sx, sy]);
      }

      update(index: number) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        if (this.targetRadius < 8) this.targetRadius += 0.3; else this.targetRadius = 1;
        this.speed *= this.acceleration;
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = Math.sqrt(Math.pow(this.sx - this.x, 2) + Math.pow(this.sy - this.y, 2));

        if (this.distanceTraveled >= this.distanceToTarget) {
          // Standard explosion
          createParticles(this.tx, this.ty, this.hue, particlesPerExplosion);
          fireworks.splice(index, 1);
        } else {
          this.x += vx; this.y += vy;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.stroke();
      }
    }

    class Particle {
      x: number; y: number;
      coordinates: [number, number][];
      angle: number; speed: number; friction: number; gravity: number; hue: number; brightness: number; alpha: number; decay: number;

      // Modified constructor to accept physics overrides
      constructor(x: number, y: number, hue: number, speedOverride?: number, frictionOverride?: number, gravityOverride?: number, decayOverride?: number) {
        this.x = x; this.y = y;
        this.coordinates = [];
        for (let i = 0; i < 5; i++) this.coordinates.push([x, y]);
        
        this.angle = random(0, Math.PI * 2);
        // Use override speed if provided, else standard random(1,10)
        this.speed = speedOverride !== undefined ? speedOverride : random(1, 10);
        // Use override friction if provided, else standard
        this.friction = frictionOverride !== undefined ? frictionOverride : defaultFriction;
        // Use override gravity if provided, else standard
        this.gravity = gravityOverride !== undefined ? gravityOverride : defaultGravity;
        
        this.hue = random(hue - 20, hue + 20);
        this.brightness = random(50, 80);
        this.alpha = 1;
        // Use override decay if provided, else standard
        this.decay = decayOverride !== undefined ? decayOverride : random(0.015, 0.03);
      }

      update(index: number) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;
        if (this.alpha <= this.decay) particles.splice(index, 1);
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.stroke();
      }
    }

    // --- Logic ---

    // Helper for standard particles
    function createParticles(x: number, y: number, hue: number, count: number, speedMult = 1) {
      for (let i = 0; i < count; i++) {
        // Note: Passing undefined for friction/gravity to use defaults
        particles.push(new Particle(x, y, hue, random(1, 10) * speedMult));
      }
    }

    // NEW: Helper for the massive central explosion
    function launchMassiveCentralExplosion() {
        const centerX = width / 2;
        const centerY = height / 2;
        const hue = random(0, 360); // A distinct color for the big one
        // Massive count to cover screen
        const count = 600; 

        for (let i = 0; i < count; i++) {
             // CUSTOM PHYSICS for massive expansion:
             // 1. High Speed: random(20, 40) ensures it reaches screen edges quickly
             // 2. Low Friction: 0.995 means it doesn't slow down much
             // 3. Low Gravity: 0.01 means it stays relatively centered vertically
             // 4. Slow Decay: random(0.003, 0.008) means it lasts longer
            particles.push(new Particle(
                centerX, 
                centerY, 
                hue, 
                random(20, 40), // Speed override
                0.995, // Friction override (very low drag)
                0.01,  // Gravity override (very low gravity)
                random(0.003, 0.008) // Decay override (slow fade)
            ));
        }
    }

    let standardTimerTick = 0;
    let standardTimerTotal = 30; // Frequency of standard small launches
    let centralTimerTick = 0;

    const loop = () => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      let i = fireworks.length;
      while (i--) { fireworks[i].draw(); fireworks[i].update(i); }

      let j = particles.length;
      while (j--) { particles[j].draw(); particles[j].update(j); }

      // Cursor Sparkler
      if (mouse.isMoving) {
        createParticles(mouse.x, mouse.y, random(0, 360), 3, 0.6); 
        mouse.isMoving = false;
      }

      // Logic used for standard small auto-launches
      if (standardTimerTick >= standardTimerTotal) {
        fireworks.push(new Firework(width / 2 + random(-200, 200), height, random(0, width), random(0, height / 2)));
        standardTimerTick = 0;
      } else {
        standardTimerTick++;
      }

      // NEW Logic for the massive central 2-second explosion
      if (centralTimerTick >= centralExplosionTimerTotal) {
          launchMassiveCentralExplosion();
          centralTimerTick = 0;
      } else {
          centralTimerTick++;
      }

      requestAnimationFrame(loop);
    };

    const animationId = requestAnimationFrame(loop);

    // --- Event Listeners ---
    const handleClick = (e: MouseEvent) => {
      createParticles(e.clientX, e.clientY, random(0, 360), particlesPerClick, 1.5);
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX; mouse.y = e.clientY; mouse.isMoving = true;
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 bg-transparent">
      <canvas ref={canvasRef} className="block w-full h-full"/>
    </div>
  );
};