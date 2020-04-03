import Message from '../services/Message';

function getEmptyFileList() {
  const $file = document.createElement('input');
  $file.type = 'file';
  return $file.files;
}

export default ($) => ({
  _submit: () => {
    $.inject(Message).set($.name);
    console.log($);
  },
  reset: () => Object.assign($, {
    name: 'init',
    password: '',
    sexo: 'F',
    paint: true,
    select: 'h',
    file: getEmptyFileList()
  }),
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
