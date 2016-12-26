import {Component} from '../../scalar';

function render(e) {
  this.name.value(`<b>${e.target.value}</b>`);
}

export default class HelloWorld extends Component {
  constructor() {
    super('#hello-world', {
      'input': {
        'keyup': render,
        'mount': render
      },
      'submit': (e) => e.preventDefault()
    });
  }
}
