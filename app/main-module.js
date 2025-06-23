import { Module } from '../src/scalar';
import Form from './components/Form';
import Test from './components/Test';
import ToDo from './components/ToDo';
import Greeting from './components/Greeting';
import MultiSelect from './components/MultiSelect';
import AutoComplete from './components/AutoComplete';

export default new Module()
.add("/test", () => import('./test-module'))
.compose('#square', Test)
.compose('#hello-world', Form)
.compose('#todo', ToDo)
.compose('sc-hi', Greeting)
.compose('multi-select', MultiSelect)
.compose('auto-complete', AutoComplete)
.compose('.external-component', ($) => ({
  'a': { _click: () => {
    console.log($);
    history.pushState(null, "newTitle", '/test');
   } }
}))
.compose('.alert', () => ({
  '.show': { click: (e) => alert(e.target.innerText) }
}));