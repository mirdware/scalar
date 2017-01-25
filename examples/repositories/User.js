import { Resource } from '../../scalar';

export class User extends Resource {
    constructor() {
        super('response.json');
    }
}
