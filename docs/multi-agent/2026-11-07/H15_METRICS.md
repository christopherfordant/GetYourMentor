# Mission H1.5.1 — indicateurs Telegram expurgés

Un exécutant natif, worktree neuf `GYM-parallel-telegram-20261107`, branche `agent/20261107-h15-metrics`. Dépendance B1.4 terminée. Sous-lot autonome du ticket ouvert H1.5 ; son parent ne sera pas déclaré terminé par ce seul sous-lot.

Objectif : concevoir et implémenter une projection pure, en lecture seule et sans raccordement applicatif, des indicateurs d'une outbox Telegram fournie en mémoire. Observer le contrat actuel de `telegram.ts` et `telegram-state.ts`, sans les modifier. Distinguer états connus, tentatives, échecs, incertains et échéances de reprise. Ne pas déduire la réception téléphone d'un statut accepted. Ne pas promettre une alerte ou une supervision de production.

Allowlist : nouveau `gym-next/lib/telegram-observability.ts`, nouveaux tests dans `tools/telegram-observability/`, preuve `docs/multi-agent/2026-11-07/telegram-result.md`. Les autres fichiers sont réservés. Pas de modification domain/façade, auth, stockage, envoi, UI, routes, configuration, instructions, Kanban ou corpus RAG.

Sécurité : pas d'import runtime de telegram-state, pas de lecture de fichiers réels, réseau, clé ou compte. Entrées synthétiques seulement. Résultat allowlist de compteurs et états agrégés, sans texte, identité, email, chatId, token, messageId, clé de réservation ou payload d'erreur ; ne pas retourner les objets entrants. Horloge explicitement injectée. Tests : comptages, bornes de temps, champs inattendus/PII, états inconnus, immutabilité et absence de fuite. Réutiliser les dépendances existantes, tests Node légers ; pas de types globaux/build/serveur. Rapport des limites, tests et commit ciblé sans push. Aucun sous-agent.
