import Search from './modules/search'
import './modules/like'
//execute new class only if the search icon present on page i.e only if a user is logged in
if (document.querySelector('.header-search-icon')) {
    new Search();
}