import Message from '../services/Message';

export default ($) => ({
  submit: (e) => {
    $.inject(Message).msg = $.name;
    $.show ? alert($.toJSON()) : console.log($);
  },
  reset: $.reset,
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
