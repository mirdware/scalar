import { Component, customElement } from "../../src/scalar";

@customElement({
    template: /*html*/`
    <img src="data:image/png;base64,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" />
    <strong>Hola <span data-bind="name">mundo</span>!!</strong>
    <slot name="body">
      <p>Por favor de click <a href="">aquí</a></p>
    </slot>
    `,
    styles: /*css*/`
    :host{
      border: 1px solid;
      display: block;
      border-radius: 1em;
      padding: .5em;
      margin: .5em;
    }
    strong {
      color:#f58731;
    }
    img{
      vertical-align: middle;
      margin-right: 1em;
    }
    `
})
export default class Greeting extends Component {
  constructor () {
    super();
    this.name = '';
  }

  listen() {
    return {
      'a': { _click: () => alert("Hola " + this.name) }
    };
  }
}
