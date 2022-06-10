import axios from 'axios';
export default class RegistrationForm {
    constructor() {
        this.form = document.querySelector('#registration-form');
        this.allFields = document.querySelectorAll("#registration-form .form-control");
        this.username = document.querySelector('#username-register');
        this.username.previousValue = "";
        this.username.isUnique = false;
        this.email = document.querySelector('#email-register');
        this.email.previousValue = "";
        this.email.isUnique = false;
        this.password = document.querySelector('#password-register');
        this.password.previousValue = "";
        this.insertValidataionElements();
        this.events();
        this.delay = 800;
    }
    //events
    events() {
        this.username.addEventListener('keyup', () => {
            this.isDifferent(this.username, this.usernameHandler);
        });
        this.email.addEventListener('keyup', () => {
            this.isDifferent(this.email, this.emailHandler);
        });
        this.password.addEventListener('keyup', () => {
            this.isDifferent(this.password, this.passwordHandler);
        });
        this.username.addEventListener('blur', () => {
            this.isDifferent(this.username, this.usernameHandler);
        });
        this.email.addEventListener('blur', () => {
            this.isDifferent(this.email, this.emailHandler);
        });
        this.password.addEventListener('blur', () => {
            this.isDifferent(this.password, this.passwordHandler);
        });
        this.form.addEventListener('submit', e => {
            e.preventDefault();
            this.formSubmitHandler();
        });
    }
    //methods
    //calls handler only if the field has changed
    isDifferent(el, handler) {
        if (el.previousValue != el.value)
            handler.call(this);
        el.previousValue = el.value;
    }
    //handlers
    usernameHandler() {
        this.username.errors = false;
        this.usernameImmediate();
        clearTimeout(this.username.timer);
        this.username.timer = setTimeout(() => this.usernameDelay(), this.delay);
    }
    emailHandler() {
        this.email.errors = false;
        this.emailImmediate();
        clearTimeout(this.email.timer);
        this.email.timer = setTimeout(() => this.emailDelay(), this.delay);
    }
    passwordHandler() {
        this.password.errors = false;
        this.passwordImmediate();
        clearTimeout(this.password.timer);
        this.password.timer = setTimeout(() => this.passwordDelay(), this.delay);
    }
    //immediate functions
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
    emailImmediate() {
        if (!this.email.value) {
            this.showValidationError(this.email, 'email cant be empty');
        }
    }
    passwordImmediate() {
        if (this.password.value && this.password > 40) {
            this.showValidationError(this.password, 'password should contain less than 40 characters');
        }
        if (!this.errors) {
            this.hideValidateionError(this.password);
        }
    }
    //delay functions
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
    emailDelay() {
        if (this.email.value && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email.value)) {
            this.showValidationError(this.email, 'enter valid email address');
        }
        if (!this.email.errors) {
            axios.post('/doesEmailExist', { email: this.email.value }).then((res) => {
                if (res.data) {
                    this.showValidationError(this.email, 'email already taken');
                    this.email.isUnique = false;
                } else {
                    this.email.isUnique = true;
                }
            }).catch(() => {
                console.log('try again later');
            });
        }
        if (!this.email.errors) {
            this.hideValidateionError(this.email);
        }
    }
    passwordDelay() {
        if (this.password.value.length < 6 || this.password.value.length > 40) {
            this.showValidationError(this.password, 'password should be between 3 & 40 characters');
        }
        if (!this.password.errors) {
            this.hideValidateionError(this.password);
        }
    }
    //ui functions
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
    formSubmitHandler() {
        this.usernameImmediate();
        this.usernameDelay();
        this.emailDelay();
        this.passwordDelay();
        this.emailImmediate();

        if (this.username.isUnique && !this.username.errors && this.email.isUnique && !this.email.errors && !this.password.errors) {
            this.form.submit();
        }
    }
}