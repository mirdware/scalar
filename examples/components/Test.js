import { Component, Template } from '../../scalar';
import { User } from '../repositories/User';

const user = new User();

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
      <td>$${addr.first}</td>
      <td>$${addr.last}</td>
    </tr>
  `;
}

export class Test extends Component {
  constructor() {
    super('#square', {
      'mousemove': track,
      '.open': {
        'click': sendRequest
      }
    });
    this.name.setTemplate(renderTable);
  }
}
