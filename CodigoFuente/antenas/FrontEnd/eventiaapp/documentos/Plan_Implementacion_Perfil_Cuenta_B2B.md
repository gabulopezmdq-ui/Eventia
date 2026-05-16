# Plan de Implementación: Perfil de Cuenta (B2B)

> [!IMPORTANT]
> ✅ **IMPLEMENTACIÓN COMPLETADA** — Todas las fases han sido validadas correctamente.

Este plan detalla las acciones necesarias para incorporar la nueva sección "Perfil de Cuenta" para usuarios B2B en el frontend de Eventia, manteniendo la arquitectura y el estilo de código actual.

## Fase 1: Servicios y Proxies de API
**Objetivo:** Establecer la comunicación con los endpoints del backend para obtener y actualizar los datos de la cuenta.

**Archivos a modificar/crear:**
1. **`src/app/api/cuentas/perfil/route.ts` (NUEVO)**
   - **GET:** Proxy para obtener los datos actuales de la cuenta (asumiendo que existe un endpoint `GET /cuentas/MiCuenta` o similar en el backend).
   - **PUT:** Proxy hacia el endpoint `PUT /cuentas/UpdateMiCuenta`. Recibe y reenvía el JSON detallado en la documentación.

2. **`src/features/cuenta/cuenta.service.ts` (MODIFICAR)**
   - **Tipos:** Definir las interfaces `CuentaPerfilInfo` y `UpdateCuentaPayload`.
   - **Funciones:**
     - `getMiCuentaPerfil()`: Hace un GET a `/api/cuentas/perfil`.
     - `updateMiCuentaPerfil(data)`: Hace un PUT a `/api/cuentas/perfil`.

---

## Fase 2: Integración en la Navegación (Layout)
**Objetivo:** Exponer la nueva vista en el menú lateral (Sidebar) para los usuarios con cuentas B2B.

**Archivos a modificar/crear:**
1. **`src/app/dashboard/layout.tsx` (MODIFICAR)**
   - Ubicar la sección del menú `CUENTA (B2B)`.
   - Agregar un nuevo componente `<SidebarItem />` justo debajo de la opción "Plan y Facturación".
   - **Propiedades:** `href="/dashboard/cuenta/perfil"`, `icon={Building2}` (o un ícono representativo como `FileText`), `label="Perfil de Cuenta"`.

---

## Fase 3: Creación de la Vista (UI/UX)
**Objetivo:** Desarrollar la pantalla con el formulario de edición, reutilizando la estética de `solicitar/page.tsx` pero adaptándola a las nuevas reglas de negocio.

**Archivos a modificar/crear:**
1. **`src/app/dashboard/cuenta/perfil/page.tsx` (NUEVO)**
   - **Estructura y Estilos:** Mantener el uso de Tailwind CSS, con la división en tarjetas (Cards) ("Datos de tu empresa", "Datos fiscales", etc.).
   - **Carga inicial:** Usar `useEffect` para llamar a `getMiCuentaPerfil()` al montar el componente, cargar paramétricas (`paises` y `tiposIdFiscal`), y pre-poblar el formulario.
   - **Cambios específicos del formulario según documentación:**
     - **Título principal:** "Datos de la cuenta".
     - **Nombre de la Empresa:** Debe renderizarse como un campo de solo lectura (`disabled` o `readOnly`).
     - **Sección "Datos de tu empresa":**
       - Incluir los campos: Tipo de cuenta, Instagram, Web, Teléfono, Ciudad.
       - **Mover el campo "País":** Ubicarlo aquí, debajo de "Teléfono" y "Ciudad".
       - **Reglas del campo "País":** Debe ser obligatorio y también de **solo lectura** (`disabled`).
     - **Sección "Datos fiscales":**
       - Contendrá Tipo de Identificación Fiscal y Número de Identificación Fiscal.
     - **Sección "Descripción":** Campo de texto multilinea.
   - **Feedback al usuario:**
     - Implementar estados de carga (`loading`) en el botón de submit.
     - Mostrar un mensaje de éxito tras guardar correctamente (mediante un toast o alert contextual, no redirigiendo como en `solicitar/page.tsx`).
     - Manejo de errores visuales si falla la petición PUT.

2. **`src/app/dashboard/cuenta/perfil/loading.tsx` (NUEVO) (Opcional pero recomendado)**
   - Agregar un esqueleto (Skeleton) de carga para mantener la coherencia de la experiencia de usuario mientras se obtienen los datos de la cuenta desde el backend.

---

## Fase 4: Pruebas y Validación
**Objetivo:** Asegurar que la implementación cumple con todos los requisitos.

- [x] Verificar que "Perfil de Cuenta" aparece en el Sidebar bajo "Plan y Facturación".
- [x] Validar que al ingresar a `/dashboard/cuenta/perfil`, los datos se pre-carguen correctamente.
- [x] Confirmar que los campos "Nombre de la Empresa" y "País" están deshabilitados.
- [x] Confirmar que "País" se encuentra en la sección correcta ("Datos de tu empresa") y que al guardar el formulario sin modificaciones, respete su valor (al estar `disabled` hay que asegurar que su ID se envíe en el JSON del PUT).
- [x] Ejecutar el submit y comprobar en la pestaña Network (Red) que el payload coincide con la estructura requerida para `PUT /cuentas/UpdateMiCuenta`.
- [x] Verificar que tras guardar exitosamente, la UI le avise al usuario sin desarmar su contexto.
