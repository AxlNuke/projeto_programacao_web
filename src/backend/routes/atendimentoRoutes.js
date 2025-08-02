// Rotas para os endpoints de atendimento usando express.Router()
// Este módulo define as rotas REST para CRUD de atendimentos, conectando as requisições HTTP aos métodos do controller.
const express = require('express');
const AtendimentoController = require('../controllers/AtendimentoController');

class AtendimentoRoutes {
  constructor() {
    this.router = express.Router();
    this.atendimentoController = new AtendimentoController();
    this.initializeRoutes();
  }

  // Inicializa todas as rotas de atendimento
  initializeRoutes() {
    // GET /atendimentos - Buscar todos os atendimentos
    this.router.get('/', this.asyncHandler(
      this.atendimentoController.getAllAtendimentos.bind(this.atendimentoController)
    ));

    // GET /atendimento/:id - Buscar atendimento por ID
    this.router.get('/:id', this.asyncHandler(
      this.atendimentoController.getAtendimentoById.bind(this.atendimentoController)
    ));

    // POST /atendimento - Criar novo atendimento
    this.router.post('/', this.asyncHandler(
      this.atendimentoController.createAtendimento.bind(this.atendimentoController)
    ));

    // PUT /atendimento/:id - Atualizar atendimento
    this.router.put('/:id', this.asyncHandler(
      this.atendimentoController.updateAtendimento.bind(this.atendimentoController)
    ));

    // DELETE /atendimento/:id - Excluir atendimento
    this.router.delete('/:id', this.asyncHandler(
      this.atendimentoController.deleteAtendimento.bind(this.atendimentoController)
    ));
  }

  // Função pura - função de ordem superior para tratar rotas assíncronas
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Retorna o router configurado
  getRouter() {
    return this.router;
  }
}

module.exports = AtendimentoRoutes;
