// DOOM//TERM — DOOM (shareware Episode 1) for Übersicht, two columns wide (472 × 360)
// Engine: doomgeneric (GPL-2.0, github.com/ozkl/doomgeneric @ e257a09) compiled to WebAssembly (wasm32-wasi) → doom/doom.wasm.
//   Platform layer + build: doom/doomgeneric_widget.c · doom/build.sh. IWAD: doom/DOOM1.WAD (id Software shareware v1.9).
// Install: double-click install.command — copies this file and the doom/ folder in and downloads the shareware WAD.
// Saves + config persist in ~/Library/Application Support/STUDYTERM/doom/ (written whenever the game saves).
//
//   Click the screen → boot / play (keys only reach the widget while it has focus; clicking elsewhere pauses it).
//   ←↑↓→ move/turn · , . strafe · Shift run · Alt + ←→ strafe · Ctrl or left-click fire · Space use/open
//   1–7 weapons · Tab automap · Esc menu (save/load/quit) · Enter confirm · y/n · cheats work (iddqd, idkfa…)
//   No sound. Runs on a virtual 35 Hz clock driven by requestAnimationFrame, so it never blocks the desktop.
//
// Default spot: WIDGET//CTL cols 3–4, row 7 → fallback top 366, right 766. Drag it anywhere with WIDGET//CTL.
// Hidden while ~/Library/Application Support/STUDYTERM/hidden exists (⌃⌥⌘W toggles it) — the game pauses.
// No JSX fragments (<>…</>), no async/await, no BigInt literals: Übersicht's bundler and global scope don't have them.
// Style: STUDY//TERM retro terminal, themed by WIDGET//CTL (the game picture itself keeps Doom's palette).

import { run } from "uebersicht";

// ── WIDGET//CTL block — theme + position, set by the WIDGET//CTL app (⌃⌥⌘S). Identical in all the widgets: change them together. ──
// Reads ~/Library/Application Support/STUDYTERM/widgets.json on every refresh. No file / no entry for this widget →
// it keeps its className spot and the cyan terminal look, exactly as before. "placed": false → stored (renders nothing).
const W_ID = "doom";
const W_CFG = `cat "$HOME/Library/Application Support/STUDYTERM/widgets.json" 2>/dev/null | tr -d '\\n\\r'`;
// schemes = colours. c accent · blue/amber/red status · dim muted · bg panel rgb · inset field rgb · text body. cycle = rainbow hue drift
const W_SCHEMES = {
  cyan:    { c: "#3ef0ff", blue: "#1f8fff", amber: "#ffb84d", red: "#ff5f6d", dim: "#5d7a99", bg: "4,9,20",      inset: "10,24,48",    text: "#cfefff" },
  amber:   { c: "#ffb000", blue: "#ff7b29", amber: "#ffe066", red: "#ff4d3d", dim: "#8f7350", bg: "16,9,2",      inset: "40,22,6",     text: "#ffe9c4" },
  matrix:  { c: "#3dff7f", blue: "#19c25e", amber: "#d8ff47", red: "#ff4f6b", dim: "#4f8a62", bg: "2,13,6",      inset: "6,32,14",     text: "#d4ffe1" },
  vapor:   { c: "#ff5ad9", blue: "#8b6dff", amber: "#ffc857", red: "#ff4f7e", dim: "#8c6fa3", bg: "15,5,25",     inset: "38,14,56",    text: "#f7deff" },
  sunset:  { c: "#ff8c5a", blue: "#ffc06b", amber: "#ffe07a", red: "#ff4f6d", dim: "#9c7a72", bg: "22,9,10",     inset: "52,20,22",    text: "#ffe7dc" },
  ice:     { c: "#eaf6ff", blue: "#8ec9ff", amber: "#ffd38f", red: "#ff8f8f", dim: "#7e90a6", bg: "12,16,24",    inset: "30,38,52",    text: "#f3f8ff" },
  gold:    { c: "#e8c15a", blue: "#c9a227", amber: "#f5dc8c", red: "#d9534f", dim: "#8a7a4f", bg: "8,8,8",       inset: "26,24,18",    text: "#f3e6c0" },
  royal:   { c: "#ffffff", blue: "#d9c8ff", amber: "#ffd479", red: "#ff8fa3", dim: "#b9a3e6", bg: "74,32,140",   inset: "98,54,170",   text: "#f4eeff" },
  marble:  { c: "#2d2a26", blue: "#5b6b7a", amber: "#a07a2c", red: "#b0413e", dim: "#8d877e", bg: "243,240,234", inset: "228,224,216", text: "#3a3631" },
  pastel:  { c: "#8a6fd1", blue: "#5f9bd6", amber: "#d69a4a", red: "#d9707f", dim: "#a59bb4", bg: "251,245,252", inset: "240,232,246", text: "#4d4560" },
  rose:    { c: "#f2b5a7", blue: "#d79a8c", amber: "#f5d0a9", red: "#e0707a", dim: "#8f7471", bg: "26,17,19",    inset: "48,32,35",    text: "#f8e4df" },
  ink:     { c: "#111111", blue: "#3a3a3a", amber: "#8a6d1f", red: "#c0392b", dim: "#8a8a8a", bg: "255,255,255", inset: "240,240,240", text: "#1a1a1a" },
  forest:  { c: "#a8d5a2", blue: "#7fb7a4", amber: "#e3c77a", red: "#e08a7a", dim: "#6f8a6a", bg: "14,26,18",    inset: "26,44,32",    text: "#e2f1df" },
  ocean:   { c: "#7fdbff", blue: "#4aa3df", amber: "#ffd27f", red: "#ff7f8f", dim: "#5f86a3", bg: "6,28,48",     inset: "14,48,76",    text: "#e2f5ff" },
  rainbow: { c: "#ff4fd8", blue: "#4fa8ff", amber: "#ffd84f", red: "#ff4f6b", dim: "#9a7fb8", bg: "12,6,22",     inset: "34,18,52",    text: "#fbeaff", cycle: true },
  vice:    { c: "#ff4fa3", blue: "#2de2e6", amber: "#ffb347", red: "#ff3f5e", dim: "#a07ab8", bg: "24,8,40",     inset: "52,16,72",    text: "#ffe6f3" },
};
// styles = finish. tex grid|scan|glass|marble|none · bw border px · hard = offset shadow · glow = neon text/edges
const W_STYLES = {
  terminal: { tex: "grid",   bin: true,  brackets: true,  radius: 0,  alpha: 0.88, blur: 22, glow: true,  edge: "55", bw: 1 },
  crt:      { tex: "scan",   bin: false, brackets: true,  radius: 4,  alpha: 0.92, blur: 16, glow: true,  edge: "77", bw: 1 },
  glass:    { tex: "glass",  bin: false, brackets: false, radius: 18, alpha: 0.5,  blur: 30, glow: true,  edge: "40", bw: 1 },
  minimal:  { tex: "none",   bin: false, brackets: false, radius: 8,  alpha: 0.95, blur: 10, glow: false, edge: "30", bw: 1 },
  marble:   { tex: "marble", bin: false, brackets: false, radius: 12, alpha: 0.97, blur: 8,  glow: false, edge: "44", bw: 1 },
  paper:    { tex: "none",   bin: false, brackets: false, radius: 14, alpha: 0.98, blur: 0,  glow: false, edge: "18", bw: 1, soft: true },
  bold:     { tex: "none",   bin: false, brackets: false, radius: 0,  alpha: 1,    blur: 0,  glow: false, edge: "",   bw: 2, hard: true },
  vice:     { tex: "vice",   bin: false, brackets: false, radius: 10, alpha: 0.9,  blur: 20, glow: true,  edge: "88", bw: 1 },
};
let C, BLUE, AMBER, RED, DIM, T;
let W_LAST = null, W_POS = { position: "relative" };
const W_RGBA = (hex, a) => { const n = parseInt(String(hex).slice(1), 16) || 0; return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
const W_INSET = () => `rgba(${T.inset},0.55)`;
const W_APPLY = (style, scheme) => {
  const st = W_STYLES[style] ? style : "terminal", sc = W_SCHEMES[scheme] ? scheme : "cyan";
  T = { ...W_STYLES[st], ...W_SCHEMES[sc], name: st };
  C = T.c; BLUE = T.blue; AMBER = T.amber; RED = T.red; DIM = T.dim;
};
W_APPLY("terminal", "cyan");
const W_LOAD = (output) => {
  const m = /CFG:(\{.*\})/.exec(output || "");
  if (m) { try { W_LAST = JSON.parse(m[1]); } catch (e) {} }
  const cfg = W_LAST || {}, g = cfg.global || {}, w = (cfg.widgets || {})[W_ID] || {};
  W_APPLY(w.style || g.style, w.scheme || g.scheme);
  const ok = typeof w.x === "number" && typeof w.y === "number";
  W_POS = ok ? { position: "fixed", left: w.x, top: w.y } : { position: "relative" };
  return { unplaced: w.placed === false };
};
const W_TEX = () => {
  if (T.tex === "grid") return `linear-gradient(${W_RGBA(C, 0.045)} 1px, transparent 1px), linear-gradient(90deg, ${W_RGBA(C, 0.045)} 1px, transparent 1px)`;
  if (T.tex === "scan") return `repeating-linear-gradient(0deg, ${W_RGBA(C, 0.07)} 0px, ${W_RGBA(C, 0.07)} 1px, transparent 1px, transparent 3px)`;
  if (T.tex === "glass") return `linear-gradient(135deg, ${W_RGBA(C, 0.12)}, transparent 55%)`;
  if (T.tex === "marble") {
    const v = W_RGBA(T.dim, 0.38), v2 = W_RGBA(T.dim, 0.2);
    return [
      `linear-gradient(118deg, transparent 31%, ${v} 31.6%, transparent 33%)`,
      `linear-gradient(152deg, transparent 58%, ${v2} 58.5%, transparent 60.5%)`,
      `linear-gradient(28deg, transparent 69%, ${v2} 69.4%, transparent 70.6%)`,
      `linear-gradient(97deg, transparent 12%, ${v2} 12.3%, transparent 13.4%)`,
      `radial-gradient(ellipse at 78% 22%, ${W_RGBA(T.text, 0.06)}, transparent 55%)`,
      `radial-gradient(ellipse at 15% 85%, ${W_RGBA(T.dim, 0.12)}, transparent 50%)`,
    ].join(", ");
  }
  if (T.tex === "vice") return [
    `radial-gradient(ellipse at 88% 118%, ${W_RGBA(T.amber, 0.42)}, transparent 58%)`,
    `radial-gradient(ellipse at 8% -12%, ${W_RGBA(C, 0.30)}, transparent 60%)`,
    `repeating-linear-gradient(0deg, ${W_RGBA(T.blue, 0.07)} 0px, ${W_RGBA(T.blue, 0.07)} 1px, transparent 1px, transparent 9px)`,
    `linear-gradient(160deg, ${W_RGBA(C, 0.10)}, ${W_RGBA(T.blue, 0.08)})`,
  ].join(", ");
  return "none";
};
// col = the widget's own frame colour (STUDY//TERM: dim at standby, amber paused). Flat styles only show
// it when it means something — standby dim would turn their solid border + hard shadow muddy, so they use the accent.
const W_PANEL = (c0) => { const col = !T.glow && c0 === DIM ? C : c0; return ({
  ...W_POS,
  background: `rgba(${T.bg},${T.alpha})`, backdropFilter: `blur(${T.blur}px)`, WebkitBackdropFilter: `blur(${T.blur}px)`,
  border: `${T.bw}px solid ${col}${T.edge}`, borderRadius: T.radius, color: T.text,
  boxShadow: T.hard ? `5px 5px 0 ${col}`
    : T.soft ? "0 10px 26px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.18)"
    : (T.glow ? `0 8px 30px rgba(0,0,0,0.45), 0 0 18px ${col}22` : "0 6px 20px rgba(0,0,0,0.35)") + (T.tex === "scan" ? ", inset 0 0 40px rgba(0,0,0,0.55)" : ""),
  backgroundImage: W_TEX(),
  backgroundSize: T.tex === "grid" ? "12px 12px" : "auto",
  animation: T.cycle ? "wctlhue 16s linear infinite" : "none",
}); };
const W_CSS = `.wctl-noglow * { text-shadow: none !important; filter: none !important; }
@keyframes wctlhue { from { filter: hue-rotate(0deg) } to { filter: hue-rotate(360deg) } }`;
// ── end WIDGET//CTL block ──

// ───────── where things live ─────────
// Engine + IWAD: served by Übersicht from its widgets folder (doom/doom.wasm, doom/DOOM1.WAD — copied there by the
// install / restart scripts from the vault's 00 — Meta/doom/). Saves + config: ~/Library/Application Support/STUDYTERM/doom/
const SAVE_D = `"$HOME/Library/Application Support/STUDYTERM/doom"`;
const ASSET_BASES = ["doom/", "/doom/"];

export const command = `H="$HOME/Library/Application Support/STUDYTERM/hidden"; [ -f "$H" ] && { echo HIDDEN; exit 0; }; echo "CFG:$(${W_CFG})"`;

export const refreshFrequency = 2000; // 2 s — only for theme/position/hidden; the game runs on its own requestAnimationFrame loop

export const className = `
  top: 40px;
  right: 766px;
  font-family: "SF Mono", Menlo, ui-monospace, monospace;
  color: #cfefff;
`;

export const initialState = { output: "", f: 0 };

export const updateState = (ev, prev) => {
  switch (ev.type) {
    case "UB/COMMAND_RAN":
      return { ...prev, output: ev.output || prev.output };
    case "FRAME":
      return { ...prev, f: ev.f };
    default:
      return prev;
  }
};

// ── DOOM host: a minimal in-memory WASI for doomgeneric (wasm32-wasi reactor). Shared by the widget and the test. ──
// FS: "/" holds doom1.wad (read-only bytes) + whatever the engine writes (default.cfg, savegames) — kept in memory,
// with onSave(name, bytes) called when a file is closed after writing so the caller can persist it.
const DOOM_HOST = (wasmBytes, files, nowMs, onSave, log) => {
  const E = { OK: 0, BADF: 8, EXIST: 20, INVAL: 28, ISDIR: 31, NOENT: 44, NOTDIR: 54 };
  const FS = new Map(); // "/path" → { data: Uint8Array, size }
  const DIRS = new Set(["/"]);
  Object.keys(files).forEach((k) => FS.set("/" + k, { data: files[k], size: files[k].length }));
  const fds = new Map([[3, { dir: "/" }]]);
  let nextFd = 4, mem = null, exitCode = null;
  const u8 = () => new Uint8Array(mem.buffer), dv = () => new DataView(mem.buffer);
  const str = (p, n) => new TextDecoder().decode(u8().subarray(p, p + n));
  const norm = (base, rel) => {
    const parts = (rel.startsWith("/") ? rel : base.replace(/\/$/, "") + "/" + rel).split("/");
    const out = [];
    parts.forEach((s) => { if (!s || s === ".") return; if (s === "..") out.pop(); else out.push(s); });
    return "/" + out.join("/");
  };
  const ci = (p) => { if (FS.has(p)) return p; const l = p.toLowerCase(); for (const k of FS.keys()) if (k.toLowerCase() === l) return k; return p; };
  let outBuf = "";
  const W = {
    fd_prestat_get: (fd, p) => { if (fd !== 3) return E.BADF; const d = dv(); d.setUint8(p, 0); d.setUint32(p + 4, 1, true); return E.OK; },
    fd_prestat_dir_name: (fd, p, n) => { if (fd !== 3) return E.BADF; u8()[p] = 47; return E.OK; },
    fd_fdstat_get: (fd, p) => {
      const d = dv(), f = fds.get(fd);
      if (fd > 2 && !f) return E.BADF;
      d.setUint8(p, fd <= 2 ? 2 : f.dir ? 3 : 4); d.setUint16(p + 2, 0, true);
      d.setBigUint64(p + 8, BigInt("0xffffffffffffffff"), true); d.setBigUint64(p + 16, BigInt("0xffffffffffffffff"), true);
      return E.OK;
    },
    fd_fdstat_set_flags: () => E.OK,
    path_open: (dirfd, dflags, pp, pl, oflags, rb, ri, fdflags, outp) => {
      const base = fds.get(dirfd); if (!base || !base.dir) return E.BADF;
      let path = ci(norm(base.dir, str(pp, pl)));
      if (DIRS.has(path)) { const fd = nextFd++; fds.set(fd, { dir: path }); dv().setUint32(outp, fd, true); return E.OK; }
      if (oflags & 2) return E.NOTDIR;
      let f = FS.get(path);
      if (f && (oflags & 4)) return E.EXIST;
      if (!f) { if (!(oflags & 1)) return E.NOENT; f = { data: new Uint8Array(1024), size: 0 }; FS.set(path, f); }
      if (oflags & 8) f.size = 0;
      const fd = nextFd++; fds.set(fd, { path, f, pos: (fdflags & 1) ? f.size : 0, dirty: !!(oflags & 9) });
      dv().setUint32(outp, fd, true); return E.OK;
    },
    fd_read: (fd, iovs, n, outp) => {
      const h = fds.get(fd); if (!h || !h.f) return fd === 0 ? (dv().setUint32(outp, 0, true), E.OK) : E.BADF;
      const d = dv(), m = u8(); let tot = 0;
      for (let i = 0; i < n; i++) {
        const b = d.getUint32(iovs + i * 8, true), l = d.getUint32(iovs + i * 8 + 4, true);
        const c = Math.max(0, Math.min(l, h.f.size - h.pos));
        m.set(h.f.data.subarray(h.pos, h.pos + c), b); h.pos += c; tot += c; if (c < l) break;
      }
      d.setUint32(outp, tot, true); return E.OK;
    },
    fd_write: (fd, iovs, n, outp) => {
      const d = dv(), m = u8(); let tot = 0;
      for (let i = 0; i < n; i++) {
        const b = d.getUint32(iovs + i * 8, true), l = d.getUint32(iovs + i * 8 + 4, true), chunk = m.subarray(b, b + l);
        if (fd <= 2) { outBuf += new TextDecoder().decode(chunk); let k; while ((k = outBuf.indexOf("\n")) >= 0) { log && log(outBuf.slice(0, k)); outBuf = outBuf.slice(k + 1); } }
        else {
          const h = fds.get(fd); if (!h || !h.f) return E.BADF;
          const need = h.pos + l;
          if (need > h.f.data.length) { const nd = new Uint8Array(Math.max(need, h.f.data.length * 2)); nd.set(h.f.data.subarray(0, h.f.size)); h.f.data = nd; }
          h.f.data.set(chunk, h.pos); h.pos += l; h.f.size = Math.max(h.f.size, h.pos); h.dirty = true;
        }
        tot += l;
      }
      d.setUint32(outp, tot, true); return E.OK;
    },
    fd_seek: (fd, off, whence, outp) => {
      const h = fds.get(fd); if (!h || !h.f) return E.BADF;
      const o = Number(off), np = whence === 0 ? o : whence === 1 ? h.pos + o : h.f.size + o;
      if (np < 0) return E.INVAL;
      h.pos = np; dv().setBigUint64(outp, BigInt(np), true); return E.OK;
    },
    fd_close: (fd) => {
      const h = fds.get(fd); if (!h) return E.BADF;
      fds.delete(fd);
      if (h.f && h.dirty && onSave) onSave(h.path.slice(1), h.f.data.slice(0, h.f.size));
      return E.OK;
    },
    path_create_directory: (dirfd, pp, pl) => { const p = norm(fds.get(dirfd).dir, str(pp, pl)); if (DIRS.has(p)) return E.EXIST; DIRS.add(p); return E.OK; },
    path_remove_directory: (dirfd, pp, pl) => { DIRS.delete(norm(fds.get(dirfd).dir, str(pp, pl))); return E.OK; },
    path_unlink_file: (dirfd, pp, pl) => { const p = ci(norm(fds.get(dirfd).dir, str(pp, pl))); return FS.delete(p) ? E.OK : E.NOENT; },
    path_rename: (fa, pa, la, fb, pb, lb) => {
      const a = ci(norm(fds.get(fa).dir, str(pa, la))), b = norm(fds.get(fb).dir, str(pb, lb)), f = FS.get(a);
      if (!f) return E.NOENT; FS.delete(a); FS.set(b, f); if (onSave) onSave(b.slice(1), f.data.slice(0, f.size)); return E.OK;
    },
    proc_exit: (code) => { exitCode = code; throw new Error("DOOM_EXIT " + code); },
  };
  const mod = new WebAssembly.Module(wasmBytes);
  const imports = { wasi_snapshot_preview1: W, env: { js_ticks: () => Math.floor(nowMs()) >>> 0 } };
  WebAssembly.Module.imports(mod).forEach((i) => {
    const ns = imports[i.module] || (imports[i.module] = {});
    if (!ns[i.name]) ns[i.name] = () => { log && log("missing import " + i.module + "." + i.name); return 52; };
  });
  const inst = new WebAssembly.Instance(mod, imports);
  mem = inst.exports.memory;
  inst.exports._initialize && inst.exports._initialize();
  const X = inst.exports, RW = X.dw_w(), RH = X.dw_h();
  const guard = (f) => { if (exitCode !== null) return false; try { f(); return true; } catch (e) { if (exitCode === null) { exitCode = -1; log && log("crash: " + e.message); } return false; } };
  return {
    w: RW, h: RH,
    init: () => guard(() => X.dw_init()),
    tick: () => guard(() => X.dw_tick()),
    key: (down, k) => { if (exitCode === null) X.dw_key(down ? 1 : 0, k); },
    exited: () => exitCode,
    frame: (img) => { // img: Uint8ClampedArray RGBA, RW*RH*4
      const src = new Uint8Array(mem.buffer, X.dw_screen(), RW * RH * 4);
      for (let i = 0; i < src.length; i += 4) { img[i] = src[i + 2]; img[i + 1] = src[i + 1]; img[i + 2] = src[i]; img[i + 3] = 255; }
    },
  };
};

// ───────── session (module scope: survives re-renders, resets when the file is reloaded) ─────────
const PW = 472, PH = 360, SCALE = 1.35, TIC = 1000 / 35;
const D = {
  state: "idle",   // idle · loading · play · pause · error · quit
  msg: "", eng: null, canvas: null, ctx: null, img: null, vt: 0, last: 0, acc: 0,
  held: new Set(), f: 0, dispatch: null, assets: null, fps: 0, fpsN: 0, fpsT: 0,
};
const bump = () => { D.f++; if (D.dispatch) D.dispatch({ type: "FRAME", f: D.f }); };

const b64 = (bytes) => { let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (s) => { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
const safe = (name) => name.replace(/\//g, "~").replace(/[^A-Za-z0-9._~-]/g, "_");

const persist = (name, bytes) => {
  if (name.toLowerCase() === "doom1.wad") return;
  run(`D=${SAVE_D}; mkdir -p "$D"; echo '${b64(bytes)}' | base64 -D > "$D/${safe(name)}"`).catch(() => {});
};

const loadSaves = () => run(`cd ${SAVE_D} 2>/dev/null && for f in *; do [ -f "$f" ] && printf 'F:%s:' "$f" && base64 < "$f" | tr -d '\\n' && echo; done; true`)
  .then((out) => {
    const files = {};
    (out || "").split("\n").forEach((l) => { const m = /^F:([^:]+):(.*)$/.exec(l); if (m && m[2]) { try { files[m[1].replace(/~/g, "/")] = unb64(m[2]); } catch (e) {} } });
    return files;
  }).catch(() => ({}));

const fetchFirst = (file) => {
  const tryAt = (i) => i >= ASSET_BASES.length
    ? Promise.reject(new Error(`${file} not found — run install.command again`))
    : fetch(ASSET_BASES[i] + file).then((r) => (r.ok ? r.arrayBuffer().then((a) => new Uint8Array(a)) : tryAt(i + 1)), () => tryAt(i + 1));
  return tryAt(0);
};

const boot = () => {
  if (D.state === "loading") return;
  D.state = "loading"; D.msg = "LOADING WAD…"; bump();
  const assets = D.assets ? Promise.resolve(D.assets)
    : Promise.all([fetchFirst("doom.wasm"), fetchFirst("DOOM1.WAD")]).then(([wasm, wad]) => (D.assets = { wasm, wad }));
  assets.then(() => loadSaves()).then((saved) => {
    const files = { ...saved, "doom1.wad": D.assets.wad };
    D.vt = 0;
    D.eng = DOOM_HOST(D.assets.wasm, files, () => D.vt, persist, (s) => { D.msg = s.slice(0, 60); });
    D.img = null;
    if (!D.eng.init()) throw new Error(D.msg || "engine stopped during start-up");
    D.state = "play"; D.msg = ""; D.last = performance.now(); D.acc = 0;
    if (D.canvas && D.canvas.parentNode) D.canvas.parentNode.focus();
    draw(); bump();
  }).catch((e) => { D.state = "error"; D.msg = String((e && e.message) || e).slice(0, 80); bump(); });
};

const releaseAll = () => { if (D.eng) D.held.forEach((k) => D.eng.key(false, k)); D.held.clear(); };
const pause = () => { if (D.state === "play") { releaseAll(); D.state = "pause"; bump(); } };
const resume = () => { if (D.state === "pause") { D.state = "play"; D.last = performance.now(); D.acc = 0; bump(); } };

const draw = () => {
  if (!D.eng || !D.ctx) return;
  if (!D.img || D.img.width !== D.eng.w) D.img = D.ctx.createImageData(D.eng.w, D.eng.h);
  D.eng.frame(D.img.data);
  D.ctx.putImageData(D.img, 0, 0);
};

const loop = (now) => {
  try {
    if (D.state === "play" && D.eng) {
      D.acc += Math.min(now - D.last, 250);
      let n = 0;
      while (D.acc >= TIC && n < 4) {          // virtual clock: one engine tic per 1/35 s, never busy-waits
        D.acc -= TIC; D.vt += TIC; n++;
        if (!D.eng.tick()) { releaseAll(); D.state = D.eng.exited() === 0 ? "quit" : "error"; if (D.state === "error" && !D.msg) D.msg = "engine crashed"; bump(); break; }
      }
      if (n) { draw(); D.fpsN++; }
      if (now - D.fpsT > 1000) { D.fps = D.fpsN; D.fpsN = 0; D.fpsT = now; }
    }
    D.last = now;
  } catch (e) { D.state = "error"; D.msg = String(e.message || e).slice(0, 80); bump(); }
  window.__doomRAF = requestAnimationFrame(loop);
};
try { if (window.__doomRAF) cancelAnimationFrame(window.__doomRAF); window.__doomRAF = requestAnimationFrame(loop); } catch (e) {}

// browser key → Doom key (doomkeys.h)
const KEYMAP = {
  ArrowLeft: 0xac, ArrowRight: 0xae, ArrowUp: 0xad, ArrowDown: 0xaf,
  ",": 0xa0, "<": 0xa0, ".": 0xa1, ">": 0xa1,           // strafe left / right
  Control: 0xa3, " ": 0xa2,                             // fire · use / open
  Shift: 0xb6, Alt: 0xb8,                               // run · strafe modifier
  Enter: 13, Escape: 27, Tab: 9, Backspace: 0x7f, Delete: 0x7f,
  "-": 0x2d, "=": 0x3d, "+": 0x3d,
  F1: 0xbb, F2: 0xbc, F3: 0xbd, F4: 0xbe, F5: 0xbf, F6: 0xc0, F7: 0xc1, F8: 0xc2, F9: 0xc3, F10: 0xc4, F11: 0xd7,
};
const doomKey = (e) => {
  if (KEYMAP[e.key] !== undefined) return KEYMAP[e.key];
  if (e.key.length === 1) { const c = e.key.toLowerCase().charCodeAt(0); if (c >= 32 && c < 127) return c; }
  return null;
};

const onKeyDown = (e) => {
  if (e.metaKey) return;                                  // leave ⌘-shortcuts to macOS
  if (D.state !== "play") {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); D.state === "pause" ? resume() : (D.state === "idle" || D.state === "quit" || D.state === "error") && boot(); }
    return;
  }
  const k = doomKey(e); if (k === null) return;
  e.preventDefault(); e.stopPropagation();
  if (e.repeat) return;
  D.held.add(k); D.eng.key(true, k);
};
const onKeyUp = (e) => {
  if (D.state !== "play") return;
  const k = doomKey(e); if (k === null) return;
  e.preventDefault(); e.stopPropagation();
  D.held.delete(k); D.eng.key(false, k);
};
const onMouseDown = (e) => {
  e.currentTarget.focus();
  if (D.state === "idle" || D.state === "quit" || D.state === "error") { boot(); return; }
  if (D.state === "pause") { resume(); return; }
  if (D.state === "play" && e.button === 0) { D.held.add(0xa3); D.eng.key(true, 0xa3); }   // click = fire
};
const onMouseUp = (e) => { if (D.state === "play" && e.button === 0) { D.held.delete(0xa3); D.eng.key(false, 0xa3); } };

const setCanvas = (el) => {
  if (!el || el === D.canvas) return;
  D.canvas = el; D.ctx = el.getContext("2d"); D.img = null;
  if (D.eng) draw();
};

// ───────── look ─────────
const BIN = "0110100101110011 1000110101001011 0011101011000101 1101001010010110 0101110100101101 1010011101010010 0110101100101011 1001010111010010 0101101001110101 1100101011010010 0011010110101101 1001011010110100";

const Bracket = ({ pos, color }) => {
  const p = {
    tl: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 },
    tr: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 },
    bl: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 },
    br: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },
  }[pos];
  return <div style={{ position: "absolute", width: 10, height: 10, borderColor: color, borderStyle: "solid", borderWidth: 0, filter: `drop-shadow(0 0 3px ${color})`, ...p }} />;
};

const CSS = `
@keyframes dmblink { 0%,55% { opacity: 1 } 56%,100% { opacity: .25 } }
.dm-screen:focus { outline: none }
`;

export const render = ({ output }, dispatch) => {
  D.dispatch = dispatch;
  if (/^HIDDEN/.test(output || "")) { setTimeout(pause, 0); return <div />; }
  const W_L = W_LOAD(output);
  if (W_L.unplaced) { setTimeout(pause, 0); return <div />; }

  const col = D.state === "error" ? RED : D.state === "pause" || D.state === "loading" ? AMBER : D.state === "quit" ? DIM : C;
  const head = D.state === "play" ? `▶ ${D.fps || 35} FPS` : D.state === "pause" ? "II PAUSE" : D.state === "loading" ? "… LOADING" : D.state === "error" ? "✕ ERROR" : D.state === "quit" ? "■ QUIT" : "STANDBY";
  const SW = Math.round(320 * SCALE), SH = Math.round(200 * SCALE);

  const overlay = D.state === "play" ? null : (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: `rgba(${T.bg},${D.eng && D.state === "pause" ? 0.55 : 0.82})`, textAlign: "center", gap: 7, pointerEvents: "none" }}>
      {D.state === "idle" && <div style={{ fontSize: 15, letterSpacing: 6, color: RED, textShadow: T.glow ? `0 0 10px ${RED}` : "none" }}>DOOM</div>}
      {D.state === "pause" && <div style={{ fontSize: 11, letterSpacing: 2, color: AMBER, textShadow: T.glow ? `0 0 8px ${AMBER}` : "none" }}>II PAUSED</div>}
      {D.state === "quit" && <div style={{ fontSize: 11, letterSpacing: 2, color: T.text }}>THANKS FOR PLAYING</div>}
      {D.state === "error" && <div style={{ fontSize: 9, letterSpacing: 1, color: RED, maxWidth: 380 }}>{D.msg}</div>}
      {D.state === "loading" && <div style={{ fontSize: 9, letterSpacing: 1.5, color: AMBER }}>{D.msg}</div>}
      {D.state !== "loading" && <div style={{ fontSize: 8, letterSpacing: 1.5, color: C, animation: "dmblink 1.2s steps(1) infinite" }}>
        {D.state === "pause" ? "CLICK TO RESUME" : D.state === "error" ? "CLICK TO RETRY" : D.state === "quit" ? "CLICK TO REBOOT" : "▶ CLICK TO PLAY"}
      </div>}
    </div>
  );

  return (
    <div className={"wctl-" + T.name + (T.glow ? "" : " wctl-noglow")} style={{
      width: PW, height: PH, padding: "14px 18px 12px", overflow: "hidden",
      boxSizing: "border-box", display: "flex", flexDirection: "column",
      ...W_PANEL(col),
    }}>
      <style>{CSS}</style>
      <style>{W_CSS}</style>
      {T.bin && <div style={{ position: "absolute", inset: 0, fontSize: 8, lineHeight: "10px", letterSpacing: 2, color: C, opacity: 0.06, wordBreak: "break-all", pointerEvents: "none" }}>{BIN}{BIN}{BIN}{BIN}</div>}
      {T.brackets && ["tl", "tr", "bl", "br"].map((p) => <Bracket key={p} pos={p} color={col} />)}

      {/* header */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, letterSpacing: 2, flexShrink: 0 }}>
        <span style={{ color: C, textShadow: T.glow ? `0 0 6px ${C}` : "none" }}>DOOM//TERM</span>
        <span style={{ fontSize: 8, letterSpacing: 1.5, color: DIM }}>E1 · KNEE-DEEP IN THE DEAD</span>
        <span style={{ fontSize: 8.5, letterSpacing: 1.5, color: col }}>{head}</span>
      </div>
      <div style={{ position: "relative", height: 1, background: `${C}33`, margin: "8px 0 8px", flexShrink: 0 }} />

      {/* screen — focusable: keys only arrive while it has focus; clicking elsewhere pauses */}
      <div className="dm-screen" tabIndex={0} onKeyDown={onKeyDown} onKeyUp={onKeyUp} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
        onBlur={pause} onContextMenu={(e) => e.preventDefault()} style={{
          position: "relative", width: SW, height: SH, margin: "0 auto", flexShrink: 0, cursor: "crosshair",
          outline: `1px solid ${col}${D.state === "play" ? "66" : "33"}`, outlineOffset: 1, background: "#000", userSelect: "none",
        }}>
        <canvas key="doom-canvas" ref={setCanvas} width={320} height={200}
          style={{ width: SW, height: SH, display: "block", imageRendering: "pixelated" }} />
        {overlay}
      </div>

      <div style={{ position: "relative", marginTop: "auto", display: "flex", justifyContent: "space-between", fontSize: 6.5, letterSpacing: 0.6, color: DIM }}>
        <span>←↑↓→ MOVE · ,/. STRAFE · ⇧ RUN</span>
        <span>CTRL/CLICK FIRE · ␣ USE · 1-7 GUNS · TAB MAP · ESC MENU</span>
      </div>
    </div>
  );
};
