// API da família Kealoha (Vercel Function + Upstash Redis via REST)
const crypto = require('crypto');
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOK = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN = process.env.ADMIN_PASSWORD;
const SECRET = process.env.SESSION_SECRET || crypto.createHash('sha256').update('kealoha|' + ADMIN + '|' + TOK).digest('hex');
const REL = ['pai', 'mãe', 'filho', 'filha', 'genro', 'nora', 'neto', 'neta', 'bisneto', 'bisneta', 'avô', 'avó', 'bisavô', 'bisavó', 'tio', 'tia', 'sobrinho', 'sobrinha', 'irmão', 'irmã', 'cunhado', 'cunhada', 'primo', 'prima', 'marido', 'esposa', 'sogro', 'sogra'];
const R = async (...c) => {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOK }, body: JSON.stringify(c) });
  const j = await r.json(); if (j.error) throw new Error(j.error); return j.result;
};
const hmac = b => crypto.createHmac('sha256', SECRET).update(b).digest('base64url');
const sign = p => { const b = Buffer.from(JSON.stringify(p)).toString('base64url'); return b + '.' + hmac(b); };
const verify = t => {
  try {
    const [b, s] = String(t).split('.'), e = hmac(b);
    if (s.length !== e.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(e))) return null;
    const p = JSON.parse(Buffer.from(b, 'base64url')); return p.exp > Date.now() ? p : null;
  } catch (e) { return null; }
};
const hashPw = p => { const s = crypto.randomBytes(16).toString('hex'); return s + ':' + crypto.scryptSync(p, s, 32).toString('hex'); };
const checkPw = (p, h) => {
  if (!h) return false; const [s, x] = h.split(':'), y = crypto.scryptSync(p, s, 32).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(x), Buffer.from(y));
};
const same = (a, b) => crypto.timingSafeEqual(crypto.createHash('sha256').update(String(a)).digest(), crypto.createHash('sha256').update(String(b)).digest());
const str = (s, n) => String(s ?? '').slice(0, n);
const clean = (m, isC) => ({
  nome: str(m.nome, 80).trim(), apelido: str(m.apelido, 60).trim(),
  idade: Math.max(0, Math.min(999, +m.idade || 0)), gen: Math.max(1, Math.min(20, +m.gen || 1)),
  tipo: isC && m.tipo === 'npc' ? 'npc' : 'jog', st: m.st === 'mem' ? 'mem' : 'vivo', hist: str(m.hist, 4000),
  rels: (Array.isArray(m.rels) ? m.rels : []).slice(0, 40).filter(r => r && REL.includes(r.t) && typeof r.id === 'string').map(r => ({ t: r.t, id: str(r.id, 40) })),
  foto: typeof m.foto === 'string' && m.foto.length < 120000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(m.foto) ? m.foto : ''
});
const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const DUP = 'Já existe uma ficha com esse nome. Use outro nome (por exemplo, acrescentando um sobrenome ou apelido).';
// Reserva o nome: trava curta contra envios simultâneos + varredura das fichas existentes.
const lockKey = nome => 'kf:nl:' + crypto.createHash('sha1').update(norm(nome)).digest('hex');
const claim = async (nome, except) => {
  const k = norm(nome), lk = lockKey(nome);
  if (!(await R('SET', lk, '1', 'NX', 'EX', 15))) return false;
  const all = await R('HGETALL', 'kf:m');
  for (let i = 0; i < all.length; i += 2) {
    const m = JSON.parse(all[i + 1]);
    if (m.id !== except && norm(m.nome) === k) { await R('DEL', lk); return false; }
  }
  return true;
};
const limit = async (key, max, secs) => { const n = await R('INCR', key); if (n === 1) await R('EXPIRE', key, secs); return n > max; };

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const bad = (e, c = 400) => res.status(c).json({ e });
  if (req.method !== 'POST') return bad('Método não permitido', 405);
  if (!URL_ || !TOK || !ADMIN) return bad('Servidor não configurado: faltam variáveis de ambiente (veja o README).', 500);
  const b = req.body || {}, a = b.a;
  const S = verify((req.headers.authorization || '').replace('Bearer ', '')), isC = S?.r === 'c';
  const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
  try {
    if (a === 'list') {
      const [all, hp, siteRaw] = await Promise.all([R('HGETALL', 'kf:m'), R('HKEYS', 'kf:pw'), R('GET', 'kf:site')]);
      const members = []; for (let i = 0; i < all.length; i += 2) members.push(JSON.parse(all[i + 1]));
      members.sort((x, y) => x.t - y.t);
      let site = null; try { site = siteRaw ? JSON.parse(siteRaw) : null; } catch (e) {}
      return res.json({ members, hp, site });
    }
    if (a === 'login') {
      const fk = 'kf:fail:' + ip;
      if ((+(await R('GET', fk)) || 0) >= 8) return bad('Muitas tentativas. Aguarde 15 minutos.', 429);
      let ok, p;
      if (b.who === 'c') { ok = same(b.pass, ADMIN); p = { r: 'c' }; }
      else { ok = checkPw(String(b.pass || ''), await R('HGET', 'kf:pw', str(b.who, 40))); p = { r: 'm', id: str(b.who, 40) }; }
      if (!ok) { await R('INCR', fk); await R('EXPIRE', fk, 900); return bad('Senha incorreta.', 401); }
      await R('DEL', fk); p.exp = Date.now() + 30 * 864e5; return res.json({ ...p, tok: sign(p) });
    }
    if (a === 'create') {
      if (!isC && await limit('kf:cr:' + ip, 6, 3600)) return bad('Muitas fichas enviadas. Tente mais tarde.', 429);
      const c = clean(b.member || {}, isC), pass = String(b.pass || '');
      if (!c.nome) return bad('Informe o nome.');
      if (c.tipo === 'jog' && pass.length < 4) return bad('A senha precisa ter pelo menos 4 caracteres.');
      if (!(await claim(c.nome))) return bad(DUP, 409);
      const id = 'm' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex');
      await R('HSET', 'kf:m', id, JSON.stringify({ id, t: Date.now(), ...c }));
      await R('DEL', lockKey(c.nome));
      if (c.tipo === 'jog') await R('HSET', 'kf:pw', id, hashPw(pass));
      const out = { id };
      if (c.tipo === 'jog' && !isC) { const p = { r: 'm', id, exp: Date.now() + 30 * 864e5 }; Object.assign(out, p, { tok: sign(p) }); }
      return res.json(out);
    }
    if (a === 'update') {
      const id = str(b.id, 40);
      if (!S || !(isC || S.id === id)) return bad('Sem permissão. Entre com 🔑 Acesso.', 403);
      const raw = await R('HGET', 'kf:m', id); if (!raw) return bad('Ficha não encontrada.', 404);
      const old = JSON.parse(raw), c = clean(b.member || {}, isC), pass = String(b.pass || '');
      if (!isC) c.tipo = old.tipo;
      if (!c.nome) return bad('Informe o nome.');
      if (pass && pass.length < 4) return bad('A senha precisa ter pelo menos 4 caracteres.');
      if (norm(c.nome) !== norm(old.nome) && !(await claim(c.nome, id))) return bad(DUP, 409);
      await R('HSET', 'kf:m', id, JSON.stringify({ ...old, ...c, id }));
      await R('DEL', lockKey(c.nome));
      if (c.tipo === 'npc') await R('HDEL', 'kf:pw', id); else if (pass) await R('HSET', 'kf:pw', id, hashPw(pass));
      return res.json({ ok: 1 });
    }
    if (a === 'remove') {
      if (!isC) return bad('Só a criadora pode remover fichas.', 403);
      const id = str(b.id, 40); await R('HDEL', 'kf:m', id); await R('HDEL', 'kf:pw', id);
      const all = await R('HGETALL', 'kf:m');
      for (let i = 0; i < all.length; i += 2) { const m = JSON.parse(all[i + 1]); if (m.rels.some(r => r.id === id)) { m.rels = m.rels.filter(r => r.id !== id); await R('HSET', 'kf:m', m.id, JSON.stringify(m)); } }
      return res.json({ ok: 1 });
    }
    if (a === 'site') {
      if (!isC) return bad('Só a criadora pode editar o site.', 403);
      const s = b.site || {}, T = (x, n) => str(x, n).trim(), arr = x => (Array.isArray(x) ? x : []).filter(Array.isArray);
      const out = {
        hist: arr(s.hist).slice(0, 40).map(h => [T(h[0], 40), T(h[1], 80), T(h[2], 3000)]).filter(h => h[0] || h[1] || h[2]),
        signif: arr(s.signif).slice(0, 24).map(x => [T(x[0], 8), T(x[1], 40), T(x[2], 200)]).filter(x => x[1]),
        inicio: { titulo: T(s.inicio?.titulo, 80), lema: T(s.inicio?.lema, 80), frase: T(s.inicio?.frase, 300) }
      };
      await R('SET', 'kf:site', JSON.stringify(out)); return res.json({ ok: 1 });
    }
    return bad('Ação desconhecida.');
  } catch (e) { console.error(e); return bad('Erro no servidor.', 500); }
};
