---
name: simple-button-card
description: Trabalhar no custom:simple-button-card (botão quadrado papel/neumórfico do HA). Use ao adicionar propriedade, mexer em geometria/cores/ícone, igualar visualmente ao custom:button-card, publicar teste no HA, gerar release pelo HACS, ou quando o dono disser que "mudou e a tela não muda" / "o HACS não mostra versão nova".
---

# simple-button-card — fábrica

Arquivo único `dist/simple-button-card.js` (fonte **e** artefato, sem build).
JS puro + `<ha-form>`. Instala por HACS, tipo Dashboard.

## Anatomia

- `DEFAULTS` — toda propriedade nasce aqui; o editor remove do YAML tudo que
  for igual ao default.
- Blocos entre marcadores — **não editar aqui**, editar na fonte canônica e
  re-embutir nos dois cards; validar com `IA/tools/check-embeds.sh` antes de
  commitar:
  - `>>> paper-palette v1` → `IA/lib/paper-palette/`
  - `>>> touch-feedback v1` → `IA/lib/touch-feedback/` (vibração `haptic()` +
    diálogo `confirmAction()`). Não depende de nada do card: o texto de
    reserva mora dentro do bloco. O card só precisa oferecer as chaves
    `haptic`, `confirm` e `confirm_text` no `DEFAULTS`/editor.
- `LAYOUT` — grade por posição do label; `hide_label` colapsa para `'i'`.
- `_render()` — monta CSS + HTML no shadow root e religa tap/hold.
- `LABELS` + `_schema()` — editor visual; `_schema()` é dinâmico (esconde os
  campos de label quando `hide_label` está ligado).

## Geometria = paridade com o `custom:button-card`

Requisito do dono: o card tem que ficar idêntico ao `button-card` ao lado.
Por isso a geometria é cópia do CSS **real** do bundle servido pelo HA:
`padding: 4% 0`, container em grid `1fr min-content`, `#img-cell` flex
relative com `overflow:hidden`, ícone `position:absolute` +
`--mdc-icon-size:100%` (escala com a célula — **nunca px fixo**), nome sem
uppercase/letter-spacing/ellipsis.

Reler quando desconfiar:
```bash
curl -s http://192.168.1.71:8123/hacsfiles/button-card/button-card.js > /tmp/bc.js
```

## Verificar sem browser

`IA/skills/ha-lovelace-card-factory/SKILL.md` tem o probe em Node que
instancia o card e imprime o CSS gerado. Use-o: o pane de browser em geral
não consegue abrir o HA (exige aprovação por ação).

## Testar no HA (sem esperar release)

```bash
cd /Volumes/SSD-T1-01/CLAUDE-SSD/PROJECTS
gzip -9 -c mw-ha-simple-button-card/dist/simple-button-card.js > /tmp/simple-button-card.js.gz
scp -F new_wakeword/ssh/ssh_config mw-ha-simple-button-card/dist/simple-button-card.js \
  /tmp/simple-button-card.js.gz ha-leticia:/config/www/community/mw-ha-simple-button-card/
curl -s http://192.168.1.71:8123/hacsfiles/mw-ha-simple-button-card/simple-button-card.js | grep -c "<marcador novo>"
```

**Subir o `.js.gz` junto não é opcional** — existindo, é ele que o servidor
entrega. Depois, hard refresh (⌘⇧R): o `?hacstag=` é fixo por versão.

## Release

Feature branch → PR → **merge é do dono** → `auto-release.yml` (só dispara em
push na `main`) calcula o bump pelos commits (`feat` = minor) → tag → HACS.
**Não** subir o número no `console.info` em PR pré-merge: o workflow
sincroniza sozinho e mexer antes cria divergência.

## Armadilhas

| Sintoma | Causa |
|---|---|
| "HACS não mostra versão nova" | commit em feature branch; release só na `main` |
| `curl` novo, tela velha | `.js.gz` antigo ainda servido |
| YAML com `chave: null` | campo limpo do editor voltando `undefined` — filtrar em `_onChange` |
| "Mergeei e a feature não apareceu na release" | commits empurrados para a branch depois do merge do PR — órfãos, sem PR | branch nova a cada lote |
| Ícone destoando dos vizinhos | tamanho fixo em px em vez de escalar com a célula |

Commits: inglês, assinados em GPG, autoria exclusiva do dono, sem coautoria.
