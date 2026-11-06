const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('../../gym-next/node_modules/typescript');

const lib = path.resolve(__dirname, '../../gym-next/lib');
const snapshot = JSON.parse(fs.readFileSync(path.join(__dirname, 'coaches.snapshot.json'), 'utf8'));
const plain = (value) => JSON.parse(JSON.stringify(value));

// Each test owns a fresh module cache and fixture: no application store is loaded.
function isolatedModules() {
  const cache = new Map();
  const allowed = new Set(['domain.ts', 'domain/model.ts', 'fixtures/coaches.ts', 'sports-catalogue.ts']);
  function load(relative) {
    const filename = path.resolve(lib, relative);
    const key = path.relative(lib, filename).replaceAll('\\', '/');
    assert.ok(allowed.has(key), `Unexpected runtime dependency: ${key}`);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const source = fs.readFileSync(filename, 'utf8');
    const { outputText, diagnostics } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
      fileName: filename,
      reportDiagnostics: true,
    });
    assert.equal(diagnostics.length, 0);
    const requireLocal = (specifier) => {
      assert.ok(specifier.startsWith('.'), `Unexpected external dependency: ${specifier}`);
      return load(path.relative(lib, path.resolve(path.dirname(filename), `${specifier}.ts`)));
    };
    vm.runInNewContext(outputText, { module, exports: module.exports, require: requireLocal }, { filename });
    return module.exports;
  }
  return { domain: load('domain.ts'), fixtures: load('fixtures/coaches.ts'), load };
}

test('facade keeps runtime exports and the exact demonstration records', () => {
  const { domain, fixtures } = isolatedModules();
  assert.deepEqual(Object.keys(domain).sort(), [
    'canonicalSportSlug', 'coachIdForName', 'coachProfiles', 'createCoachProfile',
    'filterCoaches', 'findCoach', 'setCoachVerification', 'updateCoachProfile',
  ].sort());
  assert.strictEqual(domain.coachProfiles, fixtures.coachProfiles);
  assert.deepEqual(plain(domain.coachProfiles), snapshot);
});

test('lookup and filtering preserve aliases, defaults, encoding and verification', () => {
  const { domain } = isolatedModules();
  const first = domain.coachProfiles[0];
  assert.strictEqual(domain.findCoach(), first);
  assert.strictEqual(domain.findCoach('unknown'), first);
  assert.strictEqual(domain.findCoach('MADISON%20SECK'), domain.coachProfiles[1]);
  assert.strictEqual(domain.findCoach('studio-form-marseille'), domain.coachProfiles[2]);
  assert.throws(() => domain.findCoach('%'), { name: 'URIError' });
  const ids = (filters) => Array.from(domain.filterCoaches(filters), (coach) => coach.id);
  assert.deepEqual(ids({}), snapshot.map((coach) => coach.id));
  assert.deepEqual(ids({ city: 'MARSEILLE' }), ['steven-fordant', 'studio-form-marseille']);
  assert.deepEqual(ids({ sport: 'metiers-de-la-forme', city: 'marseille' }), ['studio-form-marseille']);
  assert.deepEqual(ids({ sport: 'football' }), ['madison-seck']);
  assert.deepEqual(ids({ sport: 'unknown' }), []);
  assert.deepEqual(ids({ city: 'unknown' }), []);
  domain.setCoachVerification('steven-fordant', false);
  assert.deepEqual(ids({ sport: 'basketball' }), []);
});

test('facade and fixture share mutable array and object identity in both directions', () => {
  const { domain, fixtures } = isolatedModules();
  const shared = fixtures.coachProfiles;
  const coach = shared[0];
  assert.strictEqual(domain.setCoachVerification(coach.id, false), coach);
  assert.equal(coach.verified, false);
  assert.strictEqual(domain.updateCoachProfile(coach.id, { city: 'Lyon', priceFrom: 45 }), coach);
  assert.equal(shared[0].city, 'Lyon');
  assert.equal(shared[0].priceFrom, 45);
  coach.city = 'Nice';
  assert.strictEqual(domain.filterCoaches({ city: 'Nice' })[0], undefined);
  coach.verified = true;
  assert.strictEqual(domain.filterCoaches({ city: 'Nice' })[0], coach);
  const created = domain.createCoachProfile({ name: 'Élise Test', city: 'Lille' });
  assert.equal(created.id, 'coach-elise-test');
  assert.strictEqual(shared.at(-1), created);
  assert.equal(created.verified, false);
  assert.equal(created.sport, 'fitness');
  assert.strictEqual(domain.createCoachProfile({ name: 'Ignored', id: created.id }), created);
  assert.equal(shared.length, 4);
  shared.push({ ...coach, id: 'fixture-added', name: 'Fixture Added' });
  assert.strictEqual(domain.findCoach('fixture-added'), shared.at(-1));
  assert.equal(domain.setCoachVerification('missing', true), null);
  assert.equal(domain.updateCoachProfile('missing', {}), null);
  assert.deepEqual(plain(isolatedModules().domain.coachProfiles), snapshot);
});

test('pure model exposes all facade types and emits no runtime dependencies', () => {
  const filename = path.join(lib, 'domain/model.ts');
  const source = fs.readFileSync(filename, 'utf8');
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const names = [];
  for (const statement of ast.statements) {
    if (ts.isImportDeclaration(statement)) {
      assert.equal(statement.importClause.isTypeOnly, true);
      assert.equal(statement.moduleSpecifier.text, '../sports-catalogue');
    } else {
      assert.ok(ts.isTypeAliasDeclaration(statement), 'Model must contain only pure type declarations');
      names.push(statement.name.text);
    }
  }
  assert.deepEqual(names.sort(), ['CoachProfile', 'Reservation', 'ReservationStatus']);
  const emitted = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  assert.doesNotMatch(emitted, /require\s*\(|fixtures|coachProfiles/);
  assert.deepEqual(Object.keys(isolatedModules().load('domain/model.ts')), []);
  const facade = fs.readFileSync(path.join(lib, 'domain.ts'), 'utf8');
  assert.match(facade, /export type \{ CoachProfile, ReservationStatus, Reservation \} from '\.\/domain\/model'/);
  assert.match(facade, /export \{ canonicalSportSlug, type SportSlug \} from '\.\/sports-catalogue'/);
});
