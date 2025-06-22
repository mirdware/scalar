declare module 'scalar' {
    const scalar: {
        Component: Class<Component>,
        Module: Class<Module>,
        customElement: function ({template?: string, styles?: string, type?: string}): ClassDecorator
    };
    export = scalar
}

declare class Component {
    inject<T> (provider: Class<T>): T
    compose<T extends Component> ($domElement: HTMLElement, behavioral: Class<T>|BehavioralFunction): T
    getIndex (e: Event): string|undenined
}

declare class Module {
    compose<T extends Component> (selector: string, component: Class<T>|BehavioralFunction): Module
    bind<T, R> (origin: Class<T>, replace: Class<R>): Module
    add(module: Module): Module
    execute(): void
}

declare type BehavioralFunction = (compound: Component) => Payload

declare type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;

declare type Class<T> = { new (...args: Array<any>): T }
