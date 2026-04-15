// ===========================
// PROPERTIES DATA (dynamic from API)
// ===========================

// ⚙️ Change this to your deployed backend URL for production
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api'; // same-origin when frontend & backend are served together

let properties = []; // populated by fetchProperties()

async function fetchProperties() {
    try {
        const res = await fetch(`${API_BASE}/properties`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        // Normalise API shape to match what the rest of the script expects
        properties = data.map(p => ({
            id: p._id,
            title: p.title || '',
            location: p.location || '',
            city: p.city || '',
            propertyType: p.propertyType || '',
            price: p.price || '',
            beds: p.beds || 0,
            baths: p.baths || 0,
            area: p.area || '',
            image: p.image || '',
            gallery: (p.gallery && p.gallery.length) ? p.gallery : (p.image ? [p.image] : []),
            description: p.description || '',
            style: p.style || '',
            year: p.year || '',
            featured: p.featured || false
        }));
        renderDynamicProperties();
    } catch (e) {
        console.warn('Could not load properties from API:', e.message);
        // Leave properties = [] and show empty state
        renderDynamicProperties();
    }
}

function renderDynamicProperties() {
    // ── Properties section ────────────────────────────────
    const grid = document.getElementById('propertiesGrid');
    if (grid) {
        if (!properties.length) {
            grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:3rem 0;">No properties listed yet.</p>';
        } else {
            grid.innerHTML = properties.map((p, i) => `
                <div class="prop-card reveal" style="transition-delay:${i * 0.08}s" onclick="openpropertiesModal(${i})">
                    <div class="prop-img-wrap">
                        <img src="${p.image || ''}" alt="${p.title}" loading="lazy" onerror="this.style.opacity='.15'">
                        ${p.featured ? '<span class="prop-badge">Featured</span>' : ''}
                    </div>
                    <div class="prop-info">
                        <h3 class="prop-title">${p.title}</h3>
                        <p class="prop-loc">📍 ${p.location}${p.city ? ', ' + p.city : ''}</p>
                        <p class="prop-price">${p.price}</p>
                        <div class="prop-meta">
                            ${p.beds ? `<span>🛏 ${p.beds} Beds</span>` : ''}
                            ${p.baths ? `<span>🚿 ${p.baths} Baths</span>` : ''}
                            ${p.area ? `<span>📐 ${p.area}</span>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
            initStaticProperties(); // re-apply tilt/reveal on new cards
        }
    }

    // ── Gallery section (featured properties) ────────────
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
        const featured = properties.filter(p => p.featured);
        const list = featured.length ? featured : properties.slice(0, 6);
        if (list.length) {
            galleryGrid.innerHTML = list.map((p, i) => `
                <div class="gallery-card reveal" onclick="openStaticLightbox(${i})">
                    <div class="gc-img">
                        <img src="${p.image || ''}" alt="${p.title}" loading="lazy" onerror="this.style.opacity='.15'">
                    </div>
                    <div class="gc-info">
                        <h4>${p.title}</h4>
                        <p>${p.location}${p.city ? ', ' + p.city : ''}</p>
                        <span>${p.price}</span>
                    </div>
                </div>
            `).join('');
            initStaticGallery(); // re-init gallery scroll + dots
        }
    }
}

// ===========================
// STATE
// ===========================
let wishlist = [];
let currentGalleryImages = [];
let currentGalleryIndex = 0;
let currentModalproperties = null;

// ===========================
// DOM READY
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initScrollProgress();
    initCursorGlow();
    initDarkMode();
    initNavbar();
    initMobileMenu();
    initTypingEffect();
    initScrollReveal();
    initAnimatedCounters();
    init3DTilt();
    initMagneticButtons();
    // Fetch properties from API, then render gallery & properties cards:
    fetchProperties();
    initLightbox();
    initpropertiesModal();
    initWishlist();
    initForms();
    initFilters();
    initVideoTestimonials();
    initSmoothScroll();
    initParallax();
});

// ===========================
// 1. PRELOADER WITH LOGO
// ===========================
function initPreloader() {
    // Preloader removed — trigger hero animations immediately
    document.body.style.overflow = '';
    document.querySelectorAll('.anim-fade-up, .anim-fade-down').forEach(el => {
        el.style.animationPlayState = 'running';
    });
}

// ===========================
// 2. SCROLL PROGRESS BAR
// ===========================
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        bar.style.width = progress + '%';
    }, { passive: true });
}

// ===========================
// 3. CURSOR GLOW EFFECT (DISABLED)
// ===========================
function initCursorGlow() {
    return; // Cursor glow disabled
}

// ===========================
// 4. DARK MODE TOGGLE
// ===========================
function initDarkMode() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return; // Dark mode toggle removed
    const stored = localStorage.getItem('ve-theme');
    if (stored) document.documentElement.setAttribute('data-theme', stored);
}

// ===========================
// 5. TYPING HERO EFFECT
// ===========================
function initTypingEffect() {
    const el = document.getElementById('typingText');
    if (!el) return;

    const phrases = [
        'Discover Homes Beyond Ordinary',
        'Luxury Living Redefined',
        'Where Dreams Meet Design',
        'Your Perfect Home Awaits'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function type() {
        const current = phrases[phraseIndex];

        if (isDeleting) {
            el.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40;
        } else {
            el.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 80;
        }

        if (!isDeleting && charIndex === current.length) {
            typeSpeed = 2500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 400;
        }

        setTimeout(type, typeSpeed);
    }

    // Start after preloader
    setTimeout(type, 1500);
}

// ===========================
// 6. ANIMATED COUNTERS
// ===========================
function initAnimatedCounters() {
    const counters = document.querySelectorAll('.counter');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target + suffix;
        }
    }

    requestAnimationFrame(update);
}

// ===========================
// 7. 3D CARD TILT EFFECT
// ===========================
function init3DTilt() {
    // Will be applied dynamically to cards after render
    applyTiltToCards();
}

function applyTiltToCards() {
    const cards = document.querySelectorAll('.properties-card, .gallery-card, .video-testimonial-card');
    
    cards.forEach(card => {
        if (card.dataset.tiltBound) return;
        card.dataset.tiltBound = 'true';

        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 768) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.5s ease';
            setTimeout(() => card.style.transition = '', 500);
        });
    });
}

// ===========================
// 8. MAGNETIC BUTTONS
// ===========================
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 768) return;
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
            setTimeout(() => btn.style.transition = '', 400);
        });
    });
}

// ===========================
// 9. VIDEO TESTIMONIALS
// ===========================
function initVideoTestimonials() {
    const playBtns = document.querySelectorAll('.vtc-play-btn');

    playBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const wrap = btn.closest('.vtc-video-wrap');
            const video = wrap.querySelector('video');

            if (video.paused) {
                // Pause all other videos first
                document.querySelectorAll('.vtc-video-wrap video').forEach(v => {
                    v.pause();
                    v.closest('.vtc-video-wrap').querySelector('.vtc-play-btn').classList.remove('playing');
                });
                video.play();
                btn.classList.add('playing');
            } else {
                video.pause();
                btn.classList.remove('playing');
            }
        });
    });

    // Pause video when out of view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                const video = entry.target.querySelector('video');
                const playBtn = entry.target.querySelector('.vtc-play-btn');
                if (video && !video.paused) {
                    video.pause();
                    playBtn?.classList.remove('playing');
                }
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.vtc-video-wrap').forEach(w => observer.observe(w));
}

// ===========================
// NAVBAR SCROLL
// ===========================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
}

// ===========================
// MOBILE MENU
// ===========================
function initMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    const close = document.getElementById('mobileClose');

    function open() { hamburger.classList.add('active'); menu.classList.add('active'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function closeFn() { hamburger.classList.remove('active'); menu.classList.remove('active'); overlay.classList.remove('active'); document.body.style.overflow = ''; }

    hamburger.addEventListener('click', () => menu.classList.contains('active') ? closeFn() : open());
    close.addEventListener('click', closeFn);
    overlay.addEventListener('click', closeFn);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeFn));
}

// ===========================
// SCROLL REVEAL
// ===========================
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

    document.querySelectorAll('.reveal, .reveal-wipe').forEach(el => observer.observe(el));
}

// ===========================
// STATIC PROPERTIES INIT (cards are in HTML)
// ===========================
function initStaticProperties() {
    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;
    grid.querySelectorAll('.reveal').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.08}s`;
    });
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    applyTiltToCards();
}

// ===========================
// STATIC GALLERY INIT (snap + auto-scroll, cards are in HTML)
// ===========================
let galleryAutoScrollTimer = null;

function initStaticGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.gallery-card');
    const total = cards.length;
    if (!total) return;

    // Build dots
    const dotsWrap = document.getElementById('gnavDots');
    if (dotsWrap) {
        dotsWrap.innerHTML = Array.from({ length: total }, (_, i) =>
            `<span class="gnav-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
        ).join('');
        dotsWrap.querySelectorAll('.gnav-dot').forEach(dot => {
            dot.addEventListener('click', () => { scrollGalleryTo(Number(dot.dataset.index)); resetGalleryAutoScroll(); });
        });
    }

    const prev = document.getElementById('gnavPrev');
    const next = document.getElementById('gnavNext');
    if (prev) prev.onclick = () => { scrollGalleryBy(-1); resetGalleryAutoScroll(); };
    if (next) next.onclick = () => { scrollGalleryBy(1); resetGalleryAutoScroll(); };

    grid.addEventListener('scroll', updateActiveDot);
    grid.addEventListener('mouseenter', stopGalleryAutoScroll);
    grid.addEventListener('mouseleave', startGalleryAutoScroll);
    grid.addEventListener('touchstart', stopGalleryAutoScroll, { passive: true });
    grid.addEventListener('touchend', () => setTimeout(startGalleryAutoScroll, 3000), { passive: true });

    startGalleryAutoScroll();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    applyTiltToCards();
}

// Static-gallery lightbox: uses the card's own <img src> as the single image
window.openStaticLightbox = function (cardIndex) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.gallery-card');
    const card = cards[cardIndex];
    if (!card) return;
    const img = card.querySelector('.gc-img img');
    if (!img) return;
    currentGalleryImages = [img.src];
    currentGalleryIndex = 0;
    updateLightboxImage();
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
};

function getCurrentGalleryIndex() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return 0;
    const cards = grid.querySelectorAll('.gallery-card');
    if (!cards.length) return 0;
    const cardWidth = cards[0].getBoundingClientRect().width + 32;
    return Math.min(cards.length - 1, Math.max(0, Math.round(grid.scrollLeft / cardWidth)));
}

function scrollGalleryTo(index) {
    const grid = document.getElementById('galleryGrid');
    const cards = grid.querySelectorAll('.gallery-card');
    if (!cards[index]) return;
    const card = cards[index];
    const gridRect = grid.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const offset = cardRect.left - gridRect.left + grid.scrollLeft - (gridRect.width - cardRect.width) / 2;
    grid.scrollTo({ left: offset, behavior: 'smooth' });
}

function scrollGalleryBy(direction) {
    const grid = document.getElementById('galleryGrid');
    const total = grid ? grid.querySelectorAll('.gallery-card').length : 0;
    if (!total) return;
    let next = getCurrentGalleryIndex() + direction;
    if (next < 0) next = total - 1;
    if (next >= total) next = 0;
    scrollGalleryTo(next);
}

function updateActiveDot() {
    const idx = getCurrentGalleryIndex();
    document.querySelectorAll('.gnav-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

function startGalleryAutoScroll() {
    stopGalleryAutoScroll();
    galleryAutoScrollTimer = setInterval(() => scrollGalleryBy(1), 4000);
}

function stopGalleryAutoScroll() {
    if (galleryAutoScrollTimer) { clearInterval(galleryAutoScrollTimer); galleryAutoScrollTimer = null; }
}

function resetGalleryAutoScroll() {
    stopGalleryAutoScroll();
    setTimeout(startGalleryAutoScroll, 3000);
}

// ===========================
// LIGHTBOX
// ===========================
function initLightbox() {
    document.getElementById('lbClose').addEventListener('click', closeLightbox);
    document.getElementById('lbPrev').addEventListener('click', () => navigateLightbox(-1));
    document.getElementById('lbNext').addEventListener('click', () => navigateLightbox(1));
    document.getElementById('lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') closeLightbox(); });
    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('lightbox').classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

function openLightbox(propertiesId) {
    const prop = properties.find(p => String(p.id) === String(propertiesId));
    if (!prop) return;
    currentGalleryImages = prop.gallery;
    currentGalleryIndex = 0;
    updateLightboxImage();
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(dir) {
    currentGalleryIndex += dir;
    if (currentGalleryIndex < 0) currentGalleryIndex = currentGalleryImages.length - 1;
    if (currentGalleryIndex >= currentGalleryImages.length) currentGalleryIndex = 0;
    updateLightboxImage();
}

function updateLightboxImage() {
    document.getElementById('lbImage').src = currentGalleryImages[currentGalleryIndex];
    document.getElementById('lbCurrent').textContent = currentGalleryIndex + 1;
    document.getElementById('lbTotal').textContent = currentGalleryImages.length;
}

// ===========================
// properties MODAL
// ===========================
function initpropertiesModal() {
    document.getElementById('pmClose').addEventListener('click', closepropertiesModal);
    document.getElementById('propertiesModal').addEventListener('click', (e) => { if (e.target.id === 'propertiesModal') closepropertiesModal(); });
    document.getElementById('pmWishlist').addEventListener('click', () => { if (currentModalproperties) { addToWishlist(currentModalproperties); closepropertiesModal(); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.getElementById('propertiesModal').classList.contains('active')) closepropertiesModal(); });
}

function openpropertiesModal(index) {
    const p = properties[index];
    if (!p) return;
    currentModalproperties = p;
    document.getElementById('pmTitle').textContent = p.title;
    document.getElementById('pmImage').src = p.image;
    document.getElementById('pmPrice').textContent = p.price;
    document.getElementById('pmBeds').textContent = p.beds;
    document.getElementById('pmBaths').textContent = p.baths;
    document.getElementById('pmArea').textContent = p.area;
    document.getElementById('pmLocation').textContent = p.location;
    document.getElementById('pmDescription').textContent = p.description;
    document.getElementById('pmStyle').textContent = p.style;
    document.getElementById('pmYear').textContent = p.year;
    document.getElementById('propertiesModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closepropertiesModal() {
    document.getElementById('propertiesModal').classList.remove('active');
    document.body.style.overflow = '';
    currentModalproperties = null;
}

// ===========================
// WISHLIST
// ===========================
function initWishlist() {
    document.getElementById('wishlistBtn').addEventListener('click', openWishlistModal);
    document.getElementById('wmClose').addEventListener('click', closeWishlistModal);
    document.getElementById('wishlistModal').addEventListener('click', (e) => { if (e.target.id === 'wishlistModal') closeWishlistModal(); });
    document.getElementById('emailWishlistBtn').addEventListener('click', emailWishlist);
}

function addToWishlist(properties) {
    if (wishlist.find(w => w.id === properties.id)) { showToast('Already in wishlist!'); return; }
    wishlist.push({ id: properties.id, title: properties.title, price: properties.price, image: properties.image });
    document.getElementById('wishlistCount').textContent = wishlist.length;
    showToast('Added to wishlist!');
}

function removeFromWishlist(id) {
    wishlist = wishlist.filter(w => w.id !== id);
    document.getElementById('wishlistCount').textContent = wishlist.length;
    renderWishlistItems();
}

function openWishlistModal() { renderWishlistItems(); document.getElementById('wishlistModal').classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeWishlistModal() { document.getElementById('wishlistModal').classList.remove('active'); document.body.style.overflow = ''; }

function renderWishlistItems() {
    const container = document.getElementById('wishlistItems');
    if (wishlist.length === 0) { container.innerHTML = '<p class="wl-empty">No properties in your wishlist yet.</p>'; return; }
    container.innerHTML = wishlist.map(item => `
        <div class="wl-item"><img src="${item.image}" alt="${item.title}" width="80" height="80"><div class="wl-item-info"><h4>${item.title}</h4><p>${item.price}</p></div><button class="wl-remove" onclick="removeFromWishlist(${item.id})">✕</button></div>
    `).join('');
}

function emailWishlist() {
    if (wishlist.length === 0) { showToast('Wishlist is empty'); return; }
    const list = wishlist.map(w => `${w.title} - ${w.price}`).join('\n');
    window.location.href = `mailto:hello@vinodhaestates.com?subject=${encodeURIComponent('My Vinodha Estates Wishlist')}&body=${encodeURIComponent(`Hi,\n\nFavorite properties:\n\n${list}\n\nPlease share more info.\n\nThanks!`)}`;
}

// ===========================
// FILTERS
// ===========================
function initFilters() {
    const search = document.getElementById('searchInput');
    const price = document.getElementById('priceFilter');
    const beds = document.getElementById('bedsFilter');
    if (!search || !price || !beds) return; // Filters removed from page

    const filter = () => {
        const term = search.value.toLowerCase();
        const pv = price.value;
        const bv = beds.value;

        const filtered = properties.filter(p => {
            const matchSearch = p.title.toLowerCase().includes(term) || p.location.toLowerCase().includes(term);
            let matchPrice = true;
            if (pv === 'low') matchPrice = p.priceNum < 1500000000;
            if (pv === 'medium') matchPrice = p.priceNum >= 1500000000 && p.priceNum <= 2500000000;
            if (pv === 'high') matchPrice = p.priceNum > 2500000000;
            let matchBeds = true;
            if (bv) matchBeds = p.beds >= parseInt(bv);
            return matchSearch && matchPrice && matchBeds;
        });
        renderProperties(filtered);
    };

    search.addEventListener('input', filter);
    price.addEventListener('change', filter);
    beds.addEventListener('change', filter);
}

// ===========================
// FORMS
// ===========================
function initForms() {
    document.getElementById('contactForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.querySelector('[name="name"]').value.trim();
        const email = form.querySelector('[name="email"]').value.trim();
        const phone = form.querySelector('[name="phone"]').value.trim();
        const interest = form.querySelector('[name="interest"]').value;
        const message = form.querySelector('[name="message"]').value.trim();

        const interestMap = { buy: 'Buying a properties', sell: 'Selling a properties', invest: 'Investment Consultation', tour: 'Schedule a Tour' };
        const interestText = interestMap[interest] || 'General Inquiry';

        const waText = `Hi Vinodha Estates!%0A%0A` +
            `*Name:* ${encodeURIComponent(name)}%0A` +
            `*Email:* ${encodeURIComponent(email)}%0A` +
            `*Phone:* ${encodeURIComponent(phone)}%0A` +
            `*Interest:* ${encodeURIComponent(interestText)}%0A` +
            (message ? `*Message:* ${encodeURIComponent(message)}%0A` : '') +
            `%0ASent from VinodhaEstates.com`;

        const waUrl = `https://wa.me/919876543210?text=${waText}`;
        window.open(waUrl, '_blank');
        showToast('Redirecting to WhatsApp...');
        form.reset();
    });
    document.getElementById('nlForm')?.addEventListener('submit', (e) => { e.preventDefault(); showToast('Subscribed! Welcome aboard.'); e.target.reset(); });
}

// ===========================
// SMOOTH SCROLL
// ===========================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// ===========================
// PARALLAX HERO
// ===========================
function initParallax() {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const video = document.querySelector('.hero-video');
                if (video && window.scrollY < window.innerHeight) {
                    video.style.transform = `scale(${1 + window.scrollY * 0.0003})`;
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ===========================
// TOAST
// ===========================
function showToast(message) {
    document.querySelector('.toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `position:fixed;bottom:6rem;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#0d2147,#1a4fd4);color:#fff;padding:1rem 2.5rem;border-radius:50px;font-size:0.9rem;font-weight:500;z-index:3000;box-shadow:0 10px 30px rgba(10,22,40,0.3);animation:toastIn 0.4s cubic-bezier(0.16,1,0.3,1),toastOut 0.4s ease 2.5s forwards;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
}

// Inject toast keyframes
const style = document.createElement('style');
style.textContent = `@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px) scale(0.95)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}@keyframes toastOut{from{opacity:1}to{opacity:0;transform:translateX(-50%) translateY(20px)}}`;
document.head.appendChild(style);

// ===========================
// CATEGORY TOGGLE (expandable cards)
// ===========================
function toggleCategory(card) {
    // Don't toggle link cards
    if (card.classList.contains('cat-card-link')) return;
    
    const wasActive = card.classList.contains('active');
    
    // Close all other cards
    document.querySelectorAll('.cat-card.active').forEach(c => {
        if (c !== card) c.classList.remove('active');
    });
    
    // Toggle clicked card
    if (wasActive) {
        card.classList.remove('active');
    } else {
        card.classList.add('active');
    }
}

// ===========================
// CONSULTANCY FORM → WHATSAPP
// ===========================
function sendConsultancy() {
    const name = document.getElementById('consultName').value.trim();
    const phone = document.getElementById('consultPhone').value.trim();
    const query = document.getElementById('consultQuery').value.trim();

    if (!name || !phone) {
        showToast('Please enter your name and phone number');
        return;
    }

    const waText = `Hi Vinodha Estates!%0A%0A` +
        `*Consultancy Enquiry*%0A` +
        `*Name:* ${encodeURIComponent(name)}%0A` +
        `*Phone:* ${encodeURIComponent(phone)}%0A` +
        (query ? `*Query:* ${encodeURIComponent(query)}%0A` : '') +
        `%0ASent from VinodhaEstates.com`;

    const waUrl = `https://wa.me/919876543210?text=${waText}`;
    window.open(waUrl, '_blank');
    showToast('Redirecting to WhatsApp...');

    // Clear form
    document.getElementById('consultName').value = '';
    document.getElementById('consultPhone').value = '';
    document.getElementById('consultQuery').value = '';
}

// ===========================
// CHANNEL PARTNER ENQUIRY → WHATSAPP
// ===========================
function sendChannelPartnerEnquiry() {
    const name = document.getElementById('cpName').value.trim();
    const phone = document.getElementById('cpPhone').value.trim();
    const city = document.getElementById('cpCity').value.trim();
    const experience = document.getElementById('cpExperience').value.trim();
    const message = document.getElementById('cpMessage').value.trim();

    if (!name || !phone) {
        showToast('Please enter your name and phone number');
        return;
    }

    const waText = `Hi Vinodha Estates!%0A%0A` +
        `*Channel Partner Enquiry*%0A` +
        `*Name:* ${encodeURIComponent(name)}%0A` +
        `*Phone:* ${encodeURIComponent(phone)}%0A` +
        (city ? `*City/Area:* ${encodeURIComponent(city)}%0A` : '') +
        (experience ? `*Experience:* ${encodeURIComponent(experience)}%0A` : '') +
        (message ? `*About Me:* ${encodeURIComponent(message)}%0A` : '') +
        `%0ASent from VinodhaEstates.com`;

    const waUrl = `https://wa.me/917974741166?text=${waText}`;
    window.open(waUrl, '_blank');
    showToast('Redirecting to WhatsApp...');

    document.getElementById('cpName').value = '';
    document.getElementById('cpPhone').value = '';
    document.getElementById('cpCity').value = '';
    document.getElementById('cpExperience').value = '';
    document.getElementById('cpMessage').value = '';
}

// ===========================
// REVIEW SLIDER (show 3 at a time)
// ===========================
let reviewPage = 0;
let reviewsPerPage = 3;

function initReviewSlider() {
    updateReviewsPerPage();
    renderReviewPage();
    renderReviewDots();
    window.addEventListener('resize', () => {
        const oldPer = reviewsPerPage;
        updateReviewsPerPage();
        if (oldPer !== reviewsPerPage) {
            reviewPage = 0;
            renderReviewPage();
            renderReviewDots();
        }
    });
}

function updateReviewsPerPage() {
    if (window.innerWidth <= 560) {
        reviewsPerPage = 1;
    } else if (window.innerWidth <= 900) {
        reviewsPerPage = 2;
    } else {
        reviewsPerPage = 3;
    }
}

function getReviewCards() {
    return document.querySelectorAll('#reviewGrid .video-testimonial-card');
}

function getTotalPages() {
    return Math.ceil(getReviewCards().length / reviewsPerPage);
}

function renderReviewPage() {
    const cards = getReviewCards();
    const start = reviewPage * reviewsPerPage;
    const end = start + reviewsPerPage;

    cards.forEach((card, i) => {
        if (i >= start && i < end) {
            card.classList.remove('hidden-card');
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, (i - start) * 100);
        } else {
            card.classList.add('hidden-card');
        }
    });

    // Update button states
    const prev = document.getElementById('reviewPrev');
    const next = document.getElementById('reviewNext');
    if (prev) prev.disabled = reviewPage === 0;
    if (next) next.disabled = reviewPage >= getTotalPages() - 1;

    // Update dots
    document.querySelectorAll('.review-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === reviewPage);
    });
}

function renderReviewDots() {
    const dotsContainer = document.getElementById('reviewDots');
    if (!dotsContainer) return;
    const total = getTotalPages();
    dotsContainer.innerHTML = '';
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'review-dot' + (i === reviewPage ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to page ' + (i + 1));
        dot.onclick = () => { reviewPage = i; renderReviewPage(); };
        dotsContainer.appendChild(dot);
    }
}

function slideReviews(dir) {
    const total = getTotalPages();
    reviewPage += dir;
    if (reviewPage < 0) reviewPage = 0;
    if (reviewPage >= total) reviewPage = total - 1;
    renderReviewPage();
    renderReviewDots();
}

// Initialize slider on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initReviewSlider, 500);
});
