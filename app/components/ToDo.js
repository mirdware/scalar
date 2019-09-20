import { Component } from "../../scalar";

export default class ToDo extends Component {
  listen() {
    return {
      submit: () => this.add(),
      '.close': {
        click: (e) => this.remove(e)
      },
      '.check': {
        click: (e) => this.crossOutItem(e)
      },
      '#clean': {
        click: () => this.tasks = []
      }
    };
  }

  remove(e) {
    const index = this.getIndex(e);
    this.tasks.splice(index, 1);
  }
  
  add() {
    if (!this.task) return;
    this.tasks.push({
      content: this.task,
      checked: ''
    });
    this.task = "";
  }
  
  crossOutItem(e) {
    const task = this.tasks[this.getIndex(e)];
    task.checked = task.checked ? '' : 'checked';
  }
}
