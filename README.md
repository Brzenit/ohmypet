# Oh My Pet!

Protótipo do site do clube de assinatura pet: home animada, criador de pet, conta e assinatura simulada.

Feito com Vite, React, TypeScript e React Router. Contas, pets e assinaturas ficam no [Supabase](https://supabase.com).

## Rodar

```bash
npm install
```

```bash
npm run dev
```

O site abre em http://localhost:5173.

## Supabase

1. Rode `supabase/migrations/0001_oh_my_pet.sql` no SQL Editor do projeto. Ele cria as tabelas e as regras que deixam cada pessoa ver só os próprios dados.
2. Copie `.env.example` para `.env` e preencha a URL e a chave publicável (Project Settings > API).
3. No Cloudflare (Workers & Pages > ohmypet), cadastre as mesmas duas variáveis em Settings > Build > Variables and secrets e publique de novo. Elas precisam existir na hora do build, porque o Vite grava os valores no site.
4. Em Authentication > URL Configuration, coloque `https://ohmypet.ohmypet.workers.dev` em Site URL e adicione `http://localhost:5173/**` em Redirect URLs, para o link de confirmação de e-mail voltar para o site.

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

- A assinatura não tem pagamento.
- O texto de `/ongs` e parte de `/quem-somos` é lorem ipsum (`src/data/content.ts`).
- Os links do rodapé sem página ainda mostram o aviso "em produção".

### E-mail de confirmação personalizado

O modelo fica em `supabase/templates/confirmacao.html`, e as imagens dele em `public/email/` (precisam estar publicadas).

1. No Supabase, abra Authentication > Email Templates > Confirm signup.
2. Em Subject, use: `Falta só um passinho! Confirme sua conta 🐾`
3. Cole o conteúdo do arquivo no corpo (aba de código) e salve.
