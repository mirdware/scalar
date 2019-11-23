import Message from '../services/Message';

export default ($) => ({
  submit: (e) => {
    e.preventDefault();
    $.inject(Message).set($.name);
    console.log($);
  },
  reset: () => $.reset(),
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
