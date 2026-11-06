# Premier lot natif parallèle — instructions de coordination

Exception utilisateur du 7 novembre, limitée à deux exécutants. Les missions sont indépendantes, sans sous-délégation. Les anciens lanceurs restent désactivés. Aucune dépense, API modèle supplémentaire, connexion de compte, migration, notification ou publication. Les sous-agents natifs sont ceux de la conversation coordinatrice, pas des conversations VS Code automatisées.

Le coordinateur réserve le Kanban, la reprise, les décisions/instructions communes et l'intégration finale. Chaque exécutant ne modifie que son allowlist et sa preuve dédiée, dans le worktree qui lui est assigné. Un problème de périmètre ou dépendance à un brouillon absent impose un signalement, pas une copie silencieuse. Commit ciblé de l'exécutant autorisé sans push ; pas de fusion, changement de branche ou force-push. Tests légers seulement en parallèle ; contrôle TypeScript complet, build et navigateur gérés séquentiellement par le coordinateur.

Ne pas déclarer un agent exécuté à partir d'un rôle Kanban ou d'une fenêtre. Temps passé non mesuré, estimations proposées. Arrêt après un premier résultat borné, review puis validation combinée ; aucun agent persistant ni nouvelle mission automatique.
