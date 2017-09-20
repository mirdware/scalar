import { HelloWorld } from './components/HelloWorld';
import { Test } from './components/Test';
import { IoC } from '../scalar';

IoC.provide({
    hello: HelloWorld,
    test: Test
});
