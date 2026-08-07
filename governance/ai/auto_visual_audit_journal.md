# Journal Lot Auto Audit Visuel GYM


## Lot auto 2026-08-07 22:35:22

- Statut superviseur : CONFORME
- Statut audit visuel : OK
- Statut lot : CONFORME_AUDIT_OK
- Phase active : SEO
- Artefacts : C:\Users\cashe\Documents\GetYourMentor\gym-next\playwright-artifacts
- Action recommandee : Continuer sur un lot metier, QA ou visuel en conservant la phase active SEO

### Sortie cycle auto
- [auto-mode] Cycle termine.
- [auto-mode] Statut superviseur : CONFORME
- [auto-mode] Phase suivante : SEO
- [auto-mode] Action recommandee : Continuer le cycle sur la phase SEO

### Sortie audit visuel
- 
- > gym-next@0.1.0 pw:audit
- > node scripts/run-playwright-audit.cjs
- 
- 
- > gym-next@0.1.0 dev
- > next dev --hostname 127.0.0.1 --port 3001
- 
-    â–² Next.js 15.3.0
-    - Local:        http://127.0.0.1:3001
-    - Network:      http://127.0.0.1:3001
- 
-  âœ“ Starting...
-  âœ“ Ready in 3.5s
-  â—‹ Compiling / ...
-  âœ“ Compiled / in 2.1s (677 modules)
-  GET / 200 in 2816ms
- 
- Running 14 tests using 2 workers
- 
-  GET / 200 in 477ms
-  GET / 200 in 298ms
-   ok  2 [desktop-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel home (7.6s)
-  â—‹ Compiling /recherche ...
-  âœ“ Compiled /recherche in 874ms (685 modules)
-  GET /recherche?sport=football 200 in 1295ms
-   ok  1 [mobile-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel home (10.1s)
-  GET /recherche?sport=football 200 in 182ms
-   ok  3 [desktop-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel recherche-football (4.3s)
-  â—‹ Compiling /coachs ...
-  âœ“ Compiled /coachs in 683ms (693 modules)
-  GET /coachs?sport=football&city=Paris 200 in 952ms
-   ok  5 [desktop-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel coachs-paris (3.3s)
-  â—‹ Compiling /coach ...
-  âœ“ Compiled /coach in 802ms (701 modules)
-  GET /coach?sport=metiers-de-la-forme&city=Lyon&coach=Studio%20Form%20Marseille 200 in 1042ms
-   ok  4 [mobile-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel recherche-football (6.9s)
-  GET /coachs?sport=football&city=Paris 200 in 136ms
-   ok  6 [desktop-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel coach-fitness (3.9s)
-  âœ“ Compiled /creneau in 473ms (709 modules)
-  GET /creneau?sport=metiers-de-la-forme&city=Lyon&coach=Studio%20Form%20Marseille&service=Coaching%20remise%20en%20forme&duration=30min&price=35 200 in 753ms
-   ok  7 [mobile-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel coachs-paris (4.1s)
-  GET /coach?sport=metiers-de-la-forme&city=Lyon&coach=Studio%20Form%20Marseille 200 in 151ms
-   ok  8 [desktop-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel creneau (3.1s)
-  â—‹ Compiling /compte ...
-  âœ“ Compiled /compte in 630ms (717 modules)
-  GET /compte 200 in 949ms
-   ok  9 [mobile-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel coach-fitness (4.4s)
-  GET /creneau?sport=metiers-de-la-forme&city=Lyon&coach=Studio%20Form%20Marseille&service=Coaching%20remise%20en%20forme&duration=30min&price=35 200 in 134ms
-   ok 10 [desktop-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel compte (4.7s)
-  â—‹ Compiling /inscription-club ...
-  âœ“ Compiled /inscription-club in 688ms (725 modules)
-  GET /inscription-club 200 in 976ms
-   ok 11 [mobile-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel creneau (2.8s)
-  GET /compte 200 in 312ms
-   ok 12 [desktop-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel inscription-club (3.1s)
-   ok 13 [mobile-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel compte (3.5s)
-  GET /inscription-club 200 in 92ms
-   ok 14 [mobile-chromium] â€º tests\visual-audit.spec.ts:14:7 â€º audit visuel inscription-club (2.2s)
- 
-   14 passed (35.9s)
- (node:11468) [DEP0190] DeprecationWarning: Passing args to a child process with shell option true can lead to security vulnerabilities, as the arguments are not escaped, only concatenated.
- (Use `node --trace-deprecation ...` to show where the warning was created)
- AUDIT_COMPLETED=True
- AUDIT_EXIT_CODE=
- RECENT_AUDIT_FILES=14
