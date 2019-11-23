import { Component } from "../../scalar";

export default class ToDo extends Component {
  listen() {
    return {
      mount: () => console.log(this),
      submit: (e) => this.add(e),
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
    e.preventDefault();
    const index = this.getIndex(e);
    this.tasks.splice(index, 1);
  }
  
  add(e) {
    e.preventDefault();
    if (!this.task) return;
    this.tasks.push({
      content: this.task,
      checked: ''
    });
    this.task = '';
  }
  
  crossOutItem(e) {
    const index = this.getIndex(e);
    const task = this.tasks[index];
    task.checked = task.checked ? '' : 'checked';
  }
}
