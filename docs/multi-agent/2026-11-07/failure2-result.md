# GYM-H1.5.2.2 — tests synthetiques de panne/reprise

Mission bornee du 7 novembre 2026, branche `agent/20261107-telegram-tests`, base `6e62d05`. Seuls ce rapport et `tools/telegram-observability/flush.test.cjs` sont ajoutes. Aucun code produit modifie, aucune correction dissimulee dans les assertions.

## Methode et isolation

Le test transpile uniquement `gym-next/lib/telegram.ts` avec TypeScript deja disponible et execute ce module dans un contexte VM neuf par scenario. Le `require` local n'autorise que les doubles de `telegram-state` et `node:crypto`; aucun vrai module de stockage/runtime n'est importe. `mutateTelegram` opere sur une copie de fixture et `telegramStorageReady` est injecte. `process.env`, `Date.now`, `fetch` et `AbortSignal.timeout` sont propres au contexte : ni environnement, ni horloge, ni reseau globaux du processus ne sont modifies. Token, identites et destinations sont synthetiques. Les exceptions timeout/reseau sont injectees, sans attente reelle de huit secondes.

La suite verifie le vrai `flushTelegram` : gardes configuration/envoi/allowlist/stockage, 429 et frontiere temporelle de reprise, delais par defaut/minimum, 4xx definitifs, timeout/reseau/5xx/JSON/resultats malformes incertains, leases `sending`, confirmation `accepted` sans renvoi, liaison exacte proprietaire/destination et plafond de dix envois par appel. Les fixtures initiales sont copiees; leur preservation est verifiee dans les principaux scenarios.

## Resultat initial et defaut transmis au coordinateur

Commande : `node --test tools/telegram-observability/flush.test.cjs`.

**38 tests : 36 PASS, 2 FAIL, aucun ignore/TODO.** Les deux echecs sont des regressions explicites pour `retry_after: "Infinity"` et `retry_after: 1e308`. Le calcul actuel produit `retryAt = Infinity`; les assertions exigent une date finie et le fallback existant de 60 secondes. Les autres chemins demandes passent.

Le produit utilise actuellement `Date.now() + Math.max(1, Number(retry_after) || 60) * 1000` sans verification de finitude du resultat. `Infinity` empeche toute eligibilite future en memoire; une serialisation JSON transforme cette valeur en `null`, ce qui peut au contraire rendre le message immediatement eligible apres rechargement. Cette consequence de serialisation est une analyse du calcul; le stockage reel n'a pas ete execute.

Commande combinee : `node --test tools/telegram-observability/flush.test.cjs tools/telegram-observability/project.test.cjs`.

**43 tests : 41 PASS, 2 FAIL**, memes deux regressions. Les cinq tests historiques de projection restent verts. Le coordinateur est averti et reserve la correction produit puis la verification verte integree. Ce commit livre volontairement la preuve rouge du defaut, sans `skip`, `todo` ni affaiblissement.

## Limites et livraison

Aucun service reel, secret, message Telegram, installation, nouveau processus persistant/fenetre IDE, build, controle TypeScript global, push ou deploiement. La simulation en memoire ne valide ni concurrence/CAS, ni persistance, ni transport Telegram reel. Kanban, reprise, correctif produit et integration appartiennent au coordinateur. Commit cible avec `[skip ci] [skip netlify]`; SHA communique dans le retour de mission.
