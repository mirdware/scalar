import User from '../repositories/User';
import {Component} from '../../pinnacle';

const user = new User();

function enter(e) {
  console.log(this);
}

function close(e) {
  let className = e.target.className;
  this.getOpenClass().remove(className);
  user.get((tpl) => this.setName(tpl));
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
