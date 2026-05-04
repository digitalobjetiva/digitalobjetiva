import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, setup, id, login } = req.query;

  try {
    if (setup === 'true') {
      await sql`CREATE TABLE IF NOT EXISTS agentes (id SERIAL PRIMARY KEY, nome TEXT NOT NULL, email TEXT UNIQUE, senha TEXT NOT NULL, ativo BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;
      await sql`INSERT INTO agentes (nome, email, senha) VALUES ('Thiago Delgado', 'thiagodelgado', '52334353Tds@') ON CONFLICT (email) DO NOTHING;`;
      await sql`CREATE TABLE IF NOT EXISTS atendimentos (id SERIAL PRIMARY KEY, cliente_nome TEXT NOT NULL, whatsapp TEXT, servico_nome TEXT, valor DECIMAL(10,2), status TEXT DEFAULT 'Finalizado', data_execucao DATE DEFAULT CURRENT_DATE, agente_id INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;
      try { await sql`ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS agente_id INTEGER;`; } catch(e) {}
      try { await sql`ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS whatsapp TEXT;`; } catch(e) {}
      try { await sql`ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Finalizado';`; } catch(e) {}
      await sql`CREATE TABLE IF NOT EXISTS leads (id SERIAL PRIMARY KEY, nome TEXT NOT NULL, whatsapp TEXT, status TEXT DEFAULT 'Novo', notas TEXT, valor_estimado DECIMAL(10,2), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;
      return res.status(200).json({ message: "ERP Premium configurado!" });
    }

    if (login === 'true') {
      const { rows } = await sql`SELECT id, nome FROM agentes WHERE email = ${req.body.email} AND senha = ${req.body.password} AND ativo = TRUE LIMIT 1;`;
      if (rows.length > 0) return res.status(200).json({ success: true, user: rows[0] });
      return res.status(401).json({ success: false, message: "Credenciais inválidas" });
    }

    if (type === 'stats') {
      const faturamentoTotal = await sql`SELECT SUM(valor) as total FROM atendimentos WHERE status = 'Finalizado';`;
      const faturamentoMes = await sql`SELECT SUM(valor) as total FROM atendimentos WHERE status = 'Finalizado' AND data_execucao >= date_trunc('month', current_date);`;
      const leadsAtivos = await sql`SELECT COUNT(*) as count FROM leads WHERE status != 'Convertido' AND status != 'Perdido';`;
      const porAgente = await sql`SELECT ag.nome, SUM(a.valor) as total, COUNT(a.id) as quantidade FROM atendimentos a JOIN agentes ag ON a.agente_id = ag.id WHERE a.status = 'Finalizado' GROUP BY ag.nome;`;
      const historicoMensal = await sql`SELECT to_char(data_execucao, 'Mon') as mes, SUM(valor) as total FROM atendimentos WHERE status = 'Finalizado' GROUP BY mes, date_trunc('month', data_execucao) ORDER BY date_trunc('month', data_execucao) DESC LIMIT 6;`;
      return res.status(200).json({ total: faturamentoTotal.rows[0].total || 0, mesAtual: faturamentoMes.rows[0].total || 0, leadsCount: leadsAtivos.rows[0].count || 0, porAgente: porAgente.rows, grafico: historicoMensal.rows.reverse() });
    }

    if (type === 'atendimentos' || !type) {
      if (req.method === 'GET') {
        if (id) {
          const { rows } = await sql`SELECT a.*, ag.nome as agente_nome FROM atendimentos a LEFT JOIN agentes ag ON a.agente_id = ag.id WHERE a.id = ${id} LIMIT 1;`;
          return res.status(200).json(rows[0]);
        }
        const { rows } = await sql`SELECT a.*, ag.nome as agente_nome FROM atendimentos a LEFT JOIN agentes ag ON a.agente_id = ag.id ORDER BY data_execucao DESC;`;
        return res.status(200).json(rows);
      }
      if (req.method === 'POST') {
        const { cliente_nome, whatsapp, servico_nome, valor, data_execucao, status, agente_id } = req.body;
        const v_valor = parseFloat(valor) || 0;
        const v_data = data_execucao || new Date().toISOString().split('T')[0];
        const v_agente = parseInt(agente_id) || null;
        const result = await sql`INSERT INTO atendimentos (cliente_nome, whatsapp, servico_nome, valor, data_execucao, status, agente_id) VALUES (${cliente_nome}, ${whatsapp}, ${servico_nome}, ${v_valor}, ${v_data}, ${status || 'Finalizado'}, ${v_agente}) RETURNING *;`;
        return res.status(201).json(result.rows[0]);
      }
      if (req.method === 'PUT') {
        const { id, status } = req.body;
        await sql`UPDATE atendimentos SET status = ${status} WHERE id = ${id};`;
        return res.status(200).json({ message: "Status atualizado!" });
      }
    }

    if (type === 'leads') {
      if (req.method === 'GET') { const { rows } = await sql`SELECT * FROM leads ORDER BY created_at DESC;`; return res.status(200).json(rows); }
      if (req.method === 'POST') {
        const { nome, whatsapp, status, valor_estimado, notas } = req.body;
        await sql`INSERT INTO leads (nome, whatsapp, status, valor_estimado, notas) VALUES (${nome}, ${whatsapp}, ${status}, ${parseFloat(valor_estimado) || 0}, ${notas});`;
        return res.status(201).json({ message: "Lead criado!" });
      }
    }

    if (type === 'agentes') {
      if (req.method === 'GET') { const { rows } = await sql`SELECT id, nome, email, ativo FROM agentes ORDER BY nome ASC;`; return res.status(200).json(rows); }
      if (req.method === 'POST') {
        const { nome, email, senha } = req.body;
        await sql`INSERT INTO agentes (nome, email, senha) VALUES (${nome}, ${email}, ${senha});`;
        return res.status(201).json({ message: "Agente cadastrado!" });
      }
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
