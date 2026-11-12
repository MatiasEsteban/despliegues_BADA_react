/**
 * Fixtures deterministas del modo de captura visual (SPEC-001 / A-08.1).
 *
 * NO se importa de forma estática desde código de producción: dataStore y
 * workspaceStore lo cargan con `import()` dinámico solo cuando
 * `VITE_APP_FIXTURES === '1'` (build/mode `capture`). Sin `Date.now()` ni
 * aleatoriedad: capturas, axe y chequeos de overflow deben ser idénticos entre
 * ejecuciones. No hay red ni Firestore.
 *
 * Esquema tomado de `src/store/dataStore.js`, `src/services/firebaseData.js` y
 * `src/services/excelImporter.js`:
 *   workspace → { id, name, type, protected }
 *   version   → { id, numero, titulo, fuente, fechaCreacion, horaCreacion,
 *                 fechaDespliegue, horaDespliegue, estado, comentarios, cdus }
 *   comentarios → { mejoras, salidas, cambiosCaliente, observaciones, cambiosCDU }
 *   cdu       → { id, uuid, nombreCDU, descripcionCDU, estado, versionBADA,
 *                 versionMiro, responsables, observaciones, pasos, historial }
 *   paso      → { titulo, dificultad: 'Baja'|'Media'|'Alta',
 *                 version: 'V1'|'V2', completado: boolean }
 *   responsable → { nombre, rol: 'DEV'|'AF'|'UX'|'AN'|'QA' }
 *
 * Nota de esquema: `metricasBada` no existe como campo. La métrica BADA se
 * deriva de `cdu.pasos` (`BadaGraph`, `calculateVersionStats`), así que los
 * fixtures la ejercitan con pasos V1/V2 y dificultades, sin inventar campos.
 * El estado de producción real es `versionEnProduccionId`, no `version.estado`;
 * `estado` se mantiene porque `generateStats` lo consume.
 */

const WORKSPACE = Object.freeze({
    id: 'fixture-workspace',
    name: 'Workspace de captura',
    type: 'full',
    protected: true,
});

const step = (titulo, dificultad, version, completado) => ({
    titulo,
    dificultad,
    version,
    completado,
});

const createCdu = ({
    id,
    nombreCDU,
    descripcionCDU,
    estado,
    versionBADA = 'V1',
    versionMiro = '',
    responsables = [],
    observaciones = [],
    pasos = [],
    historial = [],
}) => ({
    id: `fixture-cdu-${id}`,
    uuid: `fixture-uuid-${id}`,
    nombreCDU,
    descripcionCDU,
    estado,
    versionBADA,
    versionMiro,
    responsables,
    observaciones,
    pasos,
    historial,
});

const comment = (id, texto, autor, cduNombre = '') => ({
    id: `fixture-comment-${id}`,
    texto,
    autor,
    cdu: cduNombre,
    ...(cduNombre ? { cduNombre } : {}),
});

/** Las 5 categorías reales de `normalizeComments` / `ChangelogEntriesModal`. */
const createComentarios = (versionNumber) => ({
    mejoras: [
        comment(
            `${versionNumber}-mejoras-1`,
            `Mejora sintética de la versión ${versionNumber} para capturas.`,
            'Equipo Fixture',
        ),
    ],
    salidas: [
        comment(
            `${versionNumber}-salidas-1`,
            `Salida a producción sintética de la versión ${versionNumber}.`,
            'Equipo Fixture',
        ),
    ],
    cambiosCaliente: [
        comment(
            `${versionNumber}-caliente-1`,
            `Cambio en caliente sintético de la versión ${versionNumber}.`,
            'Guardia Fixture',
        ),
    ],
    observaciones: [
        comment(
            `${versionNumber}-observaciones-1`,
            `Observación sintética de la versión ${versionNumber}, sin datos reales.`,
            'QA Fixture',
        ),
    ],
    cambiosCDU: [
        comment(
            `${versionNumber}-cdu-1`,
            `Cambio de CDU sintético de la versión ${versionNumber}.`,
            'Ana Fixture',
            'Alta de cuenta',
        ),
    ],
});

const createVersion1 = () => ({
    id: 'fixture-v1',
    numero: '3.1',
    titulo: 'Mejoras de accesibilidad',
    fuente: 'Release 3.1',
    fechaCreacion: '2026-04-06',
    horaCreacion: '10:00',
    fechaDespliegue: '2026-04-20',
    horaDespliegue: '17:30',
    estado: 'En Desarrollo',
    comentarios: createComentarios('3.1'),
    cdus: [
        createCdu({
            id: 'v1-alta-cuenta',
            nombreCDU: 'Alta de cuenta',
            descripcionCDU: 'Formulario de alta con validación accesible y mensajes de error.',
            estado: 'En Desarrollo',
            versionBADA: 'V1',
            versionMiro: 'V12',
            responsables: [
                { nombre: 'Ana Fixture', rol: 'UX' },
                { nombre: 'Leo Fixture', rol: 'DEV' },
            ],
            observaciones: ['Validar con teclado en claro y oscuro.'],
            pasos: [
                step('Analizar el flujo actual', 'Baja', 'V1', true),
                step('Diseñar el formulario accesible', 'Media', 'V1', true),
                step('Implementar validaciones', 'Media', 'V1', false),
            ],
        }),
        createCdu({
            id: 'v1-recuperar-clave',
            nombreCDU: 'Recuperar clave',
            descripcionCDU: 'Recuperación de clave con foco inicial y anuncios de estado.',
            estado: 'Pendiente de Certificacion',
            versionBADA: 'V1',
            versionMiro: 'V13',
            responsables: [{ nombre: 'Leo Fixture', rol: 'DEV' }],
            observaciones: [],
            pasos: [
                step('Revisar el correo de recuperación', 'Baja', 'V1', true),
                step('Probar el ciclo completo', 'Alta', 'V1', false),
            ],
        }),
    ],
});

const createVersion2 = () => ({
    id: 'fixture-v2',
    numero: '3.2',
    titulo: 'Panel de métricas',
    fuente: 'Release 3.2',
    fechaCreacion: '2026-06-01',
    horaCreacion: '08:45',
    fechaDespliegue: '2026-06-18',
    horaDespliegue: '19:05',
    estado: 'Pendiente de Certificacion',
    comentarios: createComentarios('3.2'),
    cdus: [
        createCdu({
            id: 'v2-metricas',
            nombreCDU: 'Panel de métricas',
            descripcionCDU: 'Resumen de progreso con gráficos y leyendas legibles.',
            estado: 'Pendiente de Certificacion',
            versionBADA: 'V2',
            versionMiro: 'V20',
            responsables: [
                { nombre: 'Ana Fixture', rol: 'AN' },
                { nombre: 'Leo Fixture', rol: 'DEV' },
            ],
            observaciones: ['Comprobar el contraste de las leyendas.'],
            pasos: [
                step('Definir indicadores', 'Media', 'V2', true),
                step('Construir el gráfico', 'Alta', 'V2', true),
                step('Validar los totales', 'Baja', 'V2', false),
                step('Revisar el contraste', 'Media', 'V2', false),
            ],
        }),
        createCdu({
            id: 'v2-notificaciones',
            nombreCDU: 'Notificaciones',
            descripcionCDU: 'Avisos no intrusivos con región viva y cierre accesible.',
            estado: 'Certificado OK',
            versionBADA: 'V1',
            versionMiro: 'V21',
            responsables: [{ nombre: 'Sofía Fixture', rol: 'QA' }],
            observaciones: [],
            pasos: [
                step('Definir los mensajes', 'Baja', 'V1', true),
                step('Anunciar los cambios', 'Media', 'V1', true),
            ],
        }),
    ],
});

const createVersion3 = () => ({
    id: 'fixture-v3',
    numero: '3.3',
    titulo: 'Historial de versiones',
    fuente: 'Release 3.3',
    fechaCreacion: '2026-07-20',
    horaCreacion: '09:30',
    fechaDespliegue: '2026-08-04',
    horaDespliegue: '18:15',
    estado: 'Certificado OK',
    comentarios: createComentarios('3.3'),
    cdus: [
        createCdu({
            id: 'v3-historial',
            nombreCDU: 'Historial de CDU',
            descripcionCDU: 'Consulta del historial con estados vacíos explicativos.',
            estado: 'Certificado OK',
            versionBADA: 'V2',
            versionMiro: 'V22',
            responsables: [
                { nombre: 'Sofía Fixture', rol: 'QA' },
                { nombre: 'Ana Fixture', rol: 'UX' },
            ],
            observaciones: ['El estado vacío debe indicar el siguiente paso.'],
            pasos: [
                step('Diseñar el historial', 'Media', 'V2', true),
                step('Implementar la consulta', 'Alta', 'V2', true),
                step('Certificar el flujo', 'Media', 'V2', true),
            ],
        }),
        createCdu({
            id: 'v3-exportacion',
            nombreCDU: 'Exportación de resumen',
            descripcionCDU: 'Exportación con opciones seleccionables por teclado.',
            estado: 'Certificado OK',
            versionBADA: 'V1',
            versionMiro: 'V23',
            responsables: [{ nombre: 'Leo Fixture', rol: 'DEV' }],
            observaciones: [],
            pasos: [
                step('Definir el formato', 'Baja', 'V1', true),
                step('Implementar la descarga', 'Media', 'V1', true),
            ],
        }),
    ],
});

const createVersion4 = () => ({
    id: 'fixture-v4',
    numero: '4.0',
    titulo: 'Portal de autogestión',
    fuente: 'Release 4.0',
    fechaCreacion: '2026-10-01',
    horaCreacion: '09:15',
    fechaDespliegue: '2026-10-15',
    horaDespliegue: '18:40',
    estado: 'En Produccion',
    comentarios: createComentarios('4.0'),
    cdus: [
        createCdu({
            id: 'v4-autogestion',
            nombreCDU: 'Autogestión de cuenta',
            descripcionCDU: 'Flujo completo de autogestión con estados y responsables visibles.',
            estado: 'En Produccion',
            versionBADA: 'V2',
            versionMiro: 'V30',
            responsables: [
                { nombre: 'Ana Fixture', rol: 'UX' },
                { nombre: 'Leo Fixture', rol: 'DEV' },
                { nombre: 'Sofía Fixture', rol: 'QA' },
            ],
            observaciones: ['Verificar el foco al abrir los modales.'],
            pasos: [
                step('Relevar el flujo', 'Baja', 'V2', true),
                step('Diseñar las pantallas', 'Media', 'V2', true),
                step('Implementar el flujo', 'Alta', 'V2', true),
                step('Certificar los estados', 'Media', 'V2', true),
                step('Medir el resultado', 'Baja', 'V2', false),
            ],
        }),
        createCdu({
            id: 'v4-notificaciones',
            nombreCDU: 'Centro de notificaciones',
            descripcionCDU: 'Bandeja con filtros y estados de lectura.',
            estado: 'Certificado OK',
            versionBADA: 'V1',
            versionMiro: 'V31',
            responsables: [{ nombre: 'Sofía Fixture', rol: 'QA' }],
            observaciones: [],
            pasos: [
                step('Definir filtros', 'Media', 'V1', true),
                step('Implementar la bandeja', 'Media', 'V1', true),
            ],
        }),
        createCdu({
            id: 'v4-facturacion',
            nombreCDU: 'Facturación',
            descripcionCDU: 'Consulta de comprobantes con importes y fechas normalizadas.',
            estado: 'En Desarrollo',
            versionBADA: 'V2',
            versionMiro: 'V32',
            responsables: [{ nombre: 'Leo Fixture', rol: 'DEV' }],
            observaciones: ['Pendiente de revisión de copy.'],
            pasos: [
                step('Relevar comprobantes', 'Media', 'V2', true),
                step('Construir la consulta', 'Alta', 'V2', false),
                step('Revisar los importes', 'Baja', 'V2', false),
            ],
        }),
    ],
});

/**
 * Devuelve una copia nueva y determinista del estado de captura.
 * @returns {{ workspace: object, versions: object[], versionEnProduccionId: string }}
 */
export function createFixtureState() {
    return {
        workspace: { ...WORKSPACE },
        versions: [
            createVersion1(),
            createVersion2(),
            createVersion3(),
            createVersion4(),
        ],
        versionEnProduccionId: 'fixture-v4',
    };
}
