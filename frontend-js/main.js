import Search from './modules/search';
import Chat from './modules/chat';
import RegistrationForm from './modules/registration';
//execute new class only if the search icon present on page i.e only if a user is logged in
if (document.querySelector('.header-search-icon')) {
    new Search();
}

if (document.querySelector('#chat-wrapper')) {
    new Chat();
}

if (document.querySelector('#registration-form')) {
    new RegistrationForm();
}