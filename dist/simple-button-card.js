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
    haptic: true,
    confirm: false,
    confirm_text: "Tem certeza que quer {acao} {nome}?",
    confirm_3d: false,
    confirm_paper_dark: false,
    confirm_paper_color: "paper",
    name_position: "bottom",
    icon_size: "",
    name_size: 11,
    name_gap: 0,
    hide_label: false,
    paper_color: "paper",
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

  // >>> paper-palette v1 — fonte canônica: /Volumes/SSD-T1-01/CLAUDE-SSD/IA/lib/paper-palette/paper-palette.js
  // 49 papéis encardidos: 7 matizes do arco-íris × 7 tons (1 = quase branco,
  // 7 = mais encardido). Saturação baixa de propósito — papel descansa a vista.
  const PAPER_HUES = [
    ["red", "Vermelho", 6], ["orange", "Laranja", 27], ["yellow", "Amarelo", 47],
    ["green", "Verde", 96], ["blue", "Azul", 203], ["indigo", "Anil", 236],
    ["violet", "Violeta", 283],
  ];
  const PAPER_TONES = [[97, 6], [96, 9], [94, 12], [92, 15], [90, 18], [88, 21], [85, 24]];
  const PAPER_DEFAULT = "linear-gradient(145deg, #fdfaf3, #e8e3d8)";
  const paperGradient = (key) => {
    const m = /^([a-z]+)-([1-7])$/.exec(String(key || "").trim());
    if (!m) return PAPER_DEFAULT;
    const hue = PAPER_HUES.find((h) => h[0] === m[1]);
    if (!hue) return PAPER_DEFAULT;
    const [l, s] = PAPER_TONES[+m[2] - 1];
    return `linear-gradient(145deg, hsl(${hue[2]}, ${s}%, ${l}%), hsl(${hue[2]}, ${s + 4}%, ${l - 7}%))`;
  };
  const paperOptions = () => [{ value: "paper", label: "Papel original (creme)" }].concat(
    ...PAPER_HUES.map((h) => PAPER_TONES.map((t, i) => ({
      value: `${h[0]}-${i + 1}`,
      label: `${h[1]} · tom ${i + 1}${i === 0 ? " (mais claro)" : i === 6 ? " (mais encardido)" : ""}`,
    }))));
  // <<< paper-palette v1

  // >>> paper-dark-palette v1 — fonte canônica: /Volumes/SSD-T1-01/CLAUDE-SSD/IA/lib/paper-dark-palette/paper-dark-palette.js
  // 49 papéis de noite: as mesmas 7 matizes do paper-palette v1 × 7 tons
  // (1 = papel escuro mais claro, 7 = mais encardido). A saturação sobe mais
  // rápido que na rampa clara porque matiz em luminosidade baixa desaparece.
  const PAPER_DARK_HUES = [
    ["red", "Vermelho", 6], ["orange", "Laranja", 27], ["yellow", "Amarelo", 47],
    ["green", "Verde", 96], ["blue", "Azul", 203], ["indigo", "Anil", 236],
    ["violet", "Violeta", 283],
  ];
  const PAPER_DARK_TONES = [[26, 10], [24, 13], [21, 16], [19, 19], [16, 22], [14, 25], [11, 28]];
  const PAPER_DARK_DEFAULT = "linear-gradient(145deg, #2b2825, #161411)";
  const paperDarkGradient = (key) => {
    const m = /^([a-z]+)-([1-7])$/.exec(String(key || "").trim());
    if (!m) return PAPER_DARK_DEFAULT;
    const hue = PAPER_DARK_HUES.find((h) => h[0] === m[1]);
    if (!hue) return PAPER_DARK_DEFAULT;
    const [l, s] = PAPER_DARK_TONES[+m[2] - 1];
    return `linear-gradient(145deg, hsl(${hue[2]}, ${s}%, ${l}%), hsl(${hue[2]}, ${s + 6}%, ${Math.max(4, l - 6)}%))`;
  };
  const paperDarkOptions = () => [{ value: "paper", label: "Papel de noite (grafite)" }].concat(
    ...PAPER_DARK_HUES.map((h) => PAPER_DARK_TONES.map((t, i) => ({
      value: `${h[0]}-${i + 1}`,
      label: `${h[1]} · tom ${i + 1}${i === 0 ? " (mais claro)" : i === 6 ? " (mais escuro)" : ""}`,
    }))));
  // Tinta que se lê sobre o papel do modo pedido. Não é contraste calculado:
  // é o par fixo que a casa usa, para dois cards lado a lado combinarem.
  const paperInk = (dark) => (dark
    ? { text: "rgba(247, 244, 236, 0.94)", dim: "rgba(247, 244, 236, 0.62)", line: "rgba(255, 255, 255, 0.14)" }
    : { text: "rgba(28, 25, 20, 0.92)", dim: "rgba(28, 25, 20, 0.58)", line: "rgba(0, 0, 0, 0.14)" });
  // <<< paper-dark-palette v1

  // >>> touch-feedback v2 — fonte canônica: /Volumes/SSD-T1-01/CLAUDE-SSD/IA/lib/touch-feedback/touch-feedback-v2.js
  // feedback táctil: o app companion (iOS/Android) escuta o evento "haptic" na
  // window e chama o motor de vibração nativo — é assim que o próprio frontend
  // do HA vibra. Fora do app não existe essa ponte, então cai no
  // navigator.vibrate (funciona no Chrome do Android; o Safari do iPhone não
  // vibra em página nenhuma, só dentro do companion).
  const VIBRATE_MS = { selection: 5, light: 10, success: 15, medium: 20, warning: 25, heavy: 30, failure: 40 };
  const inCompanionApp = () =>
    !!(window.externalApp || window.webkit?.messageHandlers?.externalBus);
  const haptic = (kind) => {
    try {
      window.dispatchEvent(new CustomEvent("haptic",
        { bubbles: true, composed: true, detail: kind }));
      // sem a ponte do companion o evento morre sem ninguém escutando
      if (!inCompanionApp() && navigator.vibrate) navigator.vibrate(VIBRATE_MS[kind] ?? 10);
    } catch (_) { /* vibração é enfeite: nunca pode derrubar o toque */ }
  };

  // confirmação da ação (desligada por default). Duas decisões deliberadas:
  // 1) o diálogo é montado no document.body, não no shadow root do card —
  //    dentro dele o overflow:hidden do botão cortaria o modal;
  // 2) não usa window.confirm: o WebView do companion pode engolir o diálogo
  //    nativo e devolver false sozinho, e aí a ação nunca aconteceria.
  // O texto aceita {nome} e {acao} → "Tem certeza que quer desligar MESA?".
  // O card hospedeiro oferece as chaves confirm/confirm_text; o texto de
  // reserva mora aqui para o bloco não depender do DEFAULTS de ninguém.
  const CONFIRM_FALLBACK = "Tem certeza que quer {acao} {nome}?";
  const CONFIRM_PAPER = "linear-gradient(145deg, #fdfaf3, #e8e3d8)";
  // tinta de reserva: o mesmo par de paperInk(), repetido aqui para o bloco
  // continuar colável em card que não embute a paleta escura.
  const CONFIRM_INK = (dark) => (dark
    ? { text: "rgba(247, 244, 236, 0.94)", dim: "rgba(247, 244, 236, 0.62)", line: "rgba(255, 255, 255, 0.14)" }
    : { text: "rgba(28, 25, 20, 0.92)", dim: "rgba(28, 25, 20, 0.58)", line: "rgba(0, 0, 0, 0.14)" });

  // O relevo do papel é o MESMO vocabulário dos botões MW, e por isso a
  // hierarquia sai de graça: "Confirmar" é papel saliente (o botão ligado) e
  // "Cancelar" é papel afundado (o botão desligado). Ninguém precisa de cor de
  // alerta para saber qual é qual.
  const paper3dSkin = (bg, dark) => {
    // no papel escuro o brilho interno de cima tem que cair muito: 0.80 de
    // branco sobre grafite vira risco de giz, não luz.
    const lit = dark ? "rgba(255,255,255,0.10)" : "rgba(255,250,235,0.80)";
    const litSoft = dark ? "rgba(255,255,255,0.07)" : "rgba(255,250,235,0.85)";
    const dent = dark ? "rgba(0,0,0,0.50)" : "rgba(0,0,0,0.08)";
    const edge = dark ? "rgba(255,255,255,0.10)" : "rgba(180,180,180,0.55)";
    const drop = dark ? "rgba(0,0,0,0.70)" : "rgba(0,0,0,0.50)";
    // botão e balão são o MESMO papel, e só o relevo não basta para separá-los
    // — nos tons encardidos (claros ou escuros) o botão sumia dentro do balão.
    // Uma camada de tinta por cima da folha resolve sem inventar segunda cor:
    // o saliente clareia, o afundado escurece, os dois na mesma matéria.
    const tint = (v) => `linear-gradient(${v}, ${v}), ${bg}`;
    const upBg = tint(dark ? "rgba(255,255,255,0.075)" : "rgba(255,255,255,0.34)");
    const downBg = tint(dark ? "rgba(0,0,0,0.30)" : "rgba(0,0,0,0.055)");
    return {
      box: `background:${bg};border:1px solid ${edge};
        box-shadow:0 18px 50px ${drop}, 0 0 8px 2px rgba(0,0,0,0.28),
          inset 2px 2px 4px ${lit}, inset -2px -2px 4px ${dent};`,
      // saliente: luz em cima à esquerda, sombra projetada embaixo
      up: `background:${upBg};border:1px solid ${edge};
        box-shadow:inset 1px 1px 2px ${litSoft}, inset -1px -1px 2px ${dent},
          0 3px 6px rgba(0,0,0,${dark ? "0.45" : "0.22"});`,
      // afundado: a sombra vai para dentro — mesmo estado "desligado" do card
      down: `background:${downBg};border:1px solid ${edge};
        box-shadow:inset 2px 2px 5px rgba(0,0,0,${dark ? "0.55" : "0.30"}),
          inset -1px -1px 3px ${dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.45)"};`,
    };
  };

  const confirmAction = (tpl, nome, acao, opts) => new Promise((resolve) => {
    const o = opts || {};
    const msg = String(tpl || CONFIRM_FALLBACK)
      .replace(/\{nome\}/g, nome).replace(/\{acao\}/g, acao);
    const dark = o.dark === true;
    const ink = o.ink || CONFIRM_INK(dark);
    const bg = o.bg || CONFIRM_PAPER;
    const three = o.paper3d === true;
    const skin = three ? paper3dSkin(bg, dark) : null;

    // v1 chapado × v2 em relevo: as duas peles saem daqui, e o resto do
    // diálogo (foco, Esc, clique no fundo) é idêntico nos dois casos.
    const boxCss = three ? skin.box
      : `background:${CONFIRM_PAPER};box-shadow:0 10px 40px rgba(0,0,0,0.45), inset 2px 2px 4px rgba(255,250,235,0.80);`;
    const textCol = three ? ink.text : "#1a1a1a";
    const noCss = three ? skin.down + `color:${ink.text};`
      : "background:rgba(0,0,0,0.06);color:#1a1a1a;border:1px solid rgba(0,0,0,0.18);";
    const yesCss = three ? skin.up + `color:${ink.text};`
      : "background:#1a1a1a;color:#fdfaf3;border:1px solid #1a1a1a;";
    // o toque tem que responder na hora: pressionar afunda o saliente e
    // levanta o afundado, os dois trocando de lugar como papel de verdade.
    const pressCss = three
      ? `.bt button:active{${skin.down}transform:translateY(1px);}
         .bt button.no:active{${skin.up}transform:translateY(1px);}`
      : ".bt button:active{transform:translateY(1px);}";

    const host = document.createElement("div");
    host.attachShadow({ mode: "open" });
    host.shadowRoot.innerHTML = `
      <style>
        .ov{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;
          background:rgba(0,0,0,${three && dark ? "0.68" : "0.55"});padding:16px;}
        .box{max-width:min(420px,86vw);border-radius:14px;padding:22px 22px 16px;
          color:${textCol};font-family:inherit;font-size:15px;line-height:1.45;text-align:center;
          ${boxCss}}
        .bt{display:flex;gap:10px;margin-top:20px;}
        button{flex:1;padding:11px 14px;border-radius:${three ? "12px" : "10px"};font:inherit;font-size:14px;
          font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;
          transition:box-shadow .15s ease,transform .1s ease;}
        .no{${noCss}}
        .yes{${yesCss}}
        ${pressCss}
      </style>
      <div class="ov"><div class="box"><div class="msg"></div>
        <div class="bt"><button class="no">Cancelar</button><button class="yes">Confirmar</button></div>
      </div></div>`;
    // textContent, não innerHTML: o texto vem do YAML do dono, mas nome de
    // entidade não tem por que virar HTML.
    host.shadowRoot.querySelector(".msg").textContent = msg;
    const close = (ok) => {
      window.removeEventListener("keydown", onKey, true);
      host.remove();
      resolve(ok);
    };
    const onKey = (ev) => {
      if (ev.key === "Escape") { ev.stopPropagation(); close(false); }
      else if (ev.key === "Enter") { ev.stopPropagation(); close(true); }
    };
    host.shadowRoot.querySelector(".yes").addEventListener("click", () => close(true));
    host.shadowRoot.querySelector(".no").addEventListener("click", () => close(false));
    // clique no fundo = cancelar (mesma saída do Esc)
    host.shadowRoot.querySelector(".ov").addEventListener("click", (ev) => {
      if (ev.target === ev.currentTarget) close(false);
    });
    window.addEventListener("keydown", onKey, true);
    document.body.appendChild(host);
    host.shadowRoot.querySelector(".yes").focus();
  });
  // <<< touch-feedback v2

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

      const bg = isOn ? paperGradient(c.paper_color) : c.color_off_bg;
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
      // hide_label: só o ícone, ocupando o botão inteiro e centrado
      const bare = c.hide_label === true;
      const layout = bare
        ? { grid: "grid-template-areas:'i';grid-template-columns:1fr;grid-template-rows:1fr;", edge: "" }
        : LAYOUT[c.name_position] || LAYOUT.bottom;
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
            ${bare ? "" : `<div class="nm">${esc(c.name || (st?.attributes?.friendly_name ?? c.entity))}</div>`}
          </div>
        </ha-card>`;

      // tap = toggle · hold (500 ms) = more-info (hold cancela o toggle)
      // A vibração vai no pointerdown, não no pointerup: o dedo tem que sentir
      // o botão no instante em que encosta, antes de o serviço responder.
      // O hold ganha um pulso mais forte para avisar que virou more-info.
      const buzz = c.haptic !== false;
      const card = this.shadowRoot.querySelector("ha-card");
      let holdTimer = null, held = false;
      card.addEventListener("pointerdown", () => {
        held = false;
        if (buzz) haptic("light");
        holdTimer = setTimeout(() => {
          held = true; holdTimer = null;
          if (buzz) haptic("medium");
          this.dispatchEvent(new CustomEvent("hass-more-info",
            { bubbles: true, composed: true, detail: { entityId: c.entity } }));
        }, 500);
      });
      ["pointerleave", "pointercancel"].forEach((t) =>
        card.addEventListener(t, () => { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } }));
      card.addEventListener("pointerup", async () => {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
        if (held || dead || !canControl) return;
        if (c.confirm === true) {
          const nome = c.name || st?.attributes?.friendly_name || c.entity;
          // quem escolhe o papel é o card, não o bloco: as duas paletas estão
          // embutidas aqui e a mesma chave ("blue-5") serve às duas rampas.
          const cdark = c.confirm_paper_dark === true;
          const ok = await confirmAction(c.confirm_text, nome, isOn ? "desligar" : "ligar", {
            paper3d: c.confirm_3d === true,
            dark: cdark,
            bg: cdark ? paperDarkGradient(c.confirm_paper_color) : paperGradient(c.confirm_paper_color),
            ink: paperInk(cdark),
          });
          if (!ok) return;
        }
        this._hass.callService("homeassistant", "toggle", { entity_id: c.entity });
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
    haptic: "Vibrar ao tocar (feedback táctil no celular)",
    confirm: "Pedir confirmação antes de ligar/desligar",
    confirm_text: "Mensagem da confirmação ({nome} e {acao} são substituídos)",
    confirm_3d: "Balão 3D (a confirmação em papel com relevo)",
    confirm_paper_dark: "Balão em papel escuro",
    confirm_paper_color: "Cor do papel do balão",
    hide_label: "Esconder o label (só o ícone, centralizado)",
    paper_color: "Cor do papel (ligado)",
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
      // com hide_label ligado, os campos do label saem do formulário —
      // não adianta oferecer posição/tamanho de algo que não é desenhado
      const bare = this._config?.hide_label === true;
      const labelFields = bare ? [] : [
        { name: "name_position", selector: { select: { mode: "dropdown", options: [
          { value: "bottom", label: "Abaixo do ícone" },
          { value: "top", label: "Acima do ícone" },
          { value: "left", label: "À esquerda do ícone" },
          { value: "right", label: "À direita do ícone" },
        ] } } },
        { name: "name_size", selector: { number: { min: 6, max: 40, step: 1, mode: "box", unit_of_measurement: "px" } } },
        { name: "name_gap", selector: { number: { min: 0, max: 40, step: 1, mode: "box", unit_of_measurement: "px" } } },
      ];
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
        { name: "haptic", selector: { boolean: {} } },
        { name: "confirm", selector: { boolean: {} } },
        // mensagem e aparência do balão só aparecem com a confirmação ligada;
        // a cor do papel, só com o relevo ligado — sem ele não há papel nenhum.
        ...(this._config?.confirm === true ? [
          { name: "confirm_text", selector: { text: {} } },
          { name: "confirm_3d", selector: { boolean: {} } },
          ...(this._config?.confirm_3d === true ? [
            { name: "confirm_paper_dark", selector: { boolean: {} } },
            // as duas rampas usam as MESMAS chaves, então virar o interruptor
            // do papel escuro troca a lista sem invalidar o que já foi escolhido
            { name: "confirm_paper_color", selector: { select: { mode: "dropdown",
              options: this._config?.confirm_paper_dark === true ? paperDarkOptions() : paperOptions() } } },
          ] : []),
        ] : []),
        { name: "paper_color", selector: { select: { mode: "dropdown", options: paperOptions() } } },
        { name: "hide_label", selector: { boolean: {} } },
        { name: "icon_size", selector: { number: { min: 8, max: 200, step: 1, mode: "box", unit_of_measurement: "px" } } },
        ...labelFields,
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

  console.info("%c MW-SIMPLE-BUTTON-CARD %c 0.6.1 ", "background:#1a1a1a;color:#fdfaf3;font-weight:700;", "background:#e8e3d8;color:#1a1a1a;font-weight:700;");
})();
