import { Component } from "../../scalar";

export default class ToDo extends Component {
  listen() {
    return {
      mount: () => console.log(this),
      _submit: (e) => this.add(e),
      '.close': {
        _click: (e) => this.remove(e)
      },
      '.check': {
        _click: (e) => this.crossOutItem(e)
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
    this.task = '';
  }
  
  crossOutItem(e) {
    const index = this.getIndex(e);
    const task = this.tasks[index];
    task.checked = task.checked ? '' : 'checked';
  }
}
