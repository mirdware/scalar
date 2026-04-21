import './styles/theme.css';
import mainModule from './main-module';

const originalPushState = history.pushState;
const $control = document.getElementById('control');

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

$control.addEventListener('click', () => {
  if ($control.textContent === 'Enable') {
    $control.className = '';
    $control.textContent = 'Disable';
    mainModule.execute();
  } else {
    $control.className = 'disabled';
    $control.textContent = 'Enable';
    mainModule.dispose();
  }
});

mainModule.execute();
