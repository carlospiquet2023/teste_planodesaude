/**
 * 🔐 SISTEMA DE AUDITORIA DE SEGURANÇA
 * Monitora e registra atividades suspeitas
 */

const { logger } = require('../middleware/logger');
const database = require('../config/database');

class SecurityAudit {
  /**
   * Registra tentativa de acesso suspeita
   */
  static async logSuspiciousActivity(type, details, req = null) {
    const auditData = {
      type,
      timestamp: new Date().toISOString(),
      ip: req?.ip || 'unknown',
      userAgent: req?.get('user-agent') || 'unknown',
      path: req?.path,
      method: req?.method,
      ...details
    };

    // Log para Winston
    logger.warn('🚨 Atividade suspeita detectada', auditData);

    // Salvar no banco de dados para análise
    try {
      await database.run(
        `INSERT INTO security_audit (type, details, ip, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          type,
          JSON.stringify(auditData),
          auditData.ip,
          auditData.userAgent,
          auditData.timestamp
        ]
      );
    } catch (error) {
      logger.error('Erro ao salvar audit log', { error: error.message });
    }

    // Se for crítico, notificar admin (implementar webhook/email)
    if (this.isCritical(type)) {
      await this.notifyAdmin(auditData);
    }
  }

  /**
   * Verifica se evento é crítico
   */
  static isCritical(type) {
    const criticalEvents = [
      'SQL_INJECTION_ATTEMPT',
      'XSS_ATTEMPT',
      'BRUTE_FORCE_ATTACK',
      'UNAUTHORIZED_ACCESS',
      'MULTIPLE_FAILED_LOGINS'
    ];
    return criticalEvents.includes(type);
  }

  /**
   * Notifica administradores sobre eventos críticos
   */
  static async notifyAdmin(auditData) {
    // TODO: Implementar notificação por email/webhook
    logger.error('🚨 ALERTA CRÍTICO DE SEGURANÇA', auditData);
    
    // Exemplo: enviar para Slack, Discord, email, etc.
    // await sendToSlack(auditData);
    // await sendEmail(auditData);
  }

  /**
   * Detecta tentativas de SQL Injection
   */
  static detectSQLInjection(input) {
    const patterns = [
      /(\bOR\b|\bAND\b).*=.*=/i,
      /UNION.*SELECT/i,
      /DROP.*TABLE/i,
      /INSERT.*INTO/i,
      /UPDATE.*SET/i,
      /DELETE.*FROM/i,
      /--/,
      /;.*DROP/i,
      /'\s*OR\s*'1'\s*=\s*'1/i
    ];

    return patterns.some(pattern => pattern.test(input));
  }

  /**
   * Detecta tentativas de XSS
   */
  static detectXSS(input) {
    const patterns = [
      /<script[^>]*>.*<\/script>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\(/i,
      /alert\(/i,
      /document\.cookie/i
    ];

    return patterns.some(pattern => pattern.test(input));
  }

  /**
   * Monitora tentativas de login falhadas
   */
  static async trackFailedLogin(username, ip) {
    const key = `failed_login:${ip}:${username}`;
    
    // Buscar tentativas recentes (últimos 15 minutos)
    const recent = await database.all(
      `SELECT COUNT(*) as count FROM security_audit 
       WHERE type = 'FAILED_LOGIN' 
       AND ip = ? 
       AND created_at > datetime('now', '-15 minutes')`,
      [ip]
    );

    const count = recent[0]?.count || 0;

    // Se mais de 5 tentativas, registrar ataque de força bruta
    if (count >= 5) {
      await this.logSuspiciousActivity('BRUTE_FORCE_ATTACK', {
        username,
        attempts: count,
        message: 'Múltiplas tentativas de login falhadas'
      }, { ip });
    }
  }

  /**
   * Valida requisição suspeita
   */
  static async validateRequest(req) {
    const suspicious = [];

    // Verificar headers suspeitos
    const userAgent = req.get('user-agent');
    if (!userAgent || userAgent.length < 10) {
      suspicious.push('User-Agent suspeito ou ausente');
    }

    // Verificar tamanho da requisição
    const contentLength = req.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      suspicious.push('Requisição muito grande (possível DoS)');
    }

    // Verificar body por padrões maliciosos
    if (req.body) {
      const bodyStr = JSON.stringify(req.body);
      
      if (this.detectSQLInjection(bodyStr)) {
        suspicious.push('Tentativa de SQL Injection detectada');
        await this.logSuspiciousActivity('SQL_INJECTION_ATTEMPT', {
          body: req.body,
          path: req.path
        }, req);
      }

      if (this.detectXSS(bodyStr)) {
        suspicious.push('Tentativa de XSS detectada');
        await this.logSuspiciousActivity('XSS_ATTEMPT', {
          body: req.body,
          path: req.path
        }, req);
      }
    }

    return suspicious;
  }

  /**
   * Gera relatório de segurança
   */
  static async generateSecurityReport(days = 7) {
    const report = {
      period: `Últimos ${days} dias`,
      generated: new Date().toISOString(),
      summary: {}
    };

    // Total de eventos
    const total = await database.get(
      `SELECT COUNT(*) as count FROM security_audit 
       WHERE created_at > datetime('now', '-${days} days')`
    );
    report.summary.totalEvents = total.count;

    // Por tipo de evento
    const byType = await database.all(
      `SELECT type, COUNT(*) as count FROM security_audit 
       WHERE created_at > datetime('now', '-${days} days')
       GROUP BY type ORDER BY count DESC`
    );
    report.summary.byType = byType;

    // Top IPs suspeitos
    const topIPs = await database.all(
      `SELECT ip, COUNT(*) as count FROM security_audit 
       WHERE created_at > datetime('now', '-${days} days')
       GROUP BY ip ORDER BY count DESC LIMIT 10`
    );
    report.summary.topSuspiciousIPs = topIPs;

    // Eventos críticos
    const critical = await database.all(
      `SELECT * FROM security_audit 
       WHERE type IN ('SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT', 'BRUTE_FORCE_ATTACK')
       AND created_at > datetime('now', '-${days} days')
       ORDER BY created_at DESC LIMIT 50`
    );
    report.criticalEvents = critical;

    return report;
  }

  /**
   * Verifica se IP está na blacklist
   */
  static async isBlacklisted(ip) {
    const result = await database.get(
      'SELECT * FROM ip_blacklist WHERE ip = ? AND expires_at > datetime("now")',
      [ip]
    );
    return !!result;
  }

  /**
   * Adiciona IP à blacklist
   */
  static async blacklistIP(ip, reason, durationHours = 24) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);

    await database.run(
      `INSERT OR REPLACE INTO ip_blacklist (ip, reason, expires_at, created_at) 
       VALUES (?, ?, ?, ?)`,
      [ip, reason, expiresAt.toISOString(), new Date().toISOString()]
    );

    logger.warn(`IP bloqueado: ${ip}`, { reason, expiresAt });
  }
}

/**
 * Middleware de auditoria de segurança
 */
async function securityAuditMiddleware(req, res, next) {
  // Verificar se IP está na blacklist
  const blacklisted = await SecurityAudit.isBlacklisted(req.ip);
  if (blacklisted) {
    logger.warn(`Acesso bloqueado - IP na blacklist: ${req.ip}`);
    return res.status(403).json({
      success: false,
      error: 'Acesso negado'
    });
  }

  // Validar requisição
  const suspicious = await SecurityAudit.validateRequest(req);
  if (suspicious.length > 0) {
    logger.warn('Requisição suspeita detectada', {
      ip: req.ip,
      path: req.path,
      issues: suspicious
    });
    
    // Não bloquear automaticamente, apenas logar
    // (evita falsos positivos)
  }

  next();
}

module.exports = { SecurityAudit, securityAuditMiddleware };
