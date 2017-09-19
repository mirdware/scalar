import { Component, Template, Resource } from '../../scalar';

const user = new Resource('response.json');

function track(e) {
  console.log(this, e.clientX + ',' + e.clientY);
}

function sendRequest(e) {
  let element = e.target;
  element.classList.remove(element.className);
  this.name.set(user.get());
}

function renderTable(addr) {
  return Template.html`
    <tr>
      <td class="first">$${addr.first}</td>
      <td>$${addr.last}</td>
    </tr>
  `;
}

export class Test extends Component {
  constructor() {
    super('#square');
  }

  listen() {
    return {
      'mousemove': track,
      '.open': {
        'click': sendRequest
      },
      '.first': {
        'click': (e) => alert('click on ' + e.target.innerHTML)
      }
    };
  }

  init() {
    this.name.setTemplate(renderTable);
  }
}
