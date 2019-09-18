import { Component } from "../../scalar";

function remove($, e) {
  const index = e.target.parentNode.dataset.index;
  $.tasks.splice(index, 1);
}

function add($) {
  if (!$.task) return;
  $.tasks.push($.task);
  $.task = "";
}

function crossOutItem(e) {
  const styles = e.target.parentNode.style;
  styles.textDecoration = styles.textDecoration === 'line-through' ? 'none' : 'line-through'
}

export default class ToDo extends Component {
  listen() {
    return {
      submit: () => add(this),
      '.close': {
        click: (e) => remove(this, e)
      },
      '.check': {
        click: (e) => crossOutItem(e)
      },
      '#clean': {
        click: () => this.tasks = []
      }
    };
  }
}
