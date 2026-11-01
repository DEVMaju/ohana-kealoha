# Site da Família Kealoha: como colocar na Vercel

O site agora tem servidor de verdade: as fichas ficam num banco de dados online e as senhas são guardadas com criptografia, então todo mundo vê as mesmas fichas e cada membro só edita a própria.

## 1. Subir o projeto
Como o MP3 tem mais de 25 MB, não dá para arrastar pelo site do GitHub. Use uma destas opções:
- **GitHub Desktop** (ou `git push`): crie um repositório com o conteúdo desta pasta e, na Vercel, clique em *Add New → Project* e importe o repositório.
- **Vercel CLI**: `npm i -g vercel`, depois `vercel` dentro desta pasta (e `vercel --prod` para publicar).

## 2. Criar o banco de dados (grátis)
No projeto da Vercel: *Storage → Create Database → Upstash (Redis)* e conecte ao projeto. Isso cria sozinho as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN` (o site também aceita `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`).

## 3. Definir a senha da criadora
*Settings → Environment Variables* → crie `ADMIN_PASSWORD` com a senha que você quiser (opcional: `SESSION_SECRET` com um texto longo aleatório). Depois faça um *Redeploy*.

**Para trocar ou resetar a senha da criadora:** mude o valor de `ADMIN_PASSWORD` e faça *Redeploy*.

## 4. Usar
- Criadora: 🔑 Acesso → Criadora → sua senha. Edita e remove qualquer ficha e cria NPCs.
- Editar o site (só criadora): nas páginas **Início** e **História** aparece o botão **✏️ Editar esta página**. Na História dá para adicionar, remover e reordenar os marcos da linha do tempo e os símbolos do brasão. Se nunca editar, valem os textos de exemplo do `app.js`.
- Nomes repetidos: o site não aceita duas fichas com o mesmo nome (maiúsculas, acentos e espaços extras não contam como diferença).
- Membros: criam a ficha em "Enviar ficha" com uma senha própria e depois entram por 🔑 Acesso para editar a qualquer momento (não podem excluir).
- Se um membro esquecer a senha: abra a ficha dele como criadora, vá em Editar e preencha "Nova senha".

## Testar no computador
`vercel dev` dentro da pasta (precisa das variáveis acima: `vercel env pull`). Abrir o `index.html` direto no navegador não funciona mais, porque as fichas dependem do servidor.
