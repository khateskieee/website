// Existing + Web3 Background Effects

// Reduced Motion Check
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.remove('reduced-motion');
}

// Scroll Reveal (preserved)
const revealElements = document.querySelectorAll('.reveal-text');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('revealed');
  });
}, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
revealElements.forEach(el => observer.observe(el));

// Initial reveal
window.addEventListener('load', () => {
  document.querySelectorAll('.slide').forEach(slide => {
    const texts = slide.querySelectorAll('.reveal-text');
    texts.forEach(t => {
      if (isElementInViewport(slide)) t.classList.add('revealed');
    });
  });
});
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight - 100;
}

// Existing Parallax/Tilt/Active Slide (preserved/enhanced)
document.querySelectorAll('.slide').forEach(slide => {
  const parallaxBg = slide.querySelector('.parallax-bg');
  if (parallaxBg) {
    slide.addEventListener('mousemove', (e) => {
      const rect = slide.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const moveX = (x - 0.5) * 30; // Increased
      const moveY = (y - 0.5) * 30;
      parallaxBg.style.setProperty('--mouse-x', `${x * 100}%`);
      parallaxBg.style.setProperty('--mouse-y', `${y * 100}%`);
    });
  }
});

const tiltItems = document.querySelectorAll('.tilt-card, .float-card, .identity-card, .timeline-item');
tiltItems.forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = y / 15;
    const rotateY = -x / 15;
    item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  });
  item.addEventListener('mouseleave', () => {
    item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  });
});

// Active Slide Glow (preserved)
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');
const container = document.getElementById('slidesContainer');
let rafId;
container.addEventListener('scroll', () => {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    const scrollPos = container.scrollTop / window.innerHeight;
    const newIndex = Math.round(scrollPos);
    if (newIndex !== currentSlideIndex && newIndex >= 0 && newIndex < slides.length) {
      currentSlideIndex = newIndex;
      slides.forEach((s, idx) => {
        const mainCard = s.querySelector('.glass-card');
        if (mainCard && idx === currentSlideIndex) {
          mainCard.style.borderColor = '#F483C4';
          mainCard.style.boxShadow = '0 0 25px #F483C4';
        } else if (mainCard) {
          mainCard.style.borderColor = 'rgba(227,22,132,0.25)';
        }
      });
    }
  });
});

// === NEW WEB3 BACKGROUND ===
// 1. Canvas Mesh/Particles/Liquid
class Web3Mesh {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.particles = this.initParticles(150);
    this.time = 0;
    this.mouse = { x: 0.5, y: 0.5 };
    this.scrollY = 0;
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX / window.innerWidth;
      this.mouse.y = e.clientY / window.innerHeight;
    });
    document.getElementById('slidesContainer').addEventListener('scroll', (e) => this.scrollY = e.target.scrollTop);
    this.animate();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  initParticles(num) {
    const particles = [];
    for (let i = 0; i < num; i++) {
      particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        hue: Math.random() * 320 + 300, // Pink-purple range
        life: 1
      });
    }
    return particles;
  }
  
  animate() {
    this.ctx.fillStyle = 'rgba(246, 217, 232, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.time += 0.01;
    
    this.particles.forEach((p, i) => {
      // Mouse attraction
      const dx = this.mouse.x * this.canvas.width - p.x;
      const dy = this.mouse.y * this.canvas.height - p.y;
      p.vx += dx * 0.0002;
      p.vy += dy * 0.0002;
      
      // Scroll wave
      p.vy -= Math.sin((p.x + this.scrollY * 0.01 + this.time * 10) * 0.01) * 0.3;
      
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      
      // Boundary wrap
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
      
      // Draw trail
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
      gradient.addColorStop(0, `hsla(${p.hue}, 70%, 60%, ${p.life * 0.8})`);
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Pulse
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.life})`;
      this.ctx.fill();
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Init Mesh
const meshCanvas = document.getElementById('bgMesh');
if (meshCanvas && !document.body.classList.contains('reduced-motion')) {
  new Web3Mesh(meshCanvas);
}

// Cursor Glow Follow
const cursorGlow = document.querySelector('.cursor-glow');
document.addEventListener('mousemove', (e) => {
  if (cursorGlow) {
    cursorGlow.style.left = e.clientX - 100 + 'px';
    cursorGlow.style.top = e.clientY - 100 + 'px';
    cursorGlow.style.opacity = '1';
  }
});

// Scroll Section Blend
const slideColors = [
  'radial-gradient(circle, #F483C440 0%, var(--color-bg) 50%)',
  'linear-gradient(135deg, #EB6BAD20, var(--color-bg))',
  'radial-gradient(circle at center, #E3168420, var(--color-bg))',
  'linear-gradient(45deg, #F483C420, var(--color-bg))',
  'radial-gradient(ellipse, #EB6BAD30, var(--color-bg))',
  'linear-gradient(90deg, #F6D9E820, var(--color-bg))',
  'radial-gradient(circle, #E3168430, var(--color-bg))',
  'linear-gradient(135deg, #F483C430, var(--color-bg))',
  'radial-gradient(ellipse at bottom, #EB6BAD40, var(--color-bg))'
];

// Static bottom progress line (full static, no animation/movement)
const progressLine = document.createElement('div');
progressLine.id = 'staticProgress';
progressLine.style.cssText = `
  position: fixed; bottom: 0; left: 0; height: 4px; background: linear-gradient(90deg, var(--color-primary), var(--color-accent)); 
  width: 100%; z-index: 10000; opacity: 0.9; box-shadow: 0 0 12px var(--color-accent); transition: none;
`;
document.body.appendChild(progressLine);

let scrollProgress = 0;
document.getElementById('slidesContainer').addEventListener('scroll', (e) => {
  scrollProgress = e.target.scrollTop / (e.target.scrollHeight - window.innerHeight);
  document.body.style.setProperty('--scroll-progress', scrollProgress);
  const slideIdx = Math.floor(scrollProgress * (slideColors.length - 1));
  document.body.style.backgroundBlend = slideColors[slideIdx];
});

// Existing Particles Enhanced (fade to new mesh)
function createFloatingShapes() {
  const containerP = document.createElement('div');
  containerP.id = 'floatingShapes';
  containerP.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;overflow:hidden;';
  
  for (let i = 0; i < 12; i++) {
    const shape = document.createElement('div');
    shape.style.cssText = `
      position:absolute;width:40px;height:40px;background:radial-gradient(circle, hsla(320,70%,60%,0.3), transparent);border-radius:50% 20%;filter:blur(1px);
      left:${Math.random()*100}%;top:${Math.random()*100}%;animation:floatShape ${20+Math.random()*20}s linear infinite;animation-delay:${Math.random()*10}s;
    `;
    containerP.appendChild(shape);
  }
  
  document.body.appendChild(containerP);
}

if (!document.body.classList.contains('reduced-motion')) createFloatingShapes();

// Icon glows (preserved)
document.querySelectorAll('.identity-card i, .timeline-item i, .step i, .timeline-node i').forEach(icon => {
  icon.addEventListener('mouseenter', () => icon.style.filter = 'drop-shadow(0 0 8px #F483C4)');
  icon.addEventListener('mouseleave', () => icon.style.filter = 'none');
});

// === NEW FEATURES ===

// 1. Interactive Roadmap Timeline
const roadmapContainer = document.getElementById('roadmapTimeline');
const progressFill = document.querySelector('.progress-fill');
const timelineNodes = document.querySelectorAll('.timeline-node');
const previewPanel = document.getElementById('timelinePreview');
// No modal needed

const containerScroll = document.getElementById('slidesContainer');

let roadmapProgress = 0;

// Update progress based on scroll in Slide 6
containerScroll.addEventListener('scroll', () => {
  const scrollTop = containerScroll.scrollTop;
  const slide6Top = document.getElementById('slide6').offsetTop;
  const slide6Height = window.innerHeight;
  const relativeScroll = Math.max(0, Math.min(1, (scrollTop - slide6Top) / slide6Height));
  roadmapProgress = relativeScroll;
  if (progressFill) progressFill.style.width = `${roadmapProgress * 100}%`;
});


// Timeline node hovers
timelineNodes.forEach((node, index) => {
  node.addEventListener('mouseenter', () => {
    previewPanel.textContent = node.dataset.preview || 'Explore Maartie collections';
    previewPanel.style.opacity = '1';
    previewPanel.style.visibility = 'visible';
  });
  node.addEventListener('mouseleave', () => {
    previewPanel.style.opacity = '0';
    previewPanel.style.visibility = 'hidden';
  });
});

// Modal functionality removed


// 2. Theme Switcher + Affirmation Particles
const themeToggle = document.getElementById('themeToggle');
let isDark = false;
const affirmations = ['I am confident', 'Self-care is power', 'I own my style', 'Maartie empowers me'];

themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  document.body.classList.toggle('dark', isDark);
  themeToggle.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  
  // Spawn affirmations
  affirmations.forEach((text, i) => {
    setTimeout(() => spawnAffirmation(text), i * 200);
  });
});

// Function to spawn affirmation particle (integrate with mesh)
function spawnAffirmation(text) {
  const affirmation = document.createElement('div');
  affirmation.className = 'affirmation-particle';
  affirmation.textContent = text;
  affirmation.style.left = Math.random() * 100 + '%';
  affirmation.style.top = '100vh';
  affirmation.style.opacity = '0.8';
  affirmation.style.fontSize = '1.2rem';
  affirmation.style.fontWeight = 'bold';
  affirmation.style.color = 'var(--color-primary)';
  affirmation.style.position = 'fixed';
  affirmation.style.zIndex = '10';
  affirmation.style.pointerEvents = 'none';
  affirmation.style.transition = 'all 4s var(--ease-fashion)';
  document.body.appendChild(affirmation);
  
  // Animate up and fade
  requestAnimationFrame(() => {
    affirmation.style.transform = 'translateY(-100vh) rotate(10deg)';
    affirmation.style.opacity = '0';
  });
  
  // Remove after animation
  setTimeout(() => affirmation.remove(), 4000);
}

