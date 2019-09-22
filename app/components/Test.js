import { Resource } from '../../scalar';
import Message from '../services/Message';

const user = new Resource('response.json');

export default ($) => {
  const message = $.inject(Message);

  function track(e) {
    console.log($, e.clientX + ',' + e.clientY);
  }

  function sendRequest() {
    $.action.replace('open', 'reset');
    $.name = user.get();
  }

  function paint() {
    const color = this.innerHTML;
    $.squareStyle = {
      backgroundColor: color,
      borderRadius: color !== 'blue' ? '.5em': '0'
    };
  }

  return {
    mount: () => message.my = $.my,
    mousemove: track,
    '.open': {
      click: sendRequest
    },
    '.first': {
      _click: paint
    },
    '.reset': {
      click: () => $.reset()
    }
  };
};