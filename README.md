# Bot RPG Runeterra — Tickets + Formulário

Este pacote já vem com:
- `/criar` → abre um **ticket privado** e inicia a **criação de personagem** por formulário (Modals).
- `/ficha` → mostra sua ficha salva (ephemeral).
- Salvamento em `data/personagens/<userId>.json`
- Ticket é apagado automaticamente após finalizar/cancelar (ou por timeout).

## 1) Requisitos
- Node.js 18+ (recomendado)
- Um bot criado no Discord Developer Portal, adicionado ao seu servidor com permissões de criar canais.

## 2) Instalação
```bash
npm install
```

## 3) Configuração
1. Edite `.env` e coloque seu token:
   - `DISCORD_TOKEN=...`
2. Edite `config/bot.json`:
   - `clientId`: ID da aplicação do bot
   - `guildId`: ID do seu servidor
   - `ticketCategoryId` (opcional): categoria onde os tickets serão criados
   - `ticketAutoDeleteMinutes`: minutos para apagar o ticket (padrão 10)

## 4) Registrar os comandos slash
```bash
npm run register:commands
```

## 5) Rodar o bot
```bash
npm start
```

## Como o fluxo funciona
1. Jogador usa `/criar`
2. Bot cria um canal privado `ticket-<nome>` com permissões só para o jogador e o bot
3. Bot envia mensagem com botão **Começar**
4. Jogador preenche 3 formulários (Modals)
5. Bot mostra o resumo e pede **Confirmar e salvar**
6. Salva a ficha e apaga o ticket (auto-delete)

## Próximas melhorias (se você quiser)
- Validar escolhas com listas (origens/raças/classes) do seu site
- Montar ficha com atributos (FOR/AGI/INT etc.)
- Exportar ficha em imagem/embeds bonitos
- Sistema de “aprovação” por narrador (ADM) antes de salvar

Boa diversão! 🐉

## Solução de problemas (ticket não abre)
Se aparece a mensagem do `/criar` mas o canal não é criado, quase sempre é permissão/configuração:

**1) Permissões do bot no servidor**
- O bot precisa de **Gerenciar Canais (Manage Channels)** e **Ver Canais (View Channels)**.
- Se você usa uma **categoria** pra tickets, o bot também precisa dessas permissões **na categoria**.

**2) ticketCategoryId**
- Se `ticketCategoryId` estiver preenchido em `config/bot.json`, verifique se:
  - é o ID de uma **Categoria** (não de um canal normal)
  - o bot tem permissão nessa categoria
- Teste deixando `ticketCategoryId` vazio para criar o ticket fora de categorias.

**3) Logs**
- Olhe o console onde o bot está rodando: erros de permissão aparecem lá.

## Importante (Categoria de tickets)
Se você **não** quiser usar uma categoria, deixe `ticketCategoryId` vazio em `config/bot.json`.
Se quiser, coloque o ID da categoria (17-20 dígitos). IDs inválidos quebram a criação do canal.

## Observação (Etapas)
O Discord não permite abrir outro formulário imediatamente após enviar um formulário. Por isso, após cada etapa você clica em um botão **Continuar** para abrir o próximo formulário.

## Comandos de Admin
- `/admin_fichas listar [pagina]` — lista fichas
- `/admin_fichas ver user_id:<id>` — ver ficha
- `/admin_fichas exportar` — exporta todas as fichas em `fichas-export.json`

## Retrato (Imagem)
Use o botão **Escolher retrato** durante a criação para selecionar um retrato.
Você pode editar a lista em `config/rpg.json` (campo `retratos`).

## RunePoints
O bot dá **RunePoints** automaticamente quando as pessoas conversam no chat e reagem em mensagens.
Config em `config/bot.json` → `runepoints` (pontos e cooldown anti-spam).

Comandos:
- `/perfil` — ver seus RunePoints
- `/rank` — top RunePoints
- `/admin_runepoints add/set` — (admin) ajustar RunePoints

## Retrato por link
No ticket, use **Retrato por link** e cole um link https de imagem (png/jpg/jpeg/gif/webp ou CDN do Discord).


### Admin (fichas)
- `/admin_fichas ver usuario:@alguem` — ver ficha do usuário (mais fácil)
- `/admin_fichas ver_id user_id:123...` — ver por ID numérico
- `/admin_fichas procurar nome:Akali` — procurar por nome do personagem


## Canal de criação
O comando `/criar` só funciona no canal definido em `config/bot.json` → `characterCreationChannelId`.
O bot envia uma mensagem de introdução nesse canal via **webhook** (uma única vez).

## Admin por cargo
Os comandos `admin_*` aparecem e funcionam apenas para quem tem permissão **Administrador** (Discord) ou, se você preencher `adminRoleId`, somente para quem possuir esse cargo.


## Mensagem de boas-vindas (DM)
Quando alguém entra no servidor, o bot tenta enviar uma DM estilizada com links do RPG e instruções.
Se não chegar, o usuário pode estar com DMs bloqueadas.
