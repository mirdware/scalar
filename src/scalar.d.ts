declare module 'scalar' {
    export class Component {
        [key: string]: any;
        /** @deprecated use constructor dependencies instead */
        inject<T>(provider: Class<T>): T;
        compose<T extends Component>($domElement: HTMLElement, behavioral: Class<T>): T;
        compose<P extends any[]>($domElement: HTMLElement, component: BehavioralFunction<P>): Component;
        /** @deprecated use context parameter instead */
        getIndex(e: Event): string | undefined;
        listen?(): BehavioralObject;
        connectedCallback?(): void;
        disconnectedCallback?(): void;
        attributeChangedCallback?(name: string, oldVal: any, newVal: any): void;
        onInit?(...providers: any[]): void;
    }

    export class Module {
        compose<T extends Component>(selector: string, component: Class<T> | BehavioralFunction<any[]>): this;
        bind<T, R>(origin: Class<T>, replace: Class<R>): this;
        /** @deprecated */
        add(path: string, loader: Function): this;
        execute(): void;
        dispose(): void;
    }

    export function inject<T extends any[]>(
        ...providers: { [K in keyof T]: Class<T[K]> }
    ): ClassDecorator & {
        <P extends T>(fn: BehavioralFunction<P>): BehavioralFunction<P>;
    };

    export function customElement(options: CustomElementOptions): ClassDecorator;

    export interface CustomElementOptions {
        template?: string;
        styles?: string;
        type?: string;
    }

    export interface BehavioralObject {
        mount?: (e: Event) => void | boolean;
        mutate?: (e: Event) => void | boolean;
        [key: string]: ((e: Event, context?: any) => void | boolean) | BehavioralObject | any;
    }

    type BehavioralFunction<P extends any[]> = ($: Component, ...args: P) => BehavioralObject;

    type Class<T, P extends any[] = any[]> = {
        new (...args: P): T;
        _providers?: { [K in keyof P]: Class<P[K]> };
    };

    type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
}
