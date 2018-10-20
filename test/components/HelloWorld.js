import { Component } from '../../scalar';

export class HelloWorld extends Component {
  constructor() {
    super('#hello-world');
  }

  listen() {
    return {
      'submit': (e) => e.preventDefault(),
      '.click-me': {
        'click': () => this.show ? alert(this.file) : console.log(this)
      },
      '.fill': {
        'click': () => {
          this.name = 'Marlon Ramírez';
          this.password = 'MySecretPassword';
          this.sexo = 'M';
          this.show = false;
          this.select = 'm';
        }
      }
    };
  }
}
