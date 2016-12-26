import {Resource} from '../../scalar';
import Table from '../templates/Table';

const tplTable = new Table();

export default class User extends Resource {
    constructor() {
        super('response.json');
    }

    get(fn) {
      return super.get().then((data) => {
          data = tplTable.render(data);
          fn(data);
        });
    }
}
