import { Component } from '../../scalar';

function render(e) {
  this.name.set(e.target.value);
}

export class HelloWorld extends Component {
  constructor() {
    super('#hello-world');
  }

  listen() {
    return {
      'input': {
        'keyup': render,
        'mount': render
      },
      'submit': (e) => e.preventDefault()
    };
  }
}
