# HISTÓRICO — mw-ha-simple-button-card

## 2026-07-17 — v0.1.0 (sessão inicial, Claude)
- Fábrica reaproveitada do mw-ha-power-button-card (v0.1.1 + auto-release).
- `dist/simple-button-card.js`: botão quadrado papel independente (sem grid
  embutida): ON gradiente/sombras, OFF afundado, indisponível = ícone cancel
  + âmbar + glow vermelho + nome riscado; tap=toggle (homeassistant.toggle,
  bloqueado quando indisponível), hold=more-info (hold cancela o toggle).
- Editor visual: entity (light/switch/fan/input_boolean), nome, 3 icon
  pickers (on/off/indisponível), 6 cores com picker visual (cor+alfa).
  11 propriedades — nada a mais. Defaults não poluem o YAML.
- hacs.json + README + workflows copiados/adaptados (auto-release com bump
  semântico + release.yml fallback).
- `node --check` OK. Teste visual: dono via HACS.

### Pendente
- Merge do PR (dono) → auto-release gera v0.1.x → instalar via HACS → testar.

## 2026-07-31 — v0.2.0: paridade visual com o button-card
- CSS do `custom:button-card` (bundle servido pelo HA, `/hacsfiles/button-card/`)
  lido e replicado: `ha-card{padding:4% 0;overflow:hidden;text-align:center}`,
  container em grid vertical `'i' 'n'` com `grid-template-rows:1fr min-content`,
  `#img-cell` flex/relative/overflow:hidden 100%×100% e ícone
  `position:absolute; height/width:100%; --mdc-icon-size:100%`.
  Antes o ícone era fixo em 38px numa faixa de 55% da altura — por isso o
  botão não batia com os vizinhos. Agora o ícone escala com a célula, igual
  ao irmão, em qualquer tamanho de grid.
- Nome: sem `text-transform:uppercase`, sem `letter-spacing` e sem
  nowrap/ellipsis — o button-card não faz nada disso (quebra linha igual).
- `control: false`: ícone em `opacity:.6` + `scale(.88)` (escala no `.ic`, não
  no `ha-icon`, senão brigaria com a animação de girar) — o botão avisa
  sozinho que é só leitura.
- `icon_shadow` (default `true`): desliga a sombra de papel do ícone ligado;
  o glow vermelho de indisponível permanece (sinal de estado). 14 propriedades.
- Deploy de teste por SSH em `/config/www/community/mw-ha-simple-button-card/`
  (.js + .js.gz) — o HA serve o .gz quando existe, os dois precisam ir junto.

## 2026-07-31 — geometria no editor (mesmo PR #2, pré-merge)
- 4 propriedades novas, todas no editor visual: `name_position`
  (bottom/top/left/right — troca `grid-template-areas` e o lado da folga de
  8px do label), `icon_size` (vazio = escala com a célula; com valor o ícone
  vira `position:relative` numa caixa fixa centrada pelo flex), `name_size`
  e `name_gap` (`gap` da grade). 18 propriedades.
- Helper `px()`: número vira px, string com unidade (`2em`, `40%`) passa
  direto — o YAML aceita os dois.
- Editor: campos vazios saem do `data` do `ha-form` (senão o seletor numérico
  mostra lixo) e `_onChange` ignora `undefined/null/""` para não gravar
  `icon_size: null` no YAML.
- Versão do banner **não** subiu: as features entram na mesma release v0.2.0
  (o bump é calculado pelo workflow a partir da última tag).

## 2026-07-17 — animate + control (no PR #1, pré-merge)
- `animate` (default false): ícone gira (sbc-spin 1.2s, translateZ/backface,
  padrão do exaustor do dono) quando ligado.
- `control` (default true): false = toque não alterna (cursor default);
  hold/more-info segue. Editor: 2 booleans novos. Total: 13 propriedades.
