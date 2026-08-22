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
  - `>>> paper-dark-palette v1` → `IA/lib/paper-dark-palette/` (a rampa
    escura; **mesmas chaves** da clara, então trocar de rampa não invalida o
    `blue-5` já escolhido)
  - `>>> touch-feedback v2` → `IA/lib/touch-feedback/touch-feedback-v2.js`
    (vibração `haptic()` + diálogo `confirmAction()` com o **balão 3D**). Não
    depende de nada do card: os valores de reserva moram dentro do bloco. O
    card oferece `haptic`, `confirm`, `confirm_text`, `confirm_3d`,
    `confirm_paper_dark` e `confirm_paper_color` no `DEFAULTS`/editor, e
    **quem escolhe a cor é o card** — passa `bg`/`ink` prontos para o bloco.
    O `power-button-card` ficou no `v1`, congelado (ADR 0010): bloco embutido
    publicado não muda mais, evolução ganha marcador novo. Migrar é só trocar
    o bloco — a assinatura sem o 4º argumento desenha o diálogo de antes.
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

## Bancada: ver o balão sem HA

`tools/bench-confirm.html` monta as 6 variantes de `confirm_3d` lado a lado.
**Não abre por `file://`** — o pane de browser serve arquivo de fora do projeto
como *snapshot* `data:`, e aí o `<script src="../dist/...">` não carrega.
Servir por HTTP (entrada `mw-simple-button-bancada` no
`PROJECTS/.claude/launch.json`, porta 8794) e abrir
`http://localhost:8794/tools/bench-confirm.html`.

Para conferir **no destino** em vez do `dist/` local, é a mesma página com o
`src` apontando para `http://192.168.1.71:8123/hacsfiles/...` — o navegador
carrega script de outra origem sem CORS, então roda o arquivo que o HA entrega
de verdade.

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
| Botão do balão 3D sumindo dentro do balão | balão e botão são o mesmo papel: relevo sozinho não separa, falta a camada de tinta (`linear-gradient(cor,cor), ${bg}`) — e os valores claro/escuro **não** são simétricos |
| Balão escuro com "risco de giz" na borda de cima | `inset` de `rgba(255,250,235,0.80)` copiado do papel claro; no escuro é `0.10` |
| `check-embeds` reprovando N cards por causa de 1 | não evoluir bloco publicado no lugar — marcador novo (ADR 0010) |

Commits: inglês, assinados em GPG, autoria exclusiva do dono, sem coautoria.
