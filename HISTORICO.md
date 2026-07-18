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
