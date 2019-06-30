import Message from '../services/Message';

export default ($) => ({
  submit: (e) => {
    e.preventDefault();
    $.inject(Message).msg = $.name;
    $.show ? alert($.toJSON()) : console.log($);
  },
  reset: (e) => {
    e.preventDefault();
    $.reset();
  },
  '.fill': {
    click: (e) => Object.assign($, {
      name: 'Marlon Ramírez',
      password: 'MySecretPassword',
      sexo: 'M',
      show: false,
      select: 'm'
    })
  }
});
