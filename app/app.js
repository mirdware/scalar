import './styles/theme.css';
import { Module } from '../scalar';
import Form from './components/Form';
import Test from './components/Test';
import ToDo from './components/ToDo';
import Message from './services/Message';
import Greeting from './components/Greeting';

new Module(Message)
.compose('#square', Test)
.compose('#hello-world', Form)
.compose('#todo', ToDo)
.compose('sc-hi', Greeting)
.compose('.external-component', ($) => ({
  mount: () => console.log($)
}))
.compose('.alert', () => ({
  '.show': { click: (e) => alert(e.target.innerText) }
})).execute();
