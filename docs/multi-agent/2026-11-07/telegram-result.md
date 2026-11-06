# Résultat H1.5.1 — projection des indicateurs Telegram

Ajout d'une fonction pure `projectTelegramOutbox(outbox, now)` dans `gym-next/lib/telegram-observability.ts`. Elle ne lit aucun stockage et n'est raccordée à aucun flux applicatif. Elle renvoie uniquement le total, les comptes par état connu, les états inconnus, la somme des tentatives et des comptes de dates/échéances.

La politique de temps est documentée près de la fonction : `retryAt <= now` est dû (égalité comprise), `retryAt` absent est non planifié, les dates non finies sont invalides et une création future est comptée séparément. Seuls les nombres d'essais entiers sûrs et non négatifs contribuent au total. L'horloge `now` doit être finie. `accepted` indique l'acceptation de la requête par l'API Telegram et ne prouve ni livraison sur téléphone ni lecture.

Les tests légers synthétiques se trouvent dans `tools/telegram-observability/project.test.cjs`. Exécution réelle : `node --test tools/telegram-observability/project.test.cjs` — 4 tests réussis. Ils couvrent les cinq états, les limites d'échéance, les dates non finies et futures, les états/lignes inconnus, les champs inattendus contenant des données sensibles, l'absence de fuite et la non-mutation.

Limites : ces compteurs ne constituent pas une alerte, une supervision de production, une mesure de livraison ou une intégration au stockage. Aucun fichier d'état réel, compte, clé ou service réseau n'a été consulté. Les modifications se limitent au module, au test et à cette preuve.
