import Message from '../services/Message';

const data = [
  ['', 'Mazda', 'Tesla', 'Renault', 'Volkswagen', 'Pegeout'],
  ['', 'London', 'New York', 'Madrid', 'Cali', 'Pekin', 'Moscou'],
  ['', 'soccer', 'basketball', 'baseball', 'hockey', 'snowboarding']
];

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
  _reset: () => Object.assign($, {
    name: 'init',
    password: '',
    sexo: 'F',
    paint: true,
    select: '',
    dependency: [''],
    select2: '',
    file: getEmptyFileList()
  }),
  '.fill': {
    click: () => Object.assign($, {
      name: 'Marlon Ramírez',
      password: 'MySecretPassword',
      sexo: 'M',
      paint: false,
      select: 0,
      dependency: data[0],
      select2: 'Tesla'
    })
  },
  '#select': {
    change: () => {
      const { select } = $;
      $.select2 = '';
      $.dependency = select ? data[select] : [''];
    }
  }
});
