let photos = [];
let films = [];
let visibleCount = 32;
let currentPhoto = 0;
let currentPage = 0;
let currentFilm = 0;
const $ = selector => document.querySelector(selector);
const safe = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const src = photo => photo.src || 'media/cover.svg';

function renderPhotos() {
  const grid = $('#photo-grid');
  grid.innerHTML = photos.slice(0, visibleCount).map(photo => `<button class="photo-card" data-index="${photos.indexOf(photo)}"><img loading="lazy" decoding="async" src="${safe(src(photo))}" alt="${safe(photo.title || 'Portfolio photograph')}"><span class="photo-label">${safe(photo.title || 'Photograph')}</span></button>`).join('');
  if (!photos.length) grid.innerHTML = '<p class="empty-note">Add your photo filenames to media.json to display your collection.</p>';
  $('#load-more').style.display = photos.length > visibleCount ? 'inline-flex' : 'none';
  grid.querySelectorAll('.photo-card').forEach(button => button.addEventListener('click', () => openLightbox(Number(button.dataset.index))));
}

function renderFilms() {
  $('#film-grid').innerHTML = films.map((film, index) => `<article class="film-card"><div class="film-thumb"><video controls playsinline preload="metadata" poster="${safe(film.poster || '')}" aria-label="Play ${safe(film.title || `Film ${index + 1}`)}"><source src="${safe(film.src || '')}" type="video/mp4">Your browser does not support video playback.</video></div><strong>${String(index + 1).padStart(2, '0')}. ${safe(film.title || `Film ${index + 1}`)}</strong><small>${safe(film.description || 'Play video')}</small></article>`).join('');
  $('#film-position').textContent = `01 / ${String(films.length).padStart(2, '0')}`;
  $('#film-grid').querySelectorAll('video').forEach((video, index) => {
    video.addEventListener('loadedmetadata', () => {
      const frame = video.closest('.film-thumb');
      frame.classList.toggle('is-portrait', video.videoHeight > video.videoWidth);
      frame.classList.toggle('is-landscape', video.videoWidth >= video.videoHeight);
    });
    video.addEventListener('play', () => {
      currentFilm = index;
      $('#film-position').textContent = `${String(index + 1).padStart(2, '0')} / ${String(films.length).padStart(2, '0')}`;
    });
  });
}

function moveFilm(direction) {
  if (!films.length) return;
  currentFilm = (currentFilm + direction + films.length) % films.length;
  const video = $('#film-grid').querySelectorAll('video')[currentFilm];
  $('#film-position').textContent = `${String(currentFilm + 1).padStart(2, '0')} / ${String(films.length).padStart(2, '0')}`;
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
  $('#page-left').innerHTML = `<img loading="lazy" src="${safe(pageSrc(currentPage))}" alt="Book page ${currentPage + 1}">`;
  $('#page-right').innerHTML = `<img loading="lazy" src="${safe(pageSrc(currentPage + 1))}" alt="Book page ${currentPage + 2}">`;
  $('#page-number').textContent = `${String(currentPage + 1).padStart(2, '0')}—${String(Math.min(currentPage + 2, photos.length)).padStart(2, '0')} / ${photos.length}`;
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
  $('#lightbox-caption').textContent = `${index + 1} / ${photos.length} · ${photos[index].title || 'Nithin Potharaju'}`;
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

$('#load-more').addEventListener('click', () => {
  visibleCount += 32;
  renderPhotos();
});
$('#prev').addEventListener('click', () => {
  currentPage = Math.max(0, currentPage - 2);
  renderBook();
});
$('#next').addEventListener('click', () => {
  currentPage = (currentPage + 2) % Math.max(photos.length, 1);
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
    currentPage = (currentPage + 2) % Math.max(photos.length, 1);
    renderBook();
  }
  if (document.fullscreenElement === $('.book-shell') && event.key === 'ArrowLeft') {
    currentPage = Math.max(0, currentPage - 2);
    renderBook();
  }
});
$('#menu').addEventListener('click', () => document.querySelector('.nav nav').classList.toggle('open'));
init();