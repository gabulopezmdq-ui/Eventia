# Reporte de Implementación: Módulo "Captación y Audiencias"

**Proyecto**: Eventia B2B
**Fecha**: Abril 2026

---

## 🎯 Objetivo del Módulo
El objetivo principal de este desarrollo fue dotar a Eventia de un **CRM de Eventos (Captación y Audiencias)**. Esto permite a los organizadores crear campañas públicas mediante links (`tokens`), recopilar registros masivos a través de formularios inteligentes (con encuestas de intereses/perfiles), gestionar el control de acceso mediante QRs, ofrecer beneficios canjeables en barra, y administrar una base de datos centralizada de todos sus asistentes.

La implementación completa se planificó y ejecutó exitosamente a lo largo de **4 Sprints consecutivos**.

---

## 🚀 Resumen por Sprints

### Sprint 1: Arquitectura Base y Conexiones B2B (Infraestructura)
El primer paso consistió en establecer un canal de comunicación robusto y tipado con el backend de Eventia, sorteando problemas de CORS y centralizando el manejo de autenticación.

* **Tipado Estricto**: Creación de `types.ts` centralizando todas las interfaces de Campañas, Registros, Check-in, Beneficios y Audiencia utilizando `snake_case` para mapeo directo con el backend.
* **Capa de Proxies (App Router)**: Implementación de 16 endpoints en `src/app/api/` que inyectan el `access_token` desde las cookies y enrutan de forma segura las peticiones hacia el backend.
* **Servicios Frontend**: Se crearon los clientes de consumo de API (`captacion.service.ts` y `audiencias.service.ts`), extrayendo toda la lógica `fetch` fuera de los componentes visuales.

### Sprint 2: Dashboard del Evento (Gestor B2B)
En esta fase se construyeron las herramientas de administración para un **evento particular**.

* **Navegación por Pestañas**: Integración fluida en `/dashboard/events/[id]/audiencias` con múltiples vistas de gestión.
* **Gestor de Campañas**: 
  * Vista de grilla con activación de campañas en tiempo real y métricas sumizadas.
  * *Modal* avanzado (`CampanaFormModal`) para configurar links, capacidad máxima, y recompensas o beneficios.
* **Visor de Personas Registradas**: Tabla dinámica de asistentes con buscador integrado.
* **Simuladores de Puerta (Control de Acceso)**: Pantallas de resolución de *Token QR* adaptadas a uso por *Staff*:
  * **QR Entrada**: Valida si el asistente puede ingresar o si ya ingresó.
  * **QR Beneficio**: Valida en barra el estado del beneficio (Pendiente, Canjeado, Vencido).

### Sprint 3: Landing Pública de Registro (B2C)
Aquí se desarrolló la experiencia visible para el asistente final que recibe la invitación.

* **Ruta Pública (`/registro/[token]`)**: Excluida estratégicamente del `middleware.ts` para no requerir login a los invitados.
* **Diseño Premium**: Interfaz visual de alta gama (`PublicLanding`), responsiva, y orientada a la conversión, mostrando detalles de anfitriones, cupos limitados y beneficios.
* **Formulario Inteligente**: 
  * Recopilación de contacto base (Exige Nombre, Apellido y Celular o Email).
  * Consumo de paramétricas dinámicas para preguntar **"¿Con quién venís?"** (Perfiles) y **"¿Qué te interesa?"** (Preferencias/Intereses).
* **Confirmación Inmediata**: Pantalla de éxito en línea que entrega el **Token QR visual** e instrucciones de ingreso.

### Sprint 4: CRM de Audiencia de Cuenta (Vista Global)
Esta fase conectó el comportamiento aislado de cada evento para transformarlo en información histórica y trazable a nivel "Cuenta Organizador".

* **Navegación**: Inclusión del acceso *"Audiencia (CRM)"* en el Sidebar global del Dashboard.
* **Listado General (`/dashboard/audiencia`)**: Tabla integral con todas las personas registradas alguna vez por el organizador, midiendo de inmediato si suelen ser *"No Show"* o asistentes frecuentes.
* **Ficha del Asistente (`/dashboard/audiencia/[id]`)**:
  * Visualización completa de contacto y datos demográficos.
  * **Historial de Eventos**: Seguimiento minucioso sobre a qué evento fue, si usó beneficios y qué campaña lo atrajo.
  * **Gestión de Etiquetas (Tags)**: Sistema para que el organizador califique manualmente al asistente (Ej: *VIP*, *Conflictivo*, *Staff*), con validación paramétrica.

---

## 🔄 Flujos Principales Implementados

Para mayor claridad operativa, el módulo consolida 3 flujos clave:

1. **Flujo de Captación (Generación y Registro)**:
   * El Organizador crea una *"Campaña"* desde el Dashboard y obtiene un Link Único (`Token`).
   * El Organizador comparte el link por redes/WhatsApp.
   * El Usuario Final abre el link (`/registro/[token]`), completa sus datos personales, preferencias e intereses, y acepta los términos.
   * El sistema registra al usuario, le asigna un QR virtual y lo vincula al CRM de la cuenta.

2. **Flujo de Operación (Check-in y Beneficios)**:
   * El día del evento, el Asistente muestra su QR.
   * El Staff escanea el QR utilizando los módulos de simulación en el panel del evento.
   * El sistema aprueba/rechaza el ingreso y cambia su estado a *Asistió*.
   * Si la campaña incluía un beneficio (ej. Consumición gratis), el Staff de barra escanea el mismo QR para canjearlo.

3. **Flujo de Fidelización (Mini-CRM)**:
   * Una vez finalizados los eventos, el Organizador ingresa a su panel general de *Audiencias*.
   * Puede ver el comportamiento del usuario: a qué eventos faltó (No-Show), a cuáles asistió, y si suele canjear sus beneficios.
   * El Organizador puede añadir *Etiquetas (Tags)* manuales para segmentar a los mejores clientes para futuras campañas.

---

## 🛠 Arquitectura de Archivos y Rutas Generadas

**Rutas de Página (UI)**
* `[B2B] /dashboard/events/[id]/audiencias`: Hub principal del evento.
* `[B2B] /dashboard/audiencia`: Tabla CRM Global de la cuenta.
* `[B2B] /dashboard/audiencia/[id]`: Ficha del asistente en el CRM.
* `[B2C] /registro/[token]`: Landing pública de captación.

**Componentes Destacados (`src/components/captacion/`)**
* `CampanaFormModal.tsx`
* `CampanasTab.tsx`
* `PersonasRegistradasTab.tsx`
* `QrEntradaScreen.tsx` / `QrBeneficioScreen.tsx`
* `PublicLanding.tsx`
* `RegistroAudienciaForm.tsx`

---

## ✅ Conclusión y Estado
El módulo fue integrado con éxito, **respeta los lineamientos de UI premium pre-existentes de Eventia** y soluciona un flujo "End-to-End" (desde que el organizador genera el link, hasta que el usuario final llega a la puerta y, posteriormente, figura en la base de datos central de la cuenta B2B). Todo el código está tipado bajo TypeScript y estructurado bajo los estándares de Next.js App Router.
