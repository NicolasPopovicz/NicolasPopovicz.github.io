/* Portfólio de Nicolas Popovicz: terminal interativo (compartilhado por / e /en/; textos em PT e EN) */
(() => {
    'use strict';

    /* ── CONFIG ─────────────────────────────────────────────────── */
    const CFG = {
        rerunOnSwitch: false, // true: digita o --help de novo toda vez que voltar para a aba
        typeMin: 18, typeMax: 46, // ms por tecla
        startDelay: 240,          // pausa antes de começar a digitar
        printMs: 520,             // tempo total para "imprimir" a saída
        fitMin: 11.5, fitMax: 15.5, // faixa do ajuste automático da fonte (desktop)
    };
    const CH = 0.5859; // largura de um caractere da Cascadia Code, em em

    /* ── HELPERS ────────────────────────────────────────────────── */
    const D = document, R = D.documentElement;
    const $ = (s, r = D) => r.querySelector(s);
    const $$ = (s, r = D) => Array.from(r.querySelectorAll(s));
    const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const TOUCH = matchMedia('(pointer: coarse)').matches;
    const MOBILE = matchMedia('(max-width: 760px)');
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const frame = () => new Promise(r => requestAnimationFrame(r));
    const rand = (a, b) => a + Math.random() * (b - a);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { /* bloqueado */ } },
    };

    const win = $('#win'), scr = $('#screen'), titleEl = $('#wtitle'), tabsNav = $('#tabs');
    const ended = $('#ended'), dock = $('#dock'), profileBtn = $('#profile-btn');
    const tabs = $$('.tab', tabsNav), panels = $$('.panel', scr);
    const PS1 = '<span class="ps1" aria-hidden="true"><span class="pa"></span><span class="pb"></span><span class="pc"></span><span class="pd"></span></span>';

    /* ── IDIOMA: a mesma lógica serve / (pt-BR) e /en/ (en); os textos ficam aqui ──
       Os ids das abas são os mesmos nas duas páginas; só o #hash da URL muda de idioma. */
    const EN = /^en/i.test(R.lang);
    const LOCALE = EN ? 'en-US' : 'pt-BR';
    const ROOT = EN ? '../' : '';
    const HASH = EN ? { sobre: 'about', formacao: 'education', contato: 'contact' } : {};
    const hashOf = id => HASH[id] || id;
    const T = EN ? {
        treeCount: (d, f) => `${d} directories, ${f} files`,
        profileLabel: p => `Color profile: ${p}. Click to switch`,
        tooFast: sh => `${sh}: too many commands in a row, wait a moment`,
        links: { email: 'your e-mail client', whatsapp: 'WhatsApp', linkedin: 'LinkedIn', github: 'GitHub' },
        opening: l => `opening ${l}…`,
        version: (n, y) => `${n} ${y}+ years in production (since Feb 2021)`,
        badValue: (n, f, k, keys) => `${n}: invalid value for ${f}: '${k}'\naccepted values: ${keys}`,
        badOption: (n, a) => `${n}: invalid option '${a}'\nTry '${n} --help' for more information.`,
        notFound: {
            mac: c => `zsh: command not found: ${c}`,
            linux: c => `bash: ${c}: command not found`,
            win: c => `${c}: The term '${c}' is not recognized as a name of a cmdlet, function, script file, or executable program.`,
        },
        typeHelp: b => `Type ${b} to see the commands.`,
        help: {
            title: 'nicolas-sh: available commands',
            rows: [['nicolas', 'about me'], ['cases', 'performance in production'], ['experience', 'work history'], ['skills', 'technologies & tools'],
                ['projects', 'GitHub repositories'], ['education', 'education & languages'], ['contact', "let's talk?"]],
            theme: 'theme', profileArg: '[profile]', osArg: '[name]', os: 'mac, win, linux: switches the terminal look',
            foot: '↑/↓ history · Tab completes · Ctrl+L clears · there is an easter egg in the Konami code',
        },
        files: [['sobre', 'about.md'], ['cases', 'cases/', 1], ['experience', 'experience.log'], ['skills', 'skills/', 1], ['projects', 'projects/', 1], ['formacao', 'education.md'], ['contato', 'contact.vcf']],
        catNo: f => `cat: ${f}: No such file or directory`, catLlms: 'open llms.txt',
        profiles: 'profiles: ', autoHint: 'goes back to the system default', autoSet: p => `profile: ${p} (system default)`,
        badProfile: t => `theme: unknown profile '${t}'`, profileSet: t => `profile: ${t}`,
        osNow: n => `current look: ${n}`, osOpts: 'options: ', osBad: v => `os: unknown system '${v}'`, osSet: n => `look: ${n}`,
        sudoHire: '[sudo] password for recruiter: ********\naccess granted. opening contact…',
        sudoNo: '[sudo] password for nicolas:\nnicolas is not in the sudoers file. This incident will be reported.',
        rm: 'rm: permission denied: this portfolio is read-only',
        vim: 'nothing but a portfolio here. (and to quit vim, it is :q!)',
        sameLang: "you're already on the English version",
        ended: {
            mac: 'Saving session...\n...copying shared history...\n...saving history...truncating history files...\n...completed.\n\n[Process completed]',
            linux: 'logout\n\n[process exited with code 0]',
            win: '[process exited with code 0 (0x00000000)]\nYou can now close this terminal with Ctrl+D, or press Enter to restart.',
        },
        tabLimit: 'extra tab limit reached (3)', cmdLabel: 'Command', closeTab: 'Close tab',
        tabsPrev: 'Previous tabs', tabsNext: 'More tabs',
        repos: {
            none: 'No public repositories found.', ok: n => `200 OK · ${n} repositories`, noDesc: 'No description available.',
            err: 'error:', errMsg: "Couldn't load the repositories. See them on GitHub:",
        },
        flags: { cases: '--case', experience: '--company', skills: '--category', formacao: '--languages' },
        langEntry: 'languages',
        complete: ['nicolas', 'cases', 'experience', 'skills', 'projects', 'education', 'contact', 'help', 'clear', 'ls', 'cat', 'cd', 'whoami', 'pwd', 'date', 'echo', 'history', 'theme', 'os', 'exit', 'matrix', 'sudo', 'pt'],
    } : {
        treeCount: (d, f) => `${d} diretórios, ${f} arquivos`,
        profileLabel: p => `Perfil de cores: ${p}. Clique para trocar`,
        tooFast: sh => `${sh}: muitos comandos seguidos, aguarde um instante`,
        links: { email: 'seu cliente de e-mail', whatsapp: 'o WhatsApp', linkedin: 'o LinkedIn', github: 'o GitHub' },
        opening: l => `abrindo ${l}…`,
        version: (n, y) => `${n} ${y}+ anos em produção (desde fev/2021)`,
        badValue: (n, f, k, keys) => `${n}: valor inválido para ${f}: '${k}'\nvalores aceitos: ${keys}`,
        badOption: (n, a) => `${n}: opção inválida '${a}'\nTente '${n} --help' para mais informações.`,
        notFound: {
            mac: c => `zsh: comando não encontrado: ${c}`,
            linux: c => `bash: ${c}: comando não encontrado`,
            win: c => `${c}: O termo '${c}' não é reconhecido como nome de cmdlet, função, arquivo de script ou programa executável.`,
        },
        typeHelp: b => `Digite ${b} para ver os comandos.`,
        help: {
            title: 'nicolas-sh: comandos disponíveis',
            rows: [['nicolas', 'sobre mim'], ['cases', 'performance em produção'], ['experiencia', 'histórico profissional'], ['skills', 'tecnologias & ferramentas'],
                ['projetos', 'repositórios no GitHub'], ['formacao', 'formação & idiomas'], ['contato', 'vamos conversar?']],
            theme: 'tema', profileArg: '[perfil]', osArg: '[nome]', os: 'mac, win, linux: troca o visual do terminal',
            foot: '↑/↓ histórico · Tab completa · Ctrl+L limpa · tem um easter egg no Konami code',
        },
        files: [['sobre', 'sobre.md'], ['cases', 'cases/', 1], ['experience', 'experiencia.log'], ['skills', 'skills/', 1], ['projects', 'projetos/', 1], ['formacao', 'formacao.md'], ['contato', 'contato.vcf']],
        catNo: f => `cat: ${f}: arquivo ou diretório inexistente`, catLlms: 'abrir llms.txt',
        profiles: 'perfis: ', autoHint: 'volta ao padrão do sistema', autoSet: p => `perfil: ${p} (padrão do sistema)`,
        badProfile: t => `tema: perfil desconhecido '${t}'`, profileSet: t => `perfil: ${t}`,
        osNow: n => `visual atual: ${n}`, osOpts: 'opções: ', osBad: v => `os: sistema desconhecido '${v}'`, osSet: n => `visual: ${n}`,
        sudoHire: '[sudo] senha para recrutador: ********\nacesso concedido. abrindo contato…',
        sudoNo: '[sudo] senha para nicolas:\nnicolas não está no arquivo sudoers. Este incidente será reportado.',
        rm: 'rm: permissão negada: este portfólio é somente leitura',
        vim: 'por aqui só tem portfólio. (e pra sair do vim é :q!)',
        sameLang: 'você já está na versão em português',
        ended: {
            mac: 'Saving session...\n...copying shared history...\n...saving history...truncating history files...\n...completed.\n\n[Processo concluído]',
            linux: 'logout\n\n[processo encerrado com código 0]',
            win: '[processo encerrado com código 0 (0x00000000)]\nAgora você pode fechar este terminal com Ctrl+D ou pressionar Enter para reiniciar.',
        },
        tabLimit: 'limite de abas extras atingido (3)', cmdLabel: 'Comando', closeTab: 'Fechar aba',
        tabsPrev: 'Abas anteriores', tabsNext: 'Mais abas',
        repos: {
            none: 'Nenhum repositório público encontrado.', ok: n => `200 OK · ${n} repositórios`, noDesc: 'Sem descrição disponível.',
            err: 'erro:', errMsg: 'Não foi possível carregar os repositórios. Veja direto no GitHub:',
        },
        flags: { cases: '--case', experience: '--empresa', skills: '--categoria', formacao: '--idiomas' },
        langEntry: 'idiomas',
        complete: ['nicolas', 'cases', 'experiencia', 'skills', 'projetos', 'formacao', 'contato', 'help', 'clear', 'ls', 'cat', 'cd', 'whoami', 'pwd', 'date', 'echo', 'history', 'tema', 'os', 'exit', 'matrix', 'sudo', 'en'],
    };
    // as flags dos dois idiomas funcionam nas duas páginas; as mensagens usam a do idioma da página
    const FLAG_ALIAS = { '--company': '--empresa', '--category': '--categoria', '--languages': '--idiomas' };

    /* ── TELA DE LOGIN: relógio e bateria (a tela fica por cima até o terminal abrir) ── */
    (function clock() {
        const n = new Date();
        const hm = n.toLocaleTimeString(LOCALE, { hour: EN ? 'numeric' : '2-digit', minute: '2-digit' });
        const time = hm.replace(/\s?[AP]M$/i, ''); // relógio grande sem AM/PM, como nas telas de bloqueio
        const f = EN ? {
            time, short: n.toLocaleDateString(LOCALE, { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '') + '  ' + hm,
            date: n.toLocaleDateString(LOCALE, { weekday: 'long', month: 'long', day: 'numeric' }),
            macdate: n.toLocaleDateString(LOCALE, { weekday: 'short', month: 'short', day: 'numeric' }),
        } : {
            time, short: n.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' }).replace(/[.,]/g, '') + '  ' + hm,
            date: n.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' }),
            macdate: n.toLocaleDateString(LOCALE, { weekday: 'short' }) + ' ' + n.getDate() + ' de ' + n.toLocaleDateString(LOCALE, { month: 'short' }),
        };
        $$('#login [data-clock]').forEach(el => { el.textContent = f[el.dataset.clock]; });
        // bateria de verdade só quando o navegador informa (Chrome/Edge; o Brave sempre diz 100%)
        const b = $('#login [data-batt]');
        if (b && navigator.getBattery && !navigator.brave) navigator.getBattery().then(x => { b.textContent = Math.round(x.level * 100); b.classList.add('lv'); }, () => { });
    })();

    /* ── DADOS DINÂMICOS ────────────────────────────────────────── */
    function yearsSince(yyyymm) {
        const [y, m] = yyyymm.split('-').map(Number), now = new Date();
        return now.getFullYear() - y - (now.getMonth() + 1 < m ? 1 : 0);
    }
    const YEARS = yearsSince('2021-02');
    $$('[data-years-since]').forEach(el => { el.textContent = yearsSince(el.dataset.yearsSince); });

    // "Last login" do macOS: algum momento de hoje, um pouco antes de abrir a página
    const ll = new Date(Date.now() - rand(8, 95) * 60000);
    const pad = n => String(n).padStart(2, '0');
    const LASTLOG = `${'Sun Mon Tue Wed Thu Fri Sat'.split(' ')[ll.getDay()]} ${'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[ll.getMonth()]} ${pad(ll.getDate())} ${pad(ll.getHours())}:${pad(ll.getMinutes())}:${pad(ll.getSeconds())}`;
    $$('.lastlog').forEach(el => { el.textContent = LASTLOG; });

    const nItems = $$('.tree .items > span').length, nDirs = $$('.tree > li').length;
    const tc = $('#tree-count'); if (tc) tc.textContent = T.treeCount(nDirs, nItems);

    /* ── SISTEMA E PERFIL DE CORES ──────────────────────────────── */
    const OS_PROFILE = { mac: 'tokyonight', win: 'onehalf', linux: 'ubuntu' };
    const OS_NAME = { mac: 'macOS · Ghostty', win: 'Windows Terminal', linux: 'GNOME Terminal' };
    const PROFILES = ['tokyonight', 'pro', 'onehalf', 'ubuntu', 'homebrew', 'amber', 'basic'];

    /* ── FUNDO: campo de caracteres que reage ao mouse ──────────────
       Os pontos (·) ficam no CSS do body. O canvas só desenha as células "acesas":
       o mouse injeta energia ao redor do cursor, que vira ·:-=+*#%@ e se apaga sozinha.
       O loop só roda enquanto há algo aceso; parado, não gasta nada. */
    const BG = (() => {
        const c = $('#bg'), ctx = c && c.getContext && c.getContext('2d');
        if (!ctx) return { refresh() { }, ambient() { } };
        const CELL = 22, RAMP = '·:-=+*#%@', FONT = '"Terminal NP", Menlo, Consolas, monospace';
        const PAL = ['magenta', 'blue', 'cyan', 'green', 'yellow', 'red'];
        const active = new Set(), ripples = [], col = {};
        let W = 0, H = 0, dpr = 1, cols = 0, rows = 0, energy = new Float32Array(0), raf = 0, amb = 0, rt = 0;

        function build() {
            dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
            c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
            cols = Math.ceil(W / CELL) + 1; rows = Math.ceil(H / CELL) + 1;
            energy = new Float32Array(cols * rows); active.clear();
            const cs = getComputedStyle(R);
            ['desk', ...PAL].forEach(k => { col[k] = cs.getPropertyValue('--' + k).trim(); });
            draw();
        }
        // cor pela posição, no mesmo degradê do banner
        const colorAt = (x, y) => col[PAL[Math.min(PAL.length - 1, Math.floor(((x / cols) * .75 + (y / rows) * .25) * PAL.length))]];
        function draw() {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, c.width, c.height);
            if (!active.size) return;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.font = `13px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            for (const i of active) {
                const e = energy[i], x = i % cols, y = (i / cols) | 0, px = x * CELL, py = y * CELL;
                ctx.globalAlpha = 1; ctx.fillStyle = col.desk; ctx.fillRect(px + 5, py + 5, CELL - 10, CELL - 10); // esconde o ponto do CSS
                ctx.globalAlpha = Math.min(1, .2 + e * .8); ctx.fillStyle = colorAt(x, y);
                ctx.fillText(RAMP[Math.min(RAMP.length - 1, (e * RAMP.length) | 0)], px + CELL / 2, py + CELL / 2);
            }
            ctx.globalAlpha = 1;
        }
        function bump(i, e) { if (e > energy[i]) { energy[i] = e; active.add(i); } }
        function area(cx, cy, r, fn) {
            const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(cols - 1, Math.ceil(cx + r));
            const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(rows - 1, Math.ceil(cy + r));
            for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) fn(y * cols + x, Math.hypot(x + .5 - cx, y + .5 - cy));
        }
        function tick(now) {
            raf = 0;
            for (let k = ripples.length - 1; k >= 0; k--) { // onda do clique
                const rp = ripples[k], rad = (now - rp.t0) * .5;
                if (rad > rp.max) { ripples.splice(k, 1); continue; }
                const rr = rad / CELL, fade = 1 - rad / rp.max;
                area(rp.x / CELL, rp.y / CELL, rr + 1, (i, d) => { const off = Math.abs(d - rr); if (off < .9) bump(i, (1 - off / .9) * fade * .9); });
            }
            for (const i of active) { energy[i] *= .9; if (energy[i] < .04) { energy[i] = 0; active.delete(i); } }
            draw();
            if (active.size || ripples.length) raf = requestAnimationFrame(tick);
        }
        const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
        function ambient(on) { // brilhos aleatórios enquanto o terminal está minimizado
            clearInterval(amb); amb = 0;
            if (!on || REDUCE) return;
            amb = setInterval(() => {
                if (D.hidden) return;
                for (let k = 0; k < 4; k++) bump((Math.random() * cols * rows) | 0, .35 + Math.random() * .5);
                kick();
            }, 180);
        }
        if (!REDUCE) {
            addEventListener('pointermove', e => {
                const r = 120 / CELL;
                area(e.clientX / CELL, e.clientY / CELL, r, (i, d) => { if (d < r) bump(i, (1 - d / r) ** 2); });
                kick();
            }, { passive: true });
            addEventListener('pointerdown', e => {
                if (e.target.closest && e.target.closest('.win')) return; // dentro do terminal, clique é só clique
                ripples.push({ x: e.clientX, y: e.clientY, t0: performance.now(), max: Math.max(W, H) * .45 });
                kick();
            }, { passive: true });
        }
        addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); }, { passive: true });
        requestAnimationFrame(build);
        return { refresh: build, ambient };
    })();
    const os = () => R.dataset.os || 'mac';
    const shellName = () => ({ mac: 'zsh', win: 'pwsh', linux: 'bash' })[os()];

    function setOS(v) {
        R.dataset.os = v;
        // a escolha fica visível na URL (?os=…) e sobrevive ao recarregar; voltar ao sistema real limpa o parâmetro
        try {
            const u = new URL(location.href);
            if (v === R.dataset.osAuto) u.searchParams.delete('os'); else u.searchParams.set('os', v);
            history.replaceState(null, '', u);
        } catch (e) { /* file:// */ }
        if (!store.get('np-profile')) R.dataset.profile = OS_PROFILE[v];
        updateProfileBtn();
        layoutChanged();
        tabsOverflow(); // cada sistema tem um tamanho de aba
        BG.refresh();
    }
    function setProfile(p, save = true) {
        R.dataset.profile = p;
        store.set('np-profile', save ? p : null);
        updateProfileBtn();
        BG.refresh();
    }
    function updateProfileBtn() {
        const label = T.profileLabel(R.dataset.profile);
        profileBtn.title = label; profileBtn.setAttribute('aria-label', label);
    }
    updateProfileBtn();

    /* ── ESTADO DAS ABAS ────────────────────────────────────────── */
    const S = {};
    const st = id => S[id] || (S[id] = { ran: false, running: false, skip: false, scroll: 0, fs: 0, fitKey: '', done: Promise.resolve() });
    const panelOf = id => { const p = id && D.getElementById(id); return p && p.classList.contains('panel') ? p : null; };
    const tabOf = id => tabs.find(t => t.getAttribute('aria-controls') === id);
    const histOf = p => $('.hist', p);
    let active = null, busyCmd = null;

    tabsNav.setAttribute('role', 'tablist');
    function wireTab(t) {
        const id = t.getAttribute('aria-controls'), p = panelOf(id);
        t.id = 't-' + id;
        t.setAttribute('role', 'tab');
        p.setAttribute('role', 'tabpanel');
        p.setAttribute('aria-labelledby', t.id);
    }
    tabs.forEach(wireTab);

    /* ── ABAS QUE NÃO CABEM (celular, janela estreita) ──────────────
       Bordas esmaecidas e setas ‹ › mostram que a barra continua para os lados.
       As setas são só para o mouse/toque: no teclado, as setas ←/→ já percorrem o tablist. */
    const tabrow = tabsNav.parentElement;
    const moreBtn = (cls, label, dir) => {
        const b = D.createElement('button');
        b.type = 'button'; b.className = 'tab-more ' + cls; b.title = label;
        b.tabIndex = -1; b.setAttribute('aria-hidden', 'true');
        b.addEventListener('click', () => tabsNav.scrollBy({ left: dir * tabsNav.clientWidth * .7, behavior: REDUCE ? 'auto' : 'smooth' }));
        return b;
    };
    const prevBtn = moreBtn('prev', T.tabsPrev, -1), nextBtn = moreBtn('next', T.tabsNext, 1);
    tabrow.insertBefore(prevBtn, tabsNav); tabsNav.after(nextBtn);
    function tabsOverflow() {
        tabrow.classList.toggle('overflow', tabsNav.scrollWidth > tabsNav.clientWidth + 1);
        const over = tabrow.classList.contains('overflow');
        const l = over && tabsNav.scrollLeft > 2;
        const r = over && tabsNav.scrollLeft + tabsNav.clientWidth < tabsNav.scrollWidth - 2;
        tabsNav.classList.toggle('more-l', l); tabsNav.classList.toggle('more-r', r);
        prevBtn.disabled = !l; nextBtn.disabled = !r;
    }
    tabsNav.addEventListener('scroll', tabsOverflow, { passive: true });
    addEventListener('resize', tabsOverflow, { passive: true });
    tabsOverflow();

    /* ── TÍTULO DA JANELA ───────────────────────────────────────── */
    function dims() {
        const cs = getComputedStyle(scr), fs = parseFloat(cs.fontSize);
        const w = scr.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const h = scr.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        return { cols: Math.floor(w / (fs * CH)), rows: Math.floor(h / (fs * 1.5)) };
    }
    function updateTitle() {
        const o = os();
        if (o === 'linux') titleEl.textContent = 'nicolas@curitiba: ~';
        else if (o === 'mac') { const d = dims(); titleEl.textContent = `nicolas — ${busyCmd || '-zsh'} — ${d.cols}×${d.rows}`; }
        else titleEl.textContent = '';
    }

    /* ── AJUSTE AUTOMÁTICO: a aba ativa cabe na tela sem rolagem (desktop) ── */
    function fit(p) {
        if (!p) return;
        if (MOBILE.matches) { scr.style.removeProperty('--fs'); return; }
        const s = st(p.id), key = scr.clientWidth + 'x' + scr.clientHeight;
        if (s.fs && s.fitKey === key) { scr.style.setProperty('--fs', s.fs + 'px'); return; }
        const h = histOf(p), hidden = h ? h.hidden : true;
        if (h) h.hidden = true; // o que o visitante digitar pode rolar, como num terminal de verdade
        const set = v => scr.style.setProperty('--fs', v + 'px');
        const over = () => scr.scrollHeight > scr.clientHeight + 1;
        let lo = CFG.fitMin, hi = CFG.fitMax, best = lo;
        set(hi);
        if (!over()) best = hi;
        else for (let i = 0; i < 7; i++) {
            const mid = (lo + hi) / 2; set(mid);
            if (over()) hi = mid; else { best = mid; lo = mid; }
        }
        best = Math.floor(best * 4) / 4;
        set(best);
        if (h) h.hidden = hidden;
        s.fs = best; s.fitKey = key;
    }
    function layoutChanged() {
        if (!active) return;
        st(active.id).fitKey = '';
        fit(active); redrawBars(active); updateTitle();
    }
    let rz;
    addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(layoutChanged, 120); }, { passive: true });

    /* ── BARRAS ASCII (█ com frações ▏▎▍▌▋▊▉) ───────────────────── */
    const PART = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];
    function barCols(b) {
        if (b.dataset.cols) return +b.dataset.cols;
        const fs = parseFloat(getComputedStyle(b).fontSize);
        return Math.max(3, Math.floor(b.clientWidth / (fs * CH) - 0.05));
    }
    // upto = quantas células desenhar agora (animação); sem upto, o valor final com fração
    function barHTML(b, upto) {
        const cols = barCols(b), v = +b.dataset.v, max = +b.dataset.max;
        const track = b.dataset.track ?? '░';
        const cells = Math.max(1 / 8, v / max * cols), n = upto == null ? cells : Math.min(cells, upto);
        let s;
        if (b.dataset.lo) { // faixa (ex.: 15–47 s): sólido até o mínimo, hachurado até o máximo
            const lo = Math.round(+b.dataset.lo / max * cols), hi = Math.round(n);
            s = '█'.repeat(Math.min(lo, hi)) + '▒'.repeat(Math.max(0, hi - lo));
        } else {
            const full = Math.floor(n), i = upto == null ? Math.round((n - full) * 8) : 0;
            s = '█'.repeat(full) + (i === 8 ? '█' : PART[i]);
        }
        if (!s && upto == null) s = '▏';
        return s + (track ? `<span class="trk">${track.repeat(Math.max(0, cols - [...s].length))}</span>` : '');
    }
    // progresso "de terminal": avança em degraus de célula inteira, num ritmo irregular (com engasgos)
    // aba fora de vista (display:none): não há largura para medir, então a barra termina na hora
    // e é redesenhada na largura certa quando a aba volta (activate → redrawBars)
    const unseen = b => !b.clientWidth;
    function drawBar(b, instant) {
        b.dataset.drawn = '1';
        clearTimeout(b._t);
        if (instant || REDUCE || unseen(b)) { b._anim = false; b.innerHTML = barHTML(b); return; }
        const cols = barCols(b), step = Math.max(1, Math.round(cols / 26));
        const target = Math.max(1 / 8, +b.dataset.v / +b.dataset.max * cols);
        let cur = 0;
        const tick = () => {
            if (!b.isConnected) return;
            if (unseen(b)) { b._anim = false; b.innerHTML = barHTML(b); return; }
            cur += step;
            if (cur >= target) { b._anim = false; b.innerHTML = barHTML(b); return; }
            b.innerHTML = barHTML(b, cur);
            b._t = setTimeout(tick, Math.random() < .1 ? rand(90, 220) : rand(14, 42));
        };
        b._anim = true;
        b.innerHTML = barHTML(b, 0);
        b._t = setTimeout(tick, rand(40, 120));
    }
    function redrawBars(root) { $$('.bar', root).forEach(b => { if (b.dataset.drawn && !b._anim) b.innerHTML = barHTML(b); }); }

    /* ── "DIGITAR" O COMANDO E "IMPRIMIR" A SAÍDA ──────────────── */
    // elementos que são só agrupadores: a impressão desce neles e revela os filhos linha a linha
    const DESCEND = '.sect, .cols, .col, .opts, .boxes, .box, .bench, .kv, .log, .commit, .metrics, .edu, ul, ol, dl';
    function units(root) {
        const acc = [];
        (function walk(el) { for (const c of el.children) { acc.push(c); if (c.matches(DESCEND)) walk(c); } })(root);
        return acc;
    }
    function printed(u, instant) { (u.matches('.bar') ? [u] : $$('.bar', u)).forEach(b => drawBar(b, instant)); }

    // esconde a saída e o comando até a "digitação" começar (usado também durante o login)
    function prepare(p) {
        if (REDUCE || !p.dataset.cmd) return;
        units($('.out', p)).forEach(u => u.classList.add('off'));
        $('.prompt', p).classList.add('off');
        $('.typed', p).textContent = '';
    }

    async function intro(p) {
        const s = st(p.id);
        if (s.running || !p.dataset.cmd) return;
        let resolve; s.done = new Promise(r => { resolve = r; });
        s.running = true; s.skip = false;
        p.classList.remove('cleared');
        const cmdline = $('.cmdline', p), typed = $('.typed', cmdline), out = $('.out', p), prompt = $('.prompt', p);
        const cmd = p.dataset.cmd + ' --help';
        const list = units(out);
        const animate = !REDUCE;
        if (animate) { prepare(p); cmdline.classList.add('typing'); }
        R.classList.remove('boot');
        if (p === active) { busyCmd = cmd; updateTitle(); }

        if (animate) {
            await sleep(s.ran ? 80 : CFG.startDelay);
            for (const ch of cmd) {
                if (s.skip) break;
                typed.textContent += ch;
                await sleep(rand(CFG.typeMin, CFG.typeMax) * (ch === ' ' ? 1.8 : 1));
            }
            typed.textContent = cmd;
            if (!s.skip) await sleep(130);
            cmdline.classList.remove('typing');
            const leaves = list.filter(u => !u.matches(DESCEND)).length;
            const perFrame = Math.max(1, Math.ceil(leaves / (CFG.printMs / 16)));
            let i = 0;
            while (i < list.length) {
                if (s.skip) { while (i < list.length) { const u = list[i++]; u.classList.remove('off'); printed(u, true); } break; }
                let n = 0;
                while (i < list.length && n < perFrame) {
                    const u = list[i++]; u.classList.remove('off'); printed(u, false);
                    if (!u.matches(DESCEND)) n++;
                }
                await frame();
            }
        } else {
            list.forEach(u => printed(u, true));
        }
        prompt.classList.remove('off');
        s.running = false; s.ran = true; resolve();
        if (p === active) { busyCmd = null; updateTitle(); if (!TOUCH) focusPrompt(p); }
    }

    /* ── TROCA DE ABA ───────────────────────────────────────────── */
    function activate(id, opts = {}) {
        const p = panelOf(id);
        if (!p) return;
        if (active === p) { if (opts.focusTab) tabOf(id).focus(); return; }
        if (active) { st(active.id).scroll = scr.scrollTop; active.classList.remove('on'); }
        tabs.forEach(t => {
            const on = t.getAttribute('aria-controls') === id;
            t.classList.toggle('on', on);
            t.setAttribute('aria-selected', String(on));
            t.tabIndex = on ? 0 : -1;
        });
        p.classList.add('on');
        R.dataset.tab = id;
        active = p;
        try { history.replaceState(null, '', '#' + hashOf(id)); } catch (e) { /* file:// */ }
        fit(p);
        redrawBars(p); // barras impressas com a aba escondida ou em outro tamanho de fonte
        scr.scrollTop = st(id).scroll;
        const t = tabOf(id);
        t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        if (opts.focusTab) t.focus();
        if (p.dataset.cmd && (!st(id).ran || CFG.rerunOnSwitch)) { if (opts.deferIntro) prepare(p); else intro(p); }
        else if (!TOUCH && !opts.focusTab) focusPrompt(p);
        updateTitle();
        if (id === 'projects') loadRepos();
    }
    // âncoras antigas e as da versão em inglês (#about, #education, #contact) → ids das abas
    const LEGACY = { hero: 'sobre', experiencia: 'experience', projetos: 'projects', about: 'sobre', education: 'formacao', contact: 'contato' };
    const idFromHash = () => { const h = decodeURIComponent(location.hash.slice(1)); const id = LEGACY[h] || h; return panelOf(id) ? id : 'sobre'; };
    addEventListener('hashchange', () => activate(idFromHash()));

    // setas no tablist (padrão ARIA)
    tabsNav.addEventListener('keydown', e => {
        const i = tabs.indexOf(D.activeElement);
        if (i < 0) return;
        const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        const t = tabs[(next + tabs.length) % tabs.length];
        activate(t.getAttribute('aria-controls'), { focusTab: true });
    });

    /* ── PROMPT INTERATIVO ──────────────────────────────────────── */
    /* ── PROTEÇÃO CONTRA FLOOD: entrada, histórico e saída limitados, e freio em rajadas ── */
    const LIMIT = { input: 200, history: 100, scrollback: 160, burst: 12, burstMs: 2000 };
    const history_ = []; let hIdx = 0;
    const recent = []; let throttled = false;
    function tooFast() {
        const now = performance.now();
        while (recent.length && now - recent[0] > LIMIT.burstMs) recent.shift();
        if (recent.length >= LIMIT.burst) return true;
        recent.push(now); throttled = false;
        return false;
    }
    function sync(input) {
        const m = input.nextElementSibling, v = input.value;
        const pos = input.selectionStart == null ? v.length : input.selectionStart;
        const idle = D.activeElement !== input;
        m.innerHTML = esc(v.slice(0, pos)) + `<span class="cur${idle ? ' idle' : ''}">${esc(v[pos] || ' ')}</span>` + esc(v.slice(pos + 1));
    }
    function focusPrompt(p) {
        const i = p && $('.in', p);
        if (!i || st(p.id).running || !ended.hidden) return;
        i.focus({ preventScroll: true });
    }
    function wirePrompt(p) {
        const form = $('.prompt', p), input = $('.in', form);
        input.maxLength = LIMIT.input;
        form.addEventListener('submit', e => {
            e.preventDefault();
            const v = input.value; input.value = ''; sync(input);
            exec(v, p);
        });
        ['input', 'keyup', 'click', 'focus', 'blur', 'select'].forEach(ev => input.addEventListener(ev, () => sync(input)));
        input.addEventListener('keydown', e => onPromptKey(e, input, p));
        sync(input);
    }
    panels.forEach(wirePrompt);

    const COMPLETE = T.complete;
    function onPromptKey(e, input, p) {
        if (e.key === 'ArrowUp' && history_.length) {
            e.preventDefault(); hIdx = Math.max(0, hIdx - 1); input.value = history_[hIdx]; sync(input);
        } else if (e.key === 'ArrowDown' && history_.length) {
            e.preventDefault(); hIdx = Math.min(history_.length, hIdx + 1); input.value = history_[hIdx] || ''; sync(input);
        } else if (e.key === 'Tab' && !e.shiftKey && input.value.trim() && !input.value.includes(' ')) {
            const v = norm(input.value), hits = COMPLETE.filter(c => c.startsWith(v));
            if (!hits.length) return;
            e.preventDefault();
            if (hits.length === 1) input.value = hits[0] + ' ';
            else out(p, hits.join('  '));
            sync(input);
        } else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
            e.preventDefault(); clearPanel(p);
        } else if (e.ctrlKey && (e.key === 'c' || e.key === 'C') && input.selectionStart === input.selectionEnd) {
            e.preventDefault(); echo(p, input.value + '^C'); input.value = ''; sync(input);
        }
    }
    D.addEventListener('selectionchange', () => { const a = D.activeElement; if (a && a.classList && a.classList.contains('in')) sync(a); });

    // simula o visitante digitando (usado pelos comandos clicáveis)
    let autoTyping = false;
    async function typeAndRun(cmd) {
        const p = active, input = p && $('.in', p);
        if (!input || autoTyping) return;
        const s = st(p.id);
        if (s.running) s.skip = true;
        await s.done;
        autoTyping = true;
        scrollBottom(); // o comando é "digitado" no prompt, lá embaixo: a tela vai até ele
        if (!TOUCH) input.focus({ preventScroll: true });
        input.value = '';
        if (!REDUCE) for (const ch of cmd) { input.value += ch; input.selectionStart = input.selectionEnd = input.value.length; sync(input); await sleep(rand(14, 34)); }
        input.value = cmd; sync(input);
        await sleep(REDUCE ? 0 : 90);
        input.value = ''; sync(input);
        autoTyping = false;
        exec(cmd, p);
    }

    /* ── SAÍDA ──────────────────────────────────────────────────── */
    // como o scrollback de um terminal: as entradas mais antigas saem quando passa do limite
    function trimHist(h) { while (h.childElementCount > LIMIT.scrollback) h.firstElementChild.remove(); }
    function scrollBottom() { scr.scrollTop = scr.scrollHeight; requestAnimationFrame(() => { scr.scrollTop = scr.scrollHeight; }); }
    function echo(p, raw) {
        const d = D.createElement('p');
        d.className = 'ln cmdline';
        d.innerHTML = PS1 + ' ' + `<span>${esc(raw)}</span>`;
        histOf(p).appendChild(d); trimHist(histOf(p)); scrollBottom();
    }
    function out(p, html, cls = '') {
        const d = D.createElement('div');
        d.className = 'ln ' + cls;
        d.innerHTML = html;
        histOf(p).appendChild(d); trimHist(histOf(p)); scrollBottom();
        return d;
    }
    // shellFrom: o contêiner original (ul.tree, .log, .boxes…), clonado vazio para o item manter o estilo
    // widthFrom: o item original; a cópia fica com a mesma largura (em ch, acompanha o ajuste de fonte)
    function outNode(p, node, shellFrom, widthFrom) {
        const wrap = D.createElement('div');
        wrap.className = 'out-block';
        node.removeAttribute('id');
        $$('[id]', node).forEach(n => n.removeAttribute('id'));
        $$('.off', node).forEach(n => n.classList.remove('off'));
        node.classList.remove('off');
        if (shellFrom) {
            const shell = shellFrom.cloneNode(false);
            shell.removeAttribute('id'); shell.classList.remove('off');
            const w = widthFrom && widthFrom.getBoundingClientRect().width;
            if (w && shell.matches('.boxes')) shell.style.gridTemplateColumns = `minmax(0, ${(w / (parseFloat(getComputedStyle(widthFrom).fontSize) * CH)).toFixed(1)}ch)`;
            shell.appendChild(node);
            node = shell;
        }
        wrap.appendChild(node);
        histOf(p).appendChild(wrap); trimHist(histOf(p));
        $$('.bar', wrap).forEach(b => drawBar(b, false));
        scrollBottom();
    }
    function clearPanel(p) { histOf(p).innerHTML = ''; p.classList.add('cleared'); scr.scrollTop = 0; }

    /* ── COMANDOS ───────────────────────────────────────────────── */
    const SECTIONS = {
        nicolas: 'sobre', sobre: 'sobre', about: 'sobre',
        cases: 'cases', case: 'cases',
        experiencia: 'experience', experience: 'experience', xp: 'experience',
        skills: 'skills', stack: 'skills',
        projetos: 'projects', projects: 'projects', repos: 'projects',
        formacao: 'formacao', education: 'formacao', idiomas: 'formacao', languages: 'formacao',
        contato: 'contato', contact: 'contato', contratar: 'contato', hire: 'contato',
    };
    const CONTACTS = {
        '-e': 'email', '--email': 'email', '-w': 'whatsapp', '--whatsapp': 'whatsapp',
        '-l': 'linkedin', '--linkedin': 'linkedin', '-g': 'github', '--github': 'github',
    };
    // os links saem do próprio HTML (uma fonte só para os dados de contato)
    const LINKS = {
        email: [T.links.email, $('#contato a[href^="mailto:"]').href],
        whatsapp: [T.links.whatsapp, $('#contato a[href^="https://wa.me"]').href],
        linkedin: [T.links.linkedin, 'https://linkedin.com/in/nicolas-popovicz'],
        github: [T.links.github, 'https://github.com/NicolasPopovicz'],
    };
    const ENTRY_FLAG = { cases: '--case', experience: '--empresa', skills: '--categoria', formacao: '--idiomas' };

    function exec(raw, p) {
        if (tooFast()) { // segura a rajada e avisa uma vez só
            if (!throttled) { throttled = true; out(p, T.tooFast(shellName()), 'c-y'); }
            return;
        }
        raw = String(raw).slice(0, LIMIT.input);
        echo(p, raw);
        const line = raw.trim();
        if (!line) return;
        if (history_[history_.length - 1] !== line) history_.push(line);
        if (history_.length > LIMIT.history) history_.splice(0, history_.length - LIMIT.history);
        hIdx = history_.length;
        const parts = line.split(/\s+/), name = norm(parts[0]), args = parts.slice(1);
        if (SECTIONS[name]) return runSection(SECTIONS[name], name, args, p);
        const fn = CMDS[name];
        if (fn) return fn(args, p);
        notFound(p, parts[0]);
    }

    function runSection(id, name, args, p) {
        const a = args.map(norm), flag = a[0];
        if (!flag || flag === '--help' || flag === '-h') {
            if (id !== p.id) return activate(id);
            if (p.classList.contains('cleared')) return intro(p);
            const clone = $('.out', p).cloneNode(true);
            return outNode(p, clone);
        }
        if (CONTACTS[flag] && (id === 'sobre' || id === 'contato')) {
            const [label, href] = LINKS[CONTACTS[flag]];
            out(p, T.opening(label), 'dim');
            if (href.startsWith('mailto:')) location.href = href; else window.open(href, '_blank', 'noopener');
            return;
        }
        if (flag === '--version' || flag === '-v') return out(p, T.version(name, YEARS));
        const ef = ENTRY_FLAG[id], fl = flag.split('=')[0];
        if (ef && (FLAG_ALIAS[fl] || fl) === ef) {
            const key = id === 'formacao' ? T.langEntry : (flag.split('=')[1] || a[1]);
            const src = key && $(`[data-entry="${CSS.escape(key)}"]`, panelOf(id));
            if (!src) {
                const keys = $$('[data-entry]', panelOf(id)).map(e => e.dataset.entry).join(', ');
                return out(p, T.badValue(name, T.flags[id], esc(key || ''), keys), 'c-r');
            }
            return outNode(p, src.cloneNode(true), src.parentElement, src);
        }
        out(p, T.badOption(name, esc(args[0])), 'c-r');
    }

    function notFound(p, cmd) {
        out(p, T.notFound[os()](esc(cmd)) + '\n' + T.typeHelp(run('help')), 'c-r');
    }

    const run = (cmd, label = cmd) => `<button type="button" class="run" data-run="${esc(cmd)}">${esc(label)}</button>`;
    function helpHTML() {
        const H = T.help;
        const rows = H.rows.map(([c, d]) => `<p class="opt" style="--k:14ch"><span>${run(c)}</span><span>${esc(d)}</span></p>`).join('');
        const extra = [
            [run(H.theme) + ` <i>${H.profileArg}</i>`, PROFILES.join(', ')],
            [run('os') + ` <i>${H.osArg}</i>`, H.os],
            ['ls · clear · history', 'whoami · date · echo · exit'],
        ].map(([c, d]) => `<p class="opt" style="--k:20ch"><span>${c}</span><span class="dim">${d}</span></p>`).join('');
        return `<div class="opts"><p class="b">${H.title}</p>${rows}</div><div class="opts sect">${extra}</div>` +
            `<p class="dim sect">${H.foot}</p>`;
    }

    const CMDS = {
        help: (a, p) => out(p, helpHTML()),
        clear: (a, p) => clearPanel(p),
        ls: (a, p) => out(p, T.files.map(([id, name, dir]) => `<a href="#${hashOf(id)}"${dir ? ' class="c-b b"' : ''}>${name}</a>`)
            .concat(`<a href="${ROOT}llms.txt" target="_blank">llms.txt</a>`).join('  ')),
        cat: (a, p) => {
            const f = norm(a[0] || '').replace(/[/.].*$/, '');
            if (f === 'llms') return out(p, `<a href="${ROOT}llms.txt" target="_blank">${T.catLlms}</a>`);
            if (SECTIONS[f]) return activate(SECTIONS[f]);
            out(p, T.catNo(esc(a[0] || '')), 'c-r');
        },
        whoami: (a, p) => out(p, 'nicolas'),
        pwd: (a, p) => out(p, { mac: '/Users/nicolas', linux: '/home/nicolas', win: 'C:\\Users\\nicolas' }[os()]),
        date: (a, p) => out(p, esc(new Date().toLocaleString(LOCALE, { dateStyle: 'full', timeStyle: 'medium' }))),
        echo: (a, p) => out(p, esc(a.join(' '))),
        history: (a, p) => out(p, history_.map((h, i) => `${String(i + 1).padStart(4)}  ${esc(h)}`).join('\n')),
        tema: (a, p) => {
            const t = norm(a[0] || ''), cmd = T.help.theme;
            if (!t) return out(p, T.profiles + PROFILES.map(x => x === R.dataset.profile ? `<b class="c-g">${x}*</b>` : run(cmd + ' ' + x, x)).join('  ') + `\n${run(cmd + ' auto')} ${T.autoHint}`);
            if (t === 'auto') { setProfile(OS_PROFILE[os()], false); return out(p, T.autoSet(R.dataset.profile), 'dim'); }
            if (!PROFILES.includes(t)) return out(p, T.badProfile(esc(t)), 'c-r');
            setProfile(t); out(p, T.profileSet(t), 'dim');
        },
        os: (a, p) => {
            const v = { mac: 'mac', macos: 'mac', osx: 'mac', win: 'win', windows: 'win', linux: 'linux', ubuntu: 'linux', gnome: 'linux' }[norm(a[0] || '')];
            if (!a[0]) return out(p, `${T.osNow(OS_NAME[os()])}\n${T.osOpts}${['mac', 'win', 'linux'].map(x => run('os ' + x, x)).join('  ')}`);
            if (!v) return out(p, T.osBad(esc(a[0])), 'c-r');
            setOS(v); out(p, T.osSet(OS_NAME[v]), 'dim');
        },
        exit: (a, p) => p.classList.contains('shell') ? closeTab(p.id) : endSession(),
        matrix: (a, p) => { out(p, 'Wake up, Neo…', 'c-g'); matrixRain(); },
        sudo: (a, p) => {
            if (/^(contratar|hire|contrate)/.test(norm(a[0] || ''))) {
                out(p, T.sudoHire, 'c-g');
                return setTimeout(() => activate('contato'), 700);
            }
            out(p, T.sudoNo, 'c-r');
        },
        // troca de idioma: en/ ⇄ raiz
        en: (a, p) => { if (EN) out(p, T.sameLang, 'dim'); else location.href = 'en/'; },
        pt: (a, p) => { if (!EN) out(p, T.sameLang, 'dim'); else location.href = ROOT; },
        rm: (a, p) => out(p, T.rm, 'c-r'),
        vim: (a, p) => out(p, T.vim, 'dim'),
    };
    Object.assign(CMDS, {
        cls: CMDS.clear, dir: CMDS.ls, logout: CMDS.exit, theme: CMDS.tema, sistema: CMDS.os,
        vi: CMDS.vim, nano: CMDS.vim, emacs: CMDS.vim, man: CMDS.help, cd: (a, p) => CMDS.cat(a, p),
        english: CMDS.en, portugues: CMDS.pt, portuguese: CMDS.pt,
    });

    /* ── JANELA: fechar, minimizar, maximizar, nova aba ─────────── */
    const ENDED = T.ended;
    function endSession() {
        $('pre', ended).textContent = ENDED[os()];
        ended.hidden = false;
        $('#restart').focus();
    }
    function restart() {
        ended.hidden = true;
        panels.forEach(p => { const s = st(p.id); s.ran = false; histOf(p).innerHTML = ''; p.classList.remove('cleared'); });
        if (active) intro(active);
    }
    $('#restart').addEventListener('click', restart);

    function minimize() { win.classList.add('minimized'); dock.hidden = false; dock.focus(); BG.ambient(true); }
    dock.addEventListener('click', () => { win.classList.remove('minimized'); dock.hidden = true; BG.ambient(false); focusPrompt(active); });
    function toggleMax() { win.classList.toggle('max'); setTimeout(layoutChanged, 280); }
    $('#top').addEventListener('dblclick', e => { if (!e.target.closest('button, a')) toggleMax(); });

    let nShell = 0;
    function newTab() {
        if ($$('.panel.shell').length >= 3) return out(active, T.tabLimit, 'dim');
        nShell++;
        const id = 'shell' + nShell;
        const p = D.createElement('section');
        p.className = 'panel shell'; p.id = id;
        p.innerHTML = `<p class="ln login" aria-hidden="true"><span class="os-mac">Last login: ${LASTLOG} on ttys0${pad(7 + nShell)}</span><span class="os-win">PowerShell 7.4.6</span></p>` +
            `<p class="ln dim">${T.typeHelp(run('help'))}</p><div class="hist" aria-live="polite"></div>` +
            `<form class="prompt" action="#">${PS1}<label class="field"><span class="sr">${T.cmdLabel}</span><input class="in" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" enterkeyhint="send" /><span class="mirror" aria-hidden="true"></span></label></form>`;
        scr.appendChild(p);
        const t = D.createElement('a');
        t.className = 'tab closable'; t.href = '#' + id; t.setAttribute('aria-controls', id);
        t.innerHTML = `<span class="ti" aria-hidden="true"></span><span class="tt">${shellName()}</span><span class="tx" title="${T.closeTab}" aria-hidden="true"></span>`;
        tabsNav.appendChild(t);
        tabs.push(t); panels.push(p);
        wireTab(t); wirePrompt(p); tabsOverflow();
        st(id).ran = true;
        activate(id);
    }
    function closeTab(id) {
        const i = tabs.findIndex(t => t.getAttribute('aria-controls') === id);
        if (i < 0) return;
        const t = tabs[i], p = panelOf(id), wasActive = active === p;
        tabs.splice(i, 1); panels.splice(panels.indexOf(p), 1);
        t.remove(); p.remove(); delete S[id];
        if (wasActive) { active = null; activate(tabs[Math.max(0, i - 1)].getAttribute('aria-controls')); }
        tabsOverflow();
    }

    const ACTIONS = {
        close: endSession, min: minimize, max: toggleMax, new: newTab,
        profile: () => { const i = PROFILES.indexOf(R.dataset.profile); setProfile(PROFILES[(i + 1) % PROFILES.length]); },
    };

    /* ── CLIQUES E TECLADO ──────────────────────────────────────── */
    D.addEventListener('click', e => {
        const x = e.target.closest('.tx');
        if (x) { e.preventDefault(); closeTab(x.closest('.tab').getAttribute('aria-controls')); return; }
        const r = e.target.closest('[data-run]');
        if (r) { e.preventDefault(); typeAndRun(r.dataset.run); return; }
        const act = e.target.closest('[data-act]');
        if (act) { e.preventDefault(); ACTIONS[act.dataset.act](); return; }
        const a = e.target.closest('a[href^="#"]');
        if (a) {
            const h = a.getAttribute('href').slice(1), id = LEGACY[h] || h;
            if (panelOf(id)) { e.preventDefault(); activate(id, { focusTab: a.classList.contains('tab') && e.detail === 0 }); }
            return;
        }
        // clicar no vazio do terminal foca o prompt (sem atrapalhar quem quer selecionar texto)
        if (!TOUCH && e.target.closest('#screen') && !e.target.closest('a, button, input, label') && D.getSelection().isCollapsed) focusPrompt(active);
    });
    scr.addEventListener('pointerdown', () => { if (active && st(active.id).running) st(active.id).skip = true; });

    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let kseq = [];
    D.addEventListener('keydown', e => {
        kseq.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
        if (kseq.length > KONAMI.length) kseq.shift();
        if (kseq.join() === KONAMI.join()) { kseq = []; matrixRain(); }

        if (!ended.hidden) { if (e.key === 'Enter' && e.target.id !== 'restart') { e.preventDefault(); restart(); } return; }
        if (!active || e.metaKey || e.ctrlKey || e.altKey) return;
        const s = st(active.id);
        if (s.running && !['Tab', 'Shift'].includes(e.key)) s.skip = true;
        const t = e.target;
        if (t.matches('input, textarea')) return;
        // digitar em qualquer lugar escreve no prompt, como num terminal
        if (e.key.length === 1 && (e.key !== ' ' || t === D.body || t === scr)) focusPrompt(active);
    });

    /* ── PROJETOS (GitHub API, carregados ao abrir a aba) ───────── */
    const LANG_COLORS = { PHP: '#777bb4', TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5', HTML: '#e34c26', CSS: '#563d7c', Vue: '#41b883', Shell: '#89e051', Go: '#00ADD8' };
    let reposState = 0;
    async function loadRepos() {
        if (reposState) return;
        reposState = 1;
        const p = panelOf('projects'), status = $('.fetch', p), spin = $('.spin', status), box = $('#repos');
        const frames = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
        let f = 0;
        const timer = REDUCE ? 0 : setInterval(() => { spin.textContent = frames[f++ % frames.length]; }, 80);
        try {
            const res = await fetch('https://api.github.com/users/NicolasPopovicz/repos?sort=updated&per_page=12&type=public');
            if (!res.ok) throw new Error('API ' + res.status);
            const repos = (await res.json())
                .filter(r => !r.fork && r.name !== 'NicolasPopovicz')
                .sort((a, b) => (b.stargazers_count - a.stargazers_count) || new Date(b.updated_at) - new Date(a.updated_at))
                .slice(0, 6);
            await st('projects').done;
            clearInterval(timer);
            if (!repos.length) { status.innerHTML = `<span class="dim">${T.repos.none}</span>`; box.remove(); return; }
            status.innerHTML = `<span class="c-g">✓</span> ${T.repos.ok(repos.length)}`;
            box.innerHTML = repos.map(r => {
                const lang = r.language || 'Other';
                const desc = r.description ? r.description.slice(0, 100) + (r.description.length > 100 ? '…' : '') : T.repos.noDesc;
                const updated = new Date(r.updated_at).toLocaleDateString(LOCALE, { month: 'short', year: 'numeric' });
                return `<article class="box repo off"><h3 class="bt"><a href="${esc(r.html_url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a></h3>` +
                    `<p class="rd">${esc(desc)}</p><p class="rm"><span><span style="color:${LANG_COLORS[lang] || 'var(--dim)'}">●</span> ${esc(lang)}</span>` +
                    `${r.stargazers_count ? `<span>stars ${r.stargazers_count}</span>` : ''}<span>${esc(updated)}</span></p></article>`;
            }).join('');
            for (const el of $$('.repo', box)) { el.classList.remove('off'); if (!REDUCE) await sleep(45); }
        } catch (err) {
            clearInterval(timer);
            status.innerHTML = `<span class="c-r">${T.repos.err}</span> ${T.repos.errMsg} <a href="https://github.com/NicolasPopovicz" target="_blank" rel="noopener noreferrer">github.com/NicolasPopovicz</a>`;
            box.remove();
        }
    }

    /* ── EASTER EGG: MATRIX RAIN ────────────────────────────────── */
    let raining = false;
    function matrixRain() {
        if (REDUCE || raining) return;
        raining = true;
        const c = D.createElement('canvas');
        c.style.cssText = 'position:fixed;inset:0;z-index:50;pointer-events:none;opacity:0;transition:opacity .4s';
        D.body.appendChild(c);
        const ctx = c.getContext('2d');
        c.width = innerWidth; c.height = innerHeight;
        const drops = Array(Math.floor(c.width / 14)).fill(1);
        const chars = 'アイウエオカキクケコサシスセソタチツテト01ニヌネノハヒフヘホ#$%&*';
        const color = getComputedStyle(R).getPropertyValue('--green').trim() || '#00ff41';
        requestAnimationFrame(() => { c.style.opacity = '1'; });
        let n = 0;
        const iv = setInterval(() => {
            ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(0, 0, c.width, c.height);
            ctx.fillStyle = color; ctx.font = '14px monospace';
            drops.forEach((y, i) => {
                ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14);
                if (y * 14 > c.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            });
            if (++n > 170) { clearInterval(iv); c.style.opacity = '0'; setTimeout(() => { c.remove(); raining = false; }, 400); }
        }, 16);
    }

    /* ── TELA DE LOGIN: senha digitada sozinha, depois o terminal abre ── */
    async function runLogin() {
        const ov = $('#login');
        if (!ov) return;
        let skip = false;
        const skipNow = () => { skip = true; }; // clique ou tecla pula direto para o terminal
        addEventListener('pointerdown', skipNow);
        addEventListener('keydown', skipNow);
        const wait = ms => (skip ? Promise.resolve() : sleep(ms));
        const o = os(), scope = $('.lg-' + o, ov) || $('.lg-mac', ov), dots = $('.lg-dots', scope);
        await wait(o === 'win' ? 900 : 700);
        if (o === 'win' && !skip) { ov.classList.add('signin'); await wait(520); }
        ov.classList.add('typing');
        const dot = () => dots.appendChild(D.createElement('i'));
        for (let i = 0; i < 8 && !skip; i++) { dot(); await wait(rand(60, 120)); }
        while (dots.children.length < 8) dot();
        await wait(260);
        ov.classList.add('auth');
        await wait({ win: 900, mac: 650 }[o] || 250);
        removeEventListener('pointerdown', skipNow);
        removeEventListener('keydown', skipNow);
        ov.classList.add('out');
        R.classList.remove('win-closed'); // a janela "abre" enquanto o login some
        await sleep(skip ? 220 : 520);
        R.classList.remove('locked');
        ov.remove();
    }

    /* ── INÍCIO ─────────────────────────────────────────────────── */
    const LOGIN = R.classList.contains('locked');
    activate(idFromHash(), { deferIntro: LOGIN });
    R.classList.remove('boot');
    if (LOGIN) runLogin().then(() => { if (active && active.dataset.cmd && !st(active.id).ran) intro(active); });
    // com a fonte carregada, recalcula o ajuste e as barras (as larguras mudam um pouco)
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(() => { layoutChanged(); tabsOverflow(); BG.refresh(); });
    if (MOBILE.addEventListener) MOBILE.addEventListener('change', layoutChanged);
})();
