import axios from 'axios';
export default class RegistrationForm {
    constructor() {
        this.allFields = document.querySelectorAll("#registration-form .form-control");
        this.insertValidataionElements();
        this.username = document.querySelector('#username-register');
        this.username.previousValue = "";
        this.email = document.querySelector('#email-register');
        this.events();
    }
    //events
    events() {
        this.username.addEventListener('keyup', () => {
            this.isDifferent(this.username, this.usernameHandler);
        });
    }
    //methods
    //checks for changes in previous fields
    isDifferent(el, handler) {
        if (el.previousValue != el.value)
            handler.call(this);
        el.previousValue = el.value;
    }
    //only called when there is change in username field
    usernameHandler() {
        this.username.errors = false;
        this.usernameImmediate();
        clearTimeout(this.username.timer);
        this.username.timer = setTimeout(() => this.usernameDelay(), 3000);
    }
    //check for non alpha numeric characters
    //called immediately when there is change
    usernameImmediate() {
        if (this.username.value && !/^([a-zA-z0-9]+)$/.test(this.username.value)) {
            this.showValidationError(this.username, 'no special characters');
        }
        if (this.username.value.length > 30) {
            this.showValidationError(this.username, 'username should be less than 30 characters');
        }
        //if there are no errors
        if (!this.username.errors) {
            this.hideValidateionError(this.username);
        }
    }
    //called when there is no activity in username field for some time
    usernameDelay() {
        //there is no need of hiding message here coz it is done in usernameImmediate() each time there is change
        if (this.username.value.length < 3) {
            this.showValidationError(this.username, 'username should be atleast 3 characters');
        }
        if (!this.username.errors) {
            axios.post('/doesUsernameExist', { username: this.username.value }).then((res) => {
                if (res.data) {
                    this.showValidationError(this.username, 'username taken');
                    this.username.isUnique = false;
                } else {
                    this.username.isUnique = true;
                }
            }).catch(() => {
                console.log('try again later');
            });
        }
    }
    hideValidateionError(el) {
        el.nextElementSibling.classList.remove('liveValidateMessage--visible');
    }
    showValidationError(el, msg) {
        el.nextElementSibling.innerHTML = msg;
        el.nextElementSibling.classList.add('liveValidateMessage--visible');
        el.errors = true;
    }

    insertValidataionElements() {
        console.log(this.allFields.length);
        this.allFields.forEach((el) => {
            el.insertAdjacentHTML('afterend', `
            <div class="alert alert-danger small liveValidateMessage "></div>
            `);
        });
    }
}