import HelloWorld from './components/HelloWorld';
import Test from './components/Test';
import {Component} from '../scalar';

Component
  .add(new Test())
  .add(new HelloWorld())
  .execute();
