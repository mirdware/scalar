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
  mount: () => {
    $.countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central Arfrican Republic","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauro","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
  },
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
    multi: [],
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
      multi: ["0", "2"],
      select2: 'Cali'
    })
  },
  '#select': {
    change: () => changeSelect2($),
    mutate: () => changeSelect2($)
  },
  '.timestamp': {
    change: () => $.date = new Date($.date?.length > 10 ? $.date : $.date + "T00:00"),
    paste: async () => {
      const date = await navigator.clipboard.readText();
      $.date = new Date(date);
    },
    copy: (e) => $.date && navigator.clipboard.writeText($.date.toJSON())
  },
  'multi-select': {
    changed: (e) => $.multi = e.detail
  },
  'auto-complete': { selected: (e) => console.log(e), changed: (e) => console.log(e) }
});
