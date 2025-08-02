// Configuração e gerenciamento da conexão com o banco de dados PostgreSQL
// Esta classe centraliza a conexão, execução de consultas e inicialização das tabelas.
const { Pool } = require('pg');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
  }

  // Função pura para obter a instância do pool de conexões
  getPool() {
    return this.pool;
  }

  // Método para executar consultas SQL com tratamento de erros
  async query(text, params) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Inicializa as tabelas do banco de dados (cria se não existir)
  async initializeTables() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS atendimento (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        profissional TEXT NOT NULL,
        data DATE NOT NULL,
        tipo TEXT NOT NULL CHECK (tipo IN ('Psicológico', 'Pedagógico', 'Assistência Social')),
        observacoes TEXT
      );
    `;

    try {
      await this.query(createTableQuery);
      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw error;
    }
  }

  // Fecha a conexão com o banco de dados
  async close() {
    await this.pool.end();
  }
}

module.exports = Database;
