# Scalar
Scalar nace de la necesidad de crear sistemas escalables, de alto rendimiento y no obstructivos usando los últimos estándares de programación web, lo cual incluye el uso de las últimas características basadas en [ECMAScript](https://www.ecma-international.org/ecma-262/8.0/index.html).

El desarrollo de aplicaciones con scalar se basa en componentes no obstructivos o de backend, lo cual quiere decir que su funcionamiento no depende enteramente de javascript; obviamente muchas de las decisiones de que tan obstructivo puede llegar a ser scalar depende en gran medida del desarrollador. Otra premisa de scalar es la separación entre contenido, estilo y comportamiento.

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

El método `add(module)` se encarga de agregar un módulo junto a todos sus servicios al sistema de inyección de dependencias del módulo que invocó el método.

Mediante compose solo se declara el componente en el módulo pero no se ejecuta dentro de la estructura de la página; para esto se debe hacer uso el método `execute()`.

```javascript
import { Module } from 'scalar';
import Message from './services/Message';
import formComponent from './components/form';

const module = new Module(Message);
new Module()
.compose('#hello-world', formComponent)
.add(module)
.execute();
```

La ejecución del componente genera un `compound object`(Objeto compuesto) que contiene las propiedades enlazadas a la plantilla mediante `data-bind` y/o `data-attr`, este enlace varia de uno a doble sentido según sea el caso.

```html
<input type="text" value="scalar" data-bind="name" />
<sc-hi data-attr="name:name">
  <p slot="body">Probando <a href="">link</a> desde fuera.</p>
</sc-hi>
```

### Servicios
Un servicio no es más que un objeto común al ámbito del módulo al que pertenece. Este debe ser declarado al momento de realizar la instanciación del módulo al cual va a quedar asociado.

```javascript
import { Module } from 'scalar';
import Message from './services/Message';

const module = new Module(Message);
```

Una vez declarado el servicio es posible usarlo mediante el método inject del compound object o de la función enviada a cada servicio, teniendo siempre en cuenta el no generar dependencias cíclicas.

```javascript
import Service from './OtherService';

class Service {
  constructor(inject) {
    this _service = inject(OtherService);
  }
}
```

Es posible mockear o falsear las dependencias mediante el método `bind(Message, Fake)`, de esta manera cada vez que se solicite la dependencia Message se entregara una instancia de Fake.

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
    submit: (e) => add,
    '.close': { click: (e) => remove },
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

El evento `mount` es ejecutado tan pronto inicia el componente y cualquier cambio que se realice dentro de este hace parte del estado inicial por lo cual es ideal para enlazar propiedades y servicios.

Aparte de mount existe el evento especial `mutate` el cual notifica cuando un elemento del componente ha sido modificado, para escuchar el evento se debe enlazar al elemento que se transformara con la mutación de la propiedad.

```javascript
return {
  mount: () => message.my = $.my,
  '.input': { mutate: (e) => mask(e.target) }
}
```

### Métodos del objeto compuesto
Es posible hacer uso de servicios mediante el método `inject(Message)` enviando como parámetro la clase que fue proveída al módulo, si esta no fue declarada se retornara undefined.

Para hacer uso de un arreglo dentro de un componente se debe establecer un data-key que sirva como índice del elemento, posteriormente se obtiene mediante el método `getIndex(e)` el cual recibe el evento como parámetro.

Un componente puede generar otro mediante el método `compose($domElement, customComponent)`, este último se denomina **componente derivado**, ya que su creación no se realizó desde un módulo sino que deriva de un similar. Se puede hacer uso de los métodos de un derivado ya que compose retorna el objeto compuesto.

```javascript
const index = $.getIndex(e);
const $domElement = await $.inject(Modal).open('https://sespesoft.com/resource', 'Recurso');
const response = await $.compose($domElement, modalCOmponet).send({ index });
```

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

### Aislamiento mediante web componentes
En la versión `0.3.0` de scalar se da soporte al standard de [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components), lo cual se genera una dependencia hacia javascript; a pesar que esto va en contra de generar componentes no obstructivos se puede agregar o no estas caracteristicas e ir escalando según las necesidades del proyecto.

La implementación del [custom element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) se realiza mediante el decorator `@customElement` el cual recibe las propiedades styles, template y type, este último es para soportar el estandard con el uso de diferentes elementos HTML.

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

```html
<multi-select placeholder="Seleccionar tipo de items" _current-focus="0" required>
  <option value="0" selected>Card</option>
  <option value="1" selected>Table</option>
  <option value="2" selected>Column</option>
</multi-select>
```

La propiedad `_currentFocus` no sera enlazada al custom element. El paso de attributos dinamicos se sigue usando mediante `data-attr` como se haria con cualquier componente, cabe resaltar que es posible enviar datos complejos como objetos o arrays, los cuales seran codificados en JSON para enviar, por lo cual estos pasaran como valor y cualquier modifificación dentro del custom element no se vera reflejada en el componente padre que envio el objeto (inmutabilidad).

```html
<auto-complete required="required" placeholder="Countries" data-attr="data:countries"></auto-complete>
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
Las plantillas prerenderizadas son aquellas suministradas por el servidor y hacen parte integral del cuerpo de la respuesta, de esta manera se puede garantizar el funcionamiento de la aplicación aun si el cliente no activa JavaScript; en parte la idea de la librería es ir _"escalando"_ un proyecto según la limitación del cliente (accesibilidad).

Una plantilla scalar podría contener atributos `data-bind` y/o `data-attr`, los primeros generan un enlace en dos direcciones entre el objeto compuesto y la plantilla, siempre y cuando el elemento al cual se enlaza pueda introducir información, en caso contrario dicho enlace se establecerá en una sola dirección; el segundo modifica los atributos del elemento según se modifique alguna propiedad y por su naturaleza es unidireccional.

Mediante data-bind se crea un enlace a una propiedad del componente, por lo tanto debe tener el formato de una [propiedad javascript](https://developer.mozilla.org/es/docs/Web/JavaScript/Data_structures#Objetos), mientras data-attr puede tener tantos atributos separados por `;` como se desee, un atributo es un par clave valor en donde la clave es el nombre del atributo y el valor la propiedad del componente o una expresión javascript que manejará los cambios de estado, en caso de ser una propiedad no definida en un data-bind esta se creara en el componente, si la propiedad se encuentra dentro de una expresión esto no será posible.

Cuando se desea declarar un objeto desde el sistema de plantillas se debe separar con `.` cada una de las propiedades del mismo, esto aplica también para modificaciones de atributos como estilos.

```html
<div id="square" data-attr="style: squareStyle">
    <span data-attr="classList: action" class="open"></span>
    <h2 data-bind="my.msg" data-attr="style.color:my.color" style="color:#fff">Mensaje inicial</h2>
</div>
```
### JIT
El soporte para plantillas JIT está aún en una etapa bastante temprana, pero se están haciendo progresos. Su principal uso se encuentra restringido al enlace de datos cuando la propiedad de un componente es compleja (principalmente arreglos) y su función es generar código HTML de manera dinámica. Una propiedad es definida como compleja cuando dentro se haya un script tipo `text/template`.

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

Siempre que se quiera manipular un arreglo desde el componente este debe estar indexado por `data-key` de esta manera es posible hacer uso del método getIndex.

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

### Un/pairing mode

Antes de la versión `0.3.0` la forma común de enlazar datos a las propiedades de un array era mediante emparejamiento (pairing), esto se da cuando el template y el contenido del elemento son _exactamente_ iguales y difieren solo en la iterpolación; de esta manera los datos interpolados que partan del objeto `data` y no sean expresiones se combierten en parte del array.

El uso de data-attr en la fase de emparejamiento puede generar comportamientos inesperados por lo cual se desanconseja su uso y se recomienda la interpolación de attributos.

En recientes versiones se puede hacer uso de una nueva tecnica de enlace para datos complejos `array.${index}.name` y en la actualidad es el método por defecto a utilizar para poblar dinamicamente el array.

La notación de punto podría generar error al usar directamente desde javascript pero no desde el data-bind; con esto el enlace se realiza directamente por lo cual no es necesario que el template y el contenido del elemento coincidan en lo absoluto (unpairing). Aunque ya no sea necesario realizar emparejamiento, la hidatación de la pantalla continua realizandose desde el template por lo cual este debe ser bastante parecido al cargue inicial.

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

# Todo
* :bug: `required` dentro de la plantilla se empareja con `required=""` fuera de la plantilla. _El error solo se presenta en paring mode_.
* :bug: al usar interpolaciones seguidas en una plantilla `${var1} ${var2}`. _El error solo se presenta en paring mode_.
* :bug: al realizar solapamientos. _Se re comienda no realizar solapamientos usando web components_
