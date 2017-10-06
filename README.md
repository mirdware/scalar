Scalar
======
Scalar nace de la necesidad de crear sistemas escalables, de alto rendimiento y no obstructivos usando los últimos estándares de programación web, lo cual incluye el uso de características basadas en ecmascript 6.

El desarrollo de aplicaciones con scalar se basa en una arquitectura _CRT_ (Components Resources and Templates).

Componentes
-----------
Los componentes (Components) son los artefactos más importantes en el uso de scalar, son los encargados de renderizar y conectar los diferentes elementos del sistema, se podría pensar en ellos como los controladores en un sistema _MVC_ (Models, Views and Controllers) clásico.

El uso de componentes se logra extendiendo la clase Component que provee la librería y mediante el constructor del padre se pasa el selector del nodo que se va a componer.

```javascript
import { Component } from 'scalar';

class HelloWorld extends Component {
  constructor() {
    super('#hello-world');
  }
}
```

Con esto se crea un componente con las propiedades definidas según los data-bind que se encuentran en la plantilla.

```html
<form id="hello-world">
  <input type="text" /><br/>
  <input type="text" data-bind="name" disabled />
  <div data-bind="name"></div>
</form>
```

Para comenzar a escuchar los eventos que puede enlazar el componente se debe hacer uso del método `listen`.

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

Se debe retornar un objeto en donde la llave debe ser un selector CSS o el nombre de un evento, en el primer caso su valor deberá ser otro objeto que cumpla con las mismas características acá descritas, cuando la llave sea el nombre del evento su valor será representado por la función o método que se ejecutara al disparar dicho evento.

Otro método importante de la clase Component es `init`, este se encarga de realizar la configuración inicial del componente.

```javascript
...
init(properties) {
  properties.name.setTemplate(renderTable);
}
...
```

En el anterior ejemplo se establece una función template para la propiedad name, de esta manera cuando se dibuje la propiedad dentro del DOM esta se hará basada en la plantilla suministrada.

Repositorios
------------
El uso de los repositorios se liga usualmente a los recursos (Resources), pues estos artefactos se encargan de obtener información desde el servidor, claro que se puede usar como origen de datos cualquier cosa, incluso el mismo [localStorage](https://developer.mozilla.org/es/docs/Web/API/Storage/LocalStorage), pero lo normal es que se use una API Rest o GraphQL. Para utilizar un recurso basta con instanciar un objeto de la clase Resource que provee la librería.

```javascript
import { Resource } from 'scalar';

const user = new Resource('response.json');
```

Ya con el objeto se pueden invocar sus métodos get, post, put, delete y request, este último se usa para crear una petición personalizada (PATCH, OPTIONS, HEAD). Hasta aca no difiere mucho de lo que se puede hacer con la [API fetch](https://developer.mozilla.org/es/docs/Web/API/Fetch_API), pero tambien es posible extender la clase para realizar peticiones más personalizadas.

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

A parte de sobrescribir propiedades como observamos en el ejemplo anterior con los headers, tambien es posible utilizar del sistema de inversión para usar un solo objeto durante todo el ciclo de vida de la aplicación, solo basta con proveer esta clase y scalar se encarga del resto.

Plantillas
----------
Las plantillas (Templates) representan la parte más básica del sistema, hacen uso de la nueva característica [template string](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/template_strings) de ecmascript 2015 y su función es generar código HTML de manera dinámica.

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

IoC.provide(
  HelloWorld,
  Test
);
```

Para finalizar un provider puede ser inyectado a cualquier clase mediante el uso de `let test = IoC.inject(Test)`, esto implica la importación de la clase, por lo cual se garantiza la traza de la aplicación.
