// Builds the animated ASCII SVGs for the profile README. No dependencies: node scripts/build.mjs
// scripts/portrait.json is the avatar sampled to a 76x38 pixel grid (one pixel per character cell).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONT = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono','DejaVu Sans Mono',monospace";
const C = { bg: '#0b0e14', bar: '#131722', line: '#262b36', text: '#d0d7e2', dim: '#7d8796', accent: '#ff8a4c', green: '#56d364', blue: '#6cb6ff', purple: '#b392f0' };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const n = (v) => +v.toFixed(2);

function chrome(w, h, title) {
  return `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="${C.bg}" stroke="${C.line}"/>
<path d="M1 37V13A12 12 0 0 1 13 1H${w - 13}A12 12 0 0 1 ${w - 1} 13V37Z" fill="${C.bar}"/>
<circle cx="22" cy="19" r="6" fill="#ff5f57"/><circle cx="42" cy="19" r="6" fill="#febc2e"/><circle cx="62" cy="19" r="6" fill="#28c840"/>
<text x="${w / 2}" y="23.5" text-anchor="middle" font-size="12.5" fill="${C.dim}">${esc(title)}</text>`;
}
// A clip that wipes from the left: the "typing" effect. Returns [defs, clip-path attribute].
let clipId = 0;
function wipe(x, y, w, h, begin, dur) {
  const id = `w${clipId++}`;
  return [`<clipPath id="${id}"><rect x="${n(x)}" y="${n(y)}" width="0" height="${n(h)}"><animate attributeName="width" from="0" to="${n(w)}" begin="${n(begin)}s" dur="${n(dur)}s" fill="freeze"/></rect></clipPath>`, `clip-path="url(#${id})"`];
}
const svgOpen = (w, h, label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="${FONT}" role="img" aria-label="${esc(label)}">\n<title>${esc(label)}</title>`;

// ---------------------------------------------------------------- hero.svg
function hero() {
  const W = 960, H = 512;
  const g = JSON.parse(readFileSync(join(root, 'scripts/portrait.json'), 'utf8'));
  const ramp = " .,:;i1tfLCG08@";
  const cw = 4.8, chh = 9.6, px = 28, py = 78;
  const defs = [], out = [];
  out.push(chrome(W, H, 'victor@github: ~'));

  // prompt
  const cell = 8.4;
  const cmd = '$ neofetch --ascii me.png';
  let [d, cp] = wipe(28, 46, cmd.length * cell, 22, 0.3, 0.9);
  defs.push(d);
  out.push(`<text x="28" y="62" font-size="14" fill="${C.text}" xml:space="preserve" textLength="${n(cmd.length * cell)}" ${cp}><tspan fill="${C.green}">$</tspan>${esc(cmd.slice(1))}</text>`);

  // portrait: one <text> per row, colour runs as tspans
  // 1. classify cells. The photo's background is foliage (green) and a sofa (blue): key both out.
  //    Dark neutral cells are hair only inside an ellipse around the head; elsewhere they are shadow.
  const at = (x, y) => { const i = (y * g.cols + x) * 4; return [g.rgba[i], g.rgba[i + 1], g.rgba[i + 2]]; };
  const lum = ([r, gg, b]) => (0.2126 * r + 0.7152 * gg + 0.0722 * b) / 255;
  const on = [];
  for (let y = 0; y < g.rows; y++) for (let x = 0; x < g.cols; x++) {
    const [r, gg, b] = at(x, y), l = lum([r, gg, b]);
    const bg = (gg > r + 4 && gg >= b - 2) || b > r + 8;
    const inHead = ((x - 41) / 17.5) ** 2 + ((y - 6) / 7.5) ** 2 <= 1;
    on.push(!bg && (l >= 0.2 || inHead));
  }
  // 2. keep only the connected shape that contains the person (seed: the chest)
  const keep = new Uint8Array(on.length), stack = [[42, 30]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= g.cols || y >= g.rows) continue;
    const k = y * g.cols + x;
    if (keep[k] || !on[k]) continue;
    keep[k] = 1;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) stack.push([x + dx, y + dy]);
  }
  // 3. characters and colours
  const rows = [];
  for (let y = 0; y < g.rows; y++) {
    let runs = [], cur = null;
    for (let x = 0; x < g.cols; x++) {
      const [r, gg, b] = at(x, y), l = lum([r, gg, b]);
      const t = Math.pow(Math.max(0, Math.min(1, (l - 0.06) / 0.86)), 0.85);
      const ch = keep[y * g.cols + x] ? ramp[Math.max(4, Math.min(ramp.length - 1, Math.floor(t * ramp.length)))] : ' ';
      // lift the colour so characters stay visible on the dark background, then quantize
      const lift = (v) => Math.min(255, Math.round((v * 1.2 + 52) / 17) * 17);
      const col = '#' + [r, gg, b].map((v) => lift(v).toString(16).padStart(2, '0')).join('');
      if (cur && (cur.col === col || ch === ' ')) cur.s += ch; else { cur = { col, s: ch }; runs.push(cur); }
    }
    rows.push(runs);
  }
  out.push(`<g font-size="8" font-weight="700">`);
  rows.forEach((runs, y) => {
    const ty = py + y * chh;
    const [dd, c2] = wipe(px, ty, g.cols * cw, chh + 1, 1.3 + y * 0.05, 0.45);
    defs.push(dd);
    out.push(`<text x="${px}" y="${n(ty + 7.6)}" xml:space="preserve" textLength="${n(g.cols * cw)}" lengthAdjust="spacingAndGlyphs" ${c2}>${runs.map((r) => `<tspan fill="${r.col}">${esc(r.s)}</tspan>`).join('')}</text>`);
  });
  out.push(`</g>`);
  // info column
  const ix = 424, iy = 98, lh = 25.5;
  const info = [
    ['head', 'victor', '@', 'github'],
    ['rule', '─'.repeat(44)],
    ['name', 'Victor Lima'],
    ['role', 'Full-stack developer · SaaS founder'],
    ['based', 'Uberaba, Brazil'],
    ['building', 'Floq (agent canvas) · Flowless (AI for SMBs)'],
    ['langs', 'TypeScript · Rust · Python · Dart · SQL'],
    ['frontend', 'React · Next.js · Tauri · Tailwind'],
    ['backend', 'Node.js · Python · FastAPI · PostgreSQL · Redis'],
    ['infra', 'Docker · Linux · GCP · self-hosted'],
    ['ai', 'agent orchestration · LLMs · embeddings'],
    ['contact', 'victor@l1ma.com'],
  ];
  info.forEach((row, i) => {
    const y = iy + i * lh;
    const [dd, c2] = wipe(ix, y - 16, 510, 22, 1.7 + i * 0.2, 0.35);
    defs.push(dd);
    let inner;
    if (row[0] === 'head') inner = `<tspan fill="${C.accent}" font-weight="700">${row[1]}</tspan><tspan fill="${C.dim}">${row[2]}</tspan><tspan fill="${C.accent}" font-weight="700">${row[3]}</tspan>`;
    else if (row[0] === 'rule') inner = `<tspan fill="${C.line}">${row[1]}</tspan>`;
    else inner = `<tspan fill="${C.accent}">${row[0].padEnd(10)}</tspan><tspan fill="${C.text}">${esc(row[1])}</tspan>`;
    const len = row[0] === 'head' ? 13 : row[0] === 'rule' ? 44 : 10 + row[1].length;
    out.push(`<text x="${ix}" y="${n(y)}" font-size="14" xml:space="preserve" textLength="${n(len * cell)}" ${c2}>${inner}</text>`);
  });
  // colour swatches
  const sw = ['#ff5f57', C.accent, '#febc2e', C.green, C.blue, C.purple, C.text, C.dim];
  const sy = iy + info.length * lh - 4;
  sw.forEach((col, i) => out.push(`<rect x="${ix + i * 30}" y="${n(sy)}" width="22" height="14" rx="3" fill="${col}" opacity="0"><animate attributeName="opacity" from="0" to="1" begin="${n(4.2 + i * 0.07)}s" dur="0.2s" fill="freeze"/></rect>`));

  // bottom prompt with phrases that type, hold and clear in a loop
  const by = 484, bx = 28 + 2 * cell;
  out.push(`<line x1="28" y1="456" x2="${W - 28}" y2="456" stroke="${C.line}"/>`);
  out.push(`<text x="28" y="${by}" font-size="14" fill="${C.green}">$</text>`);
  const phrases = ['building Floq, a desktop canvas for AI coding agents', 'building Flowless, AI agents on WhatsApp for small businesses', 'automating invoices and fiscal workflows for real businesses', 'open to full-stack and AI tooling roles · say hi'];
  const span = 1 / phrases.length, cyc = 4.5 * phrases.length, kx = [], kt = [];
  phrases.forEach((p, i) => {
    const a = i / phrases.length, w = p.length * cell, id = `p${i}`;
    const t1 = a + span * 0.33, t2 = a + span * 0.9, t3 = a + span * 0.97;
    const times = [0, a, t1, t2, t3, 1].map((v) => +v.toFixed(4)).join(';');
    defs.push(`<clipPath id="${id}"><rect x="${n(bx)}" y="${by - 16}" width="0" height="22"><animate attributeName="width" values="0;0;${n(w)};${n(w)};0;0" keyTimes="${times}" begin="4s" dur="${cyc}s" repeatCount="indefinite"/></rect></clipPath>`);
    out.push(`<text x="${n(bx)}" y="${by}" font-size="14" fill="${C.text}" xml:space="preserve" textLength="${n(w)}" clip-path="url(#${id})">${esc(p)}</text>`);
    kx.push(bx, bx + w, bx + w, bx); kt.push(a, t1, t2, t3);
  });
  kx.push(bx); kt.push(1);
  out.push(`<rect x="${n(bx)}" y="${by - 13}" width="8" height="16" fill="${C.accent}"><animate attributeName="x" values="${kx.map(n).join(';')}" keyTimes="${kt.map((v) => +v.toFixed(4)).join(';')}" begin="4s" dur="${cyc}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1s" repeatCount="indefinite"/></rect>`);

  return `${svgOpen(W, H, 'Terminal running neofetch: an ASCII portrait of Victor Lima next to his role, stack and contact')}\n<defs>${defs.join('')}</defs>\n${out.join('\n')}\n</svg>\n`;
}

// ---------------------------------------------------------------- floq.svg
function floq() {
  const W = 960, H = 296, cell = 7.8, lh = 15, fs = 13;
  const defs = [], out = [];
  out.push(chrome(W, H, 'floq: agents on a server you host'));
  const diagram = [
    '┌──────────────────────────────────┐',
    '│ Floq app   Tauri 2 · React · Rust│',
    '└────────────────┬─────────────────┘',
    '                 │  HTTPS + WebSocket',
    '                 │',
    '┌────────────────┴─────────────────┐   ┌────────────┐',
    '│ Runtime  Node.js · node-pty · ws ├───┤ PostgreSQL │',
    '└────────────────┬─────────────────┘   └────────────┘',
    '                 │  one sandbox per user',
    '                 │',
    '┌────────────────┴─────────────────┐',
    '│ bubblewrap · encrypted home      │',
    '│ claude / codex CLI               │',
    '└──────────────────────────────────┘',
  ];
  const dx = 28, dy = 70, cols = Math.max(...diagram.map((l) => l.length));
  const [dd, c0] = wipe(dx, 44, cols * cell, diagram.length * lh + 20, 0.2, 1.1);
  defs.push(dd);
  out.push(`<g font-size="${fs}" fill="${C.dim}" ${c0}>`);
  diagram.forEach((l, i) => out.push(`<text x="${dx}" y="${dy + i * lh}" xml:space="preserve" textLength="${n(cols * cell)}">${esc(l.padEnd(cols)).replace(/(Floq app|Runtime|PostgreSQL|bubblewrap · encrypted home|claude \/ codex CLI)/g, `<tspan fill="${C.text}">$1</tspan>`)}</text>`));
  out.push(`</g>`);
  // packets travelling along the wires
  const wx = dx + 17.5 * cell, rowY = (r) => dy + r * lh - 4.5;
  const packet = (x1, y1, x2, y2, col, begin, dur) => `<circle r="3.2" fill="${col}" opacity="0"><animate attributeName="cx" values="${n(x1)};${n(x2)}" begin="${begin}s" dur="${dur}s" repeatCount="indefinite"/><animate attributeName="cy" values="${n(y1)};${n(y2)}" begin="${begin}s" dur="${dur}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" begin="${begin}s" dur="${dur}s" repeatCount="indefinite"/></circle>`;
  out.push(packet(wx, rowY(2.6), wx, rowY(5.2), C.accent, 1.4, 1.6), packet(wx, rowY(5.2), wx, rowY(2.6), C.blue, 2.2, 1.6));
  out.push(packet(wx, rowY(7.6), wx, rowY(10.2), C.accent, 1.8, 1.6), packet(wx, rowY(10.2), wx, rowY(7.6), C.green, 2.6, 1.6));
  out.push(packet(dx + 35.5 * cell, rowY(6), dx + 38.5 * cell, rowY(6), C.purple, 1.5, 1.1));

  // agents panel
  const ax = 492, ay = 70;
  out.push(`<line x1="468" y1="52" x2="468" y2="${H - 22}" stroke="${C.line}"/>`);
  const line = (i, begin, inner, len) => { const y = ay + i * 23; const [d2, c2] = wipe(ax, y - 15, 450, 21, begin, 0.35); defs.push(d2); out.push(`<text x="${ax}" y="${y}" font-size="${fs}" xml:space="preserve" textLength="${n(len * cell)}" ${c2}>${inner}</text>`); return y; };
  const cmd = '$ floq list';
  line(0, 1.2, `<tspan fill="${C.green}">$</tspan><tspan fill="${C.text}">${cmd.slice(1)}</tspan>`, cmd.length);
  const agents = [['lead-planner', 'orchestrator', 'running', C.green], ['builder', 'implementer', 'running', C.green], ['reviewer', 'reviewer', 'running', C.green], ['tester', 'tester', 'sleeping', C.dim]];
  const frames = ['|', '/', '-', '\\'];
  agents.forEach(([name, role, state, col], i) => {
    const txt = `  ${name.padEnd(15)}${role.padEnd(15)}${state}`;
    const y = line(i + 1, 1.9 + i * 0.3, `<tspan fill="${C.text}">  ${name.padEnd(15)}</tspan><tspan fill="${C.dim}">${role.padEnd(15)}</tspan><tspan fill="${col}">${state}</tspan>`, txt.length);
    if (state === 'running') frames.forEach((f, k) => { const v = frames.map((_, j) => (j === k ? 1 : 0)).join(';'); out.push(`<text x="${ax}" y="${y}" font-size="${fs}" fill="${C.accent}" opacity="0">${esc(f)}<animate attributeName="opacity" values="${v}" calcMode="discrete" begin="${n(2.4 + i * 0.3)}s" dur="0.48s" repeatCount="indefinite"/></text>`); });
    else out.push(`<text x="${ax}" y="${y}" font-size="${fs}" fill="${C.dim}" opacity="0">z<animate attributeName="opacity" from="0" to="1" begin="3.2s" dur="0.2s" fill="freeze"/></text>`);
  });
  const cmd2 = '$ floq approval request --action "push to main"';
  line(6, 3.6, `<tspan fill="${C.green}">$</tspan><tspan fill="${C.text}">${esc(cmd2.slice(1))}</tspan>`, cmd2.length);
  // waiting <-> GRANTED loop
  const y7 = ay + 7 * 23, loop = 7;
  out.push(`<text x="${ax}" y="${y7}" font-size="${fs}" fill="${C.dim}" opacity="0" xml:space="preserve">  waiting for the user in the Floq app ...<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.45;0.45;1" calcMode="discrete" begin="4.2s" dur="${loop}s" repeatCount="indefinite"/></text>`);
  out.push(`<text x="${ax}" y="${y7}" font-size="${fs}" fill="${C.green}" font-weight="700" opacity="0" xml:space="preserve">  GRANTED<tspan fill="${C.dim}" font-weight="400">  single use, verified before acting</tspan><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.45;0.45;1" calcMode="discrete" begin="4.2s" dur="${loop}s" repeatCount="indefinite"/></text>`);
  const tag = 'agents recruit, message and wait for your approval';
  line(9, 4.4, `<tspan fill="${C.dim}"># ${esc(tag)}</tspan>`, tag.length + 2);

  return `${svgOpen(W, H, 'Floq architecture: desktop app, self-hosted runtime with PostgreSQL, sandboxed agent CLIs, and a terminal listing running agents and an approval request')}\n<defs>${defs.join('')}</defs>\n${out.join('\n')}\n</svg>\n`;
}

mkdirSync(join(root, 'assets'), { recursive: true });
writeFileSync(join(root, 'assets/hero.svg'), hero());
writeFileSync(join(root, 'assets/floq.svg'), floq());
console.log('built assets/hero.svg, assets/floq.svg');
