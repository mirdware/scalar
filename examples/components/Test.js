import User from '../repositories/User';
import {Component} from '../../scalar';

const user = new User();

function enter(e) {
  console.log(this);
}

function close(e) {
  let className = e.target.className;
  this.open.removeClass(className);
  user.get((tpl) => this.name.value(tpl));
}

export default class Test extends Component {
  constructor() {
    super('#square', {
      'mousemove': enter,
      '.open': {
        'click': close
      }
    });
  }
}
