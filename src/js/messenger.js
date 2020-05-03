import API from './Api';

const api = new API('https://coursar-heroku.herokuapp.com/');

function convertDate(value) {
  const rValue = value < 10 ? `0${value}` : value;
  return rValue;
}

function printData(valueDate) {
  const itemDate = new Date(valueDate);
  const date = convertDate(itemDate.getDate());
  const month = convertDate(itemDate.getMonth() + 1);
  const year = convertDate(itemDate.getFullYear());
  const hours = convertDate(itemDate.getHours());
  const minut = convertDate(itemDate.getMinutes());
  const second = convertDate(itemDate.getSeconds());
  const itemCreated = `${hours}:${minut}:${second} ${date}.${month}.${year}`;
  return itemCreated;
}

export default class Messenger {
  constructor(name) {
    this.nameUser = name;
    this.url = 'wss://https://coursar-heroku.herokuapp.com/';
  }

  init() {
    this.elMessenger = document.querySelector('.messenger');
    this.elInputMessage = document.querySelector('#inp-msg');
    this.elListMessages = document.querySelector('#list-msg');
    this.elMessenger.classList.remove('hidden');
    this.initWS();
    this.drawUsersList();

    window.addEventListener('beforeunload', () => {
      this.ws.close(1000, 'work end');
      api.remove(this.nameUser);
      this.drawUsersList();
    });

    this.elInputMessage.addEventListener('keypress', (evt) => {
      // send message
      if (evt.key === 'Enter') {
        this.sendMessage(this.elInputMessage.value);
        this.elInputMessage.value = '';
      }
    });
  }

  initWS() {
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener('open', () => {
      console.log('connected');
      // this.ws.send('hello');
    });

    this.ws.addEventListener('message', (evt) => {
      // print msg
      this.drawMessage(evt);
    });

    this.ws.addEventListener('close', (evt) => {
      console.log('connection closed', evt);
    });

    this.ws.addEventListener('error', () => {
      console.log('error');
    });
  }

  async drawUsersList() {
    const response = await api.load();
    const arrUsers = await response.json();
    console.log(this.nameUser);
    const elListUsers = document.querySelector('#list-users');
    elListUsers.innerHTML = '';
    for (const item of arrUsers) {
      const elItemUser = document.createElement('div');
      elItemUser.className = 'item-user';
      elItemUser.innerHTML = `
      <div class="item-img-user"></div>
      <div class="item-name-user
        ${item.name === this.nameUser ? 'active' : ''}
      ">${item.name}</div>
      `;
      elListUsers.appendChild(elItemUser);
    }
  }

  drawMessage(message) {
    const { type } = JSON.parse(message.data);

    if (type === 'message') {
      const {
        name,
        msg,
        dateTime,
      } = JSON.parse(message.data);

      const itemMessage = document.createElement('li');
      itemMessage.className = `
        list-item-msg
        ${this.nameUser === name ? 'active' : ''}
      `;

      itemMessage.innerHTML = `
      <div class="list-item-head">
        <span>${name}</span>
        <span>${printData(dateTime)}</span>
      </div>
      <div class="list-item-msg">
      ${msg}
      </div>
      `;

      this.elListMessages.appendChild(itemMessage);
      this.elListMessages.scrollTo(0, itemMessage.offsetTop);
    } else if (type === 'add user') {
      this.drawUsersList();
    } else if (type === 'del user') {
      console.log('del user!!!');
      this.drawUsersList();
    }
  }

  sendMessage(message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      try {
        const msg = {
          type: 'message',
          name: this.nameUser,
          msg: message,
          dateTime: new Date(),
        };
        const jsonMsg = JSON.stringify(msg);
        this.ws.send(jsonMsg);
      } catch (e) {
        console.log('err');
        console.log(e);
      }
    } else {
      // Reconnect
      console.log('reconect');
      this.ws = new WebSocket(this.url);
    }
  }
}
