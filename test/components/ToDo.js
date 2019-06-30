
function remove($, e) {
    const index = e.target.parentNode.dataset.index;
    $.tasks.splice(index, 1);
}

function add($, e) {
    e.preventDefault();
    if (!$.task) return;
    $.tasks.push($.task);
    $.task = "";
}

export default ($) => ({
  submit: (e) => add($, e),
  '.close': {
    click: (e) => remove($, e)
  },
  '#clean': {
    click: () => $.tasks = []
  }
});
