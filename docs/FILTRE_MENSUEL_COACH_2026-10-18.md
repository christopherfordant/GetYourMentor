# Filtre mensuel du tableau coach — 18 octobre 2026

## Périmètre et sémantique
Un seul lot, issu de la base Git local/distant a99edb8f33c80c20505db7999868f7db5af7297a, candidat isolé GYM-finance-month. Le tableau existant reçoit un champ natif mois/année, « Appliquer le mois » et « Mois courant ». Défaut : mois courant en Europe/Paris. Le brouillon ne change pas les montants avant validation. État local réinitialisé au changement de coach ; aucune persistance URL, aucun nouveau chargement ni mutation métier.

La cohorte reste celle des réservations créées pendant le mois choisi (début inclus, mois suivant exclu, Europe/Paris même si le navigateur est à Los Angeles). Ce n'est pas un mois de paiement, d'encaissement ou de reversement. Format YYYY-MM strict, années techniques 2000–9999 ; une valeur explicite invalide passée au calcul partagé retombe sur le mois courant avec indicateur invalidPeriod. L'absence utilise le défaut sans alerte. Le formulaire refuse une saisie vide/invalide et conserve le dernier résultat validé.

## Calcul unique et protections
coachMonthlyFinance conserve son troisième argument now et reçoit une période optionnelle en quatrième argument. Les deux résumés utilisent le même résultat. Le contrôle de cohérence des preuves utilise toujours l'instant réel now, jamais la période sélectionnée. Une confirmation d'octobre d'une réservation créée en septembre reste dans septembre.

Snapshots et commissions historiques, remboursements effectués/en attente, preuves cohérentes et critères historiques indépendants, centimes, exclusions, sous-totaux partiels, Indisponible, déduplication et isolation coach sont conservés. Données sans création exploitable signalées, sans rattachement arbitraire ; erreur de chargement distincte d'un mois réellement vide. Aucun changement d'API, droits, données, preuve ou taux administrable de 15 %. Structures et administration hors lot.

## Recette
Build, typage, configuration Netlify statique et frontière des secrets client contrôlés localement. Suite ciblée coach-finance-month, coach-finance, coach-cancel-finance : 20 cas sur Chromium desktop/mobile, un worker ; détails finaux dans assets/finance-month-2026-10-18/verification.json.

Les nouveaux tests UI utilisent une réponse GET synthétique explicitement injectée pour exercer montants/états/mois ; ils ne constituent pas une recette de persistance. Le test intégré existant coach-cancel-finance utilise les vrais endpoints locaux pour paiement puis annulation, sans interception réseau ; régression conservée. Dates de référence figées pour les tests du calcul, navigateur America/Los_Angeles pour le nouveau test UI ; bornes DST/octobre et changement d'année, preuves ultérieures, données invalides, doublons et coach étranger couverts.

Contrôle local Playwright à 320, 390, 768 et 1440 px sans débordement ; activation au clavier, validation native, retour courant, URL inchangée, absence de mutation de réservation, chargement en échec sans faux zéro. Captures 390/1440 de la carte relues visuellement, dans assets/finance-month-2026-10-18. Playwright local, aucune réussite MCP revendiquée.

## Limites et reprise
Données de démonstration ; aucun débit ou reversement bancaire attesté. Pas de validation distante RLS, Stripe ou Netlify, ni déploiement. Compteurs Codex privés inaccessibles, aucune estimation chiffrée. Une seule tranche réalisée, sans agents ni orchestration nouvelle.

Retour arrière : revenir sur le commit de ce lot par revert ciblé après examen des dépendances, sans reset/force-push ni altération des historiques. Les preuves précédentes régénérées lors des tests restent hors livraison ; seules les nouvelles captures de ce lot sont incluses. Modifications locales antérieures préservées par indexation ciblée.

Prochaine action bornée recommandée : cadrer les critères de la prochaine tranche depuis la matrice V1/V2/V3 et le relais ; ne pas ouvrir automatiquement une vue par encaissement. Si une vue par confirmation est retenue ultérieurement, documenter d'abord la couverture historique limitée et ses libellés. V1/V2/V3 non déclarées terminées.
