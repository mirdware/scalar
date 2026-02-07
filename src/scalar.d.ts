declare module 'scalar' {
    export const scalar: {
        Component: Class<Component>,
        Module: Class<Module>,
        customElement: (options: CustomElementOptions) => ClassDecorator
    };

    export interface CustomElementOptions {
        template?: string;
        styles?: string;
        type?: string;
    }

    export interface BehavioralObject {
        mount?: () => void;
        mutate?: (e: MutationRecord | Event) => void;
        [key: string]: ((e: Event) => void | boolean) | BehavioralObject | any;
    }

    export class Component {
        [key: string]: any;

        inject<T>(provider: Class<T>): T;
        compose<T extends Component>($domElement: HTMLElement, behavioral: Class<T> | BehavioralFunction): T;
        getIndex(e: Event): string | undefined;
        listen?(): BehavioralObject;
        connectedCallback?(): void;
        disconnectedCallback?(): void;
        attributeChangedCallback?(name: string, oldVal: any, newVal: any): void;
        onInit?(): void;
    }

    export class Module {
        compose<T extends Component>(selector: string, component: Class<T> | BehavioralFunction): Module;
        bind<T, R>(origin: Class<T>, replace: Class<R>): Module;
        add(module: Module): Module;
        execute(): void;
    }

     export type BehavioralFunction = ($: Component & any) => BehavioralObject;

     export type Class<T> = { new (...args: any[]): T };

    export type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
}
