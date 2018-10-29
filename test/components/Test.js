import { Component, Template, Resource } from '../../scalar';

const user = new Resource('response.json');

function track(e) {
  //console.log(this, e.clientX + ',' + e.clientY);
}

function sendRequest(e) {
  this.action = 'reset';
  this.name = user.get();
}

function reset(e) {
  e.preventDefault();
  this.reset();
}

function renderTable(addr) {
  return Template.html`
    <tr>
      <td class="first">$${addr.first}</td>
      <td>$${addr.last}</td>
    </tr>
  `;
}

function paint(e) {
  this.squareStyle = {backgroundColor: e.target.innerHTML, borderRadius: '.5em'};
}

export class Test extends Component {
  constructor() {
    super('#square');
  }

  listen() {
    const events = {
      mousemove: track,
      '.open': {click: sendRequest},
      '.first': {click: paint},
      '.reset': {click: reset}
    };
    return events;
  }

  init(properties) {
    properties.name.setTemplate(renderTable);
  }
}
