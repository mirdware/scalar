export default () => {
  function clean() {
    this.tasks = [];
  }

  function remove(e) {
      const index = e.target.parentNode.dataset.index;
      this.tasks.splice(index, 1);
  }

  function add(e) {
      e.preventDefault();
      if (!this.task) return;
      this.tasks.push(this.task);
      this.task = "";
  }

  return {
    submit: add,
    '.close': {
      click: remove
    },
    '#clean': {
      click: clean
    }
  };
};
