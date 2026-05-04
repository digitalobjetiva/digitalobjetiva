import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, setup, id } = req.query;

  try {
    // SETUP INICIAL PREMIUM
    if (setup === 'true') {
      await sql`CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY, nome TEXT NOT NULL, whatsapp TEXT, status TEXT DEFAULT 'Novo', notas TEXT, valor_estimado DECIMAL(10,2), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`;
      await sql`CREATE TABLE IF NOT EXISTS servicos_catalogo (
        id SERIAL PRIMARY KEY, nome TEXT NOT NULL, preco_base DECIMAL(10,2), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`;
      await sql`CREATE TABLE IF NOT EXISTS atendimentos (
        id SERIAL PRIMARY KEY, cliente_nome TEXT NOT NULL, whatsapp TEXT, servico_nome TEXT, valor DECIMAL(10,2), status TEXT DEFAULT 'Finalizado', data_execucao DATE DEFAULT CURRENT_DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`;
      return res.status(200).json({ message: "ERP Premium configurado!" });
    }

    // --- LÓGICA DE LEADS ---
    if (type === 'leads') {
      if (req.method === 'GET') {
        const { rows } = await sql`SELECT * FROM leads ORDER BY created_at DESC;`;
        return res.status(200).json(rows);
      }
      if (req.method === 'POST') {
        const { nome, whatsapp, status, valor_estimado, notas } = req.body;
        await sql`INSERT INTO leads (nome, whatsapp, status, valor_estimado, notas) VALUES (${nome}, ${whatsapp}, ${status}, ${valor_estimado}, ${notas});`;
        return res.status(201).json({ message: "Lead criado!" });
      }
      if (req.method === 'DELETE') {
        await sql`DELETE FROM leads WHERE id = ${id};`;
        return res.status(200).json({ message: "Lead removido!" });
      }
    }

    // --- LÓGICA DE CATÁLOGO ---
    if (type === 'catalogo') {
      if (req.method === 'GET') {
        const { rows } = await sql`SELECT * FROM servicos_catalogo ORDER BY nome ASC;`;
        return res.status(200).json(rows);
      }
      if (req.method === 'POST') {
        const { nome, preco_base } = req.body;
        await sql`INSERT INTO servicos_catalogo (nome, preco_base) VALUES (${nome}, ${preco_base});`;
        return res.status(201).json({ message: "Serviço adicionado ao catálogo!" });
      }
    }

    // --- LÓGICA DE FATURAMENTO / ATENDIMENTOS ---
    if (type === 'atendimentos' || !type) {
      if (req.method === 'GET') {
        if (id) {
          const { rows } = await sql`SELECT * FROM atendimentos WHERE id = ${id} LIMIT 1;`;
          return res.status(200).json(rows[0]);
        }
        const { rows } = await sql`SELECT * FROM atendimentos ORDER BY data_execucao DESC;`;
        return res.status(200).json(rows);
      }
      if (req.method === 'POST') {
        const { cliente_nome, whatsapp, servico_nome, valor, data_execucao, status } = req.body;
        const result = await sql`
          INSERT INTO atendimentos (cliente_nome, whatsapp, servico_nome, valor, data_execucao, status)
          VALUES (${cliente_nome}, ${whatsapp}, ${servico_nome}, ${valor}, ${data_execucao}, ${status})
          RETURNING *;
        `;
        return res.status(201).json(result.rows[0]);
      }
    }

    // --- ESTATÍSTICAS PARA GRÁFICOS ---
    if (type === 'stats') {
      const faturamentoTotal = await sql`SELECT SUM(valor) as total FROM atendimentos WHERE status = 'Finalizado';`;
      const faturamentoMes = await sql`SELECT SUM(valor) as total FROM atendimentos WHERE status = 'Finalizado' AND data_execucao >= date_trunc('month', current_date);`;
      const leadsAtivos = await sql`SELECT COUNT(*) as count FROM leads WHERE status != 'Convertido' AND status != 'Perdido';`;
      
      const historicoMensal = await sql`
        SELECT to_char(data_execucao, 'Mon') as mes, SUM(valor) as total 
        FROM atendimentos 
        WHERE status = 'Finalizado' 
        GROUP BY mes, date_trunc('month', data_execucao) 
        ORDER BY date_trunc('month', data_execucao) DESC 
        LIMIT 6;
      `;

      return res.status(200).json({
        total: faturamentoTotal.rows[0].total || 0,
        mesAtual: faturamentoMes.rows[0].total || 0,
        leadsCount: leadsAtivos.rows[0].count || 0,
        grafico: historicoMensal.rows.reverse()
      });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
