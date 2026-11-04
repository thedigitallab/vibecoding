# Spécification — gestion de sprint

## Besoin

TaskFlow ne permet actuellement que de gérer un backlog et un tableau Kanban.
L’utilisateur doit pouvoir planifier et suivre des sprints pour l’unique projet
de l’application, sans changer les règles existantes des tickets ni leurs
statuts lors du démarrage ou de la fin d’un sprint.

## Résultat attendu

Une vue dédiée permet de gérer les sprints planifiés et actif, de leur associer
des tickets estimés et de consulter leur avancement. Lors de la planification,
l’utilisateur choisit une date de début et une durée en semaines calendaires;
TaskFlow calcule automatiquement la date de fin. Un seul sprint peut être actif
à la fois pour le projet.

Chaque ticket ne peut être membre que d’un seul sprint à la fois. Seuls les
tickets estimés (1, 2, 3, 5, 8 ou 13 points) peuvent être ajoutés. Cette
appartenance est indépendante du statut Kanban : ajouter, démarrer ou terminer
un sprint ne déplace pas les tickets et ne modifie pas leur statut.

La vue présente un burndown en SVG des points estimés restants, par jour, avec
une courbe réelle et une ligne idéale. Pour chaque jour écoulé de la période du
sprint, la courbe réelle représente la somme des points des tickets membres qui
ne sont pas « Terminé » à la fin de la journée. Les modifications d'estimation
ou d'appartenance pendant un sprint actif affectent la courbe réelle à compter
de leur date d'effet. La ligne idéale reste calculée à partir des tickets et de
leurs estimations au démarrage du sprint.

## Critères d’acceptation

1. Une vue dédiée « Sprints » est accessible depuis TaskFlow et permet de voir
   les tickets membres, leur statut, les dates et la durée du sprint, ainsi que
   le burndown lorsque le sprint est planifié.
2. Pour créer ou planifier un sprint, l’utilisateur choisit une date de début
   et une durée entière positive en semaines calendaires. TaskFlow calcule la
   date de fin comme la date de début plus (7 × N) - 1 jours calendaires
   inclusifs, l’affiche dans la période du sprint et la persiste avec celui-ci.
   Le formulaire ne propose aucun champ de date de fin à saisir. Sans date de
   début, le sprint reste à planifier et aucune période n’est générée.
3. Le démarrage d’un sprint planifié le rend actif. Le démarrage est refusé si
   un autre sprint est déjà actif. Il ne modifie aucun statut de ticket.
4. L’ajout d’un ticket à un sprint est refusé si le ticket n’est pas estimé ou
   s’il appartient déjà à un autre sprint. Un ticket accepté n’apparaît que
   dans un seul sprint à la fois.
5. Les règles générales des tickets continuent de s’appliquer : un ticket non
   estimé reste au Backlog, son déplacement hors du Backlog reste refusé,
   redevenir non estimé le replace au Backlog et le retire de son sprint; les
   transitions autorisées et les limites WIP restent inchangées.
6. Terminer un sprint actif ne modifie pas les statuts des tickets. Tout ticket
   membre dont le statut n’est pas « Terminé » est reporté dans le sprint
   suivant; un ticket « Terminé » n’est pas reporté.
7. Le sprint suivant est le sprint planifié qui vient ensuite dans l’ordre des
   dates. S’il n’en existe aucun, TaskFlow crée automatiquement un sprint
   suivant et y reporte uniquement les tickets inachevés. Ce sprint créé
   automatiquement reprend la durée en semaines du sprint terminé, mais n’a pas
   de dates : il reste à planifier et aucune période n’est générée
   automatiquement.
8. La création, la planification, l’activation, la fin et les appartenances
   persistent après rechargement, sans perte des tickets existants.
9. Pour un sprint vide, le burndown ne produit pas de valeur invalide : les
   points restants sont zéro pour chaque jour et les deux lignes restent
   affichables.
10. Pendant un sprint actif, l’utilisateur peut ajouter ou retirer des tickets
    estimés et modifier leur estimation. Ces changements ne modifient pas le
    statut des tickets; ils affectent les points réels à compter de leur date
    d’effet, sans recalculer la ligne idéale établie au démarrage.

## Cas limites

- Une tentative d’ajout d’un ticket non estimé ou déjà membre d’un sprint est
  refusée sans changer son appartenance.
- Une tentative de démarrer un deuxième sprint pendant qu’un sprint est actif
  est refusée; le sprint déjà actif et les statuts de tickets restent inchangés.
- À la fin d’un sprint, seuls ses tickets non « Terminé » sont reportés; les
  tickets terminés n’entrent pas dans le sprint suivant.
- Si aucun sprint suivant n’est planifié, le sprint créé automatiquement
  contient uniquement les tickets reportés, reprend la durée du sprint terminé
  et attend la définition de sa période; aucune date n’est inventée.
- Pour une durée d’une semaine commençant le 02/11/2026, la date de fin affichée
  et enregistrée est le 08/11/2026; pour deux semaines, elle est le 15/11/2026.
- Sans date de début, le sprint reste à planifier; la date de fin n’est pas
  demandée ni générée.
- Un ticket membre redevient non estimé : il est retiré de son sprint et reste
  au Backlog.
- Une modification de ticket pendant un sprint actif affecte les points réels
  à compter du jour de cette modification, mais ne change pas la ligne idéale.
- Les règles WIP continuent de s’appliquer aux déplacements de tickets dans le
  Kanban; le report d’un sprint ne constitue pas un déplacement de statut.

## Hors périmètre

- Capacité d’équipe ou objectif de points par sprint.
- Modification automatique des statuts lors du démarrage, de la fin ou du
  report.
- Archivage, suppression ou politique de conservation particulière des sprints.
- Création automatique de dates ou d’une période pour un sprint.
- Modification des règles de tickets, des statuts, des transitions, du WIP, du
  Backlog des tickets non estimés, ou des formats d’import/export.

## À clarifier

Aucune décision produit bloquante connue après les clarifications de
l’utilisateur.
