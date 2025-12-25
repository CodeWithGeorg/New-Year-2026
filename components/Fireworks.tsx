
import React, { useEffect, useRef } from 'react';

export const Fireworks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const lastMouseLaunch = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
    const defaultGravity = 0.05;
    const defaultFriction = 0.95; 
    const particlesPerExplosion = 80; 
    
    // --- State ---
    let fireworks: Firework[] = [];
    let particles: Particle[] = [];
    let flashOpacity = 0;
    let flashHue = 0;

    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    class Firework {
      x: number; y: number; sx: number; sy: number; tx: number; ty: number;
      distanceToTarget: number; distanceTraveled: number;
      coordinates: [number, number][];
      angle: number; speed: number; acceleration: number; hue: number;
      isMassive: boolean;

      constructor(sx: number, sy: number, tx: number, ty: number, hue?: number, isMassive: boolean = false) {
        this.x = sx; this.y = sy; this.sx = sx; this.sy = sy; this.tx = tx; this.ty = ty;
        this.distanceToTarget = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = isMassive ? 3 : 2;
        this.acceleration = 1.04;
        this.hue = hue ?? random(0, 360);
        this.isMassive = isMassive;
        for (let i = 0; i < 3; i++) this.coordinates.push([sx, sy]);
      }

      update(index: number) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.acceleration;
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = Math.sqrt(Math.pow(this.sx - this.x, 2) + Math.pow(this.sy - this.y, 2));

        if (this.distanceTraveled >= this.distanceToTarget) {
          if (this.isMassive) {
            launchMassiveExplosion(this.tx, this.ty, this.hue);
          } else {
            createParticles(this.tx, this.ty, this.hue, particlesPerExplosion);
            // Reduced flash intensity for standard explosions
            flashOpacity = Math.max(flashOpacity, 0.08);
            flashHue = this.hue;
          }
          fireworks.splice(index, 1);
        } else {
          this.x += vx;
          this.y += vy;
          // Shimmering trail
          if (Math.random() > (this.isMassive ? 0.2 : 0.5)) {
             particles.push(new Particle(
               this.x, this.y, 
               this.hue, 
               random(0.5, 3), 
               0.9, 0.02, 
               this.isMassive ? 0.04 : 0.08
             ));
          }
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(${this.hue}, 100%, 70%)`;
        ctx.lineWidth = this.isMassive ? 4 : 2;
        ctx.stroke();
      }
    }

    class Particle {
      x: number; y: number;
      coordinates: [number, number][];
      angle: number; speed: number; friction: number; gravity: number; hue: number; brightness: number; alpha: number; decay: number;

      constructor(x: number, y: number, hue: number, speedOverride?: number, frictionOverride?: number, gravityOverride?: number, decayOverride?: number) {
        this.x = x; this.y = y;
        this.coordinates = [];
        for (let i = 0; i < 6; i++) this.coordinates.push([x, y]);
        this.angle = random(0, Math.PI * 2);
        this.speed = speedOverride !== undefined ? speedOverride : random(1, 12);
        this.friction = frictionOverride !== undefined ? frictionOverride : defaultFriction;
        this.gravity = gravityOverride !== undefined ? gravityOverride : defaultGravity;
        this.hue = random(hue - 30, hue + 30);
        this.brightness = random(60, 95);
        this.alpha = 1;
        this.decay = decayOverride !== undefined ? decayOverride : random(0.01, 0.025);
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
        ctx.lineWidth = random(1.5, 3.5);
        ctx.stroke();
      }
    }

    function createParticles(x: number, y: number, hue: number, count: number) {
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, hue));
      }
    }

    function launchMassiveExplosion(x: number, y: number, manualHue?: number) {
      const hue = manualHue ?? random(0, 360);
      const count = 600; 
      // Reduced flash intensity for massive explosions (was 0.7)
      flashOpacity = 0.3; 
      flashHue = hue;

      for (let i = 0; i < count; i++) {
        const speed = random(10, 45);
        const friction = 0.97;
        const gravity = 0.04;
        const decay = random(0.003, 0.012);
        
        particles.push(new Particle(
          x, y, hue, 
          speed, 
          friction, 
          gravity, 
          decay
        ));
      }
    }

    // Interaction Handlers
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      // Sparkle trail
      for (let i = 0; i < 2; i++) {
        particles.push(new Particle(mousePos.current.x, mousePos.current.y, random(0, 360), random(1, 6), 0.94, 0.01, 0.04));
      }
      
      const now = Date.now();
      if (now - lastMouseLaunch.current > 400) {
        fireworks.push(new Firework(width / 2, height, mousePos.current.x, mousePos.current.y));
        lastMouseLaunch.current = now;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      launchMassiveExplosion(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    // Initial sequence
    setTimeout(() => launchMassiveExplosion(width / 2, height / 2.5), 800);

    let timerTick = 0;
    let timerTotal = 30;
    let constantFireworkTick = 0;

    const loop = () => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';

      // Enhanced Screen Lighting Effect (Reduced global intensity)
      if (flashOpacity > 0) {
        ctx.fillStyle = `hsla(${flashHue}, 100%, 30%, ${flashOpacity})`;
        ctx.fillRect(0, 0, width, height);
        flashOpacity -= 0.01; // Slightly slower fade for the now-subtler flash
      }

      let i = fireworks.length;
      while (i--) { fireworks[i].draw(); fireworks[i].update(i); }

      let j = particles.length;
      while (j--) { particles[j].draw(); particles[j].update(j); }

      // Standard ambient fireworks
      if (timerTick >= timerTotal) {
        fireworks.push(new Firework(width / 2 + random(-width/3, width/3), height, random(0, width), random(0, height / 2)));
        timerTick = 0;
      } else {
        timerTick++;
      }

      // THE MASSIVE CENTERBURST: Every ~4 seconds (240 frames at 60fps)
      if (constantFireworkTick >= 240) {
        // Launches from bottom-center to exactly center of the screen
        fireworks.push(new Firework(width / 2, height, width / 2, height / 2.2, random(0, 360), true));
        constantFireworkTick = 0;
      } else {
        constantFireworkTick++;
      }

      requestAnimationFrame(loop);
    };

    const animationId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black/95">
      <canvas ref={canvasRef} className="block w-full h-full cursor-none" />
    </div>
  );
};
