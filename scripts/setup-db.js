// Script de configuração inicial do banco de dados
// Execute uma vez com: npm run setup-db

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

async function setup() {
  console.log('\n🔌 Conectando ao MySQL...')

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
  })

  try {
    const dbName = process.env.DB_NAME || 'escritorio_db'

    console.log(`📦 Criando banco de dados "${dbName}"...`)
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    await connection.query(`USE \`${dbName}\``)

    console.log('🗂️  Criando tabela de usuários...')
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        name          VARCHAR(150) NOT NULL,
        email         VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        profile       ENUM('administrador','advogado','financeiro','comercial','estagiario') NOT NULL,
        is_active     TINYINT(1) NOT NULL DEFAULT 1,
        created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('👤 Criando usuário administrador...')
    const adminHash = await bcrypt.hash('admin', 10)
    await connection.query(
      `INSERT IGNORE INTO users (name, email, password_hash, profile)
       VALUES (?, ?, ?, ?)`,
      ['João Marcos', 'joaomarkos@decarliadv.com.br', adminHash, 'administrador']
    )

    console.log('\n✅ Banco de dados configurado com sucesso!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('   Usuário: joaomarkos@decarliadv.com.br')
    console.log('   Senha:   admin')
    console.log('   Perfil:  Administrador')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } finally {
    await connection.end()
  }
}

setup().catch((err) => {
  console.error('\n❌ Erro ao configurar banco de dados:', err.message)
  console.error('   Verifique se o MySQL está rodando e se a senha no .env.local está correta.\n')
  process.exit(1)
})
