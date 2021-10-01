import axios from 'axios';
import dompurify from 'dompurify'
export default class Search {
  //constructor: select dom elements and keep track of useful data
  constructor() {
    this.injectHtml();
    this.headerSearchIcon = document.querySelector('.header-search-icon');
    this.overlay = document.querySelector('.search-overlay');
    this.closeIcon = document.querySelector('.close-live-search');
    this.inputField = document.querySelector('#live-search-field');
    this.searchResults = document.querySelector('.live-search-results');
    this.loaderIcon = document.querySelector('.circle-loader');
    this.typingWaitTimer;
    this.previourValue = '';
    this.events();
  }
  //events: to be called from constructor 
  events() {
    //key press events
    this.inputField.addEventListener('keyup', () => {
      //showing loader icon as soon as keys are pressed in search bar
      this.keyPressHandler();
    })
    this.closeIcon.addEventListener('click', () => this.closeOverlay());
    this.headerSearchIcon.addEventListener('click', (e) => {
      e.preventDefault();
      this.openOverlay();
    })
  }
  openOverlay() {
    this.overlay.classList.add('search-overlay--visible');
    //50 ms wait due to make search bar visible first and then focus
    setTimeout(() => {
      this.inputField.focus();
    }, 50);
  }
  closeOverlay() {
    this.overlay.classList.remove('search-overlay--visible');
  }
  keyPressHandler() {
    //send request only when the delay between two key strokes is more than given time
    //also when it is not same as previous value
    //each time if block runs it clears up the previous timer
    let value = this.inputField.value;
    if (value == '') {
      clearTimeout(this.typingWaitTimer);
      this.hideLoaderIcon();
      this.hideResultsArea();
    }
    if (value && value != this.previourValue) {
      clearTimeout(this.typingWaitTimer);
      this.showLoaderIcon();
      this.hideResultsArea();
      this.typingWaitTimer = setTimeout(() => {
        this.sendRequest();
      }, 500);
    }
  }
  showLoaderIcon() {
    this.loaderIcon.classList.add('circle-loader--visible');
  }
  hideLoaderIcon() {
    this.loaderIcon.classList.remove('circle-loader--visible');
  }
  showResultsArea() {
    this.searchResults.classList.add('live-search-results--visible');
  }
  hideResultsArea() {
    this.searchResults.classList.remove('live-search-results--visible');
  }
  sendRequest() {
    axios.post('/search', {
      searchTerm: this.inputField.value
    }).then((val) => {
      this.renderResultsHtml(val.data);
    }).catch(() => {
      // alert('hello failed');
    })
  }
  renderResultsHtml(posts) {
    if (posts.length) {
      this.searchResults.innerHTML = dompurify.sanitize(`<div class="list-group shadow-sm">
            <div class="list-group-item active"><strong>Search Results</strong> (${posts.length} item${(posts.length>1?'s':'')} found)</div>
            ${
              posts.map((posts)=>{
                return `<a href="/post/${posts._id}" class="list-group-item list-group-item-action">
              <img class="avatar-tiny" src="${posts.author.avatar}"> <strong>${posts.title}</strong>
              <span class="text-muted small">by ${posts.author.username} on ${new Date(posts.createdDate).toLocaleDateString()}</span>
            </a>`
              }).join('')
            }
          </div>
`);
    } else {
      this.searchResults.innerHTML = `<p class="text-center alert alert-danger shadow-minimal"> No search results. </p>`
    }
    this.hideLoaderIcon();
    this.showResultsArea();
  }
  injectHtml() {
    document.body.insertAdjacentHTML('beforeend', `<div class="search-overlay">
    <div class="search-overlay-top shadow-sm">
      <div class="container container--narrow">
        <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
        <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
        <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
      </div>
    </div>

    <div class="search-overlay-bottom">
      <div class="container container--narrow py-3">
        <div class="circle-loader"></div>
        <div class="live-search-results "></div>
      </div>
    </div>
  </div>
  <!-- search feature end -->
`)
  }
}