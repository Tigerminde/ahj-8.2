import API from './Api';
import Messenger from './messenger';

const api = new API('https://ahj-homework-8-2-serv.herokuapp.com/users');

const elWindowStart = document.querySelector('.window');
const submitName = document.querySelector('#submit-name');
const alertName = document.querySelector('#alert');
const okAlert = document.querySelector('#ok-alert');
let nameUser = '';

function conectChat() {
  const messenger = new Messenger(nameUser);
  messenger.init();
}

submitName.addEventListener('click', async () => {
  const inputName = document.querySelector('#inp-name');
  nameUser = inputName.value;

  if (nameUser) {
    const response = await api.load();
    const arrUsers = await response.json();

    if (arrUsers.findIndex((item) => item.name === nameUser) === -1) {
      await api.add({ name: nameUser });
      elWindowStart.classList.add('hidden');
      inputName.value = '';
      conectChat();
      return;
    }
    alertName.classList.remove('hidden');
  }
});

okAlert.addEventListener('click', () => {
  alertName.classList.add('hidden');
});
