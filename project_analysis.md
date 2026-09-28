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
2. **Mejora de Identificabilidad Visual (Ajuste Fino)**:
   - **Botones con Estado Activo**: Los botones de tipo de pregunta se mantienen blancos por defecto; solo el botón **actualmente seleccionado** se colorea y destaca con su respectivo ícono (*FontAwesome*).
   - **Propagación a Campos de Texto**: Los campos de entrada (`TextInput`) adquieren automáticamente el color característico del tipo de pregunta seleccionado en ese momento (ej. *Enter q-code*, *Skip Logic*, etc.), permitiendo identificar el tipo de pregunta con solo mirar los campos sin necesidad de volver a verificar los botones superiores.
3. **Despliegue Exitoso a GitHub Pages**:
   - Se redirigió el repositorio Git local al repositorio personal: `https://github.com/IngElecSebas/Sassify.git`.
   - Se actualizó el campo `homepage` en `package.json` para apuntar a `https://IngElecSebas.github.io/Sassify`.
   - Se compiló y publicó de nuevo con éxito en la rama `gh-pages` usando `pnpm run deploy`.

## Estado Final de esta Sesión (IMPORTANTE)
- **`Documents\Sassify\SassifyIn\src` quedó en la versión 1.0 ORIGINAL** (restaurada desde el backup). No hay nada de la 1.1 activo en Documents; solo quedan los backups en `/tmp/sassify_backup/`.
- **NO se desplegó nada** a GitHub Pages / github.io. Todo quedó local.

## Intentos de Mejoras v1.1 (NO CONSEGUIDAS / SIN CONCLUIR)
Se intentó implementar la v1.1 con 4 mejoras, y quedó a medio camino. Documentar para retomar en otra sesión:

1. **Redimensionamiento de contenedores** (tan simple como se pensaba):
   - `QuestionsList.module.css`: cambiar `.QuestionsListSection` a `resize: vertical; overflow-y: auto;` (quitar `max-height`/`overflow-y: scroll`).
   - `Output.module.css`: `.OutputTextArea` a `resize: vertical; overflow-y: auto;`.
   - ⚠️ NO VERIFICADO en navegador. El CSS estaba aplicado en las backups pero no se llegó a probar con la app corriendo.

2. **Relevancia en subpreguntas MCQ** (`Output.js`, sección `case 'mcq'`):
   - Formato deseado: `punch[condición]` en subpreguntas, ej. `9[pMode=1]`.
   - Regla exacta: `if (D300_9="" OR (pMode=1 & D300_9=1)) then D300_9_final="T    "; else D300_9_final="WRONG";` — la condición aplica SOLO cuando valor = 1.
   - Se implementó en `Output.js` (parseo de subpreguntas con `split(/,\s*(?![^\[]*\])/)`, objetos `{punch, skLogic}`, generación de la regla en `checkstr`).
   - ⚠️ NO VERIFICADO con datos reales. Requiere probar que la expresión SAS resultante es correcta.

3. **Condiciones en opciones Radio/Equation** (`Output.js`, sección `case 'radio/equation'`):
   - Formato deseado: `1[SplitAB=1], 2, 3[SplitAB=2]` → compilar como OR: `(Q in (1) & SplitAB=1) OR (Q in (2)) OR (Q in (3) & SplitAB=2)`.
   - Se añadió la función `compileRadioOptions(answerOptions, modeSwitch, modeOptions, qCode)` y se reescribió el `case 'radio/equation'`.
   - FALLO DETECTADO: la primera versión rompía el balance de llaves (el `case` quedaba con una llave extra y Babel lanzaba `Unexpected token (147:12)`). Se reconstruyó el case con una variable `radioOpts` que solo usa `compileRadioOptions` si `answerOptions` contiene `[`, manteniendo el formato `Q in (a,b,c)` si no.
   - ⚠️ La versión corregida SÍ compiló con `pnpm build` y levantó el dev server (webpack OK), pero NO se probó en navegador ni se validó el SAS generado.

4. **Reordenamiento e inserción de preguntas** (QuestionCard / App.js):
   - Se planearon botones **▲/▼** y **+ Insertar** por tarjeta.
   - ⚠️ NO implementado ni verificado (no se llegó a tocar `App.js` handlers ni `QuestionCard.js`).

## Backups disponibles (para retomar)
- `/tmp/sassify_backup/src_backup` → versión **1.0** (original, la que está de nuevo en Documents).
- `/tmp/sassify_backup/src_version1.1` → versión **1.1** (trabajo en curso: incluye Output.js con `compileRadioOptions` + case radio/equation reconstruido y COMPILABLE, resize en CSS, lógica MCQ).
  - ⚠️ OJO: la backup v1.1 fue sobrescrita con el Output.js corregido que compila; todavía no valida que el SAS generado sea funcionalmente correcto.

## Recomendación para una futura sesión
1. Copiar `/tmp/sassify_backup/src_version1.1` → `src/`.
2. Levantar la app (loopback) y verificar una por una: resize, MCQ con `punch[condición]`, radio/equation con condiciones, e inserción/reordenamiento (esta última aún no escrita).
3. Solo después de validar en navegador, actualizar la backup v1.1 y considerar el despliegue (si el usuario lo pide).

## Próximos Pasos (Deuda Técnica Futura)
- Revisar la lógica de `useEffect` en `App.js` que fuerza `setIsLoggedIn(true)` incondicionalmente, puenteando el login del backend.
- Evaluar migración de React 17 a una versión más reciente.
- Implementar validación completa en modo producción.
