---
name: taskflow
description: "Use for TaskFlow feature requests, specification, test-first development, QA, regression checks, mutation testing, or coordinating the Analyste-PO → Testeur-QA → Dev-JS workflow."
argument-hint: "Décris le besoin TaskFlow en une phrase."
---

# Workflow de développement TaskFlow

## Quand utiliser cette skill

Utilise ce workflow pour ajouter ou modifier un comportement de TaskFlow, clarifier
une demande fonctionnelle, écrire les tests correspondants ou vérifier une
implémentation. Pour une simple question ou une correction de documentation sans
impact fonctionnel, réponds directement sans lancer toute la chaîne.

## Orchestration

1. Traite la demande comme un besoin exprimé en une phrase. Si un choix fonctionnel
   important manque, demande une précision avant de figer le comportement.
2. Fais rédiger une spécification testable par `Analyste-PO` dans
   `docs/spec.md`. Elle doit contenir le besoin, les critères d’acceptation, les
   cas limites pertinents et le hors-périmètre. L’agent ne code pas.
3. Passe à `Testeur-QA` pour traduire les critères d’acceptation en tests
   déterministes dans `tests.js`, sans toucher à `app.js`. Vérifie que les tests
   ciblent le comportement demandé et, lorsque possible, qu’ils échouent sur
   l’implémentation de départ pour la bonne raison.
4. Passe à `Dev-JS` pour implémenter le minimum nécessaire dans `app.js`, sans
   affaiblir ni supprimer les tests. L’agent relance les vérifications disponibles
   et remet le travail à `Testeur-QA`.
5. Fais vérifier à `Testeur-QA` le diff et l’ensemble des tests, y compris les
   auto-tests de l’application. Si un test échoue ou si une mutation pertinente
   survit, renvoie le résultat à `Dev-JS`, puis recommence la vérification.
6. Termine lorsque les critères sont satisfaits et les contrôles verts, ou indique
   précisément ce qui bloque et les vérifications manuelles restant à faire.

## Règles des relais

- Tous les boutons de relais utilisent `send: false` : l’utilisateur relit et
  envoie lui-même le prompt prérempli. Il reste chef d’orchestre.
- Un relais correspond à un diff isolé que l’utilisateur peut relire et valider.
  Les agents ne créent pas de commit, ne poussent rien et ne réinitialisent pas
  l’historique. Après revue, l’utilisateur peut créer un commit avant de poursuivre.
- Ne fais jamais de mutation de test dans les fichiers de travail. Pour vérifier
  la sensibilité d’un test, travaille sur une copie isolée et supprime uniquement
  les fichiers temporaires créés par cette vérification.
- Si un relais casse un comportement déjà validé, explique le diff fautif et
  laisse l’utilisateur décider de revenir au commit antérieur. Ne négocie pas une
  régression en supprimant ou en relâchant le test.
- Les handoffs des agents personnalisés sont pris en charge dans le harness
  **Local** de VS Code. Dans un autre harness, sélectionne l’agent suivant et
  utilise le prompt de relais équivalent manuellement.

## Conventions du projet

- Consulte `AGENTS.md` et `docs/SPECIFICATION.md` avant de changer le comportement.
- `docs/spec.md` est la spécification de la demande en cours; conserve
  `docs/SPECIFICATION.md` comme référence fonctionnelle générale du produit.
- `tests.js` contient les auto-tests intégrés et est chargé après `app.js`.
  Réutilise les règles et conventions existantes; ne crée pas un second framework
  de tests ou une dépendance.
- `app.js` contient les données, règles métier, le rendu et les interactions.
  Garde la logique métier pure distincte du DOM.
- Préserve les données de démonstration, les migrations et la compatibilité des
  sauvegardes, imports JSON/CSV, thèmes et interactions clavier.
- Vérifie les auto-tests dans la vue **Auto-tests** de `index.html`. Si le
  navigateur n’est pas disponible, indique-le et donne les étapes précises à
  exécuter manuellement; ne prétends pas qu’un test a été exécuté.
