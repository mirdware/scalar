Scalar
======
Scalar nace de la necesidad de crear sistemas escalables, de alto rendimiento y no obstructivos usando los últimos estándares de programación web, lo cual incluye el uso de características basadas en ecmascript 6.

El desarrollo de aplicaciones con scalar se basa en una arquitectura CRT (Components Resources and Templates).

Componentes
-----------
Los componentes (Components) son los artefactos más importantes en el uso de Scalar, son los encargados de renderizar y conectar los diferentes elementos del sistema, se podría pensar en ellos como los controladores en un sistema MVC (Models, Views and Controllers) clásico.

El uso de componentes se logra extendiendo la clase Component que provee la librería y mediante el constructor del padre se pasa el selector del componente que se va a trabajar.

```javascript
import { Component } from 'scalar';

class HelloWorld extends Component {
  constructor() {
    super('#hello-world');
  }
}
```

Con esto se crea un componente con las propiedades definidas como data-bind en la plantilla.

```html
<form id="hello-world">
  <input type="text" /><br/>
  <input type="text" data-bind="name" disabled />
  <div data-bind="name"></div>
</form>
```

Para comenzar a escuchar los eventos que puede enlazar el componente se debe hacer uso del método listen.

```javascript
...
listen() {
  return {
    'input': {
      'keyup': render,
      'mount': render
    },
    'submit': (e) => e.preventDefault()
  };
}
...
```

Este método debe retornar un objeto en donde la llave debe ser un selector CSS que se aplica dentro del contexto del componente o el nombre de un evento, en el primer caso su valor deberá ser otro objeto que cumpla con las mismas características acá descritas y cuando la llave sea el nombre del evento su valor será representado por la función o método que se ejecutara al disparar dicho evento.

Es posible realizar una configuración inicial de las propiedades mediante el método init.

```javascript
...
init(properties) {
  properties.name.setTemplate(renderTable);
}
...
```

En el anterior ejemplo se establece una función template para la propiedad name, de esta manera cuando se dibuje la propiedad dentro del DOM esta se hará basada en la plantilla suministrada.

Finalmente se puede hacer uso de las características de JavaScript para el desarrollo de los componentes se pueden crear métodos públicos o privados, agregar propiedades personalizadas al componente o cualquier otra cosa que se le ocurra al desarrollador.

Repositorios
------------
El uso de los repositorios se liga usualmente a los recursos (Resources), pues estos artefactos se encargan de obtener información desde el servidor, claro que se puede usar como origen de datos cualquier cosa, incluso una base de datos en local, lo normal es que se use una API Rest. Para hacer uso de un recurso es posible instanciar un objeto de la clase Resource que provee la librería.

```javascript
import { Resource } from 'scalar';

const user = new Resource('response.json');
```

Ya con el objeto es posible hacer uso de sus métodos get, post, put, delete y request. Este último se usa para crear una petición personalizada (PATCH, OPTIONS, HEAD).

Es posible extender la clase para realizar peticiones más personalizadas.

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

Como podemos observar es posible sobrescribir propiedades como los headers que utiliza la petición.

Plantillas
----------
Las plantillas (Templates) representan la parte más básica del sistema, hacen uso de la nueva característica template string de ecmascript 2015 y su función es generar código HTML de manera dinámica.

El soporte para plantillas está aún en una etapa bastante temprana, pero se están haciendo progresos. Su principal uso se encuentra restringido al binding de datos cuando la propiedad de un componente es compleja, la manera de configurar esta característica es mediante el método init, tal como observamos anteriormente.

```javascript
import { Component, Template } from 'scalar';

function renderTable(addr) {
  return Template.html`
    <tr>
      <td class="first">$${addr.first}</td>
      <td>$${addr.last}</td>
    </tr>
  `;
}
...
init(properties) {
  properties.name.setTemplate(renderTable);
}
...
```

A parte de los artefactos principales de la librería existen funciones como provide o inject que nos permiten manejar un sistema de inversión de control muy básico pero funcional dentro del contexto de scalar. Para hacer uso de estas características es necesario importar la clase IoC de la librería.

```javascript
import { HelloWorld } from './components/HelloWorld';
import { Test } from './components/Test';
import { IoC } from '../scalar';

IoC.provide({
    hello: HelloWorld,
    test: Test
}).provide('test2', Test);
```

Como podemos observar existen dos formas diferentes de proveer una clase de manera programática y basada en objetos. Para finalizar un provider puede ser inyectado a cualquier clase mediante el uso de `let test = IoC.inject('test')`.
