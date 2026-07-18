# PLANO — mw-ha-simple-button-card

**Objetivo:** botão quadrado papel/neumórfico (barra de luzes do escritório)
como card independente `custom:simple-button-card` (SEM grid embutida — o
usuário monta a barra com grid do HA), instalável via HACS, editor visual
completo. Mesmos padrões do mw-ha-power-button-card (plano→commits→PR,
auto-release, memória de IA fora do git, repo público).

## Comportamento (fiel ao template)
- ON: fundo gradiente papel, sombras elevadas, texto/ícone #1a1a1a
- OFF: fundo escuro afundado (inset), texto/ícone claros, `icon_off`
- UNAVAILABLE/UNKNOWN: `icon_unavailable` (mdi:cancel), âmbar #f5c518,
  brilho vermelho no ícone/nome, nome riscado
- Tap = toggle (homeassistant.toggle) · Hold = more-info · aspecto 1:1

## Propriedades (11 — nada a mais)
entity (light/switch/fan/input_boolean) · name · icon_on (picker) ·
icon_off (default mdi:lightbulb-off) · icon_unavailable (default mdi:cancel) ·
color_on_name (#1a1a1a) · color_off_name (rgba(255,255,255,0.78)) ·
color_off_bg (rgba(0,0,0,0.45)) · color_on_border (rgba(180,180,180,0.55)) ·
color_off_border (rgba(255,255,255,0.08)) · color_unavail (#f5c518)
Cores = seção com picker visual (cor+alfa), como no power-button-card v0.1.1.

## Checklist (status vivo)
- [x] Pasta + git + workflows adaptados (auto-release + fallback) + plano
- [x] dist/simple-button-card.js (card + editor)
- [x] hacs.json + README + HISTORICO
- [x] Repo público + feature branch + PR #1
- [ ] Merge (dono) → auto-release v0.x → instalar via HACS → testar

## Retomada manual
`cd /Volumes/SSD-T1-01/CLAUDE-SSD/PROJECTS/mw-ha-simple-button-card` →
checklist + git log. HACS: Repositórios personalizados →
https://github.com/visaodeempresa/mw-ha-simple-button-card (Dashboard).
