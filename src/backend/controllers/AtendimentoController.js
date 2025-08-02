// Controller responsável por gerenciar a lógica de negócio dos atendimentos
// Este controller recebe as requisições das rotas, chama o model e retorna respostas formatadas para o frontend.
const AtendimentoModel = require('../models/AtendimentoModel');

class AtendimentoController {
  constructor() {
    this.atendimentoModel = new AtendimentoModel();
  }

  // Função pura para formatar a resposta da API
  static formatResponse(success, data = null, message = '', errors = []) {
    return {
      success,
      data,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  // Função pura para formatar a data para exibição
  static formatDateForDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  // Função pura para formatar o objeto atendimento para resposta
  static formatAtendimentoResponse(atendimento) {
    if (!atendimento) return null;
    
    return {
      ...atendimento,
      data: AtendimentoController.formatDateForDisplay(atendimento.data)
    };
  }

  // Busca todos os atendimentos
  async getAllAtendimentos(req, res) {
    try {
      const atendimentos = await this.atendimentoModel.findAll();
      const formattedAtendimentos = atendimentos.map(AtendimentoController.formatAtendimentoResponse);
      
      res.json(AtendimentoController.formatResponse(
        true,
        formattedAtendimentos,
        'Atendimentos retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getAllAtendimentos:', error);
      res.status(500).json(AtendimentoController.formatResponse(
        false,
        null,
        'Error retrieving atendimentos',
        [error.message]
      ));
    }
  }

  // Busca um atendimento pelo ID
  async getAtendimentoById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(AtendimentoController.formatResponse(
          false,
          null,
          'Invalid ID parameter',
          ['ID must be a valid number']
        ));
      }

      const atendimento = await this.atendimentoModel.findById(parseInt(id));
      
      if (!atendimento) {
        return res.status(404).json(AtendimentoController.formatResponse(
          false,
          null,
          'Atendimento not found'
        ));
      }

      const formattedAtendimento = AtendimentoController.formatAtendimentoResponse(atendimento);
      
      res.json(AtendimentoController.formatResponse(
        true,
        formattedAtendimento,
        'Atendimento retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getAtendimentoById:', error);
      res.status(500).json(AtendimentoController.formatResponse(
        false,
        null,
        'Error retrieving atendimento',
        [error.message]
      ));
    }
  }

  // Cria um novo atendimento
  async createAtendimento(req, res) {
    try {
      const atendimentoData = req.body;
      const newAtendimento = await this.atendimentoModel.create(atendimentoData);
      const formattedAtendimento = AtendimentoController.formatAtendimentoResponse(newAtendimento);
      
      res.status(201).json(AtendimentoController.formatResponse(
        true,
        formattedAtendimento,
        'Atendimento created successfully'
      ));
    } catch (error) {
      console.error('Error in createAtendimento:', error);
      
      if (error.message.includes('Validation failed')) {
        return res.status(400).json(AtendimentoController.formatResponse(
          false,
          null,
          'Validation error',
          [error.message]
        ));
      }
      
      res.status(500).json(AtendimentoController.formatResponse(
        false,
        null,
        'Error creating atendimento',
        [error.message]
      ));
    }
  }

  // Atualiza um atendimento existente
  async updateAtendimento(req, res) {
    try {
      const { id } = req.params;
      const atendimentoData = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(AtendimentoController.formatResponse(
          false,
          null,
          'Invalid ID parameter',
          ['ID must be a valid number']
        ));
      }

      const updatedAtendimento = await this.atendimentoModel.update(parseInt(id), atendimentoData);
      
      if (!updatedAtendimento) {
        return res.status(404).json(AtendimentoController.formatResponse(
          false,
          null,
          'Atendimento not found'
        ));
      }

      const formattedAtendimento = AtendimentoController.formatAtendimentoResponse(updatedAtendimento);
      
      res.json(AtendimentoController.formatResponse(
        true,
        formattedAtendimento,
        'Atendimento updated successfully'
      ));
    } catch (error) {
      console.error('Error in updateAtendimento:', error);
      
      if (error.message.includes('Validation failed')) {
        return res.status(400).json(AtendimentoController.formatResponse(
          false,
          null,
          'Validation error',
          [error.message]
        ));
      }
      
      res.status(500).json(AtendimentoController.formatResponse(
        false,
        null,
        'Error updating atendimento',
        [error.message]
      ));
    }
  }

  // Exclui um atendimento pelo ID
  async deleteAtendimento(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(AtendimentoController.formatResponse(
          false,
          null,
          'Invalid ID parameter',
          ['ID must be a valid number']
        ));
      }

      const deletedAtendimento = await this.atendimentoModel.delete(parseInt(id));
      
      if (!deletedAtendimento) {
        return res.status(404).json(AtendimentoController.formatResponse(
          false,
          null,
          'Atendimento not found'
        ));
      }

      res.json(AtendimentoController.formatResponse(
        true,
        { id: deletedAtendimento.id },
        'Atendimento deleted successfully'
      ));
    } catch (error) {
      console.error('Error in deleteAtendimento:', error);
      res.status(500).json(AtendimentoController.formatResponse(
        false,
        null,
        'Error deleting atendimento',
        [error.message]
      ));
    }
  }
}

module.exports = AtendimentoController;
