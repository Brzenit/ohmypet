# Oh My Pet!

Protótipo do site do clube de assinatura pet: home animada, criador de pet, conta e assinatura simulada.

Feito com Vite, React, TypeScript e React Router. Os dados ficam no `db.json`, servido pelo json-server.

## Rodar

```bash
npm install
```

```bash
npm run dev
```

O site abre em http://localhost:5173 e a API em http://localhost:3001. O Vite encaminha `/api` para a API.

Outros comandos: `npm run build` (checa os tipos e gera o `dist/`) e `npm run typecheck`.

## Páginas

| Rota | O que é |
| --- | --- |
| `/` | Home: carrossel, produtos, conceito, como funciona, planos, depoimentos e dúvidas |
| `/crie-seu-pet` | Perfil do pet e personalização (pelagem, tipo, acessórios) |
| `/assinar` | Escolha de plano e pet, assinatura simulada (exige login) |
| `/conta` | Pets e assinaturas do usuário (exige login) |
| `/entrar` | Login e cadastro |
| `/ongs`, `/quem-somos` | Páginas de conteúdo |

## Limites do protótipo

- As senhas ficam em texto puro no `db.json` e a sessão é só um id no `localStorage`. Não use senhas reais nem publique assim.
- A assinatura não tem pagamento.
- O texto de `/ongs` e parte de `/quem-somos` é lorem ipsum (`src/data/content.ts`).
- Os links do rodapé sem página ainda mostram o aviso "em produção".
- Para zerar os dados, deixe as listas vazias no `db.json`.
