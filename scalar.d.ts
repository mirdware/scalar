declare module 'scalar' {
    const scalar: {
        Component: Class<Component>,
        Module: Class<Module>,
        Resource: { new (url: string): Resource }
    };
    export = scalar;
}

declare class Component {
    inject (provider: Class<any>): any
    compose ($domElement: HTMLElement, behavioral: Class<Component>|BehavioralFunction): Component
    getIndex (e: Event): number|void
}

declare class Module {
    compose (selector: string, component: Class<Component>|BehavioralFunction): Module
}

declare class Resource {
    get (queryString: string): Promise<any>
    post (dataBody: any, queryString: any): Promise<any>
    put (dataBody: any, queryString: any): Promise<any>
    delete (queryString: any): Promise<any>
    request (method: string, opt:{dataBody:any, queryString:any}):Promise<any>
}

declare type BehavioralFunction = (compound: Component) => any

declare type Class<T> = { new (...args: Array<any>): T }
