import DOMPurify from "dompurify";
export default class Chat {
    constructor() {
        //the order in which you place these statements is important
        this.openedYet = false;
        this.chatWrapper = document.querySelector('#chat-wrapper');
        this.injectHTML();
        this.openIcon = document.querySelector('.header-chat-icon');
        this.closeIcon = document.querySelector('.chat-title-bar-close');
        this.chatField = document.querySelector('#chatField');
        this.chatForm = document.querySelector('#chatForm');
        this.chatLog = document.querySelector('#chat');
        this.events();
    }
    events() {
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessageToServer();
        });
        this.openIcon.addEventListener('click', () => this.togglechat());
        this.closeIcon.addEventListener('click', () => this.togglechat());
    }
    togglechat() {
        if (!this.openedYet) {
            this.openConnection();
        }
        this.openedYet = true;
        this.chatWrapper.classList.toggle('chat--visible');
        this.chatField.focus();
    }
    //gets triggered when the chat-box is opened for the first time
    openConnection() {
        //open connection
        this.socket = io();
        //listening for the events from server
        //the message is coming from the server
        this.socket.on('welcome', (data) => {
            this.username = data.username;
            this.avatar = data.avatar;
        });
        this.socket.on('chat-message-from-server', (data) => {
            this.displayMessageFromServer(data);
        });
    }
    sendMessageToServer() {
        //sending message to the server
        this.socket.emit('chat-message-from-browser', {
            message: this.chatField.value
        });
        //this is message sent by the person to be added into the  right side of chat box
        this.chatLog.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`
        <div class="chat-self">
        <div class="chat-message">
          <div class="chat-message-inner">
          ${this.chatField.value}
          </div>
        </div>
        <img class="chat-avatar avatar-tiny" src="${this.avatar}">
      </div>
        `, {
            ALLOWED_TAGS: ["div", "img"]
        }));
        this.chatField.value = '';
        //scroll to top after the message is sent
        this.chatLog.scrollTop = this.chatLog.scrollHeight;
        this.chatField.focus();
    }

    //puts message into chat box
    displayMessageFromServer(data) {
        this.chatLog.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`<div class="chat-other">
        <a href="/profile/${data.username}"><img class="avatar-tiny" src="${data.avatar}"></a>
        <div class="chat-message"><div class="chat-message-inner">
          <a href="/profile/${data.username}"><strong>${data.username}:</strong></a>
          ${data.message}
        </div></div>
      </div>`));
        //scroll to top after the message is sent
        this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }
    injectHTML() {
        this.chatWrapper.innerHTML = `
        <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>
        <div id="chat" class="chat-log"></div>
        <form id="chatForm" class="chat-form border-top">
      <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
    </form>
        `;
    }
}
