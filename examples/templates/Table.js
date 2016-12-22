import {Template} from '../../pinnacle';

function render(addr) {
  return Template.html`
    <tr>
      <td>$${addr.first}</td>
      <td>$${addr.last}</td>
    </tr>
  `;
}

export default class Table extends Template {
  constructor() {
    super((addrs) => addrs.map(render));
  }
}
