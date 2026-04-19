declare module 'scalar' {
    export class Component {
        [key: string]: any;
        onInit?(...providers: any[]): void;
        onDestroy?(): void;
        /** @deprecated use onInit dependencies instead */
        inject<T>(provider: Class<T>): T;
        compose<T extends Component>($domElement: HTMLElement, component: Class<T>): T;
        compose<P extends any[]>($domElement: HTMLElement, component: BehavioralFunction<P>): Component;
        /** @deprecated use context parameter instead */
        getIndex(e: Event): string | undefined;
        listen?(): BehavioralObject;
    }

    export interface CustomElementComponent extends Component {
        connectedCallback?(): void;
        disconnectedCallback?(): void;
        attributeChangedCallback?(name: string, oldVal: any, newVal: any): void;
    }

    export class Module {
        compose<T extends Component>(selector: string, component: Class<T> | BehavioralFunction<any[]>): this;
        bind<T, R>(origin: Class<T>, replace: Class<R>): this;
        /** @deprecated */
        add(path: string, loader: Function, options?: { middleware?: boolean }): this;
        execute(): void;
        dispose(): void;
    }

    export function inject<T extends any[]>(
        ...providers: { [K in keyof T]: Class<T[K]> }
    ): {
        <TClass extends new () => Component & { onInit?(...args: T): void }>(
            target: TClass
        ): TClass;
        <TClass extends new (...args: T) => any>(
            target: TClass
        ): TClass;
        <P extends T>(fn: BehavioralFunction<P>): BehavioralFunction<P>;
    };

    export function customElement(options: CustomElementOptions):
    <T extends new(...args: any[]) => CustomElementComponent>(target: T) => T;

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
}
