// Arquivo principal do servidor Express do sistema de atendimento psicossocial
// Responsável por inicializar middlewares, rotas, tratamento de erros e conexão com o banco de dados.
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importa o banco de dados e as rotas
const Database = require('./src/backend/database/database');
const AtendimentoRoutes = require('./src/backend/routes/atendimentoRoutes');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.database = new Database();
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  // Inicializa os middlewares da aplicação
  initializeMiddlewares() {
    // Configuração do CORS
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Middleware para parse do corpo das requisições
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Servir arquivos estáticos da pasta public
    this.app.use(express.static(path.join(__dirname, 'public')));

    // Middleware de log das requisições
    this.app.use(this.requestLogger);
  }

  // Função pura para logar as requisições recebidas
  requestLogger(req, res, next) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  }

  // Inicializa as rotas da API
  initializeRoutes() {
    // Rota de verificação de saúde (health check)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Sistema de Atendimento Psicossocial'
      });
    });

    // Rotas da API de atendimento
    const atendimentoRoutes = new AtendimentoRoutes();
    this.app.use('/atendimentos', atendimentoRoutes.getRouter());
    this.app.use('/atendimento', atendimentoRoutes.getRouter());

    // Servir o arquivo HTML principal na rota raiz
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Handler 404 para rotas desconhecidas
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        timestamp: new Date().toISOString()
      });
    });
  }

  // Inicializa o middleware de tratamento de erros
  initializeErrorHandling() {
    // Handler global de erros
    this.app.use((error, req, res, next) => {
      console.error('Handler global de erro:', error);
      
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        errors: [error.message || 'Algo deu errado'],
        timestamp: new Date().toISOString()
      });
    });
  }

  // Inicializa o banco de dados e inicia o servidor
  async start() {
    try {
      // Inicializa as tabelas do banco de dados
      await this.database.initializeTables();
      console.log('Banco de dados inicializado com sucesso');

      // Inicia o servidor
      this.app.listen(this.port, () => {
        console.log(`🚀 Servidor rodando na porta ${this.port}`);
        console.log(`📱 Acesse a aplicação em: http://localhost:${this.port}`);
        console.log(`🏥 Sistema de Atendimento Psicossocial pronto!`);
      });
    } catch (error) {
      console.error('Falha ao iniciar o servidor:', error);
      process.exit(1);
    }
  }

  // Finalização graciosa do servidor
  async shutdown() {
    try {
      await this.database.close();
      console.log('Conexão com o banco de dados encerrada');
      process.exit(0);
    } catch (error) {
      console.error('Erro ao finalizar o servidor:', error);
      process.exit(1);
    }
  }
}

// Create server instance and start
const server = new Server();

// Handle process termination
process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());

// Start the server
server.start().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

module.exports = Server;
