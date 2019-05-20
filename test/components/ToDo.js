import { Component } from '../../scalar';

function close(e) {
    const index = e.target.parentNode.dataset.index;
    console.log(index);
    this.tasks.splice(index, 1);
}

function add(e) {
    e.preventDefault();
    if (!this.task) return;
    this.tasks.push(this.task);
    this.task = "";
    console.log(this);
}

export class ToDo extends Component {
  constructor() {
    super('#todo');
    this.tasks = [];
  }

  listen() {
    return {
      submit: add,
      '.close': {click: close},
      '#clean': {click: () => this.tasks = []}
    };
  }
}
