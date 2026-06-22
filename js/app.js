// Registration of GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initHero();
    initSequence();
    initCounters();
    initReveals();
    initLightbox();
});

/* --- Navbar Logic --- */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* --- Hero Entrance --- */
function initHero() {
    const tl = gsap.timeline();
    tl.to('.hero-logo-large', { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" })
      .to('.hero-subtitle', { opacity: 1, y: 0, duration: 1, ease: "power4.out" }, "-=0.8")
      .to('.cta-button', { opacity: 1, y: 0, duration: 1, ease: "power4.out" }, "-=0.8")
      .to('.hero-bg', { scale: 1, opacity: 0.15, duration: 2.5, ease: "power2.out" }, 0);
}

/* --- Cinematic Image Sequence Engine --- */
function initSequence() {
    const canvas = document.getElementById('sequence-canvas');
    const context = canvas.getContext('2d');
    const frameCount = 360;
    const preloader = document.getElementById('preloader');
    const progressLine = document.querySelector('.loader-progress');
    
    // Path configuration for 5-digit frames (00001.webp)
    const currentFrame = index => (
        `frames/${index.toString().padStart(5, '0')}.webp`
    );

    const images = [];
    const sequence = {
        frame: 1
    };

    // Preload important frames
    const preloadFirst = 50;
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
        
        img.onload = () => {
            loadedCount++;
            
            // Update preloader progress
            if (loadedCount <= preloadFirst) {
                const progress = (loadedCount / preloadFirst) * 100;
                gsap.to(progressLine, { width: `${progress}%`, duration: 0.2 });
            }

            if (loadedCount === preloadFirst) {
                // Fade out preloader
                gsap.to(preloader, { 
                    opacity: 0, 
                    duration: 1, 
                    onComplete: () => {
                        preloader.style.display = 'none';
                        render();
                    } 
                });
            }
        };
    }

    // GSAP ScrollTrigger for pinning and frame progress
    gsap.to(sequence, {
        frame: frameCount,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: ".experience-section",
            start: "top top",
            end: "bottom bottom",
            scrub: 1 // Smooth lerp
        },
        onUpdate: render // Render on every update
    });

    function render() {
        const img = images[Math.round(sequence.frame) - 1];
        if (img && img.complete) {
            scaleCanvas(canvas, context, img);
        }
    }

    // Canvas Scaling to maintain aspect ratio
    function scaleCanvas(canvas, context, img) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        const ratio = Math.max(windowWidth / imgWidth, windowHeight / imgHeight);
        const newWidth = imgWidth * ratio;
        const newHeight = imgHeight * ratio;
        
        const x = (windowWidth - newWidth) / 2;
        const y = (windowHeight - newHeight) / 2;

        canvas.width = windowWidth;
        canvas.height = windowHeight;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, x, y, newWidth, newHeight);
    }

    // Handle Resize
    window.addEventListener('resize', render);

    // Overlay Text Transitions
    const texts = document.querySelectorAll('.overlay-text');
    texts.forEach(text => {
        const triggerFrame = parseInt(text.getAttribute('data-frame'));
        
        gsap.to(text, {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
                trigger: ".experience-section",
                start: () => `top+=${(triggerFrame / frameCount) * (canvas.parentElement.parentElement.offsetHeight - window.innerHeight)} top`,
                end: () => `top+=${((triggerFrame + 30) / frameCount) * (canvas.parentElement.parentElement.offsetHeight - window.innerHeight)} top`,
                toggleActions: "play reverse play reverse"
            }
        });
    });

    // Scene Action Transitions
    const sceneActions = document.querySelectorAll('.scene-action-card');
    sceneActions.forEach(card => {
        const triggerFrame = parseInt(card.getAttribute('data-frame'));
        
        gsap.to(card, {
            opacity: 1,
            duration: 0.5,
            scrollTrigger: {
                trigger: ".experience-section",
                start: () => `top+=${(triggerFrame / frameCount) * (canvas.parentElement.parentElement.offsetHeight - window.innerHeight)} top`,
                end: () => `top+=${((triggerFrame + 50) / frameCount) * (canvas.parentElement.parentElement.offsetHeight - window.innerHeight)} top`,
                toggleActions: "play reverse play reverse"
            }
        });
    });
}

/* --- Counters Animation --- */
function initCounters() {
    const section = document.getElementById('counters');
    const counters = document.querySelectorAll('.counter-number');
    
    ScrollTrigger.create({
        trigger: section,
        start: "top 75%",
        onEnter: () => {
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                gsap.to(counter, {
                    innerText: target,
                    duration: 3,
                    snap: { innerText: 1 },
                    ease: "power2.out"
                });
            });
        },
        onLeaveBack: () => {
            counters.forEach(counter => {
                gsap.set(counter, { innerText: 0 }); // Reset when scrolling back up
            });
        }
    });
}

/* --- Reveal Animations --- */
function initReveals() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(el => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power4.out",
            scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    });
}

/* --- Lightbox Functionality --- */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const triggers = document.querySelectorAll('.lightbox-trigger');
    const closeBtn = document.querySelector('.lightbox-close');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            lightboxImg.src = trigger.src;
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    const closeLightbox = () => {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

/* --- Mobile Menu --- */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('open');
});
