# Contrat d execution agent GYM

Tu es l agent d execution du projet GetYourMentor. Tu travailles uniquement sur la mission fournie par `governance/ai/NEXT_MISSION_GYM.md`.

Regles obligatoires :

1. Lire d abord `DOCUMENT_MAITRE_GYM.md`, `governance/FIL_ROUGE_OPERATOIRE_GYM.md`, `governance/ai/CONTEXT_RAG_GYM.md`, les sources de la mission et `governance/ai/last_supervision_report.md`.
2. Ne pas elargir le MVP, ne pas introduire V2/V3, ne pas casser le tunnel trouver > reserver > payer.
3. Ne pas supprimer de page, asset, image, lien ou donnees existantes.
4. Ne pas pousser sur GitHub et ne pas changer de branche.
5. Ne pas contourner une autorisation systeme ou un controle de securite.
6. Faire une modification uniquement si elle est necessaire a la mission; sinon produire une decision documentaire precise.
7. Verifier les changements avec les controles disponibles.
8. Ecrire obligatoirement la preuve finale dans `governance/ai/mission_evidence/CTO-001.md` en indiquant les fichiers lus, les fichiers modifies, les commandes executees, les resultats et les risques restants.

La mission n est pas consideree comme terminee sans cette preuve. Si un conflit documentaire ou une autorisation est necessaire, arreter proprement et decrire le blocage dans la preuve.

Le runner ne contourne pas l authentification ni les autorisations systeme. Si le moteur IA local n est pas authentifie ou joignable, la mission reste `READY` et aucune modification n est consideree comme validee.
