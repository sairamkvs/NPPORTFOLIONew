let photos = [];
let films = [];
let visibleCount = 32;
let currentPhoto = 0;
let currentPage = 0;
let currentFilm = 0;
const $ = selector => document.querySelector(selector);
const safe = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const src = photo => photo.src || 'media/cover.svg';
const THEME_KEY = 'cansora-theme';

function applyTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', nextTheme);

  const toggle = $('#theme-toggle');
  if (toggle) {
    const icon = toggle.querySelector('.theme-icon');
    toggle.setAttribute('aria-label', nextTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.classList.toggle('is-light', nextTheme === 'light');
    if (icon) icon.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
  }

  try {
    localStorage.setItem(THEME_KEY, nextTheme);
  } catch (error) {
    console.warn('Theme preference could not be saved.', error);
  }
}

function renderPhotos() {
  const grid = $('#photo-grid');
  grid.innerHTML = photos.slice(0, visibleCount).map(photo => `<button class="photo-card" data-index="${photos.indexOf(photo)}"><img loading="lazy" decoding="async" src="${safe(src(photo))}" alt="${safe(photo.title || 'Portfolio photograph')}"><span class="photo-label">${safe(photo.title || 'Photograph')}</span></button>`).join('');
  if (!photos.length) grid.innerHTML = '<p class="empty-note">Add your photo filenames to media.json to display your collection.</p>';
  $('#load-more').style.display = photos.length > visibleCount ? 'inline-flex' : 'none';
  grid.querySelectorAll('.photo-card').forEach(button => button.addEventListener('click', () => openLightbox(Number(button.dataset.index))));
}

function renderFilms() {
  $('#film-grid').innerHTML = films.map((film, index) => film.src
    ? `<article class="film-card"><div class="film-thumb"><video controls playsinline preload="metadata" poster="${safe(film.poster || '')}" aria-label="Play ${safe(film.title || `Film ${index + 1}`)}"><source src="${safe(film.src)}" type="video/mp4">Your browser does not support video playback.</video></div><strong>${String(index + 1).padStart(2, '0')}. ${safe(film.title || `Film ${index + 1}`)}</strong><small>${safe(film.description || 'Play video')}</small></article>`
    : `<article class="film-card film-placeholder"><div class="film-thumb" aria-hidden="true"><span>+</span><small>VIDEO SLOT</small></div><strong>${String(index + 1).padStart(2, '0')}. ${safe(film.title || `Film ${index + 1}`)}</strong><small>${safe(film.description || 'Add video here')}</small></article>`).join('');
  $('#film-position').textContent = `01 / ${String(films.filter(film => film.src).length).padStart(2, '0')}`;
  $('#film-grid').querySelectorAll('video').forEach((video, index) => {
    video.addEventListener('loadedmetadata', () => {
      const frame = video.closest('.film-thumb');
      frame.classList.toggle('is-portrait', video.videoHeight > video.videoWidth);
      frame.classList.toggle('is-landscape', video.videoWidth >= video.videoHeight);
    });
    video.addEventListener('play', () => {
      currentFilm = films.map((film, filmIndex) => film.src ? filmIndex : -1).filter(filmIndex => filmIndex >= 0)[index];
      const playableNumber = films.slice(0, currentFilm + 1).filter(film => film.src).length;
      $('#film-position').textContent = `${String(playableNumber).padStart(2, '0')} / ${String(films.filter(film => film.src).length).padStart(2, '0')}`;
    });
  });
}

function moveFilm(direction) {
  const playableIndices = films.map((film, index) => film.src ? index : -1).filter(index => index >= 0);
  if (!playableIndices.length) return;
  const currentPlayableIndex = playableIndices.indexOf(currentFilm);
  const nextPlayableIndex = (currentPlayableIndex + direction + playableIndices.length) % playableIndices.length;
  currentFilm = playableIndices[nextPlayableIndex];
  const video = $('#film-grid').querySelectorAll('video')[nextPlayableIndex];
  $('#film-position').textContent = `${String(nextPlayableIndex + 1).padStart(2, '0')} / ${String(playableIndices.length).padStart(2, '0')}`;
  $('#film-grid').querySelectorAll('video').forEach(otherVideo => {
    if (otherVideo !== video) otherVideo.pause();
  });
  video.closest('.film-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
  video.play().catch(() => {});
}

function pageSrc(index) {
  return src(photos[(index + photos.length) % photos.length] || {});
}

function renderBook() {
  if (!photos.length) return;
  const singlePage = window.matchMedia('(max-width: 600px)').matches;
  $('#page-left').innerHTML = `<img loading="lazy" src="${safe(pageSrc(currentPage))}" alt="Book page ${currentPage + 1}">`;
  $('#page-right').innerHTML = `<img loading="lazy" src="${safe(pageSrc(currentPage + 1))}" alt="Book page ${currentPage + 2}">`;
  $('#page-number').textContent = singlePage
    ? `${String(currentPage + 1).padStart(2, '0')} / ${photos.length}`
    : `${String(currentPage + 1).padStart(2, '0')}—${String(Math.min(currentPage + 2, photos.length)).padStart(2, '0')} / ${photos.length}`;
  $('#thumb-strip').innerHTML = photos.slice(0, 50).map((photo, index) => `<button class="${index === currentPage ? 'active' : ''}" data-page="${index}" aria-label="Go to page ${index + 1}"><img loading="lazy" src="${safe(src(photo))}" alt=""></button>`).join('');
  $('#thumb-strip').querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    currentPage = Number(button.dataset.page);
    renderBook();
  }));
}

function openLightbox(index) {
  if (!photos[index]) return;
  currentPhoto = index;
  $('#lightbox-img').src = src(photos[index]);
  $('#lightbox-img').alt = photos[index].title || 'Portfolio photograph';
  $('#lightbox-caption').textContent = `${index + 1} / ${photos.length} · ${photos[index].title || 'Cansora Frames'}`;
  $('#lightbox').classList.add('open');
  $('#lightbox').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  $('#lightbox').classList.remove('open');
  $('#lightbox').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function moveLightbox(direction) {
  if (photos.length) openLightbox((currentPhoto + direction + photos.length) % photos.length);
}

async function init() {
  try {
    const response = await fetch('media.json');
    const data = await response.json();
    photos = data.photos || [];
    films = data.films || [];
  } catch (error) {
    console.error('Could not load media.json', error);
  }
  renderPhotos();
  renderFilms();
  renderBook();
}

const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
applyTheme(savedTheme);

$('#theme-toggle').addEventListener('click', () => {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
});

$('#load-more').addEventListener('click', () => {
  visibleCount += 32;
  renderPhotos();
});
$('#prev').addEventListener('click', () => {
  const pageStep = window.matchMedia('(max-width: 600px)').matches ? 1 : 2;
  currentPage = Math.max(0, currentPage - pageStep);
  renderBook();
});
$('#next').addEventListener('click', () => {
  const pageStep = window.matchMedia('(max-width: 600px)').matches ? 1 : 2;
  currentPage = (currentPage + pageStep) % Math.max(photos.length, 1);
  renderBook();
});
$('#film-prev').addEventListener('click', () => moveFilm(-1));
$('#film-next').addEventListener('click', () => moveFilm(1));
$('#fullscreen').addEventListener('click', () => $('.book-shell').requestFullscreen?.());
$('#close-lightbox').addEventListener('click', closeLightbox);
$('#light-prev').addEventListener('click', () => moveLightbox(-1));
$('#light-next').addEventListener('click', () => moveLightbox(1));
$('#lightbox').addEventListener('click', event => {
  if (event.target.id === 'lightbox') closeLightbox();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeLightbox();
  if ($('#lightbox').classList.contains('open') && event.key === 'ArrowRight') moveLightbox(1);
  if ($('#lightbox').classList.contains('open') && event.key === 'ArrowLeft') moveLightbox(-1);
  if (document.fullscreenElement === $('.book-shell') && event.key === 'ArrowRight') {
    const pageStep = window.matchMedia('(max-width: 600px)').matches ? 1 : 2;
    currentPage = (currentPage + pageStep) % Math.max(photos.length, 1);
    renderBook();
  }
  if (document.fullscreenElement === $('.book-shell') && event.key === 'ArrowLeft') {
    const pageStep = window.matchMedia('(max-width: 600px)').matches ? 1 : 2;
    currentPage = Math.max(0, currentPage - pageStep);
    renderBook();
  }
});
window.addEventListener('resize', renderBook);
$('#menu').addEventListener('click', () => document.querySelector('.nav nav').classList.toggle('open'));
init();