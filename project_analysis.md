# Análisis del Proyecto: SassifyIn (Sassify)

## 1. Propósito

Sassify es una aplicación web para construir cuestionarios y generar automáticamente código SAS a partir de la configuración de cada pregunta. Permite definir tipos de pregunta, códigos, opciones de respuesta, lógica de salto, condiciones, campos especiales y bloques de código personalizados.

La aplicación está pensada para que el usuario configure la estructura del cuestionario desde la interfaz y pueda consultar/copiar el código SAS resultante desde el panel de salida.

## 2. Tecnologías y dependencias principales

- **Framework:** React 17.0.2.
- **Scaffolding:** Create React App.
- **Gestión de paquetes:** `pnpm`.
- **Estilos:** CSS Modules y archivos CSS convencionales.
- **Componentes:** componentes funcionales de React.
- **API:** `axios`.
- **Autenticación:** tokens de acceso/refresh y `jwt-decode`.
- **Navegación:** `react-router-dom`.
- **Editor de código:** `@monaco-editor/react`.
- **Iconografía:** `@fortawesome/react-fontawesome` y `@fortawesome/free-solid-svg-icons`.
- **Persistencia local del cuestionario:** `localStorage`.
- **Estado de sesión del navegador:** `sessionStorage` para el token de acceso.

## 3. Estructura funcional

### Componentes principales

- `src/App.js`: componente raíz, autenticación, estado global de las preguntas, persistencia local, edición, eliminación, reordenamiento e inserción.
- `src/components/New Question/`: formularios para crear preguntas nuevas.
- `src/components/New Question/Radio.js`: selector visual del tipo de pregunta.
- `src/components/EditQuestion/`: formulario para editar una pregunta existente.
- `src/components/Questions/QuestionsList.js`: renderiza la lista de preguntas.
- `src/components/Questions/QuestionCard.js`: tarjeta individual con los datos y acciones disponibles.
- `src/components/Questions/*.module.css`: estilos de la lista y de las tarjetas.
- `src/components/Output/Output.js`: transforma la lista de preguntas en código SAS.
- `src/components/Output/Output.module.css`: estilos del área de código SAS y botones de copia.
- `src/components/Login/`: inicio de sesión.
- `src/components/ChangePassword/`: cambio de contraseña.
- `src/components/UI/`: encabezado, carga y elementos visuales compartidos.
- `src/services/`: llamadas a la API y gestión de tokens.
- `src/Store.js`: datos/base estática de apoyo para la lógica de la aplicación.

## 4. Estado de las versiones

| Rama | Contenido | Estado |
|---|---|---|
| `main` | Versión original | Sin cambios; no se ha hecho merge de 1.1 ni 1.2 |
| `version-1.1` | Mejoras descritas en la sección 5 | Publicada en GitHub (rama) |
| `version-1.2` | Versión 1.1 + cambios de la sección 6 | Publicada en GitHub (rama) y **desplegada en GitHub Pages** |

- Sitio en producción: https://ingelecsebas.github.io/Sassify/ (servido desde la rama `gh-pages`, generado con `pnpm run deploy` desde `version-1.2`).
- `main` sigue conservando la versión anterior; el merge hacia `main` queda pendiente de decisión.
- No se ha creado todavía una etiqueta (`v1.1.0` / `v1.2.0`).
- La carpeta `.claude/` (configuración local de Claude Code, p. ej. `launch.json` para levantar `pnpm start`) vive fuera de `SassifyIn` y no forma parte del repositorio.

## 5. Cambios realizados en la versión 1.1

### 5.1 Migración a pnpm

- Se eliminó el uso de `package-lock.json`.
- Se adoptó `pnpm-lock.yaml`.
- Los comandos de instalación, desarrollo y compilación deben ejecutarse mediante `pnpm`.

### 5.2 Mejora visual de los tipos de pregunta

Se ajustó la identificación visual del tipo de pregunta:

- Los botones de tipo de pregunta permanecen con el estilo normal cuando no están seleccionados.
- Solo el tipo actualmente seleccionado recibe el color y el estilo activo correspondiente.
- Los iconos FontAwesome se mantienen asociados al tipo de pregunta.
- Los campos de texto del formulario heredan/representan el color del tipo seleccionado para que el usuario pueda reconocer el contexto mientras completa la pregunta.

### 5.3 Redimensionamiento de contenedores

Archivos modificados:

- `src/components/Questions/QuestionsList.module.css`.
- `src/components/Output/Output.module.css`.

La lista de preguntas y el área de salida SAS ahora utilizan:

- `resize: vertical` para permitir cambiar la altura manualmente.
- `overflow-y: auto` para mostrar scroll solo cuando el contenido supera la altura disponible.
- La lista conserva un área desplazable cuando contiene muchas tarjetas.
- Se añadió espacio inferior y lateral a la lista para que los controles de las tarjetas no queden ocultos.

El redimensionamiento es una característica del navegador y afecta la sesión visual actual; todavía sería conveniente comprobar su comportamiento en distintos navegadores y tamaños de pantalla.

### 5.4 Condiciones en subpreguntas MCQ

Archivo principal: `src/components/Output/Output.js`, rama `case 'mcq'`.

Ahora se aceptan subpreguntas con una condición entre corchetes. Ejemplo:

```text
9[pMode=1], 10, 11[SplitAB=2]
```

El parser:

1. Divide las subpreguntas usando una expresión regular que evita separar las comas que forman parte de una condición entre corchetes.
2. Separa el número de punch de la condición.
3. Guarda cada elemento como un objeto con la forma conceptual `{ punch, condition }`.
4. Conserva la expansión de rangos numéricos, por ejemplo `1:5`.
5. Evita duplicar valores ya incluidos.
6. Añade los valores `other` y `exclusive` cuando corresponde.
7. Genera la validación individual de cada subpregunta.

Para una subpregunta sin condición se mantiene el comportamiento anterior:

```sas
if (D300_10="" OR D300_10=1) then D300_10_final="T    ";
else D300_10_final="WRONG";
```

Para una subpregunta condicionada, la condición solo se aplica cuando el valor de la subpregunta es `1`:

```sas
if (D300_9="" OR (pMode=1 & D300_9=1)) then D300_9_final="T    ";
else D300_9_final="WRONG";
```

Esto permite que la respuesta sea considerada válida cuando está vacía o cuando tiene valor `1` y se cumple la condición asociada.

**Pendiente de validación:** comprobar con datos representativos que la semántica de las condiciones corresponde exactamente a las reglas SAS esperadas, especialmente cuando se combinan rangos, opciones exclusivas, `other` y lógica de salto.

### 5.5 Condiciones en opciones Radio/Equation

Archivo principal: `src/components/Output/Output.js`, rama `case 'radio/equation'`.

Se incorporó el soporte para opciones condicionadas como:

```text
1[SplitAB=1], 2, 3[SplitAB=2]
```

El procesamiento:

1. Detecta si la cadena contiene corchetes.
2. Separa las opciones sin romper las comas que estén dentro de una condición.
3. Convierte cada opción en una expresión individual.
4. Combina las expresiones mediante `OR`.
5. Mantiene el formato anterior para listas simples como `1,2,3`.
6. Respeta los modos `pMode` cuando `answerOptions` contiene alternativas separadas por `|`.
7. Integra `otherCode` cuando existe.
8. Conserva la lógica de salto y la regla de respuesta vacía cuando el salto no aplica.

La forma esperada para el ejemplo anterior es conceptualmente:

```sas
if ((Q in (1) & SplitAB=1) OR
    (Q in (2)) OR
    (Q in (3) & SplitAB=2))
then Q_final="T    ";
else Q_final="WRONG";
```

Durante la implementación hubo un error intermedio de llaves que produjo `Unexpected token` en Babel. El bloque fue reconstruido y la versión final mantiene un bloque delimitado para el `case` de `radio/equation`.

**Pendiente de validación:** probar en la interfaz todas las combinaciones de opciones simples, opciones condicionadas, modos `pMode`, `skipLogic` y `otherCode`, y revisar el SAS producido carácter por carácter.

### 5.6 Reordenamiento de preguntas

Archivos modificados:

- `src/App.js`.
- `src/components/Questions/QuestionsList.js`.
- `src/components/Questions/QuestionCard.js`.
- `src/components/Questions/QuestionCard.module.css`.

Cada tarjeta puede mostrar controles de movimiento cuando el usuario pasa el cursor sobre ella:

- **▲ / Move Up:** intercambia la tarjeta con la que está inmediatamente arriba.
- **▼ / Move Down:** intercambia la tarjeta con la que está inmediatamente abajo.
- La primera tarjeta no muestra `Move Up`.
- La última tarjeta no muestra `Move Down`.
- Una lista con una sola pregunta no muestra ninguno de los dos controles.

Los handlers `moveUpHandler` y `moveDownHandler`:

1. Copian el arreglo actual para no trabajar directamente sobre el estado original.
2. Localizan la pregunta por su `id`.
3. Intercambian las posiciones vecinas.
4. Actualizan el estado de React.
5. Guardan el nuevo orden en `localStorage`.

Se corrigió además la visibilidad de los botones. Inicialmente `Move Down` estaba posicionado fuera de la tarjeta mediante `bottom: -15%`, por lo que quedaba oculto o interferido por la tarjeta siguiente. Los controles fueron recolocados dentro de la tarjeta usando posiciones explícitas en `rem`, y se aumentó el espacio entre tarjetas.

### 5.7 Inserción/duplicación de preguntas

El botón **+ Insert** se agregó a cada tarjeta.

El handler `duplicateHandler`:

1. Busca la tarjeta seleccionada mediante su `id`.
2. Crea una copia superficial de sus datos.
3. Genera un nuevo identificador para el duplicado.
4. Inserta la copia inmediatamente después de la tarjeta original.
5. Actualiza el estado y `localStorage`.

La finalidad es permitir crear rápidamente una pregunta parecida y editarla después desde el formulario de edición.

**Pendiente de mejora:** usar un generador de identificadores robusto y confirmar que el nuevo identificador nunca colisione con otro existente.

### 5.8 Corrección del selector de tipos de pregunta

Archivo modificado: `src/components/New Question/Radio.js`.

Se corrigió el error de ejecución:

```text
TypeError: e.target.firstElementChild.click is not a function
```

El problema ocurría porque `e.target` no siempre era el contenedor del selector. Al hacer clic sobre el texto, el icono FontAwesome o un elemento interno del SVG, `firstElementChild` podía apuntar a un nodo SVG o a otro elemento que no era un radio button.

La solución utiliza `e.currentTarget`, que siempre corresponde al `<div>` que tiene registrado el evento, y busca dentro de él el radio correcto:

```js
const container = e.currentTarget;
const input = container.querySelector('input[type="radio"]');
if (input && e.target !== input) {
    input.click();
}
```

Con esto el selector responde de forma uniforme al hacer clic sobre:

- El fondo del selector.
- El texto de la etiqueta.
- El icono FontAwesome.
- El propio control visual asociado.

### 5.9 Eliminación del bypass de autenticación

Archivo modificado: `src/App.js`.

Se eliminó el `useEffect` que ejecutaba continuamente:

```js
setIsLoggedIn(true);
```

Ese efecto anulaba en la práctica la comprobación del login. Ahora el estado de autenticación depende de `autoPingServer()` y de la existencia/validez del token en `sessionStorage`.

El flujo actual revisa el token, consulta `/user`, compara el usuario decodificado con la respuesta del backend y actualiza el estado de sesión. Si no hay token o la validación falla, la aplicación puede marcar al usuario como no autenticado.

**Pendiente de revisión:** comprobar las rutas protegidas y el comportamiento de expiración/refresh del token en escenarios reales, además de revisar las dependencias del `useEffect` para evitar llamadas innecesarias.

## 6. Cambios realizados en la versión 1.2

### 6.1 Extra Condition en Radio/Equation

Archivos: `NewQuestion.js`, `EditQuestion.js`, `Output.js`, `QuestionCard.js`.

- Nuevo checkbox **Add Extra Condition** (solo para Radio/Equation). Mientras no está activo, el campo no se muestra; al desactivarlo se limpia el valor.
- El texto ingresado (campo `extraCondition`) se agrega con `&` **solo a la rama positiva** del SAS, nunca a la negación del skip logic. Por eso es una opción separada y no puede ir dentro de Skip Logic.

Ejemplo con Skip Logic `Q13 in(1:7)`, opciones `1:8` y Extra Condition `Q13~=Q14`:

```sas
if (Q13 in(1:7)) & (Q14 in (1:8)) & (Q13~=Q14) then Q14_final="T    ";
else if ~(Q13 in(1:7)) & Q14="" then Q14_final="T    ";
else Q14_final="WRONG";
```

Sin Skip Logic:

```sas
if (Q14 in (1:8)) & (Q13~=Q14) then Q14_final="T    ";
else Q14_final="WRONG";
```

### 6.2 Demo Refusals por pregunta

Antes, las Demo Refusals se escribían a mano al final, en la tarjeta de Data Codes (`Title[QCode|punch],...`), repitiendo q-codes ya definidos. Ahora cada tarjeta tiene un checkbox **Demo Refusal**:

| Tipo | Campos | Qué genera `Output.js` |
|---|---|---|
| Radio/Equation | Refusal Title + Refusal Punch(es) | `QCode in (punch)` usando el q-code de la tarjeta |
| Multiple Choice | Refusal Title + Refusal Sub-Q | Variable `QCode_SubQ` con valor fijo `1` (ej. `D300_9 in (1)`) |
| Array | Refusal Title + Refusal Punch(es) | Una fila por subpregunta (`Q20a`, `Q20b`, ...) con el mismo punch; títulos `Title_a`, `Title_b`, ... |
| Custom Code | Demo Refusals (texto libre `Title1[QCode|99],Title2[QCode|6,9]`) | Mismo formato de antes, pensado para templates con varios códigos (ej. G1) |

Campos nuevos en el objeto de pregunta: `demoRefusalTitle`, `demoRefusalPunch`, `demoRefusalSubQ` (y `demoRefusals` pasa a usarse solo en Custom Code).

Implementación en `Output.js`:

1. Antes del loop principal se hace un **pre-escaneo** de todas las tarjetas que arma una lista `demoRefusalItems` (`{ titleText, questionNumber, answerOptions }`), sin importar el orden de las tarjetas.
2. Después del loop principal, si la lista no está vacía, se genera el reporte "Demo Refusals Summary" con el mismo código de salida de antes. **No depende de la tarjeta Language Q Code**: las refusals aparecen en cuanto se guarda cada pregunta. El orden final es siempre: chequeos de duplicados y fechas → chequeo de idioma (si hay tarjeta) → refusals.
3. El parseo de subpreguntas de Array se extrajo a la función `parseArraySubcodes`, reutilizada por la generación del Array y por el pre-escaneo. Los sufijos con skip logic entre corchetes (`a[...]`) se limpian para nombrar la variable.

Restricciones conocidas:

- En Array el punch de refusal es el mismo para todas las subpreguntas; si una subpregunta necesita otro punch, hay que declararla vía Custom Code.
- En MCQ se admite una sola subpregunta de refusal por tarjeta.
- Los nombres generados (`QCode_SubQ`, `QCode+subq`) deben respetar el límite de 32 caracteres de SAS.

### 6.3 Data Codes → Language Q Code

- El tipo `datacodes` se muestra ahora como **Language Q Code** (la clave interna `datacodes` no cambia).
- Se eliminó su campo de Demo Refusals; solo queda el Language Q Code.
- La tarjeta solo aporta el chequeo de idioma (`Language Check`).
- Los chequeos de duplicados (token/ID) y el "Submit Date Summary" se generan **siempre, en todos los proyectos**, una sola vez, aunque no exista la tarjeta.
- El reporte de Demo Refusals tampoco depende de esta tarjeta.
- Los botones dicen **Add Language Q Code** / **Update Language Q Code**.

### 6.4 Confirmación en Clear All

`clearStorageHandler` (`App.js`) pide confirmación con `window.confirm('Are you sure?')` antes de borrar el cuestionario de `localStorage`.

### 6.5 Correcciones de layout

- **Botón Add Question/Save Question:** estaba en `position: absolute; bottom: 1rem` y se superponía a los campos cuando el formulario crecía. Ahora está en flujo normal (`display: flex; justify-content: center`) en `NewQuestion.module.css` y `EditQuestion.module.css`.
- **Editor Monaco (Custom SAS Code):** `.Editor` era absoluto con altura en porcentaje y había una regla global `label[for='custom']` en `App.css` que movía el label. Se eliminó esa regla; el editor tiene altura fija (`12rem`) en flujo normal y el grupo ocupa las dos columnas con el label arriba (`TextInput.module.css`).
- **Advertencia ResizeObserver:** al poner el editor en flujo normal, Monaco dispara `ResizeObserver loop completed with undelivered notifications`, que el overlay de desarrollo de CRA mostraba como error bloqueante. Se silencia con un listener en `public/index.html` (debe estar ahí para ejecutarse antes que el overlay). Es una advertencia inofensiva y no afecta producción.

## 7. Correcciones y observaciones de interfaz

- Los controles de movimiento se muestran mediante `opacity` al pasar el cursor sobre la tarjeta.
- Los controles están diferenciados de las acciones existentes de editar y eliminar.
- La tarjeta conserva su contenido y acciones actuales.
- Se aumentó el espacio entre tarjetas para evitar solapamiento visual.
- El área de la lista debe revisarse en pantallas pequeñas, porque los controles posicionados lateralmente necesitan espacio horizontal suficiente.

## 8. Persistencia actual

El cuestionario continúa guardándose en `localStorage`. Desde la 1.2 cada pregunta puede incluir además `extraCondition`, `demoRefusalTitle`, `demoRefusalPunch` y `demoRefusalSubQ`; las preguntas guardadas con versiones anteriores siguen funcionando porque `Output.js` trata esos campos como vacíos si no existen.

- Agregar una pregunta actualiza la lista local.
- Editar una pregunta actualiza la posición correspondiente.
- Eliminar una pregunta persiste la lista resultante.
- Reordenar preguntas guarda inmediatamente el nuevo orden.
- Insertar/duplicar una pregunta guarda el nuevo arreglo.
- `Clear All` pide confirmación, elimina la clave `questions` y recarga la página.

`localStorage` no es una base de datos segura: puede ser eliminado, alterado o quedar corrupto. Esto debe considerarse una solución local/provisional.

## 9. Verificación realizada y pendientes

### Verificación realizada (1.1)

- Se identificó y corrigió el error runtime del selector de tipos de pregunta.
- Se revisó visualmente el problema de `Move Down` y se ajustó su posición CSS.
- Se añadieron los handlers y props necesarios para mover y duplicar tarjetas.
- Se mantuvo la compatibilidad del parser con formatos de opciones simples.

### Verificación realizada (1.2)

Probado en el navegador con `pnpm start` y en producción:

- Extra Condition con y sin Skip Logic; al desmarcar se elimina del SAS; se recarga correctamente al editar.
- Demo Refusals con el ejemplo de G1: Radio (`Party[P1Y|4]`), MCQ (`Race` → `D300_9|1`), Array (`Q20` con `a:c` → 3 filas) y Custom Code (`YearBorn[D101|9999],Hispanic[D301|3]`); el reporte final coincide con el formato anterior.
- Modo edición carga checkbox y valores de Demo Refusal.
- Sin superposiciones del botón en Radio, MCQ, Array y Custom Code; el editor Monaco queda debajo de su label; Expand/Minimize funcionan.
- `pnpm run build` compila sin errores (solo advertencias de lint ya existentes) y el despliegue en GitHub Pages sirve la nueva versión.

### Pendientes antes de considerar estable la versión 1.2

1. Validar en SAS real el reporte de Demo Refusals generado para MCQ y Array.
2. Probar en el navegador el botón **Yes** de la confirmación de Clear All (en las pruebas automatizadas solo se pudo verificar el caso **Cancel**).
3. Revisar el layout de la tarjeta en pantallas pequeñas con los nuevos checkboxes.

### Pendientes heredados de la versión 1.1

1. Ejecutar `pnpm start` y recorrer la aplicación en el navegador.
2. Crear varias tarjetas y verificar `Move Up`, `Move Down` y `+ Insert`.
3. Confirmar que el orden se conserva después de recargar la página.
4. Probar el redimensionamiento de la lista y del área de salida.
5. Generar SAS para un MCQ con `9[pMode=1]`.
6. Generar SAS para Radio/Equation con `1[SplitAB=1], 2, 3[SplitAB=2]`.
7. Probar las combinaciones con `skipLogic`, `pMode`, `otherCode` y opciones exclusivas.
8. Ejecutar `pnpm build` y corregir cualquier error de compilación.
9. Revisar advertencias de React relacionadas con claves, efectos y mutación de estado.
10. Validar el código generado en un entorno SAS real o con una revisión del equipo que mantiene la lógica SAS.
11. Probar login, logout, expiración y renovación de tokens.
12. Revisar accesibilidad: navegación con teclado, foco visible, etiquetas y botones.

## 10. Deuda técnica pendiente

- **Formularios duplicados:** `NewQuestion.js` y `EditQuestion.js` son casi idénticos (~1100 líneas cada uno); cualquier cambio debe replicarse en ambos. Conviene unificarlos en un solo componente.
- **Estado mutable a nivel de módulo:** el arreglo `textInputs` se muta con `splice`/`push` en cada render para mostrar u ocultar campos según el tipo. Es frágil; debería derivarse del estado en cada render.
- **Clase `undefined`:** `TextInput.js` concatena `Styles[props.groupClass]`, que es `undefined` para casi todos los grupos (solo existe `.Group-3`). Es inofensivo pero conviene limpiarlo.

- **Persistencia:** migrar el cuestionario de `localStorage` a una API o almacenamiento persistente con validación.
- **Autenticación:** revisar completamente la protección de rutas, expiración y renovación de tokens.
- **Estado:** evitar mutaciones directas de arreglos y objetos dentro de los handlers de React.
- **Identificadores:** reemplazar la generación aleatoria simple del duplicado por un identificador garantizado como único.
- **Validación:** validar códigos de pregunta, expresiones SAS, corchetes, rangos y condiciones antes de generar código.
- **Parser SAS:** separar el parser y los compiladores de cada tipo de pregunta en funciones o módulos testeables.
- **Pruebas:** agregar pruebas unitarias para cada formato de entrada y pruebas de integración del flujo completo.
- **Dependencias:** evaluar una migración desde React 17 y Create React App a una configuración soportada actualmente.
- **Calidad:** corregir comparaciones laxas, posibles mutaciones del estado y efectos con dependencias incompletas.
- **Accesibilidad:** revisar los `id` repetidos en tarjetas y la interacción de controles que solo aparecen con `hover`.
- **Producción:** establecer una validación completa en modo producción antes de desplegar.

## 11. Flujo Git y despliegue

Cada versión vive en su propia rama creada desde la anterior (`version-1.1` → `version-1.2`), y `main` conserva la versión original.

```powershell
git switch -c version-1.2
git add <archivos>
git commit -m "feat: ..."
git push -u origin version-1.2
```

Despliegue a GitHub Pages (desde la rama que se quiera publicar):

```powershell
pnpm run deploy
```

`deploy` ejecuta `predeploy` (`pnpm run build`) y luego `gh-pages -d build`, que publica la carpeta `build` en la rama `gh-pages`. El sitio se actualiza en 1–2 minutos en https://ingelecsebas.github.io/Sassify/ (usa Ctrl+F5 si el navegador muestra la versión anterior).

Opcional, después de validar:

```powershell
git tag -a v1.2.0 -m "Sassify versión 1.2.0"
git push origin v1.2.0
```

El merge hacia `main` debe hacerse únicamente después de completar la validación y revisar el diff final.
