# Gerencial — Instruções para sessões Claude Code

## Regras obrigatórias antes de qualquer commit

1. **Sempre sincronize com o main mais recente antes de começar:**
   ```bash
   git fetch origin main
   git merge origin/main
   ```

2. **Nunca inclua arquivos não relacionados à sua tarefa no commit.**
   Use `git add <arquivo-específico>` — nunca `git add .` ou `git add -A`.

3. **Nunca sobrescreva arquivos de outros módulos via `push_files` do MCP GitHub.**
   A ferramenta `mcp__github__push_files` substitui arquivos diretamente via API,
   ignorando o mecanismo de merge do git. Inclua APENAS os arquivos que você alterou.

## Módulos e seus arquivos

| Módulo | Arquivo | Responsabilidade |
|---|---|---|
| Audiências | `audiencias/index.html` | Pauta de audiências, controle de réus, pautas mensais |
| Controle Processual | `controle-processual/index.html` | Processos idosos, cartas precatórias, **Tempo de APN** |
| Página inicial | `index.html` | Links entre módulos |

## Regra crítica: não misture módulos

- Sessões trabalhando em `audiencias/index.html` **NUNCA** devem incluir
  `controle-processual/index.html` em seus commits ou push_files.
- Sessões trabalhando em `controle-processual/index.html` **NUNCA** devem incluir
  `audiencias/index.html` em seus commits ou push_files.

## Por que isso importa

Houve múltiplos incidentes onde merges de branches do módulo audiências
sobrescreveram `controle-processual/index.html` com versões desatualizadas,
apagando todo o código do módulo **Tempo de APN**. O `.gitattributes` tenta
mitigar isso, mas a prevenção correta é não incluir arquivos irrelevantes.

## Branch de trabalho

Alterações em `controle-processual/index.html` devem ser feitas no branch:
`claude/modest-volta-8vmf34`
