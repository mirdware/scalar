import { Component, Template, Resource } from '../../scalar';

const user = new Resource('response.json');

function track(e) {
  console.log(this, e.clientX + ',' + e.clientY);
}

function sendRequest(e) {
  let element = e.target;
  this.open = '';
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
  this.perform((node) => node.style.backgroundColor = e.target.innerHTML);
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
