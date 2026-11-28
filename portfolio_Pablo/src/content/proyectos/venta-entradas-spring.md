## 1. Descripción

Proyecto de aprendizaje para entender la **inyección de dependencias** y los **ámbitos (scopes) de los beans** en Spring Boot. Implementa una API REST de venta de entradas con gestión en memoria del aforo de un estadio (5 butacas), usando `@Component`, `@RequestScope`, `@Scope("prototype")` y `ObjectProvider`.

### 1.1 Objetivo

Practicar cómo Spring gestiona el ciclo de vida de los beans y entender por qué el `synchronized` en una única instancia evita la sobreventa con peticiones simultáneas, siempre que la aplicación corra en un único proceso.

## 2. Funcionalidades

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/compras` | Vende una entrada. Devuelve 201 con id del carrito, id del QR y butacas restantes. Si no hay butacas, devuelve 409 "Entradas agotadas". |
| `GET` | `/aforo` | Consulta el id del aforo y las butacas libres. |
| `GET` | `/hola` | Comprobación de que el servidor funciona. |
| `GET` | `/sin-inyeccion` | Crea objetos con `new` (sin Spring) para comparar con la inyección de dependencias. |

## 3. Inyección de dependencias y ámbitos de los beans

El proyecto usa tres beans con ámbitos distintos:

- **`AforoEstadio`** (`@Scope("singleton")`): una única instancia durante toda la vida de la aplicación. Se comparte entre todas las peticiones HTTP.
- **`CarritoCompra`** (`@RequestScope`): un carrito nuevo por cada petición HTTP. Se crea cuando llega la petición y se descarta cuando termina.
- **`GeneradorQR`** (`@Scope("prototype")`): una instancia nueva cada vez que se solicita.

`CompraService` los recibe por constructor para orquestar una compra:

*`CompraService.java`*

```java
@Service
public class CompraService {

    private final AforoEstadio aforo;
    private final CarritoCompra carrito;
    private final ObjectProvider<GeneradorQR> generadorQR;

    public CompraService(AforoEstadio aforo, CarritoCompra carrito, ObjectProvider<GeneradorQR> generadorQR) {
        this.aforo = aforo;
        this.carrito = carrito;
        this.generadorQR = generadorQR;
    }

    public RespuestaCompra comprar() {
        boolean vendida = aforo.venderButaca();

        if (!vendida) {
            return null;
        }

        GeneradorQR qr = generadorQR.getObject();

        return new RespuestaCompra("Entrada comprada", aforo.getButacasLibres(), carrito.getId(), qr.getId());
    }
}
```

En cada petición HTTP: `CompraService` usa el singleton `AforoEstadio` compartido, el carrito de esta petición (inyectado como proxy), y genera un QR único llamando a `generadorQR.getObject()`.

**Proxy versus ObjectProvider**: `CarritoCompra` se inyecta directamente en el singleton gracias a que `@RequestScope` hace que Spring inyecte un proxy, no la instancia real. En cada petición, ese proxy apunta al carrito correcto. `GeneradorQR` (prototype) no tiene proxy: si se inyectara directamente, solo se crearía una vez. Por eso se pide con `ObjectProvider.getObject()`, que crea una nueva en cada llamada.

## 4. Evitar la sobreventa

*`AforoEstadio.java`*

```java
public synchronized boolean venderButaca() {
    if (butacasLibres > 0) {
        butacasLibres--;
        return true;
    }
    return false;
}
```

`synchronized` garantiza que solo una petición HTTP a la vez ejecute el método. Dos peticiones simultáneas no pueden comprobar `butacasLibres > 0` y decrementarlo de forma independiente: el `if` y la resta son atómicos. Como existe una única instancia de `AforoEstadio`, cualquier compra pasa por el mismo objeto, y el lock es efectivo.

## 5. Aprendizajes

- **Elegir el ámbito adecuado**: qué estado se comparte (singleton) y cuál es propio de cada petición (request) o de cada uso (prototype).
- **Proxy frente a ObjectProvider**: para usar beans de ámbito más corto dentro de un singleton, `@RequestScope` usa proxy; `@Scope("prototype")` requiere `ObjectProvider`.
- **`synchronized` protege dentro de un proceso**: garantiza atomicidad en un servidor único. Con múltiples instancias o servidores, hace falta control a nivel de base de datos.
- **Códigos HTTP**: `201 Created` para éxito, `409 Conflict` para recurso agotado.

## 6. Mejoras futuras

- Guardar el aforo en una base de datos para que persista al reiniciar y funcione en múltiples instancias de la aplicación (usando, por ejemplo, bloqueo pesimista u optimista a nivel de SQL).
- Añadir un test que lance muchas compras de forma concurrente y verifique que nunca se venden más de 5 entradas.
- Devolver las butacas restantes en el mismo `venderButaca()` para evitar que dos métodos consecutivos den un número inexacto en caso de compras simultáneas.
- Usar `Optional<RespuestaCompra>` o una excepción en lugar de devolver `null` cuando se agotan las entradas.
