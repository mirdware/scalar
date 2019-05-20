import { Component, Template, Resource } from '../../scalar';

const user = new Resource('response.json');

function track(e) {
  console.log(this, e.clientX + ',' + e.clientY);
}

function sendRequest(e) {
  this.action = 'reset';
  this.name = user.get();
}

function reset(e) {
  e.preventDefault();
  this.reset();
}

function paint(e) {
  const color = e.target.innerHTML;
  this.squareStyle = {backgroundColor: color, borderRadius: color != 'blue' ? '.5em': '0'};
}

export class Test extends Component {
  constructor() {
    super('#square');
  }

  listen() {
    return {
      mousemove: track,
      '.open': {click: sendRequest},
      '.first': {click: paint},
      '.reset': {click: reset}
    };
  }
}
