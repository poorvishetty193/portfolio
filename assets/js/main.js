// Set current year
$(function(){
  $('#year').text(new Date().getFullYear());
});

// jQuery smooth scrolling for in-page anchors (optional)
$(function(){
  $('a[href^="#"]').on('click', function(e){
    const target = $(this).attr('href');
    if (target.length > 1 && $(target).length){
      e.preventDefault();
      $('html, body').animate({ scrollTop: $(target).offset().top }, 600);
    }
  });
});

// Contact form demo handler (front-end only)
$(function(){
  $('#contactForm').on('submit', function(e){
    if(!this.checkValidity()){ return; } // native required validation
    e.preventDefault();
    $('#formStatus').text('Sending...');
    setTimeout(function(){
      $('#formStatus').text('Thanks! Your message has been sent.');
      $('#contactForm')[0].reset();
    }, 800);
  });
});

/* ===== Mobile nav toggle (single source of truth) ===== */
const toggleBtn = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (toggleBtn && nav) {
  toggleBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('active');
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    // Optional icon swap if using Font Awesome
    const icon = toggleBtn.querySelector('i');
    if (icon){
      icon.classList.toggle('fa-xmark', open);
      icon.classList.toggle('fa-bars', !open);
    }
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded','false');
    const icon = toggleBtn.querySelector('i');
    if (icon){
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-xmark');
    }
  }));
}

/* ===== Animated counters for skills + experience ===== */
(function(){
  const easeOutQuad = t => t*(2-t);
  function countTo(el, target, duration=1200){
    const startTime = performance.now();
    function step(now){
      const p = Math.min(1, (now - startTime)/duration);
      el.textContent = Math.round(target * easeOutQuad(p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const counters = document.querySelectorAll('.skill-val[data-target], .xp-val[data-target]');
  if (!counters.length) return;
  const once = new Set();
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting){
        const el = entry.target;
        if (once.has(el)) return;
        once.add(el);
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        countTo(el, target);
      }
    });
  }, { root:null, rootMargin:'0px 0px -20% 0px', threshold:0.2 });
  counters.forEach(el => io.observe(el));
})();

/* ===== Footer year fallback ===== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== Coverflow carousel for certificates ===== */
(function(){
  const root = document.getElementById('certCarousel');
  if (!root) return;

  const track = root.querySelector('.car-track');
  const slides = Array.from(track.querySelectorAll('.slide'));
  const prevBtn = root.querySelector('.prev');
  const nextBtn = root.querySelector('.next');
  const dotsWrap = document.getElementById('certDots');

  let index = 0;
  let autoTimer = null;
  const AUTO_MS = 3500;

  function setClasses(){
    slides.forEach(s => s.className = 'slide'); // reset
    const len = slides.length;
    const i = index;
    const l = (i - 1 + len) % len;
    const r = (i + 1) % len;
    const fl = (i - 2 + len) % len;
    const fr = (i + 2) % len;

    slides[i].classList.add('center');
    slides[l].classList.add('left');
    slides[r].classList.add('right');
    if (len > 3){
      slides[fl].classList.add('far-left');
      slides[fr].classList.add('far-right');
    }

    dotsWrap.querySelectorAll('button').forEach((b, bi)=>{
      b.setAttribute('aria-current', bi === i ? 'true' : 'false');
    });
  }

  function makeDots(){
    dotsWrap.innerHTML = '';
    slides.forEach((_, i)=>{
      const b = document.createElement('button');
      b.type = 'button';
      b.addEventListener('click', ()=>{ index = i; setClasses(); restart(); });
      dotsWrap.appendChild(b);
    });
  }

  function next(){ index = (index + 1) % slides.length; setClasses(); }
  function prev(){ index = (index - 1 + slides.length) % slides.length; setClasses(); }
  function start(){ autoTimer = setInterval(next, AUTO_MS); }
  function stop(){ clearInterval(autoTimer); autoTimer = null; }
  function restart(){ stop(); start(); }

  // Init
  makeDots();
  setClasses();
  start();

  // Controls
  nextBtn.addEventListener('click', ()=>{ next(); restart(); });
  prevBtn.addEventListener('click', ()=>{ prev(); restart(); });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  // Swipe support
  let sx = 0, dx = 0;
  root.addEventListener('touchstart', e => { sx = e.touches[0].clientX; dx = 0; stop(); }, {passive:true});
  root.addEventListener('touchmove', e => { dx = e.touches[0].clientX - sx; }, {passive:true});
  root.addEventListener('touchend', () => {
    if (Math.abs(dx) > 40){ (dx < 0 ? next : prev)(); }
    start();
  });
})();

/* ===== Certificates: remove title tooltip + lightbox popup ===== */
(function(){
  const carousel = document.getElementById('certCarousel');
  if (!carousel) return;

  // Remove title attributes so browsers don't show tooltips
  carousel.querySelectorAll('.slide img').forEach(img => {
    if (img.getAttribute('title')) img.removeAttribute('title');
  });

  // Lightbox elements
  const lb = document.getElementById('lightbox');
  const lbImg = lb?.querySelector('.lb-img');
  const btnClose = lb?.querySelector('.lb-close');
  const btnPrev = lb?.querySelector('.lb-prev');
  const btnNext = lb?.querySelector('.lb-next');
  if (!lb || !lbImg) return;

  // Build ordered list of images
  const slides = Array.from(carousel.querySelectorAll('.slide img'));
  let cur = 0;

  function openAt(i){
    cur = ((i % slides.length) + slides.length) % slides.length;
    lbImg.src = slides[cur].src;
    lbImg.alt = slides[cur].alt || 'Certificate preview';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden','false');

    // lock scroll and prevent layout shift
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-w', sbw + 'px');
    document.body.classList.add('lb-lock');
  }

  function close(){
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden','true');

    // unlock scroll and cleanup
    document.body.classList.remove('lb-lock');
    document.documentElement.style.removeProperty('--scrollbar-w');
    setTimeout(()=>{ lbImg.removeAttribute('src'); }, 150);
  }

  function next(){ openAt(cur+1); }
  function prev(){ openAt(cur-1); }

  // Click to open from any slide
  slides.forEach((img, i)=>{
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', ()=> openAt(i));
  });

  // Controls
  btnClose?.addEventListener('click', close);
  btnNext?.addEventListener('click', next);
  btnPrev?.addEventListener('click', prev);

  // Backdrop click closes
  lb.addEventListener('click', (e)=>{
    if (e.target === lb) close();
  });

  // Keyboard
  window.addEventListener('keydown', (e)=>{
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  }, {passive:true});
})();

// Reveal education items on scroll
(function(){
  const items = document.querySelectorAll('.edu-item');
  if (!items.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('appear'); io.unobserve(e.target);} });
  }, { threshold: 0.2 });
  items.forEach(i => io.observe(i));
})();
