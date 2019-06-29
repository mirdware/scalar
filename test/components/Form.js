import Message from '../services/Message';

export default (module) => {
  const message = module.inject(Message);

  function reset(e) {
    e.preventDefault();
    this.reset();
  }

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
    message.msg = this.name;
    this.show ? alert(this.toJSON()) : console.log(this);
  }

  return {
    submit: submit,
    reset: reset,
    '.fill': {
      click: assignValues
    }
  };
};
