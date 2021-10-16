import axios from 'axios';
const likeButton = document.querySelector('.like-button');

likeButton.addEventListener('click', (e) => {
    likeButton.classList.toggle('is-active')

    axios.post('/like', {
        whichpost: window.location.pathname.slice(6,),
        like: likeButton.classList.contains('is-active')
    })
})