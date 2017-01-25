import { Template } from '../../scalar';

function render(addr) {
  return Template.html`
    <tr>
      <td>$${addr.first}</td>
      <td>$${addr.last}</td>
    </tr>
  `;
}

export class Table extends Template {
  constructor() {
    super((addrs) => addrs.map(render));
  }
}
