class TaskAPI {
    constructor() {
        this.localURL = 'http://localhost:3000/tareas';
        this.tasks = [];
        this.useLocalAPI = true;
    }

    async getAllTasks() {
        try {
            const response = await fetch(this.localURL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.tasks = await response.json();
            return [...this.tasks];
        } catch (error) {
            console.error('Error al obtener las tareas:', error);
            throw new Error('Error al conectar con el servidor');
        }
    }

    async createTask(taskData) {
        try {
            const newTask = {
                ...taskData,
                createdAt: new Date().toISOString()
            };

            const response = await fetch(this.localURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const createdTask = await response.json();
            
            this.tasks.push(createdTask);
            
            return createdTask;
        } catch (error) {
            console.error('Error al crear la tarea:', error);
            throw new Error('Error al crear la tarea');
        }
    }

    async updateTask(id, taskData) {
        try {
            const updatedTask = {
                ...taskData,
                id: parseInt(id),
                updatedAt: new Date().toISOString()
            };

            const response = await fetch(`${this.localURL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            const index = this.tasks.findIndex(task => task.id == id);
            if (index !== -1) {
                this.tasks[index] = result;
            }
            
            return result;
        } catch (error) {
            console.error('Error al actualizar la tarea:', error);
            throw new Error('Error al actualizar la tarea');
        }
    }

    async deleteTask(id) {
        try {
            const response = await fetch(`${this.localURL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.tasks = this.tasks.filter(task => task.id != id);
            
            return true;
        } catch (error) {
            console.error('Error al eliminar la tarea:', error);
            throw new Error('Error al eliminar la tarea');
        }
    }

    async loadInitialData() {
        try {
            console.log('Conectando con json-server...');
            await this.getAllTasks();
            console.log(`✅ Conectado con json-server local - ${this.tasks.length} tareas cargadas`);
        } catch (error) {
            console.error('Error al conectar con json-server:', error);
            
            this.tasks = [
                {
                    id: 1,
                    titulo: 'Tarea de ejemplo 1',
                    descripcion: 'Esta es una tarea de ejemplo mientras no hay conexión con el servidor',
                    estado: 'pendiente',
                    responsable: 'Usuario',
                    prioridad: 'media',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    titulo: 'Tarea de ejemplo 2',
                    descripcion: 'Otra tarea de ejemplo',
                    estado: 'en progreso',
                    responsable: 'Usuario',
                    prioridad: 'alta',
                    createdAt: new Date().toISOString()
                }
            ];
            
            console.log('Cargadas tareas de ejemplo (sin conexión al servidor)');
            throw error;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class TaskManager {
    constructor() {
        this.api = new TaskAPI();
        this.currentFilter = { estado: '', responsable: '', prioridad: '' };
        this.editingTaskId = null;
        this.taskToDelete = null;
        this.draggedTask = null; 
        this.init();
    }

    async init() {
        try {
            await this.api.loadInitialData();
            await this.loadTasks();
            this.setupEventListeners();
            this.setupDragAndDrop();
            this.loadTheme();
        } catch (error) {
            this.showNotification('Servidor no disponible. Usando datos de ejemplo.', 'warning');
            this.renderTasks(this.api.tasks);
            this.setupEventListeners();
            this.setupDragAndDrop();
            this.loadTheme();
        }
    }

    async loadTasks() {
        try {
            this.showLoading();
            const tasks = await this.api.getAllTasks();
            this.renderTasks(tasks);
            this.updateFilters();
        } catch (error) {
            this.showNotification('Error al cargar las tareas', 'error');
            this.renderTasks(this.api.tasks);
        } finally {
            this.hideLoading();
        }
    }

    renderTasks(tasks = null) {
        const tasksToRender = tasks || this.api.tasks;
        const filteredTasks = this.filterTasks(tasksToRender);
        
        ['pendiente', 'en progreso', 'terminada'].forEach(estado => {
            const container = document.getElementById(`tasks-${estado}`);
            if (container) container.innerHTML = '';
        });

        const tasksByStatus = {
            'pendiente': filteredTasks.filter(task => task.estado === 'pendiente'),
            'en progreso': filteredTasks.filter(task => task.estado === 'en progreso'),
            'terminada': filteredTasks.filter(task => task.estado === 'terminada')
        };

        Object.entries(tasksByStatus).forEach(([estado, statusTasks]) => {
            const container = document.getElementById(`tasks-${estado}`);
            const countElement = document.getElementById(`count-${estado}`);
            
            if (countElement) countElement.textContent = statusTasks.length;
            
            if (container) {
                statusTasks.forEach(task => {
                    container.appendChild(this.createTaskCard(task));
                });
            }
        });

        this.setupDragAndDrop();
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = true;
        card.dataset.taskId = task.id;
        
        const priorityClass = task.prioridad || 'media';
        
        card.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${this.escapeHtml(task.titulo)}</h3>
                <div class="task-actions">
                    <button class="task-btn edit-btn" data-id="${task.id}" title="Editar">✏️</button>
                    <button class="task-btn delete-btn" data-id="${task.id}" title="Eliminar">🗑️</button>
                </div>
            </div>
            <p class="task-description">${this.escapeHtml(task.descripcion)}</p>
            <div class="task-footer">
                <span class="task-responsible">👤 ${this.escapeHtml(task.responsable)}</span>
                <span class="priority-badge priority-${priorityClass}">${priorityClass.toUpperCase()}</span>
            </div>
        `;

        card.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.editTask(task.id);
        });

        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDeleteConfirm(task.id);
        });

        return card;
    }

    filterTasks(tasks) {
        return tasks.filter(task => {
            const estadoMatch = !this.currentFilter.estado || task.estado === this.currentFilter.estado;
            const responsableMatch = !this.currentFilter.responsable || 
                task.responsable.toLowerCase().includes(this.currentFilter.responsable.toLowerCase());
            const prioridadMatch = !this.currentFilter.prioridad || task.prioridad === this.currentFilter.prioridad;
            
            return estadoMatch && responsableMatch && prioridadMatch;
        });
    }

    async createTask(taskData) {
        try {
            this.showLoading();
            await this.api.createTask(taskData);
            this.showNotification('Tarea creada exitosamente', 'success');
            await this.loadTasks();
            this.resetForm();
        } catch (error) {
            this.showNotification('Error al crear la tarea: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async updateTask(id, taskData) {
        try {
            this.showLoading();
            await this.api.updateTask(id, taskData);
            this.showNotification('Tarea actualizada exitosamente', 'success');
            await this.loadTasks();
            this.resetForm();
            this.editingTaskId = null;
        } catch (error) {
            this.showNotification('Error al actualizar la tarea: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async deleteTask(id) {
        try {
            this.showLoading();
            await this.api.deleteTask(id);
            this.showNotification('Tarea eliminada exitosamente', 'success');
            await this.loadTasks();
        } catch (error) {
            this.showNotification('Error al eliminar la tarea: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async moveTask(taskId, newState) {
        const task = this.api.tasks.find(t => t.id == taskId);
        if (!task || task.estado === newState) return;

        const originalState = task.estado;
        
        try {
            this.updateTaskStateInUI(taskId, newState);
            
            const updatedTask = { ...task, estado: newState };
            await this.api.updateTask(taskId, updatedTask);
            
            this.showNotification(`Tarea movida a "${newState}"`, 'success');
            
            setTimeout(() => this.renderTasks(), 500);
            
        } catch (error) {
            this.updateTaskStateInUI(taskId, originalState);
            console.error('Error al mover tarea:', error);
            this.showNotification('Error al mover la tarea', 'error');
        }
    }

    updateTaskStateInUI(taskId, newState) {
        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskCard) {
            taskCard.remove();
            
            const taskIndex = this.api.tasks.findIndex(t => t.id == taskId);
            if (taskIndex !== -1) {
                this.api.tasks[taskIndex].estado = newState;
                
                const newContainer = document.getElementById(`tasks-${newState}`);
                if (newContainer) {
                    newContainer.appendChild(this.createTaskCard(this.api.tasks[taskIndex]));
                }
            }
            
            this.updateColumnCounts();
        }
    }

    updateColumnCounts() {
        ['pendiente', 'en progreso', 'terminada'].forEach(estado => {
            const container = document.getElementById(`tasks-${estado}`);
            const countElement = document.getElementById(`count-${estado}`);
            
            if (container && countElement) {
                const count = container.children.length;
                countElement.textContent = count;
            }
        });
    }

    editTask(id) {
        const task = this.api.tasks.find(t => t.id == id);
        if (!task) return;

        const form = document.getElementById('taskForm');
        if (form) {
            document.getElementById('titulo').value = task.titulo;
            document.getElementById('descripcion').value = task.descripcion;
            document.getElementById('estado').value = task.estado;
            document.getElementById('responsable').value = task.responsable;
            document.getElementById('prioridad').value = task.prioridad || 'media';

            const submitBtn = document.getElementById('submitBtn');
            const cancelBtn = document.getElementById('cancelBtn');
            
            if (submitBtn) {
                submitBtn.textContent = 'Actualizar Tarea';
                submitBtn.className = 'btn btn-secondary';
            }
            
            if (cancelBtn) {
                cancelBtn.style.display = 'block';
            }

            this.editingTaskId = id;

            form.scrollIntoView({ behavior: 'smooth' });
        }
    }

    cancelEdit() {
        this.editingTaskId = null;
        this.resetForm();
    }

    showDeleteConfirm(id) {
        this.taskToDelete = id;
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    hideModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.taskToDelete = null;
    }

    async confirmDelete() {
        if (this.taskToDelete) {
            await this.deleteTask(this.taskToDelete);
            this.hideModal();
        }
    }

    resetForm() {
        const form = document.getElementById('taskForm');
        if (form) {
            form.reset();
            
            const submitBtn = document.getElementById('submitBtn');
            const cancelBtn = document.getElementById('cancelBtn');
            
            if (submitBtn) {
                submitBtn.textContent = 'Crear Tarea';
                submitBtn.className = 'btn btn-primary';
            }
            
            if (cancelBtn) {
                cancelBtn.style.display = 'none';
            }
            
            this.editingTaskId = null;
        }
    }

    updateFilters() {
        const responsables = [...new Set(this.api.tasks.map(task => task.responsable))];
        const select = document.getElementById('filterResponsible');
        
        if (select) {
            select.innerHTML = '<option value="">Todos los responsables</option>';
            responsables.forEach(responsable => {
                const option = document.createElement('option');
                option.value = responsable;
                option.textContent = responsable;
                select.appendChild(option);
            });
        }
    }

    applyFilters() {
        const responsableFilter = document.getElementById('filterResponsible');
        const prioridadFilter = document.getElementById('filterPriority');
        const estadoFilter = document.getElementById('filterStatus');

        this.currentFilter = {
            responsable: responsableFilter ? responsableFilter.value : '',
            prioridad: prioridadFilter ? prioridadFilter.value : '',
            estado: estadoFilter ? estadoFilter.value : ''
        };

        this.renderTasks();
    }

    clearFilters() {
        const filters = ['filterResponsible', 'filterPriority', 'filterStatus'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) element.value = '';
        });
        
        this.currentFilter = { estado: '', responsable: '', prioridad: '' };
        this.renderTasks();
    }

    setupDragAndDrop() {
        this.removeDragListeners();
        
        const columns = document.querySelectorAll('.tasks-container');
        const taskCards = document.querySelectorAll('.task-card');
        
        columns.forEach(column => {
            column.addEventListener('dragover', this.handleDragOver.bind(this));
            column.addEventListener('dragenter', this.handleDragEnter.bind(this));
            column.addEventListener('dragleave', this.handleDragLeave.bind(this));
            column.addEventListener('drop', this.handleDrop.bind(this));
        });

        taskCards.forEach(card => {
            card.addEventListener('dragstart', this.handleDragStart.bind(this));
            card.addEventListener('dragend', this.handleDragEnd.bind(this));
        });

        console.log(`Drag & Drop configurado para ${taskCards.length} tareas`);
    }

    handleDragStart(e) {
        if (e.target.classList.contains('task-card')) {
            this.draggedTask = e.target;
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
            e.dataTransfer.effectAllowed = 'move';
            
            setTimeout(() => {
                const columns = document.querySelectorAll('.tasks-container');
                columns.forEach(col => col.classList.add('drag-active'));
            }, 0);
        }
    }

    handleDragEnd(e) {
        if (e.target.classList.contains('task-card')) {
            e.target.classList.remove('dragging');
            this.draggedTask = null;
            
            const columns = document.querySelectorAll('.tasks-container');
            columns.forEach(col => {
                col.classList.remove('drag-active', 'drop-zone', 'active');
            });
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        if (e.currentTarget.classList.contains('tasks-container')) {
            e.currentTarget.classList.add('drop-zone', 'active');
        }
    }

    handleDragLeave(e) {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove('drop-zone', 'active');
        }
    }

    async handleDrop(e) {
        e.preventDefault();
        const column = e.currentTarget;
        column.classList.remove('drop-zone', 'active');
        
        const taskId = e.dataTransfer.getData('text/plain');
        const newState = column.id.replace('tasks-', '');
        
        if (taskId && newState) {
            console.log(`Moviendo tarea ${taskId} a estado: ${newState}`);
            await this.moveTask(taskId, newState);
        }
    }

    removeDragListeners() {
        const columns = document.querySelectorAll('.tasks-container');
        const taskCards = document.querySelectorAll('.task-card');
        
        columns.forEach(column => {
            column.classList.remove('drag-active', 'drop-zone', 'active');
        });
        
        taskCards.forEach(card => {
            card.classList.remove('dragging');
        });
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        const themeBtn = document.getElementById('themeToggle');
        
        if (themeBtn) {
            themeBtn.textContent = isDark ? ' Modo Claro' : 'Modo Oscuro';
        }
        
        sessionStorage.setItem('darkTheme', isDark);
    }

    loadTheme() {
        const isDark = sessionStorage.getItem('darkTheme') === 'true';
        if (isDark) {
            document.body.classList.add('dark-theme');
            const themeBtn = document.getElementById('themeToggle');
            if (themeBtn) {
                themeBtn.textContent = 'Modo Claro';
            }
        }
    }

    showNotification(message, type) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    showLoading() {
        const board = document.getElementById('task-board') || document.querySelector('.board');
        if (board && !document.querySelector('.loading')) {
            const loading = document.createElement('div');
            loading.className = 'loading';
            loading.innerHTML = 'Cargando...';
            loading.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 20px;
                border-radius: 8px;
                z-index: 1000;
                font-size: 16px;
            `;
            document.body.appendChild(loading);
        }
    }

    hideLoading() {
        const loading = document.querySelector('.loading');
        if (loading) loading.remove();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupEventListeners() {
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEdit());
        }

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        const filterResponsible = document.getElementById('filterResponsible');
        if (filterResponsible) {
            filterResponsible.addEventListener('change', () => this.applyFilters());
        }

        const filterPriority = document.getElementById('filterPriority');
        if (filterPriority) {
            filterPriority.addEventListener('change', () => this.applyFilters());
        }

        const filterStatus = document.getElementById('filterStatus');
        if (filterStatus) {
            filterStatus.addEventListener('change', () => this.applyFilters());
        }

        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearFilters());
        }

        const modalClose = document.getElementById('confirmCancel');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideModal());
        }

        const modalConfirm = document.getElementById('confirmDelete');
        if (modalConfirm) {
            modalConfirm.addEventListener('click', () => this.confirmDelete());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });

        const confirmModal = document.getElementById('confirmModal');
        if (confirmModal) {
            confirmModal.addEventListener('click', (e) => {
                if (e.target.id === 'confirmModal') {
                    this.hideModal();
                }
            });
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const taskData = {
            titulo: formData.get('titulo').trim(),
            descripcion: formData.get('descripcion').trim(),
            estado: formData.get('estado'),
            responsable: formData.get('responsable').trim(),
            prioridad: formData.get('prioridad') || 'media'
        };

        if (!this.validateTaskData(taskData)) {
            return;
        }

        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, taskData);
        } else {
            this.createTask(taskData);
        }
    }

    validateTaskData(data) {
        const errors = [];

        if (!data.titulo || data.titulo.length < 3) {
            errors.push('El título debe tener al menos 3 caracteres');
        }

        if (data.titulo && data.titulo.length > 100) {
            errors.push('El título no puede exceder 100 caracteres');
        }

        if (!data.descripcion || data.descripcion.length < 10) {
            errors.push('La descripción debe tener al menos 10 caracteres');
        }

        if (data.descripcion && data.descripcion.length > 500) {
            errors.push('La descripción no puede exceder 500 caracteres');
        }

        if (!data.responsable || data.responsable.length < 2) {
            errors.push('El responsable debe tener al menos 2 caracteres');
        }

        if (data.responsable && data.responsable.length > 50) {
            errors.push('El responsable no puede exceder 50 caracteres');
        }

        if (errors.length > 0) {
            this.showNotification('❌ ' + errors.join('. '), 'error');
            return false;
        }

        return true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TaskManager, TaskAPI };
}