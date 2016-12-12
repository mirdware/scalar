import HelloWorld from './components/HelloWorld';
import Test from './components/Test';
import {Component} from '../pinnacle';

Component
    .add(new Test())
    .add(new HelloWorld())
    .execute();
