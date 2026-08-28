# Análisis del Proyecto: SassifyIn (Sassify)

## Propósito
Aplicación web generadora de código (basada en lógica SAS) para cuestionarios y gestión rápida de parámetros.

## Estructura de la Aplicación
- **Framework**: React 17.0.2
- **Gestión de Paquetes**: `pnpm` (Seguro, rápido y eficiente)
- **UI**: CSS Modules, Componentes funcionales.
- **Servicios**: `axios` para API, `jwt-decode` para autenticación.
- **Herramientas**: `@monaco-editor/react` (edición de código SAS), `react-router-dom` (navegación), `@fortawesome/react-fontawesome` (iconografía de la interfaz).

## Componentes Principales
- `Questions`: Listado y tarjetas de preguntas (`QuestionCard.js`, `QuestionsList.js`).
- `New Question`/`EditQuestion`: Formularios para la gestión y carga de lógica (`NewQuestion.js`, `EditQuestion.js`).
- `Output`: Generador y visualizador final de código SAS compilado (`Output.js`).
- `Login`/`ChangePassword`: Módulos de autenticación (`Login.js`, `ChangePassword.js`).
- `Store`: Archivo de base de datos local y estática con lógica base (`Store.js`).

## Debilidades Detectadas para Futura Deuda Técnica
- **Seguridad**: `useEffect` en `App.js` fuerza `setIsLoggedIn(true)` incondicionalmente, puenteando el login del backend.
- **Persistencia**: Depende de `localStorage` para guardar el cuestionario (fácilmente borrable o corruptible).
- **Dependencias**: React 17 y Create React App se encuentran deprecados.

## Mejoras Realizadas en esta Sesión
1. **Migración a pnpm**: Se eliminó `package-lock.json`, se migró todo a `pnpm` (`pnpm-lock.yaml`) para evitar vulnerabilidades.
2. **Mejora de Identificabilidad Visual (Opción B)**:
   - Se añadieron colores pastel únicos y bordes adaptados para cada tipo de pregunta en `Radio.module.css` (para evitar equivocaciones entre "Radio" y "Array").
   - Se integró `FontAwesomeIcon` en `Radio.js` añadiendo íconos representativos a cada tipo de pregunta (ej. list para array, dot-circle para radio/equation, database para datacodes, etc.).
3. **Despliegue Exitoso a GitHub Pages**:
   - Se redirigió el repositorio Git local al repositorio personal: `https://github.com/IngElecSebas/Sassify.git`.
   - Se actualizó el campo `homepage` en `package.json` para apuntar a `https://IngElecSebas.github.io/Sassify`.
   - Se compiló y publicó con éxito en la rama `gh-pages` usando `pnpm run deploy`.
