import { Component } from '../../scalar';

function close(e) {
    const index = e.target.dataset.index;
    this.tasks.splice(index, 1);
}

function add(e) {
    e.preventDefault();
    if (!this.task) return;
    this.tasks.push(this.task);
    this.task = "";
}

export class ToDo extends Component {
    constructor() {
      super('#todo');
      this.tasks = [];
    }
  
    listen() {
      const events = {
          submit: add,
          '.close': {click: close}
      };
      return events;
    }
  }
  