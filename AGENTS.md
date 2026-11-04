# Consignes pour les agents

## Présentation du projet

TaskFlow est une application de gestion de tickets en français, composée de `index.html`, `styles.css`, `app.js` et `tests.js`. Aucun framework, outil de compilation ou gestionnaire de dépendances n’est configuré. La spécification fonctionnelle est documentée dans `docs/SPECIFICATION.md`.

L’application propose un backlog, un tableau Kanban, des auto-tests et des fonctions d’import/export. Elle comprend aussi la recherche et les filtres, la gestion des tickets et de leurs assignés, l’historique des déplacements, ainsi que la persistance locale.

La skill de workflow et les agents personnalisés du projet sont définis dans `.github/skills/taskflow/` et `.github/agents/`. Pour une demande de fonctionnalité, suivre le relais `Analyste-PO` → `Testeur-QA` → `Dev-JS` → `Testeur-QA`, avec confirmation manuelle à chaque handoff.

## Règles de travail

- Avant toute modification, lire les parties pertinentes de `index.html`, `styles.css`, `app.js` et `tests.js`, puis suivre les conventions et structures déjà en place. Effectuer des changements ciblés, sans toucher aux parties sans rapport avec la demande.
- Conserver les libellés de l’interface et la langue du projet (français), ainsi que les noms français utilisés dans le code.
- Garder séparées la logique métier pure et la logique d’interface qui manipule le DOM ou l’état global. Réutiliser les fonctions métier existantes plutôt que de réimplémenter leurs règles dans les vues.
- Préserver les règles de statut, de transition, de limite WIP, d’estimation, d’assignation et d’historique. Respecter les constantes de référence, notamment `COLONNES`, `EQUIPE` et `POINTS_VALIDES`.
- Toute évolution du format des tickets ou des données sauvegardées doit préserver la compatibilité des versions antérieures et mettre à jour les migrations nécessaires. Garder intactes les données initiales de démonstration.
- Considérer les fichiers importés et le contenu du stockage local comme non fiables : valider et normaliser les entrées, sécuriser leur rendu et conserver les mécanismes de réparation et les messages d’erreur existants.
- Maintenir la compatibilité de l’import et de l’export JSON et CSV.
- Préserver le comportement clavier, les modales, les thèmes clair/sombre et les autres interactions déjà en place.
- Ne pas ajouter de dépendance, framework, outil de build ou fichier de projet sans nécessité liée à la demande.
- Ne pas écraser les modifications préexistantes de l’utilisateur. En cas de conflit inattendu qui empêche une modification sûre, demander des précisions avant de poursuivre.

## Vérification

- Après toute modification de logique métier, de sauvegarde ou d’import/export, ouvrir `index.html`, puis la vue **Auto-tests**, et vérifier que tous les tests passent.
- Pour un changement d’interface, vérifier dans un navigateur les vues et interactions concernées, ainsi que les thèmes clair et sombre si pertinent.
- Aucun script de build ou de test externe n’étant configuré, ne pas inventer de commande de projet. Indiquer clairement les vérifications effectuées et celles qui n’ont pas pu l’être.