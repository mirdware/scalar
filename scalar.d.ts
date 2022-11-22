declare module 'scalar' {
    const scalar: {
        Component: Class<Component>,
        Module: Class<Module>,
        Resource: { new (url: string, header?: Payload): Resource },
        customElement: function ({template: string, styles: string, extends: string}): ClassDecorator
    };
    export = scalar
}

declare class Component {
    inject<T> (provider: Class<T>): T
    compose<T extends Component> ($domElement: HTMLElement, behavioral: Class<T>|BehavioralFunction): T
    getIndex (e: Event): number|void
}

declare class Module {
    compose<T extends Component> (selector: string, component: Class<T>|BehavioralFunction): Module
    bind<T, R> (origin: Class<T>, replace: Class<R>): Module
    add(module: Module): Module
    execute(): void
}

declare class Resource {
    get (queryString?: Payload): Promise<Response>
    post (dataBody: Payload, queryString?: Payload): Promise<Response>
    put (dataBody: Payload, queryString?: Payload): Promise<Response>
    delete (queryString?: Payload): Promise<Response>
    request (method: string, dataBody?: Payload|null, queryString?: Payload): Promise<Response>
}

declare type BehavioralFunction = (compound: Component) => Payload

declare type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;

declare type Class<T> = { new (...args: Array<any>): T }

declare type JSONValue = string|number|boolean|Payload|JSONArray;

declare interface Paylod {
    [x: string]: JSONValue
}

declare interface JSONArray extends Array<JSONValue> { }

declare type Response = Payload|JSONArray|void;
