# Análisis del Proyecto: SassifyIn

## Propósito
Aplicación web generadora de código (basada en lógica SAS) para cuestionarios.

## Estructura
- **Framework**: React 17.0.2 (Anticuado)
- **UI**: CSS Modules, Componentes funcionales.
- **Servicios**: `axios` para API, `jwt-decode` para Auth.
- **Herramientas**: `Monaco Editor` (para edición de código), `react-router-dom` (navegación).

## Componentes
- `Questions`: Listado y tarjetas de preguntas.
- `New Question`/`EditQuestion`: Formularios de gestión.
- `Output`: Visualización de resultados.
- `Login`/`ChangePassword`: Auth.

## Errores y Debilidades Detectadas
- **Seguridad**: Existe un `useEffect` en `App.js` (líneas 60-63) que fuerza `setIsLoggedIn(true)` incondicionalmente. Esto ignora la autenticación real.
- **Persistencia**: Uso excesivo de `localStorage` para guardar el estado de las preguntas, lo que puede causar inconsistencias.
- **Arquitectura**: Lógica de negocio hardcodeada en `Store.js` en lugar de provenir de un endpoint o base de datos.
- **Dependencies**: React 17.0.2 y `create-react-app` están obsoletos.

## Cambios Realizados
- **Mejora Visual (Opción B)**: Se han añadido íconos (vía FontAwesome) y colores distintivos a los botones de selección de tipo de pregunta (`Radio.js` y `Radio.module.css`) para mejorar la identificabilidad. Se ha instalado `@fortawesome/react-fontawesome` vía `pnpm`.


