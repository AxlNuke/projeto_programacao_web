// Aplicação principal do frontend usando JavaScript moderno (funcional e OOP)
// Este arquivo gerencia toda a lógica de interface, requisições AJAX, manipulação de DOM e feedback ao usuário.
import '../css/styles.css';

// Pure functions for utility operations
const utils = {
  // Pure function to format date for input fields
  formatDateForInput: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  },

  // Pure function to format date for display
  formatDateForDisplay: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  },

  // Pure function to get tipo badge class
  getTipoBadgeClass: (tipo) => {
    const tipoMap = {
      'Psicológico': 'tipo-psicologico',
      'Pedagógico': 'tipo-pedagogico',
      'Assistência Social': 'tipo-social'
    };
    return tipoMap[tipo] || 'tipo-social';
  },

  // Pure function to validate form data
  validateFormData: (data) => {
    const errors = [];
    
    if (!data.nome || data.nome.trim().length === 0) {
      errors.push('Nome é obrigatório');
    }
    
    if (!data.profissional || data.profissional.trim().length === 0) {
      errors.push('Profissional é obrigatório');
    }
    
    if (!data.data) {
      errors.push('Data é obrigatória');
    }
    
    if (!data.tipo) {
      errors.push('Tipo de atendimento é obrigatório');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Pure function to sanitize form data
  sanitizeFormData: (formData) => {
    return {
      nome: formData.get('nome')?.trim() || '',
      profissional: formData.get('profissional')?.trim() || '',
      data: formData.get('data') || '',
      tipo: formData.get('tipo') || '',
      observacoes: formData.get('observacoes')?.trim() || ''
    };
  }
};

// API service class for handling HTTP requests
class ApiService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  // Generic method for making HTTP requests
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all atendimentos
  async getAllAtendimentos() {
    return this.makeRequest('/atendimentos');
  }

  // Get atendimento by ID
  async getAtendimentoById(id) {
    return this.makeRequest(`/atendimento/${id}`);
  }

  // Create new atendimento
  async createAtendimento(data) {
    return this.makeRequest('/atendimento', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Update atendimento
  async updateAtendimento(id, data) {
    return this.makeRequest(`/atendimento/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Delete atendimento
  async deleteAtendimento(id) {
    return this.makeRequest(`/atendimento/${id}`, {
      method: 'DELETE'
    });
  }
}

// UI Manager class for handling user interface operations
class UIManager {
  constructor() {
    this.messagesContainer = document.getElementById('messages');
    this.atendimentosContainer = document.getElementById('atendimentos-container');
    this.modal = document.getElementById('edit-modal');
  }

  // Show message to user
  showMessage(message, type = 'success', duration = 5000) {
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-info-circle';
    
    messageElement.innerHTML = `
      <i class="fas ${icon}"></i>
      <span>${message}</span>
    `;
    
    this.messagesContainer.appendChild(messageElement);
    
    // Auto-remove message after duration
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, duration);
  }

  // Clear all messages
  clearMessages() {
    this.messagesContainer.innerHTML = '';
  }

  // Show loading state
  showLoading(container, message = 'Carregando...') {
    container.innerHTML = `
      <div class="loading">
        <i class="fas fa-spinner"></i>
        <p>${message}</p>
      </div>
    `;
  }

  // Show empty state
  showEmptyState(container, message = 'Nenhum atendimento encontrado') {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h3>${message}</h3>
        <p>Cadastre o primeiro atendimento usando o formulário acima.</p>
      </div>
    `;
  }

  // Render single atendimento item
  renderAtendimentoItem(atendimento) {
    const tipoBadgeClass = utils.getTipoBadgeClass(atendimento.tipo);
    
    return `
      <div class="atendimento-item" data-id="${atendimento.id}">
        <div class="atendimento-header">
          <h3 class="atendimento-title">${atendimento.nome}</h3>
          <div class="atendimento-actions">
            <button class="btn btn-warning btn-edit" data-id="${atendimento.id}">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger btn-delete" data-id="${atendimento.id}">
              <i class="fas fa-trash"></i> Excluir
            </button>
          </div>
        </div>
        
        <div class="atendimento-info">
          <div class="info-item">
            <span class="info-label">Profissional:</span>
            <span class="info-value">${atendimento.profissional}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Data:</span>
            <span class="info-value">${atendimento.data}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Tipo:</span>
            <span class="tipo-badge ${tipoBadgeClass}">${atendimento.tipo}</span>
          </div>
        </div>
        
        ${atendimento.observacoes ? `
          <div class="atendimento-observacoes">
            <strong>Observações:</strong>
            <p>${atendimento.observacoes}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Render atendimentos list
  renderAtendimentosList(atendimentos) {
    if (!atendimentos || atendimentos.length === 0) {
      this.showEmptyState(this.atendimentosContainer);
      return;
    }

    const atendimentosHTML = atendimentos
      .map(atendimento => this.renderAtendimentoItem(atendimento))
      .join('');

    this.atendimentosContainer.innerHTML = `
      <div class="atendimentos-list">
        ${atendimentosHTML}
      </div>
    `;
  }

  // Show modal
  showModal() {
    this.modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  // Hide modal
  hideModal() {
    this.modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  // Preenche o formulário de edição com os dados do atendimento, garantindo que os campos existem e o DOM está pronto
  fillEditForm(atendimento) {
    // Aguarda o próximo ciclo do event loop para garantir que o DOM do modal está renderizado
    setTimeout(() => {
      const idField = document.getElementById('edit-id');
      const nomeField = document.getElementById('edit-nome');
      const profissionalField = document.getElementById('edit-profissional');
      const dataField = document.getElementById('edit-data');
      const tipoField = document.getElementById('edit-tipo');
      const observacoesField = document.getElementById('edit-observacoes');

      if (idField) idField.value = atendimento.id;
      if (nomeField) nomeField.value = atendimento.nome;
      if (profissionalField) profissionalField.value = atendimento.profissional;
      if (dataField) dataField.value = utils.formatDateForInput(atendimento.data);
      if (tipoField) tipoField.value = atendimento.tipo;
      if (observacoesField) observacoesField.value = atendimento.observacoes || '';
    }, 0);
  }

  // Clear form
  clearForm(formId) {
    document.getElementById(formId).reset();
  }
}

// Main application class
class AtendimentoApp {
  constructor() {
    this.apiService = new ApiService();
    this.uiManager = new UIManager();
    this.currentEditId = null;
    
    this.init();
  }

  // Initialize application
  init() {
    this.bindEvents();
    this.loadAtendimentos();
  }

  // Bind event listeners
  bindEvents() {
    // Main form submission
    document.getElementById('atendimento-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(e);
    });

    // Edit form submission
    document.getElementById('edit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEditFormSubmit(e);
    });

    // Modal controls
    document.getElementById('close-modal').addEventListener('click', () => {
      this.uiManager.hideModal();
    });

    document.getElementById('cancel-modal').addEventListener('click', () => {
      this.uiManager.hideModal();
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
      if (e.target === this.uiManager.modal) {
        this.uiManager.hideModal();
      }
    });

    // Delegate events for dynamic buttons
    this.uiManager.atendimentosContainer.addEventListener('click', (e) => {
      if (e.target.closest('.btn-edit')) {
        const id = e.target.closest('.btn-edit').getAttribute('data-id');
        this.handleEdit(id);
      } else if (e.target.closest('.btn-delete')) {
        const id = e.target.closest('.btn-delete').getAttribute('data-id');
        this.handleDelete(id);
      }
    });
  }

  // Handle main form submission
  async handleFormSubmit(event) {
    try {
      const formData = new FormData(event.target);
      const data = utils.sanitizeFormData(formData);
      
      // Validate data
      const validation = utils.validateFormData(data);
      if (!validation.isValid) {
        this.uiManager.showMessage(
          'Erro de validação: ' + validation.errors.join(', '), 
          'error'
        );
        return;
      }

      // Disable submit button
      const submitButton = event.target.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';

      // Create atendimento
      const result = await this.apiService.createAtendimento(data);
      
      if (result.success) {
        this.uiManager.showMessage('Atendimento cadastrado com sucesso!', 'success');
        this.uiManager.clearForm('atendimento-form');
        await this.loadAtendimentos();
      } else {
        throw new Error(result.message || 'Erro ao cadastrar atendimento');
      }
    } catch (error) {
      console.error('Error creating atendimento:', error);
      this.uiManager.showMessage(
        'Erro ao cadastrar atendimento: ' + error.message, 
        'error'
      );
    } finally {
      // Re-enable submit button
      const submitButton = event.target.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-save"></i> Cadastrar Atendimento';
    }
  }

  // Handle edit form submission
  async handleEditFormSubmit(event) {
    try {
      const formData = new FormData(event.target);
      const data = utils.sanitizeFormData(formData);
      const id = document.getElementById('edit-id').value;
      
      // Validate data
      const validation = utils.validateFormData(data);
      if (!validation.isValid) {
        this.uiManager.showMessage(
          'Erro de validação: ' + validation.errors.join(', '), 
          'error'
        );
        return;
      }

      // Disable submit button
      const submitButton = event.target.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

      // Update atendimento
      const result = await this.apiService.updateAtendimento(id, data);
      
      if (result.success) {
        this.uiManager.showMessage('Atendimento atualizado com sucesso!', 'success');
        this.uiManager.hideModal();
        await this.loadAtendimentos();
      } else {
        throw new Error(result.message || 'Erro ao atualizar atendimento');
      }
    } catch (error) {
      console.error('Error updating atendimento:', error);
      this.uiManager.showMessage(
        'Erro ao atualizar atendimento: ' + error.message, 
        'error'
      );
    } finally {
      // Re-enable submit button
      const submitButton = event.target.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
    }
  }

  // Handle edit button click
  async handleEdit(id) {
    try {
      // Mostra o modal imediatamente
      this.uiManager.showModal();
      // Mostra o loading na modal
      //this.uiManager.showLoading(document.querySelector('.modal-body'), 'Carregando dados...');

      // Busca os dados do atendimento
      const result = await this.apiService.getAtendimentoById(id);

      if (result.success) {
        // Remove o loading e exibe o formulário de edição
        // O HTML do formulário já está presente, então apenas preenche os campos
        // Para garantir, força o display do formulário
        const editForm = document.getElementById('edit-form');
        if (editForm) {
          editForm.style.display = '';
        }
        this.uiManager.fillEditForm(result.data);
      } else {
        throw new Error(result.message || 'Erro ao carregar atendimento');
      }
    } catch (error) {
      console.error('Error loading atendimento:', error);
      this.uiManager.showMessage(
        'Erro ao carregar atendimento: ' + error.message,
        'error'
      );
      this.uiManager.hideModal();
    }
  }

  // Handle delete button click
  async handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este atendimento?')) {
      return;
    }

    try {
      const result = await this.apiService.deleteAtendimento(id);
      
      if (result.success) {
        this.uiManager.showMessage('Atendimento excluído com sucesso!', 'success');
        await this.loadAtendimentos();
      } else {
        throw new Error(result.message || 'Erro ao excluir atendimento');
      }
    } catch (error) {
      console.error('Error deleting atendimento:', error);
      this.uiManager.showMessage(
        'Erro ao excluir atendimento: ' + error.message, 
        'error'
      );
    }
  }

  // Load all atendimentos
  async loadAtendimentos() {
    try {
      this.uiManager.showLoading(this.uiManager.atendimentosContainer);
      
      const result = await this.apiService.getAllAtendimentos();
      
      if (result.success) {
        this.uiManager.renderAtendimentosList(result.data);
      } else {
        throw new Error(result.message || 'Erro ao carregar atendimentos');
      }
    } catch (error) {
      console.error('Error loading atendimentos:', error);
      this.uiManager.showMessage(
        'Erro ao carregar atendimentos: ' + error.message, 
        'error'
      );
      this.uiManager.showEmptyState(
        this.uiManager.atendimentosContainer, 
        'Erro ao carregar atendimentos'
      );
    }
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AtendimentoApp();
});

// Handle uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
