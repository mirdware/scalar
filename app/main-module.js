import { Module } from '../src/scalar';
import Form from './components/Form';
import Test from './components/Test';
import ToDo from './components/ToDo';
import Greeting from './components/Greeting';
import MultiSelect from './components/MultiSelect';
import AutoComplete from './components/AutoComplete';

customElements.define('multi-select', MultiSelect);

export default new Module()
  .add("/test", () => import('./test-module'))
  .compose('#square', Test)
  .compose('#hello-world', Form)
  .compose('#todo', ToDo)
  .compose('auto-complete', AutoComplete)
  .compose('.external-component', ($) => ({
    'sc-hi': { unmount: (e) => console.log(e) },
    'a': { _click: () => {
      console.log($);
      history.pushState(null, "newTitle", '/test');
    } }
  }))
  .compose('.alert', () => ({
    '.show': { click: (e) => alert(e.target.innerText) }
  }))
  .compose('sc-hi', Greeting);
