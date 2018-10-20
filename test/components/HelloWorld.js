import { Component } from '../../scalar';

export class HelloWorld extends Component {
  constructor() {
    super('#hello-world');
  }

  listen() {
    return {
      'submit': (e) => e.preventDefault(),
      '.click-me': {
        'click': () => this.show ? alert(this.name) : console.log(this)
      }
    };
  }
}
