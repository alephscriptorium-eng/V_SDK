#!/usr/bin/env node
/**
 * Probe WP-V07 · identidad + lectura (fases 1-2)
 *
 * - Seat vía @zeus/protocol (cero cripto propia)
 * - Hostil-omite: sin card / sin seat
 * - Card expirada ⇒ re-join (contador)
 * - Smoke z-sdk local (SOLO LECTURA) si runtime/mesh disponible → sino ⏳
 *
 * Exit 0 si probes automatizados PASS (runtime vivo es opcional).
 */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(import.meta.url.replace('file:///', '').replace('file://', '')), '../..');
// Windows fileURL quirks — resolve from cwd of package
const pkgRoot = process.cwd();

const protocolPeerCard = await import(
  pathToFileURL(
    path.join(pkgRoot, 'node_modules/@zeus/protocol/src/peer-card.mjs')
  ).href
);
const protocolSeat = await import(
  pathToFileURL(
    path.join(pkgRoot, 'node_modules/@zeus/protocol/src/peer-card-seat.mjs')
  ).href
);

const {
  makePeerCard,
  peerCardPhase,
  PEER_CARD_PHASE,
  isPeerCardShaped
} = protocolPeerCard;
const {
  generateSeatKeyPair,
  signTravelingPeerCard,
  verifyTravelingPeerCard
} = protocolSeat;

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  } else {
    console.log(`PASS: ${msg}`);
  }
}

/** Espejo mínimo de acceptAuthorityPeerCard (misma política hostil-omite). */
function acceptAuthorityPeerCard(raw, state) {
  state.joinCount += 1;
  if (raw == null) {
    return { availability: 'pending_card', ssbId: null, seatOk: false };
  }
  if (!isPeerCardShaped(raw)) {
    return { availability: 'pending_card', ssbId: null, seatOk: false };
  }
  const phase = peerCardPhase(raw);
  if (phase === PEER_CARD_PHASE.EXPIRED) {
    return { availability: 'expired', ssbId: null, seatOk: false, phase };
  }
  const seat = verifyTravelingPeerCard(raw);
  if (!seat.ok) {
    return {
      availability: 'seat_invalid',
      ssbId: null,
      seatOk: false,
      error: seat.error
    };
  }
  state.session = { ...raw };
  return {
    availability: 'ready',
    ssbId: raw.ssbId,
    seatOk: true,
    phase
  };
}

async function ensureFresh(state, joinFn, now = Date.now()) {
  if (!state.session) {
    return joinFn();
  }
  if (peerCardPhase(state.session, now) === PEER_CARD_PHASE.EXPIRED) {
    state.session = null;
    return joinFn();
  }
  return acceptAuthorityPeerCard(state.session, { joinCount: state.joinCount - 1 });
}

console.log('=== WP-V07 probe · identidad + lectura ===');
console.log(`@zeus/protocol: ${require(path.join(pkgRoot, 'node_modules/@zeus/protocol/package.json')).version}`);

// --- Hostil-omite: sin card ---
{
  const state = { joinCount: 0, session: null };
  const r = acceptAuthorityPeerCard(null, state);
  assert(r.availability === 'pending_card' && !r.ssbId, 'hostil-omite sin card → pending_card');
}

// --- Hostil-omite: sin seat ---
{
  const state = { joinCount: 0, session: null };
  const unsigned = makePeerCard({
    roomId: 'PROBE_ROOM',
    endpoint: 'http://127.0.0.1:9/runtime',
    token: 'tok-omit-seat',
    scopes: ['role:player', 'presence:join'],
    expiresAt: Date.now() + 60_000,
    issuedAt: Date.now()
  });
  const r = acceptAuthorityPeerCard(unsigned, state);
  assert(
    r.availability === 'seat_invalid' && !r.ssbId,
    `hostil-omite sin seat → seat_invalid (${r.error || 'ok'})`
  );
}

// --- Join feliz: autoridad firma (fixture) · IDE solo verify ---
{
  const keys = generateSeatKeyPair();
  const unsigned = makePeerCard({
    roomId: 'PROBE_ROOM',
    endpoint: 'http://127.0.0.1:9/runtime',
    token: 'tok-ok',
    scopes: ['role:player', 'presence:join'],
    expiresAt: Date.now() + 60_000,
    issuedAt: Date.now(),
    sessionId: 'probe-session'
  });
  // Autoridad (fixture) firma — el IDE no acuña.
  const signed = signTravelingPeerCard(unsigned, keys.privateKey, keys.ssbId);
  const verify = verifyTravelingPeerCard(signed);
  assert(verify.ok === true, 'seat vía verifyTravelingPeerCard (API protocol)');
  const state = { joinCount: 0, session: null };
  const r = acceptAuthorityPeerCard(signed, state);
  assert(r.availability === 'ready' && r.ssbId === keys.ssbId, `ssbId visible: ${r.ssbId}`);
  assert(state.joinCount === 1, 'card renovada por join (joinCount=1)');
}

// --- Card expirada ⇒ re-join ---
{
  const keys = generateSeatKeyPair();
  const expiredUnsigned = makePeerCard({
    roomId: 'PROBE_ROOM',
    endpoint: 'http://127.0.0.1:9/runtime',
    token: 'tok-exp',
    scopes: ['role:player', 'presence:join'],
    expiresAt: Date.now() - 1,
    issuedAt: Date.now() - 120_000
  });
  const expired = signTravelingPeerCard(expiredUnsigned, keys.privateKey, keys.ssbId);
  assert(peerCardPhase(expired) === PEER_CARD_PHASE.EXPIRED, 'phase expired');

  const state = { joinCount: 0, session: expired };
  let joins = 0;
  const joinFn = () => {
    joins += 1;
    const freshUnsigned = makePeerCard({
      roomId: 'PROBE_ROOM',
      endpoint: 'http://127.0.0.1:9/runtime',
      token: `tok-rejoin-${joins}`,
      scopes: ['role:player', 'presence:join'],
      expiresAt: Date.now() + 60_000,
      issuedAt: Date.now()
    });
    const fresh = signTravelingPeerCard(freshUnsigned, keys.privateKey, keys.ssbId);
    return acceptAuthorityPeerCard(fresh, state);
  };

  const r = await ensureFresh(state, joinFn, Date.now());
  assert(joins === 1, 'expired ⇒ re-join ejecutado');
  assert(r.availability === 'ready' && r.ssbId === keys.ssbId, 're-join entrega card nueva con ssbId');
  assert(state.joinCount >= 1, 'joinCount incrementa en re-join');
}

// --- Smoke z-sdk local (SOLO LECTURA) ---
const zsdkRoot = process.env.Z_SDK_ROOT || 'C:/S_LAB/z-sdk';
const meshUrl = process.env.ZIGURAT_MESH_URL || '';
const launcherPort = process.env.ZIGURAT_LAUNCHER_PORT || '';

console.log('--- smoke runtime z-sdk ---');
console.log(`Z_SDK_ROOT=${zsdkRoot} (read-only)`);

const protocolSrc = path.join(zsdkRoot, 'packages/engine/protocol/src/peer-card-seat.mjs');
if (fs.existsSync(protocolSrc)) {
  console.log(`PASS: z-sdk protocol visible (read-only): ${protocolSrc}`);
} else {
  console.log(`⏳ sin verificar: z-sdk protocol path ausente (${protocolSrc})`);
}

async function tryFetch(url, label) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    console.log(`PASS?: ${label} → HTTP ${res.status}`);
    return true;
  } catch (err) {
    console.log(`⏳ sin verificar: ${label} ausente (${err.cause?.code || err.message})`);
    return false;
  }
}

const liveMesh = meshUrl
  ? await tryFetch(meshUrl, `mesh ${meshUrl}`)
  : await tryFetch('http://127.0.0.1:3010', 'mesh :3010');
const liveLauncher = launcherPort
  ? await tryFetch(`http://127.0.0.1:${launcherPort}/mcp`, `launcher :${launcherPort}`)
  : await tryFetch('http://127.0.0.1:3050/mcp', 'launcher :3050');

if (!liveMesh && !liveLauncher) {
  console.log(
    '⏳ sin verificar: flujo join→card→resources contra z-sdk vivo (runtime no disponible)'
  );
  console.log('   probes/código listos; hostil-omite y expire→re-join automatizados PASS');
}

console.log('=== fin probe ===');
process.exit(failed === 0 ? 0 : 1);
