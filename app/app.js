import './styles/theme.css';
import { Module } from '../scalar';
import Form from './components/Form';
import Test from './components/Test';
import ToDo from './components/ToDo';
import Message from './services/Message';

new Module(Message)
.compose('#square', Test)
.compose('#hello-world', Form)
.compose('#todo', ToDo)
.compose('.alert', () => ({
  '.show': { click: (e) => alert(e.target.innerText) }
}));
