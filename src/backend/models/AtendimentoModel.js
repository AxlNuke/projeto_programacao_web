// Model da entidade Atendimento seguindo princípios de Orientação a Objetos (OOP)
// Este módulo encapsula toda a lógica de acesso e manipulação dos dados de atendimento no banco PostgreSQL.
const Database = require('../database/database');

class AtendimentoModel {
  constructor() {
    this.db = new Database();
  }

  // Função pura para validar os dados do atendimento
  static validateAtendimentoData(data) {
    const { nome, profissional, data: dataAtendimento, tipo, observacoes } = data;
    const errors = [];

    if (!nome || nome.trim().length === 0) {
      errors.push('Nome é obrigatório');
    }

    if (!profissional || profissional.trim().length === 0) {
      errors.push('Profissional é obrigatório');
    }

    if (!dataAtendimento) {
      errors.push('Data é obrigatória');
    }

    const tiposValidos = ['Psicológico', 'Pedagógico', 'Assistência Social'];
    if (!tipo || !tiposValidos.includes(tipo)) {
      errors.push('Tipo deve ser: Psicológico, Pedagógico ou Assistência Social');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Função pura para sanitizar (limpar) os dados de entrada do atendimento
  static sanitizeAtendimentoData(data) {
    return {
      nome: data.nome ? data.nome.trim() : '',
      profissional: data.profissional ? data.profissional.trim() : '',
      data: data.data,
      tipo: data.tipo,
      observacoes: data.observacoes ? data.observacoes.trim() : ''
    };
  }

  // Busca todos os atendimentos cadastrados
  async findAll() {
    const query = `
      SELECT id, nome, profissional, data, tipo, observacoes 
      FROM atendimento 
      ORDER BY data DESC, id DESC
    `;
    
    try {
      const result = await this.db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching all atendimentos:', error);
      throw error;
    }
  }

  // Busca um atendimento pelo ID
  async findById(id) {
    const query = 'SELECT * FROM atendimento WHERE id = $1';
    
    try {
      const result = await this.db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching atendimento by ID:', error);
      throw error;
    }
  }

  // Cria um novo atendimento
  async create(atendimentoData) {
    const sanitizedData = AtendimentoModel.sanitizeAtendimentoData(atendimentoData);
    const validation = AtendimentoModel.validateAtendimentoData(sanitizedData);
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const query = `
      INSERT INTO atendimento (nome, profissional, data, tipo, observacoes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      sanitizedData.nome,
      sanitizedData.profissional,
      sanitizedData.data,
      sanitizedData.tipo,
      sanitizedData.observacoes
    ];

    try {
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating atendimento:', error);
      throw error;
    }
  }

  // Atualiza um atendimento existente
  async update(id, atendimentoData) {
    const sanitizedData = AtendimentoModel.sanitizeAtendimentoData(atendimentoData);
    const validation = AtendimentoModel.validateAtendimentoData(sanitizedData);
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const query = `
      UPDATE atendimento 
      SET nome = $1, profissional = $2, data = $3, tipo = $4, observacoes = $5
      WHERE id = $6
      RETURNING *
    `;
    
    const values = [
      sanitizedData.nome,
      sanitizedData.profissional,
      sanitizedData.data,
      sanitizedData.tipo,
      sanitizedData.observacoes,
      id
    ];

    try {
      const result = await this.db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating atendimento:', error);
      throw error;
    }
  }

  // Exclui um atendimento pelo ID
  async delete(id) {
    const query = 'DELETE FROM atendimento WHERE id = $1 RETURNING *';
    
    try {
      const result = await this.db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error deleting atendimento:', error);
      throw error;
    }
  }
}

module.exports = AtendimentoModel;
