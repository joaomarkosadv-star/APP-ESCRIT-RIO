// Migração: cria as tabelas do módulo de conversas
// Execute com: node scripts/migrate-conversations.js

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const mysql = require('mysql2/promise')

async function migrate() {
  console.log('\n🔌 Conectando ao MySQL...')

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'escritorio_db',
  })

  try {
    console.log('📦 Criando tabela: conversations...')
    await connection.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(150) NOT NULL,
        description VARCHAR(300),
        created_by  INT NOT NULL,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('📦 Criando tabela: conversation_members...')
    await connection.query(`
      CREATE TABLE IF NOT EXISTS conversation_members (
        conversation_id INT NOT NULL,
        user_id         INT NOT NULL,
        added_by        INT NOT NULL,
        added_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id)         REFERENCES users(id),
        FOREIGN KEY (added_by)        REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('📦 Criando tabela: messages...')
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NOT NULL,
        user_id         INT NOT NULL,
        content         TEXT NOT NULL,
        created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id)         REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('\n✅ Migração concluída com sucesso!\n')
  } finally {
    await connection.end()
  }
}

migrate().catch(err => {
  console.error('\n❌ Erro na migração:', err.message, '\n')
  process.exit(1)
})
