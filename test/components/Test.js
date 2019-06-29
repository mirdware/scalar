import { Resource } from '../../scalar';
import Message from '../services/Message';

export default (module) => {
  const user = new Resource('response.json');
  const message = module.inject(Message);

  function track(e) {
    console.log(this, e.clientX + ',' + e.clientY);
  }

  function sendRequest(e) {
    this.action = 'reset';
    this.name = user.get();
    console.log(message.msg);
  }

  function reset(e) {
    e.preventDefault();
    this.reset();
  }

  function paint(e) {
    const color = e.target.innerHTML;
    this.squareStyle = {
      backgroundColor: color,
      borderRadius: color !== 'blue' ? '.5em': '0'
    };
  }

  return {
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
