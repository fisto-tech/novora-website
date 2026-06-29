// Registration of GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

let lenisInstance;

document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initCursor();
    initNavbar();
    initHero();
    initSequence();
    initMarquee();
    initCounters();
    initReveals();
    initHorizontalScroll();
    initLightbox();
    initMaterials();
});

/* --- Smooth Scroll Engine (Lenis) --- */
function initSmoothScroll() {
    lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        syncTouch: false, // Maintain native touch scroll behavior on mobile/tablet
        touchInertiaMultiplier: 2,
    });

    // Update ScrollTrigger on Lenis scroll
    lenisInstance.on('scroll', ScrollTrigger.update);

    // Feed Lenis raf to GSAP ticker
    gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
    });

    // Disable lag smoothing in GSAP to prevent synchronization jitter
    gsap.ticker.lagSmoothing(0);

    // Smooth navigation anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Close mobile menu if active
            const navLinks = document.querySelector('.nav-links');
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (mobileMenuBtn) mobileMenuBtn.classList.remove('open');
                if (lenisInstance) lenisInstance.start();
            }

            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                e.preventDefault();
                lenisInstance.scrollTo(0);
                return;
            }
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                lenisInstance.scrollTo(targetEl, {
                    offset: 0,
                    duration: 1.2
                });
            }
        });
    });
}

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
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    const counter = document.querySelector('.lightbox-counter');
    const category = document.querySelector('.lightbox-category');
    const title = document.querySelector('.lightbox-title');
    
    // Gather all gallery items
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    if (galleryItems.length === 0) return;
    
    let currentIndex = 0;
    
    // Open Lightbox
    galleryItems.forEach((item, index) => {
        // Trigger on item click
        item.addEventListener('click', (e) => {
            currentIndex = index;
            showImage(currentIndex);
            
            // GSAP opening animation
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
            gsap.fromTo(lightboxImg, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, delay: 0.1, ease: "power3.out" });
            gsap.fromTo('.lightbox-header, .lightbox-footer, .lightbox-btn, .lightbox-close', 
                { y: 20, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.6, delay: 0.2, stagger: 0.05, ease: "power2.out" }
            );
        });
    });
    
    // Update image and text content with animation
    function showImage(index) {
        const item = galleryItems[index];
        if (!item) return;
        
        const img = item.querySelector('img');
        const itemTitle = item.getAttribute('data-title') || img.alt || '';
        const itemCategory = item.getAttribute('data-category') || '';
        
        // Before updating the image, perform a quick fade transition
        gsap.to(lightboxImg, {
            opacity: 0,
            scale: 0.98,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                
                // Update text
                if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}`;
                if (category) category.textContent = itemCategory;
                if (title) title.textContent = itemTitle;
                
                // Fade in new image
                gsap.to(lightboxImg, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.35,
                    ease: "power2.out"
                });
            }
        });
    }
    
    // Next Image
    const nextImage = () => {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        showImage(currentIndex);
    };
    
    // Prev Image
    const prevImage = () => {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        showImage(currentIndex);
    };
    
    // Close Lightbox
    const closeLightbox = () => {
        gsap.to(lightbox, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => {
                lightbox.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    };
    
    // Event Listeners
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
    
    // Close on clicking backdrop
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') closeLightbox();
    });
    
    // Touch gestures for mobile swipe
    let touchstartX = 0;
    let touchendX = 0;
    
    const handleGesture = () => {
        if (touchendX < touchstartX - 50) nextImage(); // Swipe left -> Next
        if (touchendX > touchstartX + 50) prevImage(); // Swipe right -> Prev
    };
    
    lightbox.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightbox.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        handleGesture();
    }, { passive: true });
}

/* --- Mobile Menu --- */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    const isActive = navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('open');
    
    // Toggle scroll ability when mobile overlay is active
    if (lenisInstance) {
        if (isActive) {
            lenisInstance.stop();
        } else {
            lenisInstance.start();
        }
    }
});

/* --- Materials Interactive Showcase --- */
function initMaterials() {
    const items = document.querySelectorAll('.material-item');
    const bg = document.getElementById('materials-bg');

    if(!bg) return;

    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Remove active class from all
            items.forEach(el => el.classList.remove('active'));
            // Add active class to hovered
            item.classList.add('active');
            
            // Change bg
            const newBg = item.getAttribute('data-bg');
            bg.style.backgroundImage = `url('${newBg}')`;
            
            // Slight zoom effect on background change
            gsap.fromTo(bg, { scale: 1.05 }, { scale: 1, duration: 1.5, ease: "power2.out" });
        });
    });
}

/* --- Custom Cursor --- */
function initCursor() {
    const cursor = document.querySelector('.custom-cursor');
    if(!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let speed = 0.2; // Adjust for smoother/faster tracking

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animateCursor = () => {
        let distX = mouseX - cursorX;
        let distY = mouseY - cursorY;
        
        cursorX += distX * speed;
        cursorY += distY * speed;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Standard hover items (nav links, buttons, materials)
    const hoverElements = document.querySelectorAll('a, button, .material-item');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    // Gallery specific hover cursor (expand VIEW circle)
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('gallery-hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('gallery-hover'));
    });
}

/* --- Infinite Marquee --- */
function initMarquee() {
    const marqueeContainer = document.querySelector('.marquee-text');
    if(!marqueeContainer) return;
    
    // Set up GSAP continuous animation
    gsap.to(marqueeContainer, {
        xPercent: -50,
        ease: "none",
        duration: 30, // Adjust speed
        repeat: -1
    });
}

/* --- Horizontal Scroll Gallery --- */
function initHorizontalScroll() {
    const section = document.getElementById('horizontal-projects');
    const wrapper = document.querySelector('.horizontal-wrapper');
    if(!section || !wrapper) return;

    function getScrollAmount() {
        let wrapperWidth = wrapper.scrollWidth;
        let windowWidth = window.innerWidth;
        return -(wrapperWidth - windowWidth + 80); // 80 for padding
    }

    const tween = gsap.to(wrapper, {
        x: getScrollAmount,
        ease: "none"
    });

    ScrollTrigger.create({
        trigger: section,
        start: "top 10%",
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true
    });
}
