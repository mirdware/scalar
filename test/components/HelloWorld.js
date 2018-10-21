import { Component } from '../../scalar';

export class HelloWorld extends Component {
  constructor() {
    super('#hello-world');
  }

  listen() {
    return {
      'submit': (e) => {
        e.preventDefault();
        this.show ? alert(this.toJSON()) : console.log(this);
      },
      'reset': (e) => {
        e.preventDefault();
        this.reset();
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
