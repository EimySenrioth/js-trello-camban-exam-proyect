# js-trello-camban-exam-proyect

Gestión de Tareas CRUD

Crear tareas: Formulario completo con validación
Leer tareas: Visualización en columnas por estado
Actualizar tareas: Edición en línea de tareas existentes
Eliminar tareas: Con confirmación

Estados de Tareas

Pendiente: Tareas por comenzar
En Progreso: Tareas que se están ejecutando
Terminada: Tareas completada

 Campos de Tarea

 Título: Nombre descriptivo (3-100 caracteres)
Descripción: Detalles de la tarea (10-500 caracteres)
Estado: Pendiente, En Progreso o Terminada
Responsable: Persona asignada (2-50 caracteres)
Prioridad: Alta, Media o Baja
Timestamps: Fecha de creación y última actualización

 Funcionalidades de Interfaz

 Drag & Drop (Arrastrar y Soltar)

Arrastra tareas entre columnas para cambiar su estado
Indicadores visuales durante el arrastre
Actualización automática en el servidor
Feedback visual con animaciones suaves

Sistema de Filtros

Por Responsable: Filtra tareas por persona asignada
Por Prioridad: Filtra por nivel de prioridad (Alta/Media/Baja)
Por Estado: Filtra por estado actual de la tarea
Limpiar Filtros: Botón para resetear todos los filtros

Modo Oscuro/Claro

Alternancia entre temas claro y oscuro
Preferencia guardada en sessionStorage
Aplicación automática al recargar la página

 Contadores en Tiempo Real

Muestra el número de tareas en cada columna
Actualización automática al mover o filtrar tareas

Arquitectura Técnica

 API y Conectividad

Servidor Principal: Conexión con json-server en http://localhost:3000/tareas
Modo Offline: Datos de ejemplo cuando no hay conexión al servidor
Manejo de Errores: Recuperación automática y notificaciones de error
Operaciones Asíncronas: Todas las operaciones CRUD son asíncronas

Validación de Datos

Campo obligatorio

 Seguridad

Escape HTML: Prevención de inyección XSS
Validación del lado del cliente: Verificación de datos antes del envío
Sanitización de entrada: Limpieza de datos de formulario

Experiencia de Usuario

Sistema de Notificaciones

Éxito: Confirmación de operaciones exitosas
Error: Alertas de problemas con detalles
Advertencia: Notificaciones de estado del servidor
Auto-ocultado: Desaparecen automáticamente después de 3 segundos

 Indicadores de Carga

 Loading overlay durante operaciones de red
Posicionamiento centrado con fondo semitransparente
Prevención de interacciones durante la carga

Interacciones

Edición in-place: Clic en el botón de editar para modificar tareas
Confirmación de eliminación: Modal de seguridad antes de eliminar
Navegación por teclado: Soporte para tecla Escape para cerrar modales
Scroll automático: El formulario se desplaza a la vista al editar

Estados y Persistencia

Gestión de Estado Local

Copia local de tareas para rendimiento optimizado
Sincronización con servidor en tiempo real
Recuperación automática ante fallos de conexión

Funciones Principales de las Clases

// Operaciones CRUD con el servidor
- getAllTasks()      // Obtener todas las tareas
- createTask()       // Crear nueva tarea
- updateTask()       // Actualizar tarea existente
- deleteTask()       // Eliminar tarea
- loadInitialData()  // Carga inicial con fallback

// Gestión de interfaz y lógica de negocio
- renderTasks()      // Renderizar tareas en el DOM
- createTaskCard()   // Crear elementos de tarea
- filterTasks()      // Aplicar filtros
- moveTask()         // Mover tareas entre estados
- setupDragAndDrop() // Configurar arrastrar y soltar
- toggleTheme()      // Cambiar tema
- showNotification() // Mostrar notificaciones

Flujo de Trabajo

Inicialización: Conexión al servidor y carga de datos
Renderizado: Organización de tareas por estado
Interacción: Creación, edición y eliminación de tareas
Sincronización: Actualización automática con el servidor
Feedback: Notificaciones y actualizaciones visuales

 Características de Rendimiento

Carga asíncrona: Operaciones no bloqueantes
Actualización eficiente: Solo re-renderiza cuando es necesario
Gestión de memoria: Limpieza automática de event listeners


Requisitos Técnicas

Frontend: JavaScript ES6+, HTML5, CSS3
Backend: json-server corriendo en puerto 3000
Navegador: Soporte para Drag & Drop API
Conexión: Funciona offline con datos de ejemplo

Paleta de Colores
Tema Claro

Dark Slate: #3F4F59 - Texto principal y elementos de contraste
Sage Green: #AAC27F - Elementos de naturaleza y responsables
Teal: #148BA6 - Color principal de la aplicación
Light Teal: #1FAFBF - Variante clara del teal para hover
Orange: #F26B1D - Alertas y prioridades altas
Grises: #ffffff, #f4f5f7, #ddd - Fondos y bordes

Tema Oscuro

Dark Primary: #1a1a2e - Fondo principal
Dark Secondary: #2c2c54 - Elementos secundarios
Dark Accent: #ff4757 - Color de acento principal
Dark Accent Light: #ff6b7a - Variante clara del acento
Dark Silver: #e1e5e8 - Texto principal

Estructura Jerárquica

body
├── .header (Barra superior)
├── .container (Contenedor principal)
│   ├── .task-form (Formulario de tareas)
│   │   ├── .form-grid (Grid de formulario)
│   │   │   └── .form-group (Grupos de campos)
│   │   └── .form-actions (Botones de acción)
│   ├── .filters (Barra de filtros)
│   │   └── .filter-group (Grupos de filtros)
│   └── .board (Tablero Kanban)
│       └── .column (Columnas del tablero)
│           ├── .column-header (Encabezado de columna)
│           │   ├── .column-title
│           │   └── .task-count
│           └── .tasks-container (Contenedor de tareas)
│               └── .task-card (Tarjetas de tareas)
│                   ├── .task-header
│                   ├── .task-description
│                   └── .task-footer
│                       ├── .task-responsible
│                       └── .priority-badge
└── .modal (Ventana modal)
    └── .modal-content
        ├── .modal-header
        └── .modal-title

Funcionalidades Principales

 Sistema de Temas Dinámico

Tema Claro: Gradiente sage-green a teal con elementos translúcidos
Tema Oscuro: Paleta oscura con acentos rojos
Alternancia: Botón .theme-toggle en el header
Persistencia: Los estilos se aplican mediante la clase dark-theme en el body

Efectos Visuales
Glassmorphism (Cristal Esmerilado)

background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);

Aplicado a: formularios, columnas, modales y filtros
Crea profundidad visual con transparencias y desenfoque

Animaciones y Transiciones

slideIn: Animación de entrada para nuevas tareas
Hover Effects: Elevación y cambios de color en tarjetas
Focus States: Efectos visuales en campos de formulario
Modal Transitions: Aparición suave con escalado

 Sistema de Grid Responsivo
Desktop (>768px)

Board: Grid de 3 columnas iguales
Form: Grid de 2 columnas para campos
Filters: Disposición horizontal

Mobile (≤768px)

Board: Una sola columna
Form: Campos apilados verticalmente
Filters: Disposición vertical

Estados Interactivos

Hover con elevación (translateY(-1px))
Transiciones suaves (0.2s)
Cambios de color contextuales

Identificación Visual

Bordes laterales coloreados en tarjetas
Badges redondeados con tipografía bold
Colores consistentes entre temas

Drag & Drop Visual
Estados de Arrastre

.dragging: Opacidad reducida y rotación
.drop-zone: Área de destino con bordes punteados
.drop-zone.active: Estado activo con mayor visibilidad

Feedback Visual

Cambios de cursor (cursor: move)
Transiciones suaves durante el arrastre
Indicadores visuales claros para zonas válidas

Tipos de Notificación

Success: Verde (#10b981)
Error: Naranja (var(--orange))

Formularios

Estructura

Grid responsive de 2 columnas
Grupos de campos con labels semánticos
Clase .full-width para campos que ocupan toda la fila

Estados Interactivos

Focus con borde teal y sombra suave
Placeholders con opacidad reducida
Backgrounds translúcidos para integración visual

Layout

.full-width: Ocupa todo el ancho disponible
.form-grid: Grid de formulario responsive
.form-group: Contenedor de campo con label

Estados

.show: Hace visible modales y notificaciones
.active: Estado activo para drop-zones
.dragging: Estado de arrastre para tarjetas

Tecnologías CSS Utilizadas

CSS Grid & Flexbox: Layout moderno y responsive
CSS Custom Properties: Variables para temas dinámicos
Backdrop Filter: Efectos de cristal esmerilado
CSS Animations: Transiciones y animaciones fluidas
Media Queries: Responsive design
Pseudo-elementos: Estados hover y focus
Transform: Animaciones performantes