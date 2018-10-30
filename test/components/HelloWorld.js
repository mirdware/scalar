import { Component } from '../../scalar';

function assignValues(e) {
  Object.assign(this, {
    name: 'Marlon Ramírez',
    password: 'MySecretPassword',
    sexo: 'M',
    show: false,
    select: 'm'
  });
}

function submit (e) {
  e.preventDefault();
  this.show ? alert(this.toJSON()) : console.log(this);
}

export class HelloWorld extends Component {
  constructor() {
    super('#hello-world');
  }

  listen() {
    const events = {
      submit: submit,
      reset: () => setTimeout(() => this.reset(), 0),
      '.fill': {click: assignValues}
    };
    return events;
  }
}
