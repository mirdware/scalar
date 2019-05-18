import { Form } from './components/Form';
import { Test } from './components/Test';
import { ToDo } from './components/ToDo';
import { IoC } from '../scalar';

IoC.provide(
  Form,
  Test,
  ToDo
);
