import { Component } from 'scalar';

export default class ToDo extends Component {
  onInit() {
    this._total = () => this.tasks.length;
    this._pending = () => this.tasks.filter(task => !task.checked).length;
  }

  listen() {
    return {
      _submit: (e) => this.add(e),
      '.close': {
        _click: (_, task) => this.remove(task)
      },
      '.check': {
        _click: (_, task) => task.checked = task.checked ? '' : 'checked'
      },
      '#clean': {
        click: () => this.tasks = []
      }
    };
  }

  remove(task) {
    const index = this.tasks.indexOf(task);
    this.tasks.splice(index, 1);
  }

  add() {
    console.log(this);
    if (!this.task) return;
    this.tasks.push({
      content: this.task,
      checked: ''
    });
    this.task = '';
  }
}
