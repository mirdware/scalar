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

function changeSelect2($) {
  const { select } = $;
  $.select2 = '';
  $.dependency = select && data[select] ? data[select] : [''];
}

export default ($) => ({
  _submit: () => {
    $.inject(Message).emit($.name);
    console.log($);
  },
  _reset: () => Object.assign($, {
    name: 'init',
    password: null,
    sexo: 'F',
    paint: true,
    select: null,
    date: null,
    dependency: [''],
    select2: null,
    file: getEmptyFileList()
  }),
  '.fill': {
    click: () => Object.assign($, {
      name: 'Marlon Ramírez',
      password: 'MySecretPassword',
      sexo: 'M',
      paint: false,
      select: 1,
      date: new Date(),
      dependency: data[1],
      select2: 'Cali'
    })
  },
  '#select': {
    change: () => changeSelect2($),
    mutate: () => changeSelect2($)
  },
  '.timestamp': {
    change: () => $.date = new Date($.date?.length > 10 ? $.date : $.date + "T00:00")
  }
});
