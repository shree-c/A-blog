import axios from 'axios';
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
    if (value && value != this.previourValue) {
      clearTimeout(this.typingWaitTimer);
      this.showLoaderIcon();
      this.typingWaitTimer = setTimeout(() => {
        this.sendRequest();
      }, 1000)
    }
  }
  showLoaderIcon() {
    this.loaderIcon.classList.add('circle-loader--visible');
  }
  sendRequest() {
    axios.post('/search', {
      searchTerm : this.inputField.value
    }).then(()=>{

    }).catch(()=>{
      alert('hello failed');
    })
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
        <div class="live-search-results ">
          <div class="list-group shadow-sm">
            <div class="list-group-item active"><strong>Search Results</strong> (4 items found)</div>

            <a href="#" class="list-group-item list-group-item-action">
              <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>Example Post #1</strong>
              <span class="text-muted small">by barksalot on 0/14/2019</span>
            </a>
            <a href="#" class="list-group-item list-group-item-action">
              <img class="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128"> <strong>Example Post #2</strong>
              <span class="text-muted small">by brad on 0/12/2019</span>
            </a>
            <a href="#" class="list-group-item list-group-item-action">
              <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>Example Post #3</strong>
              <span class="text-muted small">by barksalot on 0/14/2019</span>
            </a>
            <a href="#" class="list-group-item list-group-item-action">
              <img class="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128"> <strong>Example Post #4</strong>
              <span class="text-muted small">by brad on 0/12/2019</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- search feature end -->
`)
  }
}