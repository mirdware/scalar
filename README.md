# Scalar
Scalar nace de la necesidad de crear sistemas escalables, de alto rendimiento y no obstructivos usando los últimos estándares de programación web, lo cual incluye el uso de las últimas características basadas en [ECMAScript](https://www.ecma-international.org/ecma-262/8.0/index.html).

El desarrollo de aplicaciones con scalar se basa en componentes no obstructivos, lo cual quiere decir que su funcionamiento no depende enteramente de javascript; obviamente muchas de las decisiones de que tan obstructivo puede llegar a ser scalar depende en gran medida del desarrollador.

Scalar es agnóstico al backend. No importa si tu HTML es generado por Node.js, PHP, Python, Go o es un archivo estático. Scalar trata al HTML como la fuente de verdad absoluta. Su motor de hidratación _despierta_ el marcado existente mediante selectores CSS, inyectando comportamiento y reactividad sin destruir la estructura original, lo que lo hace el framework más rápido y ligero para estrategias de SEO y SSR.

## Instalación
Existen dos formas de usar scalar en un proyecto; la primera es mediante node y npm ejecutando el comando `npm i scalar`, la segunda es usar el [CDN](https://unpkg.com/scalar).

```html
<h1 data-bind="msg" id="hello-world"></h1>
<script src="https://unpkg.com/scalar"></script>
<script defer>
  new scalar.Module()
  .compose('#hello-world', ($) => ({
    mount: () => $.msg = 'Hello world!!!'
  })).execute();
</script>
```

En ambiente de desarrollo es imprescindible contar con [node](https://nodejs.org/es/) y [git](https://git-scm.com/) en sus últimas versiones.

Clona o copia desde el repositorio principal de scalar.

```bash
git clone git@github.com:mirdware/scalar.git
```

Ingresa a la carpeta del proyecto y descarga las dependencias.

```bash
cd scalar && npm install
```

Una vez instaladas es posible ejecutar un servidor webpack con el comando `npm run serve`, construir el proyecto con `npm run build` o ambas mediante `npm start`.

## Módulos
Un módulo es un objeto javascript que se instancia de la clase Module de scalar, se deben proveer por constructor las dependencias para luego declarar cada uno de los componentes mediante el método `compose('#selector', customComponent)`, esto se logra enviando como primer parámetro el selector del elemento y como segundo la función o clase conductual.

El método `add(url, loader)` se encarga de cargar un módulo junto a todos sus componentes cuando el navegador esta en la url especificada.

> [!CAUTION]
> Desde la versión `0.3.5` el método `add(url, loader)` ha sido declarado obsoleto y no debe usarse bajo ninguna condición ya que sera eliminado sin ningún reemplazo.

Mediante compose solo se declara el componente en el módulo pero no se ejecuta dentro de la estructura de la página; para esto se debe hacer uso el método `execute()`.

```javascript
import { Module } from 'scalar';
import formComponent from './components/form';

const module = new Module();
new Module()
.compose('#hello-world', formComponent)
.execute();
```

La ejecución del componente genera un `compound object`(Objeto compuesto) que contiene las propiedades enlazadas a la plantilla mediante `data-bind` y/o `data-attr`, este enlace varia de uno a doble sentido según sea el caso.

Si estás construyendo una aplicación de una sola página (SPA) o cargando módulos dinámicamente, usa `module.dispose()`. Este método realiza una limpieza profunda: desvincula todos los listeners de eventos del DOM, elimina las referencias de memoria en los WeakMaps y destruye las instancias de los servicios, garantizando que el consumo de RAM de la pestaña se mantenga limpio al navegar.

```html
<input type="text" value="scalar" data-bind="name" />
<sc-hi data-attr="name:name">
  <p slot="body">Probando <a href="">link</a> desde fuera.</p>
</sc-hi>
```

> [!NOTE]
> Las expresiones JavaScript en `data-attr` también se evalúan mediante Function, por lo cual aplica la misma restricción CSP. Si solo se usan propiedades simples sin expresiones (data-attr="class:active") esta evaluación no ocurre.

### Servicios
Los servicios en scalar desde la versión `0.3.4` son autowire y permiten las dependencias ciclicas, esto quiere decir que no se necesitan declarar dentro del modulo y que pueden depender entre sí (service A -> service B -> service A), si se usan en modulo simplemente se registran al mismo, se debe tener cuidado con esto, ya que es posible registrar el mismo servicio en diferentes modulos, creando instancias diferentes.

El servicio es inyectado mediante el método inject del compound object o de la función enviada a cada servicio, pudiendo solucionar incluso dependencias ciclicas en actuales versiones de la libreria.

```javascript
import Logger from './logger';

class Service {
  constructor(inject) {
    this._logger = inject(Logger);
  }
}
```

Es posible mockear o falsear las dependencias mediante el método `bind(Message, Fake)`, de esta manera cada vez que se solicite la dependencia Message se entregara una instancia de Fake.

> [!IMPORTANT]
> Desde la versión `0.3.5` se recomienda el uso de decoradores o propiedades estaticas para la inyección de dependencias otros métodos estan deprecados.

```javascript
import { inject } from 'scalar';
import Logger from './logger';

@inject(Logger)
class Service {
  constructor(logger) {
    this._logger = logger;
  }
}
```

De esta manera se logra desacoplar el framework de los servicios, en caso de no querer importar inject se puede hacer mediante propiedades estaticas.

```javascript
import Logger from './logger';

class Service {
  static _providers = [Logger];

  constructor(logger) {
    this._logger = logger;
  }
}
```

Para usarse en `behavioral functions` se usa como decorador de la función y se inyectan como argumentos despues del objecto compuesto, en el caso de los componentes por clases se usa siempre el método `onInit` en vez de el constructor.

```javascript
import { inject } from 'scalar';
import Logger from './logger';

export default inject(Logger)(($, logger) => ({
  mount: () => {
    logger.info("¡Inyectado!");
    $.msg = "Datos listos";
  }
}));
```

## Componentes
Existen diferentes maneras de generar un componente; la primera es extendiendo de la clase Component de scalar con lo que deberá implementar el método listen que retorna un `behavioral object`(Objeto conductual).

```javascript
export default class ToDo extends Component {
  listen() {
    return {
      submit: () => add(this),
      '.close': { click: (e) => remove(this, e) },
      '.check': { click: (e) => crossOutItem(e) },
      '#clean': { click: () => this.tasks = [] }
    };
  }
}
```

Para generar web components el funcionamiento es muy similar al de componentes basados en clases, con la diferencia que se debe agregar el decorator `@customElement` con los estilos y template para dicho componente, más adelante se detallara el uso de este método.

Otra manera es mediante `behavioral function`(función conductual) la cual es una función pura de javascript que retorna las acciones del componente; la función recibe como parámetro un objeto compuesto y retorna un objeto conductual.

```javascript
export default ($) => ({
  submit: (e) => {
    if (!$.task) return;
    $.tasks.push($.task);
    $.task = "";
  },
  '.close': {
    click: (e) => {
      const index = e.target.parentNode.dataset.index;
      $.tasks.splice(index, 1);
    }
  },
  '#clean': { click: () => $.tasks = [] }
});
```

Al ser una función javascript pura se pueden usar diferentes estilos de programación. En el ejemplo anterior vimos un retorno directo del objeto, pero también es posible usar clousures.

```javascript
export default ($) => {
  function remove(e) {
    const index = e.target.parentNode.dataset.index;
    $.tasks.splice(index, 1);
  }

  function add() {
    if (!$.task) return;
    $.tasks.push($.task);
    $.task = "";
  }

  return {
    submit: add,
    '.close': { click: remove },
    '#clean': { click: () => $.tasks = [] }
  };
};
```

Incluso es posible usar las últimas características de ECMAScript para encapsular llamadas a otras funciones en módulos.

```javascript
function remove($, e) {
    const index = e.target.parentNode.dataset.index;
    $.tasks.splice(index, 1);
}

function add($) {
    if (!$.task) return;
    $.tasks.push($.task);
    $.task = '';
}

export default ($) => ({
  submit: (e) => add($),
  '.close': { click: (e) => remove($, e) },
  '#clean': { click: () => $.tasks = [] }
});
```

### Definición del objeto conductual
Mediante javascript se establece el comportamiento de un componente por lo cual se debe retornar un objeto con selectores CSS o nombres de evento (click, submit, reset, blur, focus, etc) como llaves, en el primer caso su valor deberá ser otro objeto con similares características y en el segundo contendrá el manejador del evento, a esta estructura se le denomina objeto conductual.

Los eventos lanzados por un objeto conductual tienen un comportamiento de burbuja y son pasivos, si se antepone el signo `_` a su nombre este prevendrá su acción por defecto y se volvera activo, si es necesario se puede retornar true para ejecutar el comportamiento del elemento pero esto no modificara el hecho que el evento a dejado de ser pasivo; si el signo aparece después del nombre quiere decir que sé está forzando la propagación en modo captura, es posible usar ambas características a la vez.

```javascript
return {
  _submit: (e) => add($),
  '.close': { _click: (e) => remove($, e) },
  '#clean': { click: () => $.tasks = [] }
}
```

> [!TIP]
> Se recomienda usar atributos `data-action` como selectores en el objeto conductual en lugar de clases o IDs, separando así el comportamiento del estilo: { '[data-action="save"]': { click: save } }.

El evento `mount` es ejecutado tan pronto inicia el componente y cualquier cambio que se realice dentro de este hace parte del estado inicial por lo cual es ideal para enlazar propiedades y servicios.

Aparte de mount existe el evento especial `mutate` el cual notifica cuando un elemento del componente ha sido modificado, para escuchar el evento se debe enlazar al elemento que se transformara con la mutación de la propiedad. Este es el momento perfecto para que el desarrollador integre librerías de terceros (por ejemplo, si Scalar inyecta un input, el usuario puede escuchar mutate para inicializar un DatePicker sobre ese nuevo HTML).

```javascript
return {
  mount: () => message.my = $.my,
  '.input': { mutate: (e) => mask(e.target) }
}
```

### Métodos del objeto compuesto
Es posible hacer uso de servicios mediante el método `inject(Message)` enviando como parámetro la clase que fue proveída al módulo, si esta no fue declarada se retornara undefined.

> [!WARNING]
> Desde la versión `0.3.5` no se debe usar inject en su lugar se debe usar el decorador `@inject` o directamente la función inject para behavioral function.

Para hacer uso de un arreglo dentro de un componente se debe establecer un data-key que sirva como índice del elemento, posteriormente se obtiene mediante el método `getIndex(e)` el cual recibe el evento como parámetro.

> [!WARNING]
> Desde la versión `0.3.5` no se debe usar getIndex en su lugar se debe incluir el `context parameter`, en un futuro se cambiara el comportamiento de data-key para soportar keyed reconciliation.

Cuando manejas eventos en listas, el parameter context que recibe la función es un Proxy vinculado al estado original. Si modificas una propiedad del context directamente (ej: `task.done = true`), Scalar detectará el cambio y actualizará automáticamente la fila correspondiente en el DOM sin que tengas que manipular el array principal.

```javascript
'.list label': { change: (_, item) => toogleItem(item, this) },
'.optext span': { _click: (e, badge) => removeBadge(e, badge, this) },
```

Un componente puede generar otro mediante el método `compose($domElement, customComponent)`, este último se denomina **componente derivado**, ya que su creación no se realizó desde un módulo sino que deriva de un similar. Se puede hacer uso de los métodos de un derivado ya que compose retorna el objeto compuesto.

```javascript
const index = $.getIndex(e);
const $domElement = await $.inject(Modal).open('https://sespesoft.com/resource', 'Recurso');
const response = await $.compose($domElement, modalCOmponet).send({ index });
```

### Properties y computed properties

Son propiedades especiales del objeto conductual de solo lectura que se procesan cada vez que una propiedad enlazada a la `computed function` es modificada, estas deben establecerse como funciones al cargar el componente.

```javascript
onInit(message) {
  this._total = () => this.tasks.length;
  this._pending = () => this.tasks.filter(task => !task.checked).length;
}
```

Las propiedades usadas dentro de la función **no deben ser modificadas**, solo deben servir en modo lectura como base para recalcular las computed properties. Existen dos momentos en el ciclo de vida la computed function: tracking y execution, en tracking se detecta automáticamente qué propiedades se usarón dentro de la función computada para suscribirse a ellas y en execution se ejecuta la computed property cada vez que cambia una propiedad trackeada. Dentro de una computed function los objetos anidados se devuelven sin proxificar, por lo cual la reactividad no aplica dentro de ellas.

En cualquier parte del componente, los métodos de arrays y objetos reactivos (como `Array.indexOf`, `Array.find`, etc.) funcionan correctamente aunque se les pase un proxy como argumento, ya que el framework desenvuelve automáticamente el proxy al objeto real antes de ejecutar el método.

### Solapamiento de componentes
El solapamiento (overloaping) se presenta cuando se define un componente sobre otro ya establecido.

```javascript
new Module()
.compose('.pageable', pageable)
.compose('.check-table', checkTable)
execute();
```

```html
<div class="pageable">
    <form action="https://sespesoft.com/resource">
        <input type="search" name="name" data-bind="name"/>
        <input type="submit" value="Buscar"/>
    </form>
    <table class="check-table" data-bind="data">
        <script type="text/template">
            <tr>
              <td>${data.one}</td>
              <td>${data.two}</td>
              <td><input type="checkbox" /></td>
            </tr>
        </script>
    </table>
</div>
```

En este caso tanto el componente pageable como checkTable hacen uso de la propiedad data, a esto hace referencia el solapamiento a compartir propiedades gracias a su ubicación dentro del DOM; un cambio en una propiedad afectara a la propiedad del componente solapado. Se debe tener cuidado al momento de solapar componentes pues es posible tener resultados inesperados, en muchas ocaciones lo recomendable es aislar cada comportamiento.

> [!CAUTION]
> En futuras versiones este comportamiento dejara de funcionar en favor de un sistema de ownership explicito o delegación de control.

### Aislamiento mediante web componentes
En la versión `0.3.0` de scalar se da soporte al standard de [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components), lo cual generá una dependencia a javascript; esto va en contra de generar componentes no obstructivos, así que se puede agregar o no esta caracteristica e ir _escalando_ según las necesidades del proyecto.

La implementación de [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) se realiza mediante el decorator `@customElement` el cual recibe las propiedades styles, template y type, este último es para soportar el estandard con el uso de diferentes elementos HTML.

```javascript
@customElement({
    template: '<strong>Hola <span data-bind="name">mundo</span>!!</strong>' +
    '<slot name="body"><p>Por favor de click <a href="">aquí</a></p></slot>',
    styles: 'strong{color:#f58731;} ' +
    'img{vertical-align: middle; margin-right: 1em;} ' +
    ':host{border: 1px solid; display: block; border-radius: 1em; padding: .5em; margin: .5em;}'
})
export default class Greeting extends Component {}
```

Como se puede observar el web component debe extender de Component y no de HTMLElement como lo hace el estandard, esto es para que la libreria pueda manejar cosas como el [shadown DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) y ciertas funciones del ciclo de vida que se integran en el comportamiento normal de un backend component.

Es importante mencionar que el componente puede hacer uso de todos los métodos del ciclo de vida del custom element como: `attributeChangedCallback(name, oldValue, newValue)`, `connectedCallback()` o `disconnectedCallback()`, al igual que del método `onInit()` el cual es implementado por la libreria y se ejcuta cuando el componente es montado; al basarse en el estandar es posible hacer uso de [slots y templates](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots).

El uso de `observedAttributes` se reemplaza por la declaración explicita de la priopiedad dentro de la clase.

```javascript
export default class MultiSelect extends Component {
  constructor() {
    super();
    this._currentFocus = -1;
    this.placeholder = '';
    this.required = false;
    this.value = [];
  }
}
```

El constructor debe llamar al padre y proceder a declarar las propiedades, cabe resaltar el uso del caracter `_` para iniciar ciertas declaraciones, estas son propiedades que no se exponen al custom element, al igual que aquellas que inicien con `$`, las propiedades deben inicializarse para indicar como debe observedAttributes tratar el nuevo valor, así cuando es booleano y se aplica al elemento este lo convertira a `true` o si es un objeto `[]` o `{}` se tratara de hacer un `JSON.parse`.

El framework convierte internamente el nombre del atributo de kebab-case a camelCase para la asignación de la propiedad. El método `attributeChangedCallback` del usuario, si se implementa, recibe el nombre original en kebab-case conforme al estándar Web Components. Las propiedades que comienzan con `_` o `$` son estrictamente privadas. No se convertirán en observedAttributes ni se expondrán al DOM.

```html
<multi-select placeholder="Seleccionar tipo de items" _current-focus="0" required>
  <option value="0" selected>Card</option>
  <option value="1" selected>Table</option>
  <option value="2" selected>Column</option>
</multi-select>
```

La propiedad `_currentFocus` no sera enlazada al custom element. El paso de attributos dinamicos se sigue usando mediante `data-attr` como se haria con cualquier componente, cabe resaltar que es posible enviar datos complejos como objetos o arrays, los cuales seran codificados en JSON para enviar, por lo cual estos pasaran como valor y cualquier modificación dentro del custom element no se vera reflejada en el componente padre que envio el objeto (inmutabilidad).

```html
<auto-complete required="required" placeholder="Countries" data-attr="data:countries"></auto-complete>
```

Al no poderse hacer inyección de dependencias por constructor, este comportamiento queda delegado al método `onInit` al igual que para behavioral components para estandarizar su uso.

```javascript
@inject(Message)
export default class MultiSelect extends Component {
  constructor() {
    super();
    this.data = [];
  }

  onInit(message) {
    this._message = message;
  }
}
```

Las unicas vias de comunicación entre custom element y componente padre son los atributos y [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent), por lo tanto el enlace en doble vía no es posible en este tipo de comunicación y se debe de hacer de manera explicita.

```javascript
{
  'multi-select': { changed: (e) => $.multi = e.detail }
}
```

### Integración entre components
Es posible hacer uso de ambos tipos de componentes dentro de una misma aplicación, supongamos un `.extenal-component` compuesto.

```html
<section class="external-component">
  <input type="text" value="scalar" data-bind="name" />
  <sc-hi data-attr="name:name" />
</section>
```

## Plantillas
Las plantillas (Templates) representan la parte más básica del sistema y se pueden clasificar en: prerenderizadas y JIT (Just In Time).

### Prerenderizadas
Las plantillas prerenderizadas son aquellas suministradas por el servidor y hacen parte integral del cuerpo de la respuesta, de esta manera se puede garantizar el funcionamiento de la aplicación si el cliente no activa JavaScript; la idea de la librería es ir _"escalando"_ un proyecto según la limitación del cliente (accesibilidad).

Una plantilla scalar podría contener atributos `data-bind` y/o `data-attr`, los primeros generan un enlace en dos direcciones entre el objeto compuesto y la plantilla, siempre y cuando el elemento al cual se enlaza pueda introducir información; en caso contrario dicho enlace se establecerá en una sola dirección; el segundo modifica los atributos del elemento según se modifique alguna propiedad y por su naturaleza es unidireccional.

Mediante data-bind se crea un enlace a una propiedad del componente, por lo tanto debe tener el formato de una [propiedad javascript](https://developer.mozilla.org/es/docs/Web/JavaScript/Data_structures#Objetos), mientras data-attr puede tener tantos atributos separados por `;` como se desee, un atributo es un par clave valor en donde la clave es el nombre del atributo y el valor la propiedad del componente o una expresión javascript que manejará los cambios de estado, en caso de ser una propiedad no definida en un data-bind esta se creara en el componente, si la propiedad se encuentra dentro de una expresión esto no será posible.

Los nombres reservados del sistema así como las variables globales (incluidas `undefined`, `Infiniy` y `NaN`) no pueden ser usadas como propiedades de un componente, porque el framework los protege para evitar colisiones con el ámbito global.

> [!WARNING]
> Aunque en la versión actual es posible usar cualquier propiedad desde la vista y automaticamente se crea en el componente, este comportamiento puede cambiar en futuras versiones en favor de evitar el solapamiento (overlaping) de propiedades.

Cuando se desea declarar un objeto desde el sistema de plantillas se debe separar con `.` cada una de las propiedades del mismo, esto aplica también para modificaciones de atributos como estilos.

```html
<div id="square" data-attr="style: squareStyle">
    <span data-attr="classList: action" class="open"></span>
    <h2 data-bind="my.msg" data-attr="style.color:my.color" style="color:#fff">Mensaje inicial</h2>
</div>
```
### JIT
El principal uso de las plantillas JIT se encuentra restringido al enlace de datos cuando la propiedad de un componente es compleja (principalmente arreglos) y su función es generar código HTML de manera dinámica. Una propiedad es definida como compleja cuando dentro se haya un script tipo `text/template`.

```html
<ul data-bind="tasks">
    <script type="text/template">
        <li data-key="${index}">
            <span class="${data.checked}">${data.content}</span>
            <a href="#" class="check">✔</a>
            <a href="#" class="close">[x]</a>
        </li>
    </script>
</ul>
```

Siempre que se quiera manipular un arreglo desde el componente este debe estar indexado por `data-key` de esta manera es posible hacer uso del método getIndex (en versiones futuras se usara para keyed reconciliation).

Tambien existe la posibilidad de realizar un enlace directamente al template tomando de esta manera al elemento padre como base; esto es útil cuando un elemento debe tener un enlace con otra propiedad, pero su contenido se debe manejar dinamicamente (ej. selects dependientes).

```html
<select data-bind="select">
    <option>One</option>
    <option>Two</option>
    <option>Three</option>
    <script type="text/template" data-bind="dependencies">
        <option>${data.name}</option>
    </script>
</select>
```

Se puede interpolar código javaScript mediante el uso de la notación [template string](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/template_strings) `${}`; dentro de la plantilla es posible acceder a dos propiedades `index` y `data`, la primera indica el índice del array y la segunda la información contenida en el mismo.

> [!TIP]
> Las plantillas JIT utilizan Function internamente para evaluar interpolaciones `${}`. Esto requiere que la política CSP del proyecto permita unsafe-eval. Si tu entorno tiene restricciones estrictas de CSP, las plantillas prerenderizadas no tienen esta limitación.

### Un/pairing mode

Antes de la versión `0.3.0` la forma común de enlazar datos a las propiedades de un array era mediante emparejamiento (pairing), esto se da cuando el template y el contenido del elemento son _exactamente_ iguales y difieren solo en la iterpolación; de esta manera los datos interpolados que partan del objeto `data` y no sean expresiones se combierten en parte del array.

Se debe tener en cuenta que al usar paring mode no es posible realizar interpolaciones seguidas en una plantilla `<p>${var1} ${var2}</p>` ya que el remplazo podrian ser palabras con espacios o una de las interpolaciones estar vacia lo cual generaría efectos inesperados; en este punto lo recomendable seria usar una sola interpolación `<p>${var1 + ' ' + var2}</p>` o separarlas `<p>${var1}<span>${var2}</span></p>`.

> [!WARNING]
> El uso de data-attr en la fase de emparejamiento puede generar comportamientos inesperados por lo cual se desanconseja su uso y se recomienda la interpolación de attributos.

En recientes versiones se puede hacer uso de una nueva tecnica de enlace para datos complejos `array.${index}.name` y en la actualidad es el método por defecto a utilizar para poblar dinamicamente el array.

La notación de punto que incluye indices númericos generá error al usarse directamente desde javascript pero no desde el data-bind. Con esto el enlace se realiza directamente por lo cual no es necesario que el template y el contenido del elemento coincidan en lo absoluto (unpairing).

Aunque ya no sea necesario realizar emparejamiento, la hidratación de la pantalla continua realizandose desde el template por lo cual este debe ser bastante parecido al cargue inicial.

Para poder usar el modo de emparejamiento es necesario colocarlo explicitamente en el script de la plantilla mediante el atributo `data-pairing`.

```html
<script type="text/template" data-pairing>
  <li data-key="${index}">
    <span class="${data.checked}">${data.content}</span>
    <a class="check" href="#">✔</a>
    <a class="close" href="#">[x]</a>
  </li>
</script>
```

### Hidden DOM

Actualmente la idea de usar virtual DOM como mecanismo de actualización para las plantillas JIT se encuentra pospuesto, en su lugar se esta experimentando con el uso de un hidden DOM. El cual funciona como un [documentFragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment) que no es adicionado al DOM en ningún momento, si no que sirve como referencia para saber exactamente cuales son los cambios que se deben realizar.

# Debug mode

Si estas trabajando directamente sobre la carpeta `src` puedes activar el debug mode con la variable de entorno `development`.

```javascript
new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify('development')
})
```

esto te permite entre otras cosas:

* Ejecutar el debuging visual mediante `alt+s` y el cierre del mismo mediante `alt+x`. un componente con borde azul quiere decir que es un web component, si el borde es naranja es un behavioral comoponent y si es rojo es por peligro de solapamiento. A parte de componentes tambien es posible ver los 🔗 data-bind y ⚡ data-action.
* Hacer consultas sobre componentes mediante la función `queryComponent(target)` en donde el target puede ser el id del componente o un nodo del HTML como `$0`.
* Tambien es posible ejecutar el modo debug visual con las funciones `debug.enable()` y `debug.disable()`.

## Hot Module Replacement (HMR)

Scalar expone integración con HMR mediante el evento personalizado `scalar-hmr-update`. Al recibirlo, el framework recompone automáticamente los componentes afectados sin recargar la página, preservando el estado del DOM.

El evento espera en su detail los objetos _old y _new, que representan el módulo, clase o función conductual anterior y su reemplazo.

```javascript
window.dispatchEvent(new CustomEvent('scalar-hmr-update', {
  detail: { _old: OldComponent, _new: NewComponent }
}));
```

Esta integración está disponible únicamente cuando process.env.NODE_ENV !== 'production'.

# Todo
* :key: modificar el reordenamiento de elementos HTML por `keyed conciliation`.
* :back: Reemplazar el sistema de solapamientos por un modelo de ownership explícito mediante notación `^`; cada `^` representa un nivel de componente hacia arriba en la jerarquía. El componente del nivel indicado es el dueño del binding — si no tiene la propiedad, la crea; si el nivel no existe en la jerarquía el enlace es ignorado. Aplica tanto para `data-bind` como `data-attr`. En modo desarrollo los enlaces huérfanos serán marcados visualmente mediante el modo debug.
