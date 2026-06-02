# 🔐 Gestão Técnica - Digital Objetiva

Este documento contém as credenciais e configurações essenciais para a manutenção do ERP e do site oficial. Guarde este arquivo em local seguro.

---

## 🚀 Acessos Oficiais
- **Site Oficial:** [https://www.digitalobjetiva.shop](https://www.digitalobjetiva.shop)
- **Painel ERP:** [https://www.digitalobjetiva.shop/erp.html](https://www.digitalobjetiva.shop/erp.html)
- **Repositório GitHub:** `https://github.com/digitalobjetiva/digitalobjetiva` (Privado)

## 🔑 Credenciais Administrativas (ERP)
- **Usuário Admin:** `thiagodelgado`
- **Senha Padrão:** `52334353Tds@`
- **E-mail de Recuperação:** `digitalobjetiva@outlook.com`

## 🗄️ Infraestrutura e Banco de Dados
- **Hospedagem:** Vercel (Projeto: `digitalobjetiva`)
- **Banco de Dados:** Vercel Postgres (Serverless)
- **Tecnologias:** Node.js (API), HTML5/CSS3 Vanila, Chart.js (Dashboard), @vercel/postgres.

## 🛠️ Comandos de Manutenção
Sempre que precisar atualizar o banco de dados ou resetar configurações, utilize a URL de setup:
`https://www.digitalobjetiva.shop/api/registros?setup=true`

### Como realizar novos Deploys:
1. Abra o terminal na pasta do projeto.
2. Execute:
   ```bash
   git add .
   git commit -m "Descrição da sua atualização"
   git push origin main
   vercel deploy --prod
   ```

---
*Documento gerado automaticamente pela Antigravity em 04/05/2026.*
