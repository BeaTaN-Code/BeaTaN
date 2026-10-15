<?php
/**
 * CONGELADOS: CAOS HELADO — BeaTaN Games Studio
 * WebRTC signaling relay for invite-code rooms (runs on ordinary PHP shared hosting, e.g. Hostinger).
 *
 * It only stores short-lived SDP offers/answers so two browsers can open a direct peer-to-peer connection.
 * No gameplay traffic passes through here. Data lives in ./data/ as small JSON files and expires automatically.
 */
declare(strict_types=1);

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LEN = 5;
const ROOM_TTL = 25;          // seconds without a host poll before a room disappears
const PEER_TTL = 60;          // seconds an unanswered join request is kept
const MAX_SDP = 12000;        // bytes
const MAX_PENDING = 12;       // join requests waiting per room
const RATE_PER_MIN = 300;     // requests per IP per minute
// Extra origins allowed to call this endpoint (same-origin requests are always allowed).
const ALLOWED_ORIGINS = ['https://beatan.com.co', 'https://www.beatan.com.co'];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, ALLOWED_ORIGINS, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { reply(['error' => 'method'], 405); }

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) { @mkdir($dataDir, 0750, true); }
if (!file_exists($dataDir . '/.htaccess')) { @file_put_contents($dataDir . '/.htaccess', "Require all denied\nDeny from all\n"); }
if (!file_exists($dataDir . '/index.html')) { @file_put_contents($dataDir . '/index.html', ''); }

rateLimit($dataDir);

$raw = file_get_contents('php://input', false, null, 0, 32768);
$in = json_decode($raw ?: '{}', true);
if (!is_array($in)) { reply(['error' => 'bad'], 400); }
$action = (string)($_GET['a'] ?? ($in['a'] ?? ''));

switch ($action) {
    case 'create': {
        gc($dataDir);
        for ($i = 0; $i < 20; $i++) {
            $code = '';
            for ($k = 0; $k < CODE_LEN; $k++) { $code .= CODE_ALPHABET[random_int(0, strlen(CODE_ALPHABET) - 1)]; }
            $file = roomFile($dataDir, $code);
            if (!file_exists($file)) {
                $key = bin2hex(random_bytes(16));
                $room = ['key' => hash('sha256', $key), 'seen' => time(), 'pending' => [], 'answers' => [], 'open' => true];
                withRoom($file, function (&$r) use ($room) { $r = $room; return true; }, true);
                reply(['code' => $code, 'key' => $key]);
            }
        }
        reply(['error' => 'busy'], 503);
    }
    case 'join': {
        $code = code($in['code'] ?? '');
        $offer = sdp($in['offer'] ?? '');
        $peer = bin2hex(random_bytes(8));
        $res = withRoom(roomFile($dataDir, $code), function (&$r) use ($offer, $peer) {
            if (!alive($r)) { return 'notFound'; }
            if (empty($r['open'])) { return 'closed'; }
            prune($r);
            if (count($r['pending']) >= MAX_PENDING) { return 'busy'; }
            $r['pending'][] = ['peer' => $peer, 'offer' => $offer, 't' => time()];
            return true;
        });
        if ($res !== true) { reply(['error' => $res ?: 'notFound'], 404); }
        reply(['peer' => $peer]);
    }
    case 'hostPoll': {
        $code = code($in['code'] ?? '');
        $key = (string)($in['key'] ?? '');
        $open = !isset($in['open']) || $in['open'] === true;
        $joins = [];
        $res = withRoom(roomFile($dataDir, $code), function (&$r) use ($key, $open, &$joins) {
            if (!isset($r['key']) || !hash_equals($r['key'], hash('sha256', $key))) { return 'auth'; }
            $r['seen'] = time();
            $r['open'] = $open;
            prune($r);
            foreach ($r['pending'] as $p) { $joins[] = ['peer' => $p['peer'], 'offer' => $p['offer']]; }
            $r['pending'] = [];
            return true;
        });
        if ($res !== true) { reply(['error' => $res ?: 'notFound'], 404); }
        reply(['joins' => $joins]);
    }
    case 'answer': {
        $code = code($in['code'] ?? '');
        $key = (string)($in['key'] ?? '');
        $peer = preg_replace('/[^a-f0-9]/', '', (string)($in['peer'] ?? ''));
        $answer = isset($in['answer']) ? sdp($in['answer']) : null;
        $reject = isset($in['reject']) ? substr(preg_replace('/[^a-zA-Z]/', '', (string)$in['reject']), 0, 20) : null;
        $res = withRoom(roomFile($dataDir, $code), function (&$r) use ($key, $peer, $answer, $reject) {
            if (!isset($r['key']) || !hash_equals($r['key'], hash('sha256', $key))) { return 'auth'; }
            if (count($r['answers']) > 40) { array_shift($r['answers']); }
            $r['answers'][$peer] = ['answer' => $answer, 'reject' => $reject, 't' => time()];
            return true;
        });
        if ($res !== true) { reply(['error' => $res ?: 'notFound'], 404); }
        reply(['ok' => true]);
    }
    case 'peerPoll': {
        $code = code($in['code'] ?? '');
        $peer = preg_replace('/[^a-f0-9]/', '', (string)($in['peer'] ?? ''));
        $out = null;
        $res = withRoom(roomFile($dataDir, $code), function (&$r) use ($peer, &$out) {
            if (!alive($r)) { return 'notFound'; }
            if (isset($r['answers'][$peer])) { $out = $r['answers'][$peer]; unset($r['answers'][$peer]); }
            return true;
        });
        if ($res !== true) { reply(['error' => $res ?: 'notFound'], 404); }
        if ($out && $out['reject']) { reply(['error' => $out['reject']], 409); }
        reply(['answer' => $out['answer'] ?? null]);
    }
    case 'close': {
        $code = code($in['code'] ?? '');
        $key = (string)($in['key'] ?? '');
        $file = roomFile($dataDir, $code);
        $ok = withRoom($file, function (&$r) use ($key) {
            return isset($r['key']) && hash_equals($r['key'], hash('sha256', $key));
        });
        if ($ok === true) { @unlink($file); }
        reply(['ok' => true]);
    }
    case 'ping':
        reply(['ok' => true, 'kind' => 'php']);
    default:
        reply(['error' => 'action'], 400);
}

// ---------------------------------------------------------------------------------------------
function reply(array $data, int $status = 200): void { http_response_code($status); echo json_encode($data); exit; }

function code($c): string {
    $c = strtoupper((string)$c);
    if (strlen($c) !== CODE_LEN || strspn($c, CODE_ALPHABET) !== CODE_LEN) { reply(['error' => 'badCode'], 400); }
    return $c;
}

function sdp($s): string {
    if (!is_string($s) || $s === '' || strlen($s) > MAX_SDP) { reply(['error' => 'badSdp'], 400); }
    $d = json_decode($s, true);
    if (!is_array($d) || !isset($d['type'], $d['sdp']) || !in_array($d['type'], ['offer', 'answer'], true) || !is_string($d['sdp'])) { reply(['error' => 'badSdp'], 400); }
    return $s;
}

function roomFile(string $dir, string $code): string { return $dir . '/room_' . $code . '.json'; }

function alive($r): bool { return is_array($r) && isset($r['seen']) && (time() - (int)$r['seen']) <= ROOM_TTL; }

function prune(array &$r): void {
    $now = time();
    $r['pending'] = array_values(array_filter($r['pending'] ?? [], fn($p) => $now - (int)$p['t'] <= PEER_TTL));
    $r['answers'] = array_filter($r['answers'] ?? [], fn($a) => $now - (int)$a['t'] <= PEER_TTL);
}

/** Opens a room file with an exclusive lock, lets $fn mutate it, and writes it back. */
function withRoom(string $file, callable $fn, bool $create = false) {
    if (!$create && !file_exists($file)) { return 'notFound'; }
    $h = @fopen($file, 'c+');
    if (!$h) { return 'io'; }
    flock($h, LOCK_EX);
    $txt = stream_get_contents($h);
    $r = $txt ? json_decode($txt, true) : [];
    if (!is_array($r)) { $r = []; }
    $res = $fn($r);
    if ($res === true) {
        ftruncate($h, 0);
        rewind($h);
        fwrite($h, json_encode($r));
        fflush($h);
    }
    flock($h, LOCK_UN);
    fclose($h);
    return $res;
}

/** Deletes stale room / rate-limit files. */
function gc(string $dir): void {
    foreach (glob($dir . '/*.json') ?: [] as $f) {
        if (time() - (int)@filemtime($f) > 600) { @unlink($f); }
    }
}

function rateLimit(string $dir): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0';
    $file = $dir . '/rl_' . substr(hash('sha256', $ip . date('YmdHi')), 0, 20) . '.json';
    $h = @fopen($file, 'c+');
    if (!$h) { return; }
    flock($h, LOCK_EX);
    $n = (int)stream_get_contents($h) + 1;
    ftruncate($h, 0); rewind($h); fwrite($h, (string)$n);
    flock($h, LOCK_UN); fclose($h);
    if ($n > RATE_PER_MIN) { reply(['error' => 'rate'], 429); }
}
