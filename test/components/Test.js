import { Resource } from '../../scalar';
import Message from '../services/Message';

const user = new Resource('response.json');

export default ($) => {
  const message = $.inject(Message);

  function track(e) {
    console.log($, e.clientX + ',' + e.clientY);
  }

  function sendRequest(e) {
    $.action = 'reset';
    $.name = user.get();
  }

  function reset(e) {
    e.preventDefault();
    $.reset();
  }

  function paint(e) {
    const color = e.target.innerHTML;
    $.squareStyle = {
      backgroundColor: color,
      borderRadius: color !== 'blue' ? '.5em': '0'
    };
  }

  return {
    observe: () => $.header = message.msg,
    mousemove: track,
    '.open': {
      click: sendRequest
    },
    '.first': {
      click: paint
    },  
    '.reset': {
      click: reset
    }
  };
};
