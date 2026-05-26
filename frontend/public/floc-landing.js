const FOCUSABLE_SELECTOR = 'button, iframe, [href], [tabindex]:not([tabindex="-1"])';

function trapFocus(event, container) {
  if (event.key !== 'Tab' || !container) return;
  const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/* ── Cursor ──────────────────────────── */
const dot  = document.getElementById('c-dot');
const ring = document.getElementById('c-ring');
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
if (dot && ring && hasFinePointer) {
  document.addEventListener('mousemove', e => {
    dot.style.left  = e.clientX + 'px';
    dot.style.top   = e.clientY + 'px';
    ring.style.left = e.clientX + 'px';
    ring.style.top  = e.clientY + 'px';
  });
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('grow'));
    el.addEventListener('mouseleave', () => ring.classList.remove('grow'));
  });
}

/* ── Nav scroll ─────────────────────── */
const navEl = document.getElementById('nav');
if (navEl) {
  window.addEventListener('scroll', () => {
    navEl.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ── Scroll reveal ──────────────────── */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('on'));
}

/* ── Hero video audio ─────────────── */
const heroVideo = document.querySelector('.hero-video');
const videoToggleButtons = document.querySelectorAll('[data-video-toggle]');
if (heroVideo && videoToggleButtons.length) {
  heroVideo.controls = true;
  heroVideo.setAttribute('controls', '');
  heroVideo.loop = true;
  let videoActivated = false;

  function syncVideoToggleState() {
    const isPlaying = videoActivated && !heroVideo.paused;
    videoToggleButtons.forEach(button => {
      button.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
      button.setAttribute('aria-label', isPlaying ? 'Pausar video' : 'Reproducir video');
    });
  }

  async function playHeroVideo() {
    const isFirstActivation = !videoActivated;
    videoActivated = true;
    if (isFirstActivation) {
      heroVideo.pause();
      heroVideo.currentTime = 0;
      heroVideo.loop = false;
      heroVideo.removeAttribute('loop');
    }
    heroVideo.muted = false;
    heroVideo.defaultMuted = false;
    heroVideo.removeAttribute('muted');
    heroVideo.volume = 1;
    heroVideo.controls = true;
    heroVideo.setAttribute('controls', '');
    try {
      await heroVideo.play();
    } catch (error) {
      videoActivated = !heroVideo.paused;
    }
    syncVideoToggleState();
  }

  videoToggleButtons.forEach(button => {
    button.addEventListener('click', async () => {
      if (videoActivated && !heroVideo.paused) {
        heroVideo.pause();
        syncVideoToggleState();
        return;
      }
      await playHeroVideo();
    });
  });

  heroVideo.addEventListener('play', syncVideoToggleState);
  heroVideo.addEventListener('pause', syncVideoToggleState);
  syncVideoToggleState();
}

/* ── Testimonial audio ─────────────── */
const testimonialAudio = document.querySelector('[data-testimonial-audio]');
const testimonialAudioButton = document.querySelector('[data-testimonial-audio-toggle]');
if (testimonialAudio && testimonialAudioButton) {
  const testimonialWaveLines = testimonialAudioButton.querySelectorAll('.testimonial-audio-wave polyline');
  let testimonialAudioContext;
  let testimonialAnalyser;
  let testimonialAudioSource;
  let testimonialWaveFrame;
  let testimonialWaveShift = 0;

  function drawIdleTestimonialWave() {
    testimonialWaveLines.forEach((line, lineIndex) => {
      const points = Array.from({ length: 42 }, (_, index) => {
        const x = (index / 41) * 228;
        const y = 22 + Math.sin(index * .54 + lineIndex * .9) * (3.8 + lineIndex);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      line.setAttribute('points', points);
    });
  }

  function drawTestimonialWave() {
    if (!testimonialAnalyser || testimonialAudio.paused) {
      drawIdleTestimonialWave();
      return;
    }
    const data = new Uint8Array(testimonialAnalyser.frequencyBinCount);
    testimonialAnalyser.getByteTimeDomainData(data);
    const pointCount = 48;
    testimonialWaveShift += .12;
    testimonialWaveLines.forEach((line, lineIndex) => {
      const points = [];
      const offset = (lineIndex - 1.5) * 2.2;
      const gain = 13 + lineIndex * 2.2;
      for (let index = 0; index < pointCount; index += 1) {
        const sampleIndex = Math.floor((index / pointCount) * data.length);
        const sample = (data[sampleIndex] - 128) / 128;
        const progress = testimonialAudio.duration ? testimonialAudio.currentTime / testimonialAudio.duration : 0;
        const x = (index / (pointCount - 1)) * 228;
        const envelope = Math.sin((index / (pointCount - 1)) * Math.PI);
        const organic = Math.sin(index * (.42 + lineIndex * .06) + testimonialWaveShift + lineIndex) * (3.4 + lineIndex);
        const y = 22 + offset + (sample * gain * envelope) + organic + ((progress - .5) * 2);
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      line.setAttribute('points', points.join(' '));
    });
    testimonialWaveFrame = requestAnimationFrame(drawTestimonialWave);
  }

  async function setupTestimonialAnalyser() {
    if (testimonialAnalyser) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    testimonialAudioContext = new AudioContextClass();
    testimonialAnalyser = testimonialAudioContext.createAnalyser();
    testimonialAnalyser.fftSize = 512;
    testimonialAnalyser.smoothingTimeConstant = .82;
    testimonialAudioSource = testimonialAudioContext.createMediaElementSource(testimonialAudio);
    testimonialAudioSource.connect(testimonialAnalyser);
    testimonialAnalyser.connect(testimonialAudioContext.destination);
  }

  function syncTestimonialAudioState() {
    const isPlaying = !testimonialAudio.paused;
    testimonialAudioButton.classList.toggle('is-playing', isPlaying);
    testimonialAudioButton.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    testimonialAudioButton.setAttribute('aria-label', isPlaying ? 'Pausar audio de Gonzalo' : 'Escuchar audio de Gonzalo');
    if (!isPlaying) {
      cancelAnimationFrame(testimonialWaveFrame);
      drawIdleTestimonialWave();
    }
  }

  testimonialAudioButton.addEventListener('click', async () => {
    if (!testimonialAudio.paused) {
      testimonialAudio.pause();
      syncTestimonialAudioState();
      return;
    }
    if (heroVideo && !heroVideo.paused) heroVideo.pause();
    try {
      await setupTestimonialAnalyser();
      if (testimonialAudioContext && testimonialAudioContext.state === 'suspended') {
        await testimonialAudioContext.resume();
      }
      await testimonialAudio.play();
    } catch (error) {
      syncTestimonialAudioState();
      return;
    }
    cancelAnimationFrame(testimonialWaveFrame);
    drawTestimonialWave();
    syncTestimonialAudioState();
  });

  testimonialAudio.addEventListener('play', syncTestimonialAudioState);
  testimonialAudio.addEventListener('pause', syncTestimonialAudioState);
  testimonialAudio.addEventListener('ended', () => {
    testimonialAudio.currentTime = 0;
    syncTestimonialAudioState();
  });
  drawIdleTestimonialWave();
  syncTestimonialAudioState();
}

/* ── Campaign availability date ─ */
(function () {
  const campaignDate = { month: 'Mayo', year: '2026' };
  document.querySelectorAll('[data-campaign-month]').forEach(el => { el.textContent = campaignDate.month; });
  document.querySelectorAll('[data-campaign-year]').forEach(el => { el.textContent = campaignDate.year; });
})();

/* ── Project galleries ───────────────── */
const projectLabels = {
  charms: {
    title: 'Charms'
  },
  paid: {
    title: 'PAID'
  },
  aniwa: {
    title: 'Aniwa'
  }
};
const projectOrder = ['charms', 'paid', 'aniwa'];
const projectsSlider = document.getElementById('projectsSlider');
const projectLightbox = document.getElementById('projectLightbox');
const projectLightboxTitle = document.getElementById('projectLightboxTitle');
const projectLightboxImage = document.getElementById('projectLightboxImage');
let projectManifestPromise = null;
let allProjectImages = [];
let activeProjectIndex = 0;
let lastFocusedBeforeProject = null;

function loadProjectManifest() {
  if (!projectManifestPromise) {
    projectManifestPromise = fetch('./project-images-manifest.json').then(res => {
      if (!res.ok) throw new Error('No se pudo cargar el manifest de proyectos');
      return res.json();
    });
  }
  return projectManifestPromise;
}

function flattenProjectImages(manifest) {
  let globalIndex = 0;
  return projectOrder.flatMap(project => (
    (manifest[project] || [])
      .filter(image => {
        const width = Number(image.width);
        const height = Number(image.height);
        return width > 0 && height > 0 && Math.abs((width / height) - (16 / 9)) < 0.01;
      })
      .map((image, index) => ({
        ...image,
        project,
        projectIndex: index,
        globalIndex: globalIndex++
      }))
  ));
}

function renderProjectSlider() {
  if (!projectsSlider) return;
  projectsSlider.replaceChildren();
  projectOrder.forEach(project => {
    const info = projectLabels[project];
    const images = allProjectImages.filter(image => image.project === project);
    images.forEach(image => {
      const src = `${image.local}?v=${image.bytes}`;
      const button = document.createElement('button');
      const media = document.createElement('div');
      const img = document.createElement('img');
      button.className = 'project-image-card';
      button.type = 'button';
      button.dataset.projectIndex = String(image.globalIndex);
      button.setAttribute('aria-label', `Ampliar ${info.title}, imagen ${image.projectIndex + 1}`);
      media.className = 'project-media';
      img.src = src;
      img.alt = `${info.title} — imagen ${image.projectIndex + 1}`;
      img.loading = 'lazy';
      media.append(img);
      button.append(media);
      button.addEventListener('click', () => openProjectLightbox(image.globalIndex));
      projectsSlider.append(button);
    });
  });
}

function renderProjectMessage(message) {
  if (!projectsSlider) return;
  const status = document.createElement('div');
  status.className = 'project-loading';
  status.textContent = message;
  projectsSlider.replaceChildren(status);
}

async function setupProjectSlider() {
  if (!projectsSlider) return;
  try {
    const manifest = await loadProjectManifest();
    allProjectImages = flattenProjectImages(manifest);
    if (!allProjectImages.length) {
      renderProjectMessage('No hay casos visuales disponibles');
      return;
    }
    renderProjectSlider();
  } catch (error) {
    renderProjectMessage('No se pudieron cargar los casos visuales');
  }
}

function renderProjectImage(index) {
  if (!allProjectImages.length || !projectLightboxImage || !projectLightboxTitle) return;
  activeProjectIndex = (index + allProjectImages.length) % allProjectImages.length;
  const image = allProjectImages[activeProjectIndex];
  const info = projectLabels[image.project] || { title: image.project };
  projectLightboxImage.src = `${image.local}?v=${image.bytes}`;
  projectLightboxImage.alt = `${info.title} — imagen ${image.projectIndex + 1}`;
  projectLightboxTitle.textContent = `${info.title} — imagen ${image.projectIndex + 1}`;
}

async function openProjectLightbox(index) {
  if (!projectLightbox || !projectLightboxImage || !projectLightboxTitle) return;
  if (!allProjectImages.length) {
    const manifest = await loadProjectManifest();
    allProjectImages = flattenProjectImages(manifest);
  }
  if (!allProjectImages.length) return;
  lastFocusedBeforeProject = document.activeElement;
  projectLightbox.classList.add('open');
  projectLightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('project-open');
  renderProjectImage(index);
  projectLightbox.querySelector('[data-project-close]')?.focus();
}

function closeProjectLightbox() {
  if (!projectLightbox || !projectLightboxImage) return;
  projectLightbox.classList.remove('open');
  projectLightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('project-open');
  projectLightboxImage.removeAttribute('src');
  if (lastFocusedBeforeProject && typeof lastFocusedBeforeProject.focus === 'function') {
    lastFocusedBeforeProject.focus();
  }
}

function initProjectGallery() {
  setupProjectSlider();
  document.querySelectorAll('[data-project-scroll]').forEach(button => {
    button.addEventListener('click', () => {
      if (!projectsSlider) return;
      const direction = Number(button.dataset.projectScroll);
      projectsSlider.scrollBy({ left: direction * projectsSlider.clientWidth * 0.82, behavior: 'smooth' });
    });
  });
  if (!projectLightbox) return;
  projectLightbox.querySelector('[data-project-close]')?.addEventListener('click', closeProjectLightbox);
  projectLightbox.querySelector('[data-project-prev]')?.addEventListener('click', () => renderProjectImage(activeProjectIndex - 1));
  projectLightbox.querySelector('[data-project-next]')?.addEventListener('click', () => renderProjectImage(activeProjectIndex + 1));
  projectLightbox.addEventListener('click', e => {
    if (e.target === projectLightbox) closeProjectLightbox();
  });
}

/* ── Booking modal ──────────────────── */
const bookingModal = document.getElementById('bookingModal');
const bookingDialog = bookingModal?.querySelector('.modal-dialog');
const bookingClose = bookingModal?.querySelector('[data-close-modal]');
const bookingIframe = document.getElementById('EFOOmskKFRG1z1pU66VF_1779557718745');
const BOOKING_SRC = 'https://api.leadconnectorhq.com/widget/booking/EFOOmskKFRG1z1pU66VF';
let lastFocusedBeforeBooking = null;

function openBookingModal() {
  if (!bookingModal || !bookingClose) return;
  if (bookingIframe && !bookingIframe.getAttribute('src')) {
    bookingIframe.setAttribute('src', BOOKING_SRC);
  }
  lastFocusedBeforeBooking = document.activeElement;
  bookingModal.classList.add('open');
  bookingModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  setTimeout(() => bookingClose.focus(), 0);
}
function closeBookingModal() {
  if (!bookingModal) return;
  bookingModal.classList.remove('open');
  bookingModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (lastFocusedBeforeBooking && typeof lastFocusedBeforeBooking.focus === 'function') {
    lastFocusedBeforeBooking.focus();
  }
}

function initBookingModal() {
  document.querySelectorAll('a[href="#cta"]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openBookingModal();
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeBookingModal);
  });
  bookingModal?.addEventListener('click', e => {
    if (e.target === bookingModal) closeBookingModal();
  });
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (projectLightbox?.classList.contains('open')) {
      if (e.key === 'Escape') closeProjectLightbox();
      if (e.key === 'ArrowLeft') renderProjectImage(activeProjectIndex - 1);
      if (e.key === 'ArrowRight') renderProjectImage(activeProjectIndex + 1);
      trapFocus(e, projectLightbox);
      return;
    }
    if (e.key === 'Escape' && bookingModal?.classList.contains('open')) closeBookingModal();
    if (!bookingModal?.classList.contains('open')) return;
    trapFocus(e, bookingDialog);
  });
}

initProjectGallery();
initBookingModal();
initKeyboardShortcuts();
