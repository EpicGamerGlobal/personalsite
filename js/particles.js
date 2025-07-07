let canvas;
let ctx;
let particles = [];
let amount = 0;
let mouse = {x:0,y:0};
let radius = 2;
let timeouts = [];
let ww;
let wh;
let loaded = false;

addEventListener("DOMContentLoaded", () => {
    canvas = document.querySelector("#particle-canvas");
    ctx = canvas.getContext("2d");
    ww = canvas.width = window.innerWidth;
    wh = canvas.height = window.innerHeight;

    if (ww <= 540) {
        radius = 0.5;
    }

    window.addEventListener("resize", initSceneWait);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("click", onMouseClick);
    window.addEventListener("touchend", onTouchEnd);
    initScene();
    requestAnimationFrame(render);

    loaded = true;
});

function Particle(x, y, color) {
    this.x = Math.random() * ww;
    this.y = Math.random() * wh;
    this.dest = { x, y };
    this.r = Math.random() * 5 + 2;
    this.vx = (Math.random() - 0.5) * 20;
    this.vy = (Math.random() - 0.5) * 20;
    this.accX = 0;
    this.accY = 0;
    this.friction = Math.random() * 0.01 + 0.94;
    this.color = color;
}

Particle.prototype.render = function() {
    this.accX = (this.dest.x - this.x) / 100;
    this.accY = (this.dest.y - this.y) / 100;
    this.vx += this.accX;
    this.vy += this.accY;
    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx;
    this.y += this.vy;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.r, this.r);

    let a = this.x - mouse.x;
    let b = this.y - mouse.y;
    let distance = Math.sqrt(a * a + b * b);

    if (distance < radius * 70) {
        this.accX = (this.x - mouse.x) / 100;
        this.accY = (this.y - mouse.y) / 100;
        this.vx += this.accX;
        this.vy += this.accY;
    }
};

function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function onTouchMove(e) {
    if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
}

function onTouchEnd() {
    mouse.x = -9999;
    mouse.y = -9999;
}

function initScene() {
    ww = canvas.width = window.innerWidth;
    wh = canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = 'images/logo.jpg'; // or logo.png if you change it

    img.onload = function() {
        console.log("✅ Image loaded!");

        // Draw larger image, centered
        ctx.drawImage(img, ww / 2 - 256, wh / 2 - 256, 512, 512);

        let imageData = ctx.getImageData(0, 0, ww, wh);
        let data = imageData.data;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "screen";

        particles = [];

        for (let i = 0; i < ww; i += 4) { // denser sampling
            for (let j = 0; j < wh; j += 4) {
                let index = ((i + j * ww) * 4);
                let alpha = data[index + 3];

                if (alpha > 150) {
                    let r = data[index];
                    let g = data[index + 1];
                    let b = data[index + 2];
                    let color = `rgb(${r},${g},${b})`;

                    particles.push(new Particle(i, j, color));
                }
            }
        }

        amount = particles.length;
        console.log(`✅ Particles created: ${amount}`);

        if (amount === 0) {
            console.log("⚠️ No particles from image, adding test particles...");
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(Math.random() * ww, Math.random() * wh, "rgb(255,0,0)"));
            }
            amount = particles.length;
        }
    };

    img.onerror = function() {
        console.error("❌ Failed to load image!");
    };
}


function onMouseClick() {
    radius++;
    if (radius >= 5) radius = 2;
    if (ww <= 540) radius = 0.5;
}

function render() {
    requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < amount; i++) {
        particles[i].render();
    }
}

function initSceneWait() {
    if (loaded && window.innerWidth <= 540) return;

    while (timeouts.length > 0) {
        clearTimeout(timeouts.pop());
    }

    const timeout = setTimeout(initScene, 1500);
    timeouts.push(timeout);
}
