import React, { useEffect, useRef } from 'react';

export const RealisticFireworks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Resize handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    // --- Configuration ---
    const gravity = 0.04;
    const friction = 0.96; // simulates air resistance
    const particlesPerExplosion = 80; // MUCH higher than DOM methods
    
    // --- State ---
    let fireworks: Firework[] = [];
    let particles: Particle[] = [];

    // --- Utility ---
    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    // --- Classes ---

    // The "Rocket" that shoots up
    class Firework {
      x: number;
      y: number;
      sx: number; // start x
      sy: number; // start y
      tx: number; // target x
      ty: number; // target y
      distanceToTarget: number;
      distanceTraveled: number;
      coordinates: [number, number][];
      angle: number;
      speed: number;
      acceleration: number;
      brightness: number;
      targetRadius: number;
      hue: number;

      constructor(sx: number, sy: number, tx: number, ty: number) {
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.tx = tx;
        this.ty = ty;
        this.distanceToTarget = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = random(50, 70);
        this.targetRadius = 1;
        this.hue = random(0, 360); // Random color

        // Create trail history
        for (let i = 0; i < 3; i++) {
          this.coordinates.push([sx, sy]);
        }
      }

      update(index: number) {
        // Remove last coordinate, add current
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        // Cycle target circle radius
        if (this.targetRadius < 8) this.targetRadius += 0.3;
        else this.targetRadius = 1;

        // Speed up
        this.speed *= this.acceleration;

        // Velocity
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;

        this.distanceTraveled = Math.sqrt(Math.pow(this.sx - this.x, 2) + Math.pow(this.sy - this.y, 2));

        if (this.distanceTraveled >= this.distanceToTarget) {
          // Reached target -> Explode!
          createParticles(this.tx, this.ty, this.hue);
          fireworks.splice(index, 1);
        } else {
          this.x += vx;
          this.y += vy;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        // Draw trail
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.stroke();
      }
    }

    // The explosion debris
    class Particle {
      x: number;
      y: number;
      coordinates: [number, number][];
      angle: number;
      speed: number;
      friction: number;
      gravity: number;
      hue: number;
      brightness: number;
      alpha: number;
      decay: number;

      constructor(x: number, y: number, hue: number) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        for (let i = 0; i < 5; i++) {
          this.coordinates.push([x, y]);
        }
        
        // Random explosion angle
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 10); // Varied explosive force
        this.friction = friction;
        this.gravity = gravity;
        
        // Add variation to hue for realism
        this.hue = random(hue - 20, hue + 20);
        this.brightness = random(50, 80);
        this.alpha = 1;
        
        // How fast it fades
        this.decay = random(0.015, 0.03);
      }

      update(index: number) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity; // Add gravity

        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
          particles.splice(index, 1);
        }
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

    function createParticles(x: number, y: number, hue: number) {
      for (let i = 0; i < particlesPerExplosion; i++) {
        particles.push(new Particle(x, y, hue));
      }
    }

    // Automatic Launch loop
    let timerTick = 0;
    let timerTotal = 40; // Frequency of auto-launches
    let limiterTick = 0;
    let limiterTotal = 5; // Click limitation

    const loop = () => {
      // 1. Clear canvas BUT leave a trail (ghosting effect)
      // This is the secret to realistic light trails
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Adjust alpha for trail length
      ctx.fillRect(0, 0, width, height);

      // 2. Set blend mode to 'lighter' for glowing effect
      ctx.globalCompositeOperation = 'lighter';

      // 3. Update/Draw Fireworks (Rockets)
      let i = fireworks.length;
      while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
      }

      // 4. Update/Draw Particles (Explosions)
      let j = particles.length;
      while (j--) {
        particles[j].draw();
        particles[j].update(j);
      }

      // 5. Auto Launch logic
      if (timerTick >= timerTotal) {
        // Launch a rocket from bottom center(ish) to random spot
        const startX = width / 2 + random(-200, 200); // Varied launch x
        const startY = height;
        const targetX = random(0, width);
        const targetY = random(0, height / 2); // Top half of screen
        
        fireworks.push(new Firework(startX, startY, targetX, targetY));
        timerTick = 0;
      } else {
        timerTick++;
      }

      requestAnimationFrame(loop);
    };

    const animationId = requestAnimationFrame(loop);

    // Optional: Mouse click launches
    const handleClick = (e: MouseEvent) => {
      fireworks.push(new Firework(width / 2, height, e.clientX, e.clientY));
    };
    canvas.addEventListener('mousedown', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-0 pointer-events-none">
       {/* Set pointer-events-auto if you want the click-to-explode feature */}
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
      />
    </div>
  );
};