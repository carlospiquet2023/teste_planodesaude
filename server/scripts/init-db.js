const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const database = require('../config/database');
require('dotenv').config();

const dbDir = path.resolve(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

async function initDatabase() {
  try {
    await database.connect();

    console.log('Criando tabelas...');

    // Tabela de usuários admin
    await database.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de clientes/leads
    await database.run(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        age INTEGER,
        dependents INTEGER DEFAULT 0,
        city TEXT,
        state TEXT,
        interested_plan TEXT,
        status TEXT DEFAULT 'novo',
        source TEXT DEFAULT 'chat',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de conversas
    await database.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        session_id TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'active',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);

    // Tabela de mensagens
    await database.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `);

    // Tabela de simulações
    await database.run(`
      CREATE TABLE IF NOT EXISTS simulations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        conversation_id INTEGER,
        plan_type TEXT NOT NULL,
        dependents INTEGER DEFAULT 0,
        total_value REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
      )
    `);

    // Tabela de configurações do chat
    await database.run(`
      CREATE TABLE IF NOT EXISTS chat_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de conteúdo editável do site
    await database.run(`
      CREATE TABLE IF NOT EXISTS site_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL,
        element_key TEXT UNIQUE NOT NULL,
        element_type TEXT NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de planos de preços
    await database.run(`
      CREATE TABLE IF NOT EXISTS pricing_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        original_price REAL,
        features TEXT NOT NULL,
        is_featured INTEGER DEFAULT 0,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de configurações gerais do site
    await database.run(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabelas criadas com sucesso!');

    // Criar admin padrão
    const adminExists = await database.get('SELECT * FROM admins WHERE username = ?', [process.env.ADMIN_USERNAME || 'admin']);
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      await database.run(
        'INSERT INTO admins (username, password, email) VALUES (?, ?, ?)',
        [process.env.ADMIN_USERNAME || 'admin', hashedPassword, 'admin@vendas.com']
      );
      console.log('✅ Usuário admin criado com sucesso!');
      console.log(`Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
      console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
      console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    } else {
      console.log('ℹ️  Usuário admin já existe');
    }

    // Inserir configurações padrão
    const configs = [
      { key: 'greeting_message', value: 'Olá! Sou a Iara, assistente virtual da VendaPlano. Como posso ajudar você hoje?' },
      { key: 'business_hours', value: '{"start": "08:00", "end": "18:00", "days": [1,2,3,4,5]}' },
      { key: 'auto_response_enabled', value: 'true' }
    ];

    for (const config of configs) {
      const exists = await database.get('SELECT * FROM chat_config WHERE key = ?', [config.key]);
      if (!exists) {
        await database.run('INSERT INTO chat_config (key, value) VALUES (?, ?)', [config.key, config.value]);
      }
    }

    console.log('✅ Configurações padrão inseridas!');

    // Inserir conteúdo padrão do site
    const siteContent = [
      { section: 'hero', element_key: 'hero_title_line1', element_type: 'text', value: 'IMAGINE', description: 'Hero - Título linha 1' },
      { section: 'hero', element_key: 'hero_title_line2', element_type: 'text', value: 'Sua Família', description: 'Hero - Título linha 2' },
      { section: 'hero', element_key: 'hero_title_line3', element_type: 'text', value: 'COMPLETAMENTE', description: 'Hero - Título linha 3 (destaque)' },
      { section: 'hero', element_key: 'hero_title_line4', element_type: 'text', value: 'PROTEGIDA', description: 'Hero - Título linha 4' },
      { section: 'hero', element_key: 'hero_subtitle', element_type: 'html', value: '<strong>PARE</strong> de adiar o que é <span class="underline-gradient">ESSENCIAL</span>...<br><strong>SINTA</strong> a tranquilidade de ter o <span class="highlight-yellow">MELHOR atendimento</span>...<br><strong>GARANTA</strong> proteção <span class="highlight-green">IMEDIATA</span> para quem você <strong>AMA</strong>', description: 'Hero - Subtítulo' },
      { section: 'hero', element_key: 'hero_badge', element_type: 'text', value: 'Mais de 50.000 vidas PROTEGIDAS', description: 'Hero - Badge superior' },
      { section: 'header', element_key: 'phone_number', element_type: 'text', value: '(11) 9 9999-9999', description: 'Telefone de contato' },
      { section: 'header', element_key: 'alert_spots', element_type: 'number', value: '7', description: 'Número de vagas disponíveis' },
      { section: 'header', element_key: 'alert_discount', element_type: 'text', value: '40% OFF', description: 'Desconto em destaque' },
      { section: 'benefits', element_key: 'benefit_1', element_type: 'text', value: '✅ Aprovação em 24h', description: 'Benefício 1' },
      { section: 'benefits', element_key: 'benefit_2', element_type: 'text', value: '💰 Economia de até 40%', description: 'Benefício 2' },
      { section: 'benefits', element_key: 'benefit_3', element_type: 'text', value: '🏥 Cobertura COMPLETA + VIP', description: 'Benefício 3' },
      { section: 'benefits', element_key: 'benefit_4', element_type: 'text', value: '🤝 Atendimento 24h/7dias', description: 'Benefício 4' },
    ];

    for (const content of siteContent) {
      const exists = await database.get('SELECT * FROM site_content WHERE element_key = ?', [content.element_key]);
      if (!exists) {
        await database.run(
          'INSERT INTO site_content (section, element_key, element_type, value, description) VALUES (?, ?, ?, ?, ?)',
          [content.section, content.element_key, content.element_type, content.value, content.description]
        );
      }
    }

    // Inserir planos de preço padrão
    const pricingPlans = [
      {
        name: 'Plano Individual',
        price: 299.90,
        original_price: 499.90,
        features: JSON.stringify(['Cobertura nacional', 'Atendimento 24h', 'Carência reduzida', 'Telemedicina inclusa']),
        is_featured: 0,
        display_order: 1
      },
      {
        name: 'Plano Familiar',
        price: 599.90,
        original_price: 999.90,
        features: JSON.stringify(['Até 4 dependentes', 'Cobertura nacional', 'Urgência sem carência', 'Reembolso de consultas', 'Desconto em farmácias']),
        is_featured: 1,
        display_order: 2
      },
      {
        name: 'Plano Empresarial',
        price: 449.90,
        original_price: 749.90,
        features: JSON.stringify(['A partir de 2 vidas', 'Cobertura completa', 'Gestão simplificada', 'Telemedicina ilimitada']),
        is_featured: 0,
        display_order: 3
      }
    ];

    for (const plan of pricingPlans) {
      const exists = await database.get('SELECT * FROM pricing_plans WHERE name = ?', [plan.name]);
      if (!exists) {
        await database.run(
          'INSERT INTO pricing_plans (name, price, original_price, features, is_featured, display_order) VALUES (?, ?, ?, ?, ?, ?)',
          [plan.name, plan.price, plan.original_price, plan.features, plan.is_featured, plan.display_order]
        );
      }
    }

    // Inserir configurações do site
    const siteSettings = [
      { key: 'site_name', value: 'VIDA PREMIUM' },
      { key: 'site_tagline', value: 'Planos de Saúde Premium' },
      { key: 'whatsapp_number', value: '5511999999999' },
      { key: 'support_email', value: 'contato@vidapremium.com.br' },
      { key: 'countdown_enabled', value: 'true' },
      { key: 'chat_enabled', value: 'true' },
    ];

    for (const setting of siteSettings) {
      const exists = await database.get('SELECT * FROM site_settings WHERE key = ?', [setting.key]);
      if (!exists) {
        await database.run(
          'INSERT INTO site_settings (key, value) VALUES (?, ?)',
          [setting.key, setting.value]
        );
      }
    }

    console.log('✅ Conteúdo padrão do site inserido!');
    console.log('\n🎉 Banco de dados inicializado com sucesso!');
    console.log('\nPróximos passos:');
    console.log('1. Execute: npm start');
    console.log('2. Acesse o painel admin em: http://localhost:3000/admin');
    console.log('3. Faça login com as credenciais padrão\n');

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
  } finally {
    await database.close();
  }
}

initDatabase();
