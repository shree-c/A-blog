export default class RegistrationForm {
    constructor() {
        this.allFields = document.querySelectorAll("#registration-form .form-control");
        this.insertValidataionElements();
        this.username = document.querySelector('#username-register');
        this.username.previousValue = "";
        this.events();
    }
    //events
    events() {
        this.username.addEventListener('keyup', () => {
            this.isDifferent(this.username, this.usernameHandler);
        });
    }
    usernameHandler() {
        this.usernameImmediate();
        this.usernametimer = setTimeout(() => this.usernameDelay(), 3000);
    }
    isDifferent(el, handler) {
        if (el.previousValue != el.value)
            handler.call(this);
        el.previousValue = el.value;
    }
    insertValidataionElements() {
        console.log(this.allFields.length);
        this.allFields.forEach((el) => {
            el.insertAdjacentHTML('afterend', `
            <div class="alert alert-danger small liveValidateMessage "></div>
            `);
        });
    }
    //methods
}