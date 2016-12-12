import {Template} from '../../pinnacle';

export default class Table extends Template {
    constructor() {
        super((addrs) => Template.html`
            <table>
            ${addrs.map((addr) => Template.html`
                <tr>
                    <td>$${addr.first}</td>
                    <td>$${addr.last}</td>
                </tr>
            `)}
            </table>
        `);
    }
}
