-- ============================================
-- TABELAS DE AUDITORIA E SEGURANÇA
-- ============================================

-- Tabela de audit logs de segurança
CREATE TABLE IF NOT EXISTS security_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  details TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_security_audit_type (type),
  INDEX idx_security_audit_ip (ip),
  INDEX idx_security_audit_created (created_at)
);

-- Tabela de IPs bloqueados
CREATE TABLE IF NOT EXISTS ip_blacklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT UNIQUE NOT NULL,
  reason TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip_blacklist_ip (ip),
  INDEX idx_ip_blacklist_expires (expires_at)
);

-- Tabela de sessões de usuário (para tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER,
  token_hash TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  INDEX idx_user_sessions_admin (admin_id),
  INDEX idx_user_sessions_token (token_hash)
);
