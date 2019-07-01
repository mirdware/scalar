import Message from '../services/Message';

export default ($) => ({
  submit: () => {
    $.inject(Message).set($.name);
    $.show ? alert($.toJSON()) : console.log($);
  },
  reset: () => $.reset(),
  '.fill': {
    click: () => Object.assign($, {
      name: 'Marlon Ramírez',
      password: 'MySecretPassword',
      sexo: 'M',
      show: false,
      select: 'm'
    })
  }
});
