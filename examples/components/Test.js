import { Component } from '../../scalar';
import { User } from '../repositories/User';
import { Table } from '../templates/Table';

const user = new User();

function track(e) {
  console.log(this, e.x, e.y);
}

function sendRequest(e) {
  let className = e.target.className;
  this.open.removeClass(className);
  this.name.set(user.get());
}

export default class Test extends Component {
  constructor() {
    super('#square', {
      'mousemove': track,
      '.open': {
        'click': sendRequest
      }
    });
    this.name.setTemplate(new Table());
  }
}
