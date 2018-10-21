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

function reset(e) {
  e.preventDefault();
  this.reset();
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
      reset: reset,
      '.fill': {click: assignValues}
    };
    return events;
  }
}
