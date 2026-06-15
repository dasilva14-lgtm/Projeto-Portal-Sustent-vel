// Acessibilidade
let currentFontLevel = 1;
const baseFontSize = 16;
let isDark = false;
let isReading = false;
const bodyEl = document.body;

function updateAccessibility() {
    if (isReading) {
        bodyEl.classList.add('reading-mode');
        bodyEl.classList.remove('dark-mode');
    } else if (isDark) {
        bodyEl.classList.add('dark-mode');
        bodyEl.classList.remove('reading-mode');
    } else {
        bodyEl.classList.remove('dark-mode', 'reading-mode');
    }
    
    let newSize = baseFontSize + (currentFontLevel - 1) * 4;
    document.documentElement.style.fontSize = newSize + 'px';
    
    setTimeout(() => {
        const expandedArticles = document.querySelectorAll('.article-card.expanded');
        expandedArticles.forEach(article => {
            article.style.maxHeight = 'none';
            setTimeout(() => {
                article.style.maxHeight = '';
            }, 10);
        });
    }, 50);
}

document.getElementById('darkModeBtn').onclick = () => { isDark = !isDark; if(isDark) isReading = false; updateAccessibility(); };
document.getElementById('readingModeBtn').onclick = () => { isReading = !isReading; if(isReading) isDark = false; updateAccessibility(); };
document.getElementById('increaseFontBtn').onclick = () => { if(currentFontLevel < 3) currentFontLevel++; updateAccessibility(); };
document.getElementById('decreaseFontBtn').onclick = () => { if(currentFontLevel > 1) currentFontLevel--; updateAccessibility(); };
updateAccessibility();

// Variáveis do p5
let portalRadius = 140;
let angle = 0;
let spiralAngle = 0;
let particles = [];
let transitionProgress = 0;
let audioCtx = null;
let portalCenter = { x: 0, y: 0 };
let beeX = 0, beeY = 0;
let showArticles = false;
let portalClicked = false;

function playPortalSound() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    osc.start();
    osc.stop(now + 0.6);
    
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.frequency.value = 2400;
    gain2.gain.setValueAtTime(0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    osc2.start();
    osc2.stop(now + 0.5);
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = random(-1, 1);
        this.vy = random(-1.5, -0.5);
        this.life = 255;
        this.size = random(3, 8);
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 5;
    }
    draw(p) {
        p.noStroke();
        p.fill(255, 220, 100, this.life);
        p.ellipse(this.x, this.y, this.size);
    }
    isDead() { return this.life <= 0; }
}

function setupParticlesAround(x, y, count) {
    for(let i=0; i<count; i++) {
        particles.push(new Particle(x + random(-25,25), y + random(-25,25)));
    }
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('position', 'fixed');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '-1');
    frameRate(60);
    portalCenter.x = width/2;
    portalCenter.y = height/2 + 40;
    beeX = portalCenter.x - 160;
    beeY = portalCenter.y - 80;
}

function draw() {
    if (showArticles) {
        let c1 = color(10, 30, 12);
        let c2 = color(35, 65, 30);
        for(let i=0; i<=height; i++) {
            let inter = map(i, 0, height, 0, 1);
            let c = lerpColor(c1, c2, inter);
            stroke(c);
            line(0, i, width, i);
        }
    } else {
        let c1 = color(10, 30, 12);
        let c2 = color(35, 65, 30);
        for(let i=0; i<=height; i++) {
            let inter = map(i, 0, height, 0, 1);
            let c = lerpColor(c1, c2, inter);
            stroke(c);
            line(0, i, width, i);
        }
    }
    
    if (!showArticles) {
        if (portalCenter.x !== width/2 || portalCenter.y !== height/2 + 40) {
            portalCenter.x = width/2;
            portalCenter.y = height/2 + 40;
            beeX = portalCenter.x - 160;
            beeY = portalCenter.y - 80;
        }
        
        let pulse = sin(angle * 2) * 12;
        let currentRadius = 140 + pulse;
        
        if (portalClicked && transitionProgress < 1) {
            transitionProgress += 0.025;
            currentRadius = lerp(140, width * 0.7, transitionProgress);
            setupParticlesAround(portalCenter.x, portalCenter.y, 2);
        } else if (portalClicked && transitionProgress >= 1 && !showArticles) {
            showArticles = true;
            document.getElementById('portal-phase').style.display = 'none';
            document.getElementById('articles-phase').style.display = 'block';
        }
        
        // Desenho do PORTAL
        push();
        translate(portalCenter.x, portalCenter.y);
        
        for(let i=0; i<16; i++) {
            let rad = currentRadius + sin(angle + i*0.5)*8;
            let alpha = map(sin(angle + i), -1, 1, 80, 220);
            fill(80, 200, 80, alpha);
            noStroke();
            ellipse(cos(i*PI/8)*rad*0.15, sin(i*PI/8)*rad*0.15, rad*0.4, rad*0.4);
        }
        
        fill(50, 150, 50, 200);
        ellipse(0, 0, currentRadius, currentRadius);
        fill(100, 210, 100, 180);
        ellipse(0, 0, currentRadius-20, currentRadius-20);
        
        // Espiral
        push();
        rotate(spiralAngle);
        for(let i=0; i<40; i++) {
            let t = i / 40;
            let r = map(t, 0, 1, 10, currentRadius - 30);
            let spiralAngleOffset = t * TWO_PI * 4;
            let x = cos(spiralAngleOffset) * r;
            let y = sin(spiralAngleOffset) * r;
            let alpha = map(sin(spiralAngleOffset + spiralAngle), -1, 1, 100, 255);
            fill(140, 255, 120, alpha);
            noStroke();
            ellipse(x, y, map(t, 0, 1, 6, 16), map(t, 0, 1, 6, 16));
        }
        pop();
        
        for(let ring = 0; ring < 3; ring++) {
            push();
            rotate(angle * (ring+1) * 0.8);
            let ringRadius = currentRadius - 35 - (ring * 25);
            noFill();
            stroke(180, 255, 140, 150);
            strokeWeight(3);
            ellipse(0, 0, ringRadius, ringRadius);
            pop();
        }
        pop();
        
        // Desenho da ABELHA com BALÃO DE FALA
        push();
        translate(beeX, beeY);
        let wingAngleLocal = sin(frameCount * 0.22) * 0.8;
        
        // Asas
        push();
        rotate(wingAngleLocal);
        fill(200, 220, 255, 200);
        ellipse(-15, -12, 22, 14);
        pop();
        
        push();
        rotate(-wingAngleLocal);
        fill(200, 220, 255, 200);
        ellipse(15, -12, 22, 14);
        pop();
        
        // Corpo
        fill(255, 200, 50);
        ellipse(0, 0, 20, 24);
        
        // Listras pretas
        fill(0, 0, 0);
        rect(-8, -10, 5, 20, 3);
        rect(3, -10, 5, 20, 3);
        
        // Cabeça
        fill(255, 200, 50);
        ellipse(0, -14, 14, 14);
        
        // Olhos
        fill(0, 0, 0);
        ellipse(-4, -16, 3, 4);
        ellipse(4, -16, 3, 4);
        
        // Brilho da abelha
        fill(255, 220, 80, 180);
        noStroke();
        ellipse(0, -20, 6, 6);
        
        // BALÃO DE FALA
        push();
        let bubbleX = 55;
        let bubbleY = -45;
        
        fill(255, 255, 220, 240);
        stroke(100, 80, 40);
        strokeWeight(1.5);
        ellipse(bubbleX, bubbleY, 95, 55);
        
        noStroke();
        fill(255, 255, 220, 240);
        triangle(bubbleX - 15, bubbleY + 15, bubbleX - 35, bubbleY + 25, bubbleX - 20, bubbleY + 5);
        
        fill(60, 40, 20);
        noStroke();
        textSize(11);
        textAlign(CENTER, CENTER);
        textFont('Inter');
        text("🐝 Clique no\nportal para\nver mais!", bubbleX, bubbleY);
        pop();
        
        pop();
        
        // Partículas
        for(let i=0; i<particles.length; i++) {
            particles[i].update();
            particles[i].draw(this);
        }
        particles = particles.filter(p => !p.isDead());
        
        if(frameCount % 6 === 0) {
            setupParticlesAround(beeX + 8, beeY - 10, 2);
            setupParticlesAround(portalCenter.x + random(-40,40), portalCenter.y + random(-40,40), 1);
        }
        
        angle += 0.045;
        spiralAngle += 0.03;
    } else {
        if(frameCount % 10 === 0) {
            setupParticlesAround(random(width), random(height), 1);
        }
        for(let i=0; i<particles.length; i++) {
            particles[i].update();
            particles[i].draw(this);
        }
        particles = particles.filter(p => !p.isDead());
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    portalCenter.x = width/2;
    portalCenter.y = height/2 + 40;
    beeX = portalCenter.x - 160;
    beeY = portalCenter.y - 80;
}

function mousePressed() {
    if (!showArticles) {
        let d = dist(mouseX, mouseY, portalCenter.x, portalCenter.y);
        if (d < 160 && !portalClicked) {
            portalClicked = true;
            playPortalSound();
            for(let i=0;i<40;i++) {
                particles.push(new Particle(portalCenter.x + random(-50,50), portalCenter.y + random(-50,50)));
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const artigo1 = document.getElementById('artigo1');
    const artigo2 = document.getElementById('artigo2');
    
    function fecharTodosArtigos() {
        artigo1.classList.remove('expanded');
        artigo2.classList.remove('expanded');
    }
    
    artigo1.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (artigo1.classList.contains('expanded')) {
            artigo1.classList.remove('expanded');
        } else {
            artigo2.classList.remove('expanded');
            artigo1.classList.add('expanded');
        }
    });
    
    artigo2.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (artigo2.classList.contains('expanded')) {
            artigo2.classList.remove('expanded');
        } else {
            artigo1.classList.remove('expanded');
            artigo2.classList.add('expanded');
        }
    });
    
    const backBtn = document.getElementById('back-to-portal');
    backBtn.addEventListener('click', () => {
        showArticles = false;
        portalClicked = false;
        transitionProgress = 0;
        document.getElementById('portal-phase').style.display = 'block';
        document.getElementById('articles-phase').style.display = 'block';
        setTimeout(() => {
            document.getElementById('articles-phase').style.display = 'none';
        }, 10);
        portalCenter.x = width/2;
        portalCenter.y = height/2 + 40;
        beeX = portalCenter.x - 160;
        beeY = portalCenter.y - 80;
        for(let i=0;i<30;i++) particles.push(new Particle(portalCenter.x + random(-80,80), portalCenter.y + random(-80,80)));
    });
});
