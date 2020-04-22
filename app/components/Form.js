import Message from '../services/Message';

const initState = ['Hello', 'Hi', 'OK'];

function getEmptyFileList() {
  const $file = document.createElement('input');
  $file.type = 'file';
  return $file.files;
}

export default ($) => ({
  mount: () => {
    $.dependency = initState;
    $.select2 = initState[0];
  },
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
  },
  '#select': {
    change: () => {
      $.dependency = $.select === 'm' ? ['World'] : initState;
      $.select2 = $.dependency[0];
    }
  },
  'datalist[data-bind]': {
    mutate: (e) => {
      const { target } = e;
      const selects = document.querySelectorAll('select[list="'+target.id+'"]');
      for (let i = 0, select; select = selects[i]; i++) {
        select.innerHTML = target.innerHTML;
      }
    }
  }
});
