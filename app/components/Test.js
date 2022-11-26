import Resource from '@spawm/resource';
import Message from '../services/Message';

const { protocol, hostname, port } = window.location;
const user = new Resource(protocol + '//' + hostname + ':' + port + '/response.json');

export default ($) => {
  $.inject(Message).listen((msg) => $.my.msg = msg);

  function sendRequest() {
    $.action.replace('open', 'reset');
    $.people = user.get();
  }

  function reset() {
    $.action.replace('reset', 'open');
    Object.assign($, {
      people: [],
      squareStyle: {
        backgroundColor: 'black',
        borderRadius: 0
      }
    });
  }

  function paint() {
    const color = this.innerText.toLowerCase();
    $.squareStyle = {
      backgroundColor: color,
      borderRadius: color !== 'blue' ? '.5em': '0'
    };
  }

  return {
    '.open': { click: sendRequest },
    '.paint': { click: paint },
    '.reset': { click: reset }
  };
};
