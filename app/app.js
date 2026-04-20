import './styles/theme.css';
import mainModule from './main-module';

const originalPushState = history.pushState;
history.pushState = function(state, title, url) {
  const result = originalPushState.apply(history, arguments);
  const event = new Event('pushstate');
  event.state = state;
  event.title = title;
  event.url = url;
  window.dispatchEvent(event);
  return result;
};
window.addEventListener('pushstate', () => mainModule.execute());
window.addEventListener('popstate', () => mainModule.execute());

document.getElementById('control').addEventListener('click', (e) => {
  const { target } = e;
  if (target.textContent === 'Enable') {
    target.textContent = 'Disable';
    mainModule.execute();
  } else {
    target.textContent = 'Enable';
    mainModule.dispose();
  }
});

mainModule.execute();
