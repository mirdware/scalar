import Message from '../services/Message';

export default ($) => ({
  _submit: () => {
    $.inject(Message).set($.name);
    console.log($);
  },
  _reset: () => $.reset(),
  '.fill': {
    click: () => Object.assign($, {
      name: 'Marlon Ramírez',
      password: 'MySecretPassword',
      sexo: 'M',
      paint: false,
      select: 'm'
    })
  }
});
