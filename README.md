# Scalar
Scalar nace de la necesidad de crear sistemas escalables, de alto rendimiento y no obstructivos usando los últimos estándares de programación web, lo cual incluye el uso de las ultimas características basadas en [ECMAScript](https://www.ecma-international.org/ecma-262/8.0/index.html).

El desarrollo de aplicaciones con scalar se basa en componentes no obstructivos, lo cual quiere decir que su funcionamiento no depende enteramente que javascript este activado desde el navegador. Otra premisa de scalar es la separación entre contenido, estilo y comportamiento.

## Instalación

Basta con tener instalado node y npm para ejecutar el comando `npm install --save scalar`.

## Módulos
Un módulo es un objeto javascript que se instancia de la clase Module de scalar, se deben proveer por constructor las dependencias para luego crear cada uno de los componentes mediante el método `compose`, esto se logra enviando como primer parámetro el selector del elemento y como segundo la función o clase conductual.

```javascript
import { Module } from '../scalar';
import Form from './components/Form';
import Test from './components/Test';
import ToDo from './components/ToDo';
import Message from './services/Message';

new Module(Message)
.compose('#square', Test)
.compose('#hello-world', Form)
.compose('#todo', ToDo);
```

La ejecución del método compose genera un `compound object`(Objeto compuesto) que contiene las propiedades enlazadas a la plantilla mediante `data-bind` y/o `data-attr`, este enlace varia de uno a doble sentido según sea el caso.

```html
<form id="hello-world">
  <input type="text" data-bind="name" disabled />
  <label><input type="checkbox" data-bind="show" checked /> ¿Mostrar alert?</label>
  <div data-bind="show"></div>
  <textarea data-bind="name"></textarea><br/>
  <select data-bind="select">
    <option value="h">Hola</option>
    <option value="m">Mundo</option>
  </select>
  <input type="text" name="select" data-bind="select"><br/>
  <label><input type="radio" name="sexo" data-bind="sexo" value="F" checked /> Femenino</label>
  <label><input type="radio" name="sexo" data-bind="sexo" value="M"> Masculino</label><br/>
  <input type="password" data-bind="password" /> <input type="text" data-bind="password" /><br/>
  <input type="file" data-bind="file" /><br/>
  <input type="submit" />
  <input type="reset" /><br/>
  <input type="button" value="Fill data inside" class="fill" />
</form>
```

## Componentes
Existen dos maneras de generar un componentes, la primera es extendiendo de la clase Component de escalar en la que se debe establecer el método listen, el cual retorna un `behavioral object`(Objeto conductual) con el comportamiento del componente.

```javascript
export default class ToDo extends Component {
  listen() {
    return {
      submit: () => add(this),
      '.close': {
        click: (e) => remove(this, e)
      },
      '.check': {
        click: (e) => crossOutItem(e)
      },
      '#clean': {
        click: () => this.tasks = []
      }
    };
  }
}
```

La segunda manera de definir un componente es mediante `behavioral function`(función conductual), esta es una función pura en javascript que retorna las acciones y comportamiento del componente; la función recibe como argumento un objeto compuesto y retorna un objeto conductual.

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
  '#clean': {
    click: () => $.tasks = []
  }
});
```

Al ser una función javascript pura es posible usar diferentes estilos de programación. En el ejemplo anterior vimos un retorno directo del objeto, pero tambien se puede usar como una función módulo.

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
    '.close': {
      click: (e) => remove
    },
    '#clean': {
      click: () => $.tasks = []
    }
  };
};
```

Incluso es posible usar las últimas características de ECMAScript para encapsular llamadas a otras funciones.

```javascript
function remove($, e) {
    const index = e.target.parentNode.dataset.index;
    $.tasks.splice(index, 1);
}

function add($) {
    if (!$.task) return;
    $.tasks.push($.task);
    $.task = "";
}

export default ($) => ({
  submit: (e) => add($),
  '.close': {
    click: (e) => remove($, e)
  },
  '#clean': {
    click: () => $.tasks = []
  }
});
```

### Definición del objeto conductual

El resultado de un componente siempre debe ser el comportamiento del mismo, para este fin se debe proveer un objeto que contenga como llave un selector CSS o el nombre de un evento (click, submit, reset, blur, focus, etc), en el primer caso su valor deberá ser otro objeto conductual y en el segundo contendrá la función o método a ejecutar.

```javascript
{
  submit: (e) => add($),
  '.close': {
    click: (e) => remove($, e)
  },
  '#clean': {
    click: () => $.tasks = []
  }
}
```
Por defecto las funciones o métodos lanzados por el objeto tienen un comportamiento de burbuja, si se desea forzar a la captura se debe anteponer el signo `_` al nombre del evento.

```javascript
{
    mount: () => message.my = $.my,
    '.first': {
      _click: paint
    }
  }
```

En este último ejemplo podemos observar el uso del evento especial `mount`, este es ejecutado tan pronto inicia el componente y es ideal para asignar objetos a servicios.

Todo evento lanzado previene su comportamiento por defecto a no ser que explicitamente se defina lo contrario retornando `true` desde la función o método.

### Métodos del objeto compuesto
Es posible reiniciar cualquier componente a un estado inicial mediante el método `reset`; se debe tener en cuenta que las propiedades representadas por un objeto no pueden ser restablecidos a su estado inicial ya que su valor es referenciado, excepto los estilos pasados como atributos.

```javascript
...
return {
  '.reset': {
    click: () => $.reset()
  }
};
...
```

Un componente puede hacer uso de servicios mediante la función `inject`, a esta se le debe enviar como parámetro la clase que fue proveída al módulo, si la clase que se intenta inyector no fue declarada no retornara ningún servicio.

```javascript
...
return {
  mount: () => $.inject(Message).my = $.my
}
...
```

Para hacer uso de un array dentro del componente se debe establecer un data-key que sirve como indice del elemento, luego se debe obtener el indice del array propiamente dicho mediante el método `getIndex` al cual se le envia el evento como parámetro.

```javascript
...
remove(e) {
  const index = this.getIndex(e);
  this.tasks.splice(index, 1);
}
...
```

Un componente puede generar otro componente mediante el método `compose`, este último se denomina **componente derivado**, ya que su creación no se realizo desde un modulo si no que deriva de un similar.

El componente padre puede hacer uso de los métodos del derivado siempre y cuando este se haya constituido desde una clase, ya que el método compose retorna el objeto resultante de la composición. En caso que se cree mediante una función el método compose devolverá _undefined_.

```javascript
...
$.compose(modal.$dom, Modal)
.send({ data })
.then((res) => console.log(res));
...
```

## Servicios y recursos
Un servicio no es más que un objeto común a todo el ambito del módulo, esto es especialmente útil para la creación de reporitorios que se encuentran usualmente ligados a los recursos (Resources), estos artefactos se encargan de obtener información desde el servidor, claro que se puede usar como origen de datos cualquier cosa, incluso el mismo [localStorage](https://developer.mozilla.org/es/docs/Web/API/Storage/LocalStorage), pero lo normal es que se use una API Rest o GraphQL. Para utilizar un recurso basta con instanciar un objeto de la clase Resource que provee la librería.

```javascript
import { Resource } from 'scalar';

const user = new Resource('response.json');
```

Ya con el objeto se pueden invocar sus métodos get, post, put, delete y request, este último se usa para crear una petición personalizada (PATCH, OPTIONS, HEAD). Hasta acá no difiere mucho de lo que se puede hacer con la [API fetch](https://developer.mozilla.org/es/docs/Web/API/Fetch_API), pero también es posible extender la clase para realizar peticiones más personalizadas.

```javascript
import { Resource } from 'scalar';

class ServerConnection extends Resource {
  constructor(path) {
    super('http://localhost:8080/' + path);
    this.headers = {
      Authorization: "Basic YWxhZGRpbjpvcGVuc2VzYW1l"
    }
  }
}
```

A parte de sobrescribir propiedades como observamos en el ejemplo anterior con los headers, también es posible utilizar del sistema de inversión para usar un solo objeto durante todo el ciclo de vida de la aplicación, solo basta con proveer esta clase y scalar se encarga del resto, tambien cabe resaltar el uso de [web workers](https://developer.mozilla.org/es/docs/Web/Guide/Performance/Usando_web_workers) para el envió de peticiones, esto hace que toda petición realizada con Resource se realice en segundo plano.

## Plantillas
Las plantillas (Templates) representan la parte más básica del sistema y se pueden clasificar en: prerenderizadas y JIT (Just In Time).

### Prerenderizadas
Las plantillas prerenderizadas son aquellas suministradas por el servidor y hacen parte integral del cuerpo de la petición, de esta manera se puede garantizar el funcionamiento de la aplicación aún si el cliente no activa JavaScript; en parte la idea de la libreria es ir _"escalando"_ la aplicación según las limitantes del cliente (accesibilidad).

Una plantilla scalar podría contener atributos `data-bind` y/o `data-attr`, los primeros generan un enlace en dos direcciones entre el objeto compuesto y la plantilla, siempre y cuando el elemento al cual se enlaza pueda introducir información en caso contrario dicho enlace se establecerá en una sola dirección; el segundo modifica los atributos del elemento según se modifique alguna propiedad y por su naturaleza es unidireccional.

```html
<div id="square">
  <span data-attr="className: open" class="open"></span>
  <table>
    <thead>
      <tr>
        <th>Color</th>
        <th>Meta</th>
      </tr>
    </thead>
    <tbody data-bind="name"></tbody>
    <tfoot><a href="#" class="reset">Reset</a></tfoot>
  </table>
</div>
```

El data-bind es simplemente un enlace a una propiedad del componente, por lo tanto debe tener el formato de una [propiedad javascript](https://developer.mozilla.org/es/docs/Web/JavaScript/Data_structures#Objetos), mientras el data-attr puede tener tantos atributos separados por `;` como se desee, un atributo es un par clave valor en donde la clave es el nombre del atributo y el valor la propiedad del componente que manejará los cambios de estado.

Cuando se desea declarar un objeto desde el sistema de plantillas este debe incluirse con separación de `.`.

```html
<h2 data-bind="my.msg" style="color: #fff">Mensaje inicial</h2>
```

### JIT
El soporte para plantillas JIT está aún en una etapa bastante temprana, pero se están haciendo progresos. Su principal uso se encuentra restringido al enlace de datos cuando la propiedad de un componente es compleja (principalmente array) y su función es generar código HTML de manera dinámica. Una propiedad es definida como compleja cuando dentro se haya una [template tag](https://developer.mozilla.org/es/docs/Web/HTML/Elemento/template), si se desea manipular un array desde el componente este debe estar indexado por `data-key`.

```html
<ul data-bind="tasks">
  <template>
    <li data-key="${index}">
      <span class="${data.checked}">${data.content}</span>
      <a href="#" class="check">✔</a>
      <a href="#" class="close">[x]</a>
    </li>
  </template>
</ul>
```

Es posible interpolar código javaScript mediante el uso de la notación [template string](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/template_strings) `${}`; dentro del template es posible acceder a dos propiedades `index` y `data`, la primera indica el indice del array y la segunda la información contenida en el mismo, esto puede cambiar cuando se implemente virtual DOM en proximas versiones.

## Solapamiento de componentes
El solapamiento se presenta cuando se define un componente sobre otro componente ya establecido.

```javascript
new Module()
.compose('.pageable', pageable)
.compose('.check-table', checkTable);
```

```html
<div class="pageable">
  <form action="https://sespesoft.com">
    <input type="search" name="name" data-bind="name" />
    <input type="submit" value="Buscar" />
  </form>
  <table class="check-table" data-bind="data">
  </table>
</div>
```

En este caso tanto el componente pageable como checkTable hacen uso de la propiedad data, a esto hace referencia el solapamiento a compratir propiedades gracias a su ubicación dentro del DOM. Se debe tener cuidado con los eventos al momento de solapar dado que un componente podria sobreescribir sin querer los eventos de otro.
