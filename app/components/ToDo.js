function remove($, e) {
  const index = e.target.parentNode.dataset.index;
  $.tasks.splice(index, 1);
}

function add($) {
  if (!$.task) return;
  $.tasks.push($.task);
  $.task = "";
}

export default ($) => ({
  submit: () => add($),
  '.close': {
    click: (e) => remove($, e)
  },
  '#clean': {
    click: () => $.tasks = []
  }
});
