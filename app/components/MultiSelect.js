import { Component, customElement } from "../../src/scalar";

function loadOptions($) {
  const $option = $.querySelector('option');
  if ($option) {
    $.$select.appendChild($option);
    $.checkList.push($option);
  }
}

function toogleItem(index, $) {
  const item = $.checkList[index];
  item.selected = !item.selected;
  if ($.selectAll) {
    if (parseInt(index)) {
      calculateAllSelector($);
    } else {
      $._data.forEach((i) => i.selected = item.selected);
    }
  }
}

function dispatchEvent($) {
  $.$select.dispatchEvent(new Event('change'));
  $.dispatchEvent(new CustomEvent('changed', {
    detail: JSON.parse(JSON.stringify($.value))
  }));
}

function calculateAllSelector($) {
  const allSelector = $.checkList[0];
  const selecteds = $._data.filter((check) => check.selected && !check.all).length;
  allSelector.selected = $._data.length - 1 === selecteds;
}

function refresh($) {
  const $selectedOptions = $.checkList.filter((check) => check.selected && !check.all);
  $.numSelected = $selectedOptions.length;
  $.showItems = $.numSelected <= $.maxItems;
  $.badgeList = $.showItems ? $selectedOptions : [];
  $.selectAll && calculateAllSelector($);
  dispatchEvent($);
}

function removeBadge(e, $) {
  const badge = $.badgeList[$.getIndex(e)];
  badge.selected = false;
  refresh($);
  e.stopPropagation();
}

function search(e, $) {
  const txtSearch = e.target.value.toUpperCase();
  $.checkList = $._data.filter((check) => check.all || check.text.toUpperCase().includes(txtSearch));
}

function show($) {
  $.show ='block';
  $.$search.focus();
  $.$search.select();
}

function toUp($) {
  let currentFocus = $._currentFocus;
  const { length } = $.checkList;
  currentFocus++;
  if (currentFocus >= length) {
      currentFocus = 0;
  }
  $._currentFocus = currentFocus;
}

function toDown($) {
  let currentFocus = $._currentFocus;
  const { length } = $.checkList;
  currentFocus--;
  if (currentFocus < 0) {
      currentFocus = length - 1;
  }
  $._currentFocus = currentFocus;
}

function enter($) {
  const currentFocus = $._currentFocus;
  if (currentFocus > -1) {
    toogleItem(currentFocus, $);
  }
}

function controlKey(e, $) {
  const { keyCode } = e;
  const inputs = { 40: toUp, 38: toDown, 13: enter, 27: close };
  if (!inputs[keyCode]) return true;
  e.preventDefault();
  inputs[keyCode]($);
}

function close($) {
  $.show = 'none';
  refresh($);
}

@customElement({
    template: /*html*/`
    <select data-attr="name:name; required:required" style="display:none;" data-bind="value" multiple></select>
    <div class="dropdown" tabindex="0">
      <div class="list-wrapper" data-attr="style.display: show">
        <input type="search" class="search" data-attr="placeholder:_txtSearch; style.display: search ? '' : 'none'">
        <div class="list" data-bind="checkList">
          <script type="text/template">
            <label data-attr="id: _currentFocus === \${index} ? 'active' : ''" data-key="\${index}" class="\${(data.all ? 'all-selector ' : '') + (data.selected ? 'checked' : '')}">
              <input type="checkbox" \${data.selected ? 'checked' : ''} />
              \${data.text}
            </label>
          </script>
        </div>
      </div>
      <div data-bind="badgeList">
        <script type="text/template">
          <span data-key="\${index}" class="optext">
            \${data.text}
            <span class="optdel" data-attr="title:_txtRemove;style.display: hideClose ? 'none' : ''">🗙</span>
          </span>
        </script>
      </div>
      <span class="placeholder" data-attr="textContent: placeholder; style.display: numSelected ? 'none' : ''"></span>
      <span class="optext maxselected" data-attr="textContent: numSelected + ' selected'; style.display: showItems ? 'none' : ''"></span>
    </div>
    <slot></slot>
    `,
    styles: /*css*/`
    .dropdown {
      display: inline-block;
      padding: 2px 5px 0px 5px;
      border-radius: 4px;
      border: solid 1px #777;
      background-color: white;
      position: relative;
      max-width: 100%;
    }
    .optext, .placeholder {
      margin-right:0.5em; 
      margin-bottom:2px;
      padding:1px 0;
      border-radius: 4px;
      display:inline-block;
    }
    .optext {
      background-color:lightgray;
      padding:1px 0.75em; 
    }
    .optdel {
      float: right;
      font-size: .7em;
      margin-left: .5em;
      margin-right: -.5em;
      cursor: pointer;
      color: #666;
    }
    .optdel:hover {
      color: #c66;
    }
    .placeholder {
      color: #777;
    }
    .list-wrapper {
      box-shadow: gray 0 3px 8px;
      z-index: 100;
      padding:2px;
      border-radius: 4px;
      border: solid 1px #ced4da;
      display: none;
      margin: -1px;
      position: absolute;
      top:0;
      left: 0;
      right: 0;
      background: white;
    }
    .search {
      padding: .5em;
      box-sizing: border-box;
      border: 0;
      outline: 0;
      background: transparent;
      width: 100%;
    }
    .list {
      padding:2px;
      max-height: 15rem;
      overflow-y:auto;
      overflow-x: hidden;
    }
    .list::-webkit-scrollbar {
      width: 6px;
    }
    .list::-webkit-scrollbar-thumb {
      background-color: #bec4ca;
      border-radius:3px;
    }
    .list label {
      cursor: pointer;
      display: block;
      padding: 5px;
    }
    .list input {
      height: 1.15em;
      width: 1.15em;
      margin-right: 0.35em;  
    }
    .list label:hover, #active {
      background-color: #ced4da;
    }
    .maxselected {
      width:100%;
      box-sizing: border-box;
    }
    .all-selector {
      border-bottom:solid 1px #999;
    }
    `
})
export default class MultiSelect extends Component {
  constructor() {
    super();
    this._data = [];
    this._currentFocus = -1;
    this._txtAll ='All';
    this._txtRemove = 'Remove';
    this._txtSearch ='Search';
    this.placeholder ='select a item';
    this.maxItems = 5;
    this.selectAll = false;
    this.search = false;
    this.hideClose = false;
    this.name = '';
    this.required = false;
    this.value = [];
  }

  connectedCallback() {
    this.$select = this.shadowRoot.querySelector('select');
    this.$search = this.shadowRoot.querySelector('.search');
    if (this.selectAll) {
      const allSelector = { text: this._txtAll, all: true };
      this.checkList.unshift(allSelector);
    }
    setTimeout(() => {
      this._data = this.checkList;
      refresh(this);
    }, 0);
    document.addEventListener('click', (e) => {
      if (e.target !== this) {
        close(this);
      }
    });
  }

  listen = () => ({
    slotchange: () => loadOptions(this),
    '.dropdown': { click: () => show(this), keydown: (e) => e.keyCode === 13 && show(this) },
    '.list-wrapper': { _keydown: (e) => controlKey(e, this) },
    '.list label': { change: (e) => toogleItem(this.getIndex(e), this) },
    '.optext span': { _click: (e) => removeBadge(e, this) },
    '.search': { input: (e) => search(e, this) }
  });
}
