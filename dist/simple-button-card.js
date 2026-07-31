/* mw-ha-simple-button-card — custom:simple-button-card
 * Botão quadrado papel/neumórfico (port fiel da barra de luzes do dono),
 * independente (sem grid embutida). JS puro + <ha-form>; editor visual completo.
 * Repo: https://github.com/visaodeempresa/mw-ha-simple-button-card
 * Releases automáticas: merge na main → bump semântico → tag → HACS.
 */
(() => {
  "use strict";

  const DEFAULTS = {
    name: "",
    icon_on: "",
    icon_off: "mdi:lightbulb-off",
    icon_unavailable: "mdi:cancel",
    animate: false,
    control: true,
    icon_shadow: true,
    name_position: "bottom",
    icon_size: "",
    name_size: 11,
    name_gap: 0,
    color_on_name: "#1a1a1a",
    color_off_name: "rgba(255, 255, 255, 0.78)",
    color_off_bg: "rgba(0, 0, 0, 0.45)",
    color_on_border: "rgba(180, 180, 180, 0.55)",
    color_off_border: "rgba(255, 255, 255, 0.08)",
    color_unavail: "#f5c518",
  };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // número vira px; string com unidade ("2em", "40%") passa direto; vazio = automático
  const px = (v) => {
    if (v === "" || v === null || v === undefined) return "";
    const s = String(v).trim();
    return /^-?\d+(\.\d+)?$/.test(s) ? `${s}px` : s;
  };

  // posição do nome em relação ao ícone: grade + folga na borda daquele lado
  const LAYOUT = {
    bottom: { grid: "grid-template-areas:'i' 'n';grid-template-columns:1fr;grid-template-rows:1fr min-content;", edge: "padding-bottom:8px;" },
    top: { grid: "grid-template-areas:'n' 'i';grid-template-columns:1fr;grid-template-rows:min-content 1fr;", edge: "padding-top:8px;" },
    left: { grid: "grid-template-areas:'n i';grid-template-columns:min-content 1fr;grid-template-rows:1fr;", edge: "padding-left:8px;" },
    right: { grid: "grid-template-areas:'i n';grid-template-columns:1fr min-content;grid-template-rows:1fr;", edge: "padding-right:8px;" },
  };

  class SimpleButtonCard extends HTMLElement {
    setConfig(config) {
      if (!config || !config.entity) {
        throw new Error("simple-button-card: defina a propriedade 'entity'");
      }
      this._config = { ...DEFAULTS, ...config };
      this._renderKey = null;
      if (this._hass) this._render();
    }

    set hass(hass) {
      this._hass = hass;
      if (!this._config) return;
      const st = hass.states[this._config.entity];
      const key = st ? st.state : "·";
      if (key !== this._renderKey) {
        this._renderKey = key;
        this._render();
      }
    }

    getCardSize() { return 2; }

    static getConfigElement() { return document.createElement("simple-button-card-editor"); }

    static getStubConfig(hass) {
      const first = Object.keys(hass?.states || {}).find((e) => e.startsWith("light.")) || "";
      return { entity: first, name: "", icon_on: "mdi:lightbulb" };
    }

    _render() {
      const c = this._config;
      const st = this._hass.states[c.entity];
      const state = st ? st.state : "unavailable";
      const isOn = state === "on";
      const dead = state === "unavailable" || state === "unknown";

      const bg = isOn ? "linear-gradient(145deg, #fdfaf3, #e8e3d8)" : c.color_off_bg;
      const border = isOn ? c.color_on_border : c.color_off_border;
      const shadow = isOn
        ? "0 0 8px 2px rgba(0,0,0,0.28), 0 4px 10px rgba(0,0,0,0.14), inset 2px 2px 4px rgba(255,250,235,0.80), inset -2px -2px 4px rgba(0,0,0,0.08)"
        : "inset 2px 2px 5px rgba(0,0,0,0.35), inset -1px -1px 3px rgba(255,255,255,0.04)";

      const icon = dead ? c.icon_unavailable
        : !isOn ? c.icon_off
        : (c.icon_on || st?.attributes?.icon || "mdi:lightbulb");

      const iconColor = dead ? c.color_unavail : isOn ? c.color_on_name : "rgba(255,255,255,0.70)";
      // icon_shadow=false remove a sombra decorativa do ícone; o brilho vermelho
      // de "indisponível" fica (é sinal de estado, não enfeite).
      const iconFilter = dead
        ? "drop-shadow(0 0 2px rgba(200,0,0,1.0)) drop-shadow(0 0 8px rgba(220,0,0,0.95)) drop-shadow(0 0 18px rgba(200,0,0,0.80)) drop-shadow(0 0 32px rgba(180,0,0,0.55))"
        : isOn && c.icon_shadow !== false
          ? "drop-shadow(1px 2px 2px rgba(0,0,0,0.55)) drop-shadow(3px 6px 8px rgba(0,0,0,0.30)) drop-shadow(6px 12px 16px rgba(0,0,0,0.15))"
          : "none";

      // animate: gira o ícone quando ligado (padrão fan-spin do dono)
      const spin = c.animate && isOn ? "animation:sbc-spin 1.2s linear infinite;" : "";
      const canControl = c.control !== false;
      // control=false: ícone "só leitura" — um pouco menor e mais apagado,
      // para o botão avisar sozinho que o toque não liga/desliga nada.
      const readOnly = canControl ? "" : "opacity:.6;transform:scale(.88);";

      // geometria ajustável: posição do nome, tamanho do ícone/texto e folga entre eles
      const layout = LAYOUT[c.name_position] || LAYOUT.bottom;
      const gap = px(c.name_gap);
      const nameSize = px(c.name_size) || "11px";
      const isz = px(c.icon_size);
      // sem icon_size o ícone escala com a célula (comportamento do button-card);
      // com icon_size ele vira uma caixa fixa centrada pelo flex da célula.
      const iconBox = isz
        ? `position:relative;width:${isz};height:${isz};max-height:${isz};
            --mdc-icon-size:${isz};--iron-icon-width:${isz};--iron-icon-height:${isz};`
        : `position:absolute;width:100%;height:100%;max-height:100%;
            --mdc-icon-size:100%;--iron-icon-width:100%;--iron-icon-height:100%;`;

      const nameColor = dead ? c.color_unavail : isOn ? c.color_on_name : c.color_off_name;
      const nameDeco = dead ? "line-through" : "none";
      const nameShadow = dead
        ? "0 0 2px rgba(200,0,0,1.0), 0 0 8px rgba(220,0,0,0.95), 0 0 18px rgba(200,0,0,0.80)"
        : "none";

      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      // Geometria copiada do custom:button-card (padding 4% 0, grid vertical
      // 1fr/min-content, ícone escalando com a célula) para os dois botões
      // ficarem idênticos lado a lado em qualquer tamanho de grid.
      this.shadowRoot.innerHTML = `
        <style>
          @keyframes sbc-spin{from{transform:rotate(0deg) translateZ(0);}to{transform:rotate(360deg) translateZ(0);}}
          ha-card{aspect-ratio:1/1;border-radius:12px;background:${bg};border:1px solid ${border};
            box-shadow:${shadow};color:${nameColor};font-size:11px;font-weight:600;
            cursor:${canControl ? "pointer" : "default"};
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            text-align:center;padding:4% 0;overflow:hidden;
            -webkit-tap-highlight-color:transparent;touch-action:manipulation;user-select:none;
            transition:background .2s ease,box-shadow .2s ease;height:100%;width:100%;box-sizing:border-box;}
          .ct{display:grid;width:100%;height:100%;text-align:center;align-items:center;
            ${layout.grid}${gap ? `gap:${gap};` : ""}}
          .ic{grid-area:i;display:flex;position:relative;overflow:hidden;
            height:100%;width:100%;max-width:100%;max-height:100%;
            align-self:center;justify-self:center;align-items:center;justify-content:center;
            ${readOnly}transition:opacity .2s ease,transform .2s ease;}
          .ic ha-icon{display:inline-block;margin:auto;${iconBox}
            color:${iconColor};filter:${iconFilter};transition:color .2s ease;
            ${spin}transform-origin:center center;backface-visibility:hidden;
            will-change:${c.animate && isOn ? "transform" : "auto"};}
          .nm{grid-area:n;max-width:100%;align-self:center;justify-self:center;
            font-size:${nameSize};font-weight:600;${layout.edge}color:${nameColor};
            text-decoration:${nameDeco};text-shadow:${nameShadow};}
        </style>
        <ha-card>
          <div class="ct">
            <div class="ic"><ha-icon icon="${esc(icon)}"></ha-icon></div>
            <div class="nm">${esc(c.name || (st?.attributes?.friendly_name ?? c.entity))}</div>
          </div>
        </ha-card>`;

      // tap = toggle · hold (500 ms) = more-info (hold cancela o toggle)
      const card = this.shadowRoot.querySelector("ha-card");
      let holdTimer = null, held = false;
      card.addEventListener("pointerdown", () => {
        held = false;
        holdTimer = setTimeout(() => {
          held = true; holdTimer = null;
          this.dispatchEvent(new CustomEvent("hass-more-info",
            { bubbles: true, composed: true, detail: { entityId: c.entity } }));
        }, 500);
      });
      ["pointerleave", "pointercancel"].forEach((t) =>
        card.addEventListener(t, () => { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } }));
      card.addEventListener("pointerup", () => {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
        if (!held && !dead && canControl) this._hass.callService("homeassistant", "toggle", { entity_id: c.entity });
      });
    }
  }

  /* ---------------- EDITOR VISUAL ---------------- */

  const LABELS = {
    entity: "Entidade",
    name: "Nome",
    icon_on: "Ícone (ligado)",
    icon_off: "Ícone (desligado)",
    icon_unavailable: "Ícone (indisponível)",
    animate: "Animar ícone quando ligado (girar)",
    control: "Permitir ligar/desligar no toque",
    icon_shadow: "Sombra no ícone quando ligado",
    name_position: "Posição do label",
    icon_size: "Tamanho do ícone (vazio = automático)",
    name_size: "Tamanho do texto do label",
    name_gap: "Distância entre label e ícone",
    color_on_name: "Ligado: texto/ícone",
    color_off_name: "Desligado: texto",
    color_off_bg: "Desligado: fundo",
    color_on_border: "Ligado: borda",
    color_off_border: "Desligado: borda",
    color_unavail: "Indisponível: destaque",
  };

  const COLOR_FIELDS = ["color_on_name", "color_off_name", "color_off_bg",
    "color_on_border", "color_off_border", "color_unavail"];

  const parseColor = (str) => {
    const s = String(str || "").trim();
    let m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
    if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
    m = s.match(/^#([0-9a-f]{6})$/i);
    if (m) { const n = parseInt(m[1], 16); return { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: 1 }; }
    m = s.match(/^#([0-9a-f]{3})$/i);
    if (m) { const [r, g, b] = m[1].split("").map((x) => parseInt(x + x, 16)); return { r, g, b, a: 1 }; }
    return { r: 128, g: 128, b: 128, a: 1 };
  };
  const toHex = ({ r, g, b }) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  const toRgba = ({ r, g, b, a }) => `rgba(${r}, ${g}, ${b}, ${a})`;

  class SimpleButtonCardEditor extends HTMLElement {
    setConfig(config) { this._config = { ...config }; this._renderForm(); }
    set hass(hass) { this._hass = hass; if (this._form) this._form.hass = hass; }

    _schema() {
      return [
        { name: "entity", required: true,
          selector: { entity: { domain: ["light", "switch", "fan", "input_boolean"] } } },
        { name: "name", selector: { text: {} } },
        { name: "icon_on", selector: { icon: {} } },
        { name: "icon_off", selector: { icon: {} } },
        { name: "icon_unavailable", selector: { icon: {} } },
        { name: "animate", selector: { boolean: {} } },
        { name: "control", selector: { boolean: {} } },
        { name: "icon_shadow", selector: { boolean: {} } },
        { name: "name_position", selector: { select: { mode: "dropdown", options: [
          { value: "bottom", label: "Abaixo do ícone" },
          { value: "top", label: "Acima do ícone" },
          { value: "left", label: "À esquerda do ícone" },
          { value: "right", label: "À direita do ícone" },
        ] } } },
        { name: "icon_size", selector: { number: { min: 8, max: 200, step: 1, mode: "box", unit_of_measurement: "px" } } },
        { name: "name_size", selector: { number: { min: 6, max: 40, step: 1, mode: "box", unit_of_measurement: "px" } } },
        { name: "name_gap", selector: { number: { min: 0, max: 40, step: 1, mode: "box", unit_of_measurement: "px" } } },
      ];
    }

    _renderForm() {
      if (!this._form) {
        this._form = document.createElement("ha-form");
        this._form.computeLabel = (f) => LABELS[f.name] || f.name;
        this._form.addEventListener("value-changed", (ev) => this._onChange(ev));
        this.appendChild(this._form);
      }
      this._form.hass = this._hass;
      this._form.schema = this._schema();
      // campos vazios (ex.: icon_size = automático) não vão para o ha-form,
      // senão o seletor numérico mostra lixo em vez de caixa vazia
      const data = { ...DEFAULTS, ...this._config };
      for (const k of Object.keys(data)) if (data[k] === "") delete data[k];
      this._form.data = data;
      this._renderColors();
    }

    _renderColors() {
      if (!this._colorsEl) {
        this._colorsEl = document.createElement("details");
        this._colorsEl.style.cssText = "margin-top:16px;border:1px solid var(--divider-color);border-radius:8px;padding:8px 12px;";
        this.appendChild(this._colorsEl);
      }
      const rows = COLOR_FIELDS.map((name) => {
        const cur = this._config[name] ?? DEFAULTS[name] ?? "";
        const c = parseColor(cur || "rgba(128,128,128,1)");
        return `<div class="sbc-crow" data-name="${name}">
          <span class="lbl">${LABELS[name] || name}</span>
          <input type="color" value="${toHex(c)}" title="cor">
          <input type="range" min="0" max="1" step="0.01" value="${c.a}" title="transparência (alfa)">
          <code>${cur || "—"}</code>
        </div>`;
      }).join("");
      this._colorsEl.innerHTML = `
        <summary style="cursor:pointer;font-weight:500;">Cores (clique para ajustar — cor + transparência)</summary>
        <style>
          .sbc-crow{display:grid;grid-template-columns:1fr 44px 110px minmax(120px,1fr);gap:10px;align-items:center;padding:6px 0;}
          .sbc-crow .lbl{font-size:13px;}
          .sbc-crow input[type=color]{width:40px;height:28px;border:none;background:none;cursor:pointer;padding:0;}
          .sbc-crow code{font-size:11px;opacity:.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        </style>${rows}`;
      this._colorsEl.querySelectorAll(".sbc-crow").forEach((rowEl) => {
        const name = rowEl.dataset.name;
        const apply = () => {
          const hex = rowEl.querySelector("input[type=color]").value;
          const a = parseFloat(rowEl.querySelector("input[type=range]").value);
          const { r, g, b } = parseColor(hex);
          const value = a >= 1 ? hex : toRgba({ r, g, b, a });
          const clean = { ...this._config };
          if (value === DEFAULTS[name]) delete clean[name]; else clean[name] = value;
          this._config = clean;
          rowEl.querySelector("code").textContent = clean[name] || "—";
          this.dispatchEvent(new CustomEvent("config-changed",
            { bubbles: true, composed: true, detail: { config: clean } }));
        };
        rowEl.querySelector("input[type=color]").addEventListener("input", apply);
        rowEl.querySelector("input[type=range]").addEventListener("input", apply);
      });
    }

    _onChange(ev) {
      ev.stopPropagation();
      const v = { ...ev.detail.value };
      const clean = {};
      for (const [k, val] of Object.entries(v)) {
        // campo limpo volta ao default em vez de gravar null no YAML
        if (val === undefined || val === null || val === "") continue;
        if (k === "entity" || val !== DEFAULTS[k]) clean[k] = val;
      }
      for (const k of COLOR_FIELDS) {
        if (this._config[k] !== undefined) clean[k] = this._config[k];
      }
      this._config = clean;
      this.dispatchEvent(new CustomEvent("config-changed",
        { bubbles: true, composed: true, detail: { config: clean } }));
      this._renderForm();
    }
  }

  customElements.define("simple-button-card", SimpleButtonCard);
  customElements.define("simple-button-card-editor", SimpleButtonCardEditor);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "simple-button-card",
    name: "MW Simple Button Card",
    description: "Botão quadrado estilo papel: toggle, hold = more-info, ícones por estado.",
    preview: true,
    documentationURL: "https://github.com/visaodeempresa/mw-ha-simple-button-card",
  });

  console.info("%c MW-SIMPLE-BUTTON-CARD %c 0.2.0 ", "background:#1a1a1a;color:#fdfaf3;font-weight:700;", "background:#e8e3d8;color:#1a1a1a;font-weight:700;");
})();
