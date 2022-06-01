import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

const axios = require('axios');

const formEl = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const moreBtn = document.querySelector('.load-more');

moreBtn.classList.add('hidden');

// BackEnd

// Variables for HTTP-request

const URL = 'https://pixabay.com/api/';
const API_KEY = '27715674-92925a6f691a5283ca5f8bc26';
let q = '';
const image_type = 'photo';
const orientation = 'horizontal';
const safesearch = 'true';
let page = 1;
const per_page = 40;
let totalPages = 0;

function pathMaker() {
  return `${URL}?key=${API_KEY}&q=${q}&image_type=${image_type}&orientation=${orientation}&safesearch=${safesearch}&page=${page}&per_page=${per_page}`;
}

// -------------------------------

formEl.addEventListener('submit', onSubmitForm);
moreBtn.addEventListener('click', onMoreBtnClick);

function onSubmitForm(e) {
  e.preventDefault();
  galleryEl.innerHTML = '';
  moreBtn.classList.add('hidden');

  page = 1;
  q = e.target.searchQuery.value;
  const PATH = !q.trim() ? '' : pathMaker();

  request(PATH)
    .then(data => {
      const totalPictures = data.totalHits;
      totalPages = Math.ceil(totalPictures / per_page);

      makeMarkupGallery(data.hits);

      Notiflix.Notify.success(`Hooray! We found ${totalPictures} images.`);

      if (totalPictures > per_page) {
        moreBtn.classList.remove('hidden');
      }
    })
    .catch(error => error);
}

function onMoreBtnClick() {
  page += 1;
  const PATH = !q.trim() ? '' : pathMaker();

  if (page === totalPages) {
    moreBtn.classList.add('hidden');
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }

  request(PATH)
    .then(data => {
      makeMarkupGallery(data.hits);

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    })
    .catch(error => error);
}

// Request

async function request(url) {
  if (!url) {
    Notiflix.Notify.failure('Search field can not be empthy!');
    return;
  } else {
    const resp = await axios.get(url);
    const data = resp.data;

    if (data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      return data;
    }
  }
}

// Markup

function makeMarkupGallery(array) {
  const galleryMarkup = array
    .map(img => {
      const smallImg = img.webformatURL;
      const largeImg = img.largeImageURL;
      const alt = img.tags;
      const likes = img.likes;
      const views = img.views;
      const comments = img.comments;
      const downloads = img.downloads;

      return `
        <div class="photo-card">
        <a href=${largeImg}><img src=${smallImg} alt=${alt} loading="lazy" /></a>
        <div class="info">
            <p class="info-item">
            <b>Likes</b>
            ${likes}
            </p>
            <p class="info-item">
            <b>Views</b>
            ${views}
            </p>
            <p class="info-item">
            <b>Comments</b>
            ${comments}
            </p>
            <p class="info-item">
            <b>Downloads</b>
            ${downloads}
            </p>
        </div>
        </div>`;
    })
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', galleryMarkup);

  new SimpleLightbox('.gallery a');
}
