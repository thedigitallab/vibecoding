# Spécification fonctionnelle de TaskFlow

## Objectif

TaskFlow est une application monopage, en français, pour gérer le backlog et le
flux de travail d'un projet. Elle fonctionne dans un navigateur sans serveur ni
dépendance de compilation. Les données sont conservées dans le stockage local du
navigateur.

## Tickets

Un ticket contient un identifiant, un titre, un type, une priorité, une
estimation en points, un statut, une personne assignée (facultative) et une date
de création. Le titre comporte de 3 à 80 caractères et ne peut pas commencer
par un espace. Les types sont Story, Bug et Tâche; les priorités vont de 1
(haute) à 3 (basse); les estimations autorisées sont 1, 2, 3, 5, 8 et 13 points,
ou « Non estimé ». Un ticket non estimé reste au Backlog; le repasser en non
estimé le replace au Backlog.

## Vues et interactions

- **Backlog** : liste triable de tickets, regroupée par priorité, avec colonnes
  configurables, recherche par titre et filtres cumulables par type, priorité
  et assigné (« Mes tickets »).
- **Kanban** : colonnes Backlog, À faire, En cours, En revue et Terminé; cartes
  déplaçables et tableau de bord des points et de l'avancement.
- **Sprints** : création d'un sprint (nom, dates, capacité en points, objectif),
  planification par glisser-déposer entre les sprints et le Backlog, jauge de
  capacité, démarrage, clôture (les tickets non terminés retournent au Backlog ou
  vont dans un sprint futur), burndown en SVG et vélocité. Détails dans
  [`spec.md`](spec.md).
- **Auto-tests** : exécution et affichage des tests fonctionnels intégrés.
- **Import / Export** : import et export des tickets aux formats JSON et CSV,
  avec rapport de validation des lignes.
- **Tickets** : création, modification et suppression avec confirmation;
  assignation à Camille, Hugo, Karim ou Léa.
- **Préférences** : thèmes clair et sombre, profil « Vous êtes », largeur et
  visibilité des colonnes du Backlog.
- **Historique** : annulation des déplacements récents de tickets; le journal
  est limité aux 10 dernières entrées.

## Règles du flux de travail

- La colonne En cours accepte au plus 3 tickets; En revue en accepte au plus 2.
- Terminé n'est accessible que depuis En revue.
- Les déplacements refusés ne modifient pas le ticket et affichent leur motif.
- Un sprint n'accepte que des tickets estimés, dans la limite de sa capacité
  (la capacité atteinte pile est acceptée). Un seul sprint est actif à la fois.
  Démarrer, clôturer ou changer de sprint ne modifie jamais le statut d'un ticket.
- Les imports valident et normalisent les données, réattribuent les identifiants
  dupliqués et respectent les limites WIP. Une importation est contrôlée avant
  de modifier le backlog.

## Persistance et compatibilité

Les tickets, l'interface, l'historique et les sprints sont enregistrés sous la
clé `taskflow`, dans le format versionné actuel (version 4). Les sauvegardes antérieures sont
migrées; les données invalides sont réparées ou écartées sans empêcher l'écran
de s'ouvrir. Si le stockage est bloqué ou plein, l'application reste utilisable
et signale que la sauvegarde a échoué.

## Fichiers du projet

- `index.html` : structure de la page et ordre de chargement des scripts.
- `styles.css` : styles et thèmes de l'application.
- `app.js` : données, règles métier, rendu et interactions.
- `tests.js` : scénarios d'auto-tests et lancement de l'initialisation.
