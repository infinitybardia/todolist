// Todo App JavaScript
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.editingId = null;
        
        this.initializeElements();
        this.loadTodos();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        // Form elements
        this.addForm = document.getElementById('addForm');
        this.todoInput = document.getElementById('todoInput');
        this.searchInput = document.getElementById('searchInput');
        
        // Filter elements
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // Display elements
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.statistics = document.getElementById('statistics');
        this.actionButtons = document.getElementById('actionButtons');
        
        // Statistics elements
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
        this.progressPercent = document.getElementById('progressPercent');
        this.progressFill = document.getElementById('progressFill');
        
        // Action buttons
        this.toggleAllBtn = document.getElementById('toggleAllBtn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
    }

    bindEvents() {
        // Add todo form
        this.addForm.addEventListener('submit', (e) => this.handleAddTodo(e));
        
        // Search input
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        
        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
        
        // Action buttons
        this.toggleAllBtn.addEventListener('click', () => this.toggleAll());
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    }

    handleAddTodo(e) {
        e.preventDefault();
        const text = this.todoInput.value.trim();
        
        if (text) {
            const todo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'medium'
            };
            
            this.todos.unshift(todo);
            this.todoInput.value = '';
            this.saveTodos();
            this.render();
            this.animateAdd();
        }
    }

    handleSearch(e) {
        this.searchTerm = e.target.value.toLowerCase();
        this.render();
    }

    handleFilter(e) {
        this.currentFilter = e.target.dataset.filter;
        
        // Update active filter button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.animateToggle(id);
        }
    }

    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            this.animateDelete(todoElement, () => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.render();
            });
        }
    }

    editTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.saveTodos();
            this.render();
        }
        this.editingId = null;
    }

    startEdit(id) {
        this.editingId = id;
        this.render();
        
        // Focus on the input after render
        setTimeout(() => {
            const editInput = document.querySelector(`[data-id="${id}"] .edit-input`);
            if (editInput) {
                editInput.focus();
                editInput.select();
            }
        }, 100);
    }

    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    toggleAll() {
        const allCompleted = this.todos.every(todo => todo.completed);
        this.todos.forEach(todo => {
            todo.completed = !allCompleted;
        });
        this.saveTodos();
        this.render();
        this.animateToggleAll();
    }

    clearCompleted() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        if (completedCount > 0) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
            this.animateClearCompleted();
        }
    }

    getFilteredTodos() {
        let filtered = this.todos;
        
        // Apply filter
        if (this.currentFilter === 'active') {
            filtered = filtered.filter(todo => !todo.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(todo => todo.completed);
        }
        
        // Apply search
        if (this.searchTerm) {
            filtered = filtered.filter(todo => 
                todo.text.toLowerCase().includes(this.searchTerm)
            );
        }
        
        return filtered;
    }

    updateStatistics() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const active = total - completed;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        this.totalCount.textContent = total;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;
        this.progressPercent.textContent = `${progress}%`;
        
        // Animate progress bar
        setTimeout(() => {
            this.progressFill.style.width = `${progress}%`;
        }, 100);
        
        // Show/hide statistics and action buttons
        this.statistics.style.display = total > 0 ? 'block' : 'none';
        this.actionButtons.style.display = total > 0 ? 'flex' : 'none';
        
        // Update toggle all button text
        this.toggleAllBtn.textContent = active === 0 ? 'Uncheck All' : 'Check All';
        
        // Update clear completed button
        if (completed > 0) {
            this.clearCompletedBtn.style.display = 'block';
            this.clearCompletedBtn.textContent = `Clear Completed (${completed})`;
        } else {
            this.clearCompletedBtn.style.display = 'none';
        }
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Update statistics
        this.updateStatistics();
        
        // Render todos
        if (filteredTodos.length === 0) {
            this.renderEmptyState();
        } else {
            this.renderTodoList(filteredTodos);
        }
    }

    renderEmptyState() {
        const emptyText = this.searchTerm ? 'No todos match your search' : 'No todos yet. Add one above!';
        this.emptyState.innerHTML = `
            <div class="empty-icon">📝</div>
            <div class="empty-text">${emptyText}</div>
        `;
        this.todoList.innerHTML = '';
        this.todoList.appendChild(this.emptyState);
    }

    renderTodoList(todos) {
        this.todoList.innerHTML = '';
        
        todos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            this.todoList.appendChild(todoElement);
        });
    }

    createTodoElement(todo) {
        const todoDiv = document.createElement('div');
        todoDiv.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoDiv.setAttribute('data-id', todo.id);
        
        if (this.editingId === todo.id) {
            todoDiv.innerHTML = this.createEditTemplate(todo);
        } else {
            todoDiv.innerHTML = this.createTodoTemplate(todo);
        }
        
        // Bind events
        this.bindTodoEvents(todoDiv, todo);
        
        return todoDiv;
    }

    createTodoTemplate(todo) {
        return `
            <div class="todo-content">
                <div class="checkbox ${todo.completed ? 'checked' : ''}" data-action="toggle">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="todo-text ${todo.completed ? 'completed' : ''}" data-action="edit">
                    ${this.escapeHtml(todo.text)}
                </div>
                <div class="todo-actions">
                    <div class="action-icon" data-action="edit" title="Edit todo">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </div>
                    <div class="action-icon" data-action="delete" title="Delete todo">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="todo-date">Created ${this.formatDate(todo.createdAt)}</div>
        `;
    }

    createEditTemplate(todo) {
        return `
            <div class="todo-content">
                <div class="checkbox ${todo.completed ? 'checked' : ''}" data-action="toggle">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <input 
                    type="text" 
                    class="edit-input" 
                    value="${this.escapeHtml(todo.text)}"
                    data-action="save"
                >
                <div class="todo-actions">
                    <div class="action-icon" data-action="save" title="Save">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <div class="action-icon" data-action="cancel" title="Cancel">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    }

    bindTodoEvents(todoElement, todo) {
        const toggleBtn = todoElement.querySelector('[data-action="toggle"]');
        const editBtn = todoElement.querySelector('[data-action="edit"]');
        const deleteBtn = todoElement.querySelector('[data-action="delete"]');
        const saveBtn = todoElement.querySelector('[data-action="save"]');
        const cancelBtn = todoElement.querySelector('[data-action="cancel"]');
        const editInput = todoElement.querySelector('.edit-input');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTodo(todo.id));
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => this.startEdit(todo.id));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const newText = editInput.value.trim();
                this.editTodo(todo.id, newText);
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEdit());
        }
        
        if (editInput) {
            editInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const newText = e.target.value.trim();
                    this.editTodo(todo.id, newText);
                } else if (e.key === 'Escape') {
                    this.cancelEdit();
                }
            });
            
            editInput.addEventListener('blur', () => {
                const newText = editInput.value.trim();
                this.editTodo(todo.id, newText);
            });
        }
    }

    // Animation methods
    animateAdd() {
        const todoItems = document.querySelectorAll('.todo-item');
        if (todoItems.length > 0) {
            const newItem = todoItems[0];
            newItem.style.opacity = '0';
            newItem.style.transform = 'translateY(-20px)';
            
            requestAnimationFrame(() => {
                newItem.style.transition = 'all 0.3s ease-out';
                newItem.style.opacity = '1';
                newItem.style.transform = 'translateY(0)';
            });
        }
    }

    animateToggle(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.style.transform = 'scale(0.98)';
            setTimeout(() => {
                todoElement.style.transform = 'scale(1)';
            }, 150);
        }
    }

    animateDelete(todoElement, callback) {
        todoElement.style.animation = 'slideOutDown 0.3s ease-out forwards';
        setTimeout(callback, 300);
    }

    animateToggleAll() {
        const todoItems = document.querySelectorAll('.todo-item');
        todoItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    item.style.transform = 'scale(1)';
                }, 100);
            }, index * 50);
        });
    }

    animateClearCompleted() {
        // Add a subtle animation to show completion
        document.body.style.transform = 'scale(0.99)';
        setTimeout(() => {
            document.body.style.transform = 'scale(1)';
        }, 200);
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Local storage methods
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        if (saved) {
            this.todos = JSON.parse(saved);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
