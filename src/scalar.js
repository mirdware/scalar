import Module from './Module';
import Component from './observable/Component';
import customElement from './customElement';

function inject(...providers) {
    return function (target) {
        target._providers = providers;
        return target;
    }
}

export { Module, Component, customElement, inject };
