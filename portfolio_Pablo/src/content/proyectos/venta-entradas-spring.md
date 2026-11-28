## 1. Qué es

API REST en Java con Spring Boot que gestiona venta de entradas de eventos sin posibilidad de sobreventa. Cuando 20 usuarios compran simultáneamente de 10 entradas disponibles, el sistema vende exactamente 10, nunca 11. Este proyecto explora inyección de dependencias, ciclos de vida de beans, y patrones robustos de control de concurrencia.

**Stack**: Java, Spring Boot, Spring Data JPA, Maven, JUnit, H2 (testing).

### 1.1 Por qué lo hice

Entender cómo Spring resuelve problemas reales de producción: inyección de dependencias en la práctica, transacciones, y sincronización a nivel base de datos. La concurrencia es uno de los temas menos entendidos y más críticos.

## 2. Inyección de dependencias

Spring gestiona el ciclo de vida de los objetos automáticamente. Declaro mis servicios con anotaciones y Spring los crea, configura e inyecta donde sea necesario.

```java
@Service
public class TicketService {
  private final EventRepository eventRepo;
  
  // Constructor injection — recomendado, campos inmutables
  public TicketService(EventRepository eventRepo) {
    this.eventRepo = eventRepo;
  }
  
  public TicketResponse buyTicket(long eventId, int quantity) {
    // Lógica aquí
  }
}

@Configuration
public class AppConfig {
  @Bean
  public NotificationService notificationService() {
    return new NotificationService();  // Spring crea instancia única
  }
}
```

**Scopes disponibles**: Singleton (una instancia, default), Prototype (nueva cada vez), Request (una por petición HTTP). Elegir bien mejora rendimiento y evita bugs de estado compartido.

## 3. El reto: Evitar sobreventa con concurrencia

**El problema**: Sin sincronización, dos threads pueden leer el mismo stock, decrementarlo, y vender dos entradas cuando solo hay una.

```
Thread A: Lee stock=1
Thread B: Lee stock=1
Thread A: Decrementa → stock=0 ✓
Thread B: Decrementa → stock=0 ✗ ERROR: sobreventa
```

**Solución**: Pessimistic Lock a nivel base de datos. Spring Data JPA lo simplifica con anotaciones.

```java
// EventRepository.java
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
  
  @Query("SELECT e FROM Event e WHERE e.id = :id")
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  Optional<Event> findByIdForUpdate(@Param("id") long id);
}

// TicketService.java
@Service
public class TicketService {
  
  @Transactional
  public TicketResponse buyTicket(long eventId, int quantity) {
    Event event = eventRepository.findByIdForUpdate(eventId)
      .orElseThrow(() -> new EventNotFoundException());
    
    if (event.getAvailableTickets() < quantity) {
      throw new TicketSoldOutException();
    }
    
    event.decrementTickets(quantity);
    eventRepository.save(event);  // Commit atómico
    
    return new TicketResponse(event.getId(), quantity);
  }
}
```

**Por qué funciona**: La base de datos bloquea la fila cuando Thread A la lee. Thread B espera. Cuando Thread A termina, Thread B lee el valor actualizado. Concurrencia garantizada, escalable a múltiples servidores.

## 4. Otros patrones de concurrencia

**Optimistic Locking**: Campo `@Version` auto-incrementado. Si otro thread cambió la fila, lanza excepción. Bueno para baja concurrencia, no bloquea, pero genera reintentos.

```java
@Entity
public class Event {
  @Version
  private Long version;  // Spring lo gestiona automáticamente
}
```

**Locks Java (`synchronized`)**: Bloquea toda la app, no escala, evitar en producción.

## 5. Testing de concurrencia

Creo 20 threads que compran simultáneamente de un evento con 10 entradas.

```java
@Test
public void testNoOverbooking() throws InterruptedException {
  ExecutorService executor = Executors.newFixedThreadPool(20);
  
  for (int i = 0; i < 20; i++) {
    executor.submit(() -> {
      ticketService.buyTicket(eventId, 1);
    });
  }
  
  executor.shutdown();
  executor.awaitTermination(10, TimeUnit.SECONDS);
  
  Event event = eventRepository.findById(eventId).get();
  assertEquals(0, event.getAvailableTickets());  // Nunca sobreventa
}
```

Resultado: Exactamente 10 entradas vendidas, 10 intentos fallidos con excepción `TicketSoldOutException`.

## 6. Qué aprendí

- **DI de Spring es elegancia pura**: Código limpio, fácil de testear, desacoplado. Los tests inyectan mocks sin ceremonias.
- **Scopes importan**: Singleton es rápido pero comparte estado (cuidado). Prototype es lento pero seguro. Request es el equilibrio en web.
- **Concurrencia en BD es la solución robusta**: Locks Java funcionan en monohilo. Locks en BD funcionan distribuidos.
- **Testing de concurrencia es imprescindible**: Bugs de race condition nunca aparecen en tests monohilo.
- **Pessimistic vs Optimistic**: Pessimistic bloquea (mejor si hay mucha contención). Optimistic reintentos (mejor si hay poca).

## 7. Próximos pasos

- Implementar Optimistic Lock como alternativa y comparar performance.
- Añadir caché de eventos con invalidación automática.
- Integrar con sistema de pagos real (Stripe, PayPal).
- Monitoreo de deadlocks en BD con logs.
- Load testing con 1000+ threads concurrentes.
