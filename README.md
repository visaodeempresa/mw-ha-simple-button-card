# MW HA Simple Button Card

Card Lovelace `custom:simple-button-card` — botão **quadrado estilo papel/neumórfico**
(o da barra de luzes): tap = toggle, hold = more-info, ícones por estado
(ligado/desligado/indisponível com brilho vermelho e nome riscado). Botão
**independente** — monte barras com o grid nativo do HA (`square: true`).
Editor visual completo. Irmão do
[mw-ha-power-button-card](https://github.com/visaodeempresa/mw-ha-power-button-card).

## Instalação (HACS)
HACS → ⋮ → **Repositórios personalizados** →
`https://github.com/visaodeempresa/mw-ha-simple-button-card` → tipo **Dashboard**
→ instalar → recarregar o navegador.

## Uso

```yaml
square: true
type: grid
columns: 4
cards:
  - type: custom:simple-button-card
    entity: light.mesa
    name: MESA
    icon_on: mdi:desk-lamp
```

## Propriedades

| Propriedade | Tipo | Default | Descrição |
|---|---|---|---|
| `entity` | light/switch/fan/input_boolean | — | obrigatório |
| `name` | texto | friendly_name | nome exibido |
| `icon_on` | ícone | ícone da entidade | ícone quando ligado |
| `icon_off` | ícone | `mdi:lightbulb-off` | ícone quando desligado |
| `icon_unavailable` | ícone | `mdi:cancel` | ícone quando indisponível |
| `color_on_name` | cor | `#1a1a1a` | texto/ícone ligado |
| `color_off_name` | cor | `rgba(255,255,255,0.78)` | texto desligado |
| `color_off_bg` | cor | `rgba(0,0,0,0.45)` | fundo desligado |
| `color_on_border` / `color_off_border` | cor | (tema papel) | bordas |
| `color_unavail` | cor | `#f5c518` | destaque indisponível |
| `animate` | bool | `false` | gira o ícone quando ligado (ex.: exaustor) |
| `control` | bool | `true` | `false` = toque não liga/desliga (hold segue funcionando); o ícone fica levemente menor e mais apagado, avisando que é só leitura |
| `icon_shadow` | bool | `true` | sombra (relevo de papel) no ícone quando ligado; `false` deixa o ícone chapado — o brilho vermelho de *indisponível* continua, é sinal de estado |
| `name_position` | `bottom`/`top`/`left`/`right` | `bottom` | posição do label em relação ao ícone |
| `icon_size` | px | *(vazio)* | vazio = o ícone escala com o botão (igual ao `button-card`); com valor vira caixa fixa (`28`, `"2em"`, `"40%"`) |
| `name_size` | px | `11` | tamanho do texto do label |
| `name_gap` | px | `0` | distância entre o label e o ícone |

O layout (padding, grade ícone/nome, escala do ícone) é o mesmo do
`custom:button-card` em modo vertical, então os dois botões ficam idênticos
lado a lado em qualquer tamanho de grid.

Cores no editor: picker visual (cor + transparência). Releases automáticas:
merge na main → bump semântico → tag → HACS notifica.
