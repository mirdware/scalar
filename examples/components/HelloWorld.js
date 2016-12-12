import {Component} from '../../pinnacle';

function render(e) {
    this.setName(`<b>${e.target.value}</b>`);
}

export default class HelloWorld extends Component {
    constructor() {
        super('#hello-world', {
            'input': {
                'keyup': render,
                'mount': render
            },
            'submit': function (e) {
                e.preventDefault();
            }
        });
    }
}
