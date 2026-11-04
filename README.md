# TaskFlow

TaskFlow est une application monopage en français pour gérer le backlog et le
flux de travail d’un projet. Elle fonctionne dans un navigateur, sans serveur
applicatif, dépendance à installer ni étape de compilation.

## Fonctionnalités

- **Backlog** avec recherche, filtres cumulables, tri et colonnes configurables.
- **Tableau Kanban** avec les statuts Backlog, À faire, En cours, En revue et
  Terminé.
- **Gestion des tickets** : création, modification, suppression, priorité,
  estimation et assignation.
- **Sprints** : planification par date de début et durée, calcul automatique de
  la date de fin, suivi des tickets et burndown.
- **Import et export** des tickets en JSON et CSV.
- **Préférences** : thème clair ou sombre et profil utilisateur.
- **Historique** des déplacements avec annulation.
- **Auto-tests** fonctionnels accessibles depuis l’application.

Les règles du produit et les détails des fonctionnalités sont décrits dans
[`docs/SPECIFICATION.md`](docs/SPECIFICATION.md).

## Utilisation

1. Téléchargez ou clonez le dépôt.
2. Ouvrez `index.html` dans un navigateur récent.
3. Choisissez une vue dans le menu latéral.

Aucune installation ni commande de lancement n’est nécessaire. Les données de
l’application sont sauvegardées dans le stockage local du navigateur; elles ne
sont pas synchronisées entre appareils.

Pour vérifier l’application, ouvrez la vue **Auto-tests**, puis cliquez sur
**Relancer**.

## Publication avec GitHub Pages

TaskFlow est un site statique et peut être publié avec GitHub Pages :

1. Dans le dépôt GitHub, ouvrez **Settings → Pages**.
2. Choisissez le déploiement depuis une branche.
3. Sélectionnez `main` et le dossier `/(root)`, puis enregistrez.

La publication peut prendre quelques minutes. Les données restent stockées
localement dans le navigateur de chaque visiteur.

## Fichiers principaux

| Fichier | Rôle |
| --- | --- |
| `index.html` | Structure de la page et chargement des scripts |
| `styles.css` | Présentation et thèmes |
| `app.js` | Règles métier, rendu et interactions |
| `tests.js` | Auto-tests intégrés |
| `docs/SPECIFICATION.md` | Référence fonctionnelle du produit |
