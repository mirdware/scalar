import { Resource } from '../../scalar';
import Message from '../services/Message';

const user = new Resource('response.json');

export default ($) => {
  const message = $.inject(Message);

  function track(e) {
    console.log($, e.clientX + ',' + e.clientY);
  }

  function sendRequest() {
    $.action = 'reset';
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
    mount: () => $.header = message.msg,
    mousemove: track,
    '.open': {
      click: sendRequest
    },
    '.first': {
      click: paint
    },
    '.reset': {
      click: $.reset
    }
  };
};
