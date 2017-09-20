Scalar
======
Scalar nace de la necesidad de crear sistemas escalables, de alto rendimiento y no obstructivos usando los ultimos estandares de programación web, lo cual incluye el uso de caracteristicas basadas en ecmascript 6.

El desarrollo de aplicaciones con scalar se basa en una arquitectura CRT (Components Resources and Templates).

Componentes
-----------
Los componentes (Components) son los artefactos más importantes en el uso de Scalar, son los encargados de renderizar y conectar los diferentes elementos del sistema, se podria pensar en ellos como los controladores en un sistema MVC (Models, Views and Controllers) clasico.

El uso de componentes se logra extendiendo la clase Component que provee la libreria y mediante el contructor del padre se pasa el selector del componente que se va a trabajar.

```javascript
import { Component } from 'scalar';

class HelloWorld extends Component {
  constructor() {
    super('#hello-world');
  }
}
```

con esto se crea un componente con las propiedades definidas como data-bind en la plantilla.

```html
<form id="hello-world">
  <input type="text" /><br/>
  <input type="text" data-bind="name" disabled />
  <div data-bind="name"></div>
</form>
```

para comensar a escuchar los eventos que puede enlazar el componente se debe hacer uso del método listen.

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

este método debe retornar un objeto en donde la llave debe ser un selector css que se aplica dentro del contexto del componente o el nombre de un evento, en el primer caso su valor debera ser otro objeto que cumpla con las mismas caracteristicas aca descritas y cuando la llave sea el nombre del evento su valor sera representado por la función o método que se ejecutara al disparar dicho evento.

Es posible realizar una configuración inicial de las propiedades mediante el método init.

```javascript
...
init(properties) {
  properties.name.setTemplate(renderTable);
}
...
```

En el anterior ejemplo se establece una función template para la propiedad name, de esta manera cuando se dibuje la propiedad dentro del DOM esta se hara basada en la plantilla suministrada.

Finalmente se puede hacer uso de las caracteristicas de javascript para el desarrollo de los componentes se pueden crear métodos publicos o privados, agregar propiedades personalizadas al componente o cualquier otra cosa que se le ocurra al desarrollador.

Repositorios
------------
El uso de los repositorios se liga usualmente a los recursos (Resources), pues estos artefactos se encargan de obtener información desde el servidor, claro que se puede usar como origen de datos cualquier cosa, incluso una base de datos en local, lo normal es que se use una API Rest. Para hacer uso de un recurso es posible instanciar un objeto de la clase Resource que provee la libreria.

```javascript
import { Resource } from 'scalar';

const user = new Resource('response.json');
```

Ya con el objeto es posible hacer uso de sus metodos get, post, put, delete y request. Este ultimo se usa para crear una petición personalizada (PATCH, OPTIONS, HEAD).

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

Como podemos observar es posible sobreescribir propiedades como los headers que se hacen uso dentro de la petición.

Plantillas
----------
Las plantillas (Templates) representan la parte más basica del sistema, hacen uso de las nuevas caracteristica template string de ecmascript 2015 y su función es generar código HTML de manera dinámica.

El soporte para plantillas está aún en una etapa bastante temprana, pero se están haciendo progresos. Su principal uso se encuentra restringido al binding de datos cuando la propiedad de un componente es compleja, la manera de configurar esta caracteristica es mediante el método init, tal como observamos anteriormente.

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

A parte de los artefactos principales de la libreria existen funciones como provide o inject que nos permiten manejar un sistema de inversión de control muy basico pero funcional dentro del contexto de scalar.
