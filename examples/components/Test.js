import Table from '../templates/Table';
import User from '../repositories/User';
import {Component} from '../../pinnacle';

const tpl = new Table();
const user = new User();

function enter(e) {
    console.log(this);
}

function close(e) {
    user.get().then((data) => {
        this.setName(tpl.render(data));
    });
}

export default class Test extends Component {
    constructor() {
        super('#square', {
            'mousemove': enter,
            '.close': {
                'click': close
            }
        });
    }
}
