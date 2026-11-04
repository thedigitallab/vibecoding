# Spécification — gestion de sprint (Scrum)

## Besoin

TaskFlow gère un backlog et un tableau Kanban. L'équipe doit pouvoir planifier
son travail en sprints, comme dans les outils du marché (Jira, Linear) : créer
un sprint avec ses dates et sa capacité, y glisser des tickets, suivre le
burndown, puis clôturer le sprint.

## Données

- `sprints[]` : `{ id, nom, objectif, debut, fin, capacite, statut, pointsDepart,
  releves, demarreLe, clotureLe, pointsTermines }`.
- `ticket.sprintId` : identifiant du sprint du ticket ; absent ou `null` = le
  ticket est dans le Backlog. Un ticket n'a qu'un seul `sprintId`, il ne peut donc
  appartenir qu'à un seul sprint à la fois.
- Statuts d'un sprint : **Futur → Actif → Clôturé**. Un seul sprint actif à la fois.
- Le format d'export JSON et CSV des tickets ne change pas : `sprintId` n'y figure
  pas, et un ticket importé arrive dans le Backlog.

## Fonctionnalités

1. **Créer un sprint** : nom, date de début, date de fin, capacité en points
   (entier de 1 à 999) et objectif facultatif. Le formulaire propose un nom, une
   période de deux semaines qui commence après le dernier sprint (ou aujourd'hui)
   et une capacité égale à la vélocité moyenne, ou 20 points s'il n'y a pas
   encore de vélocité.
2. **Planifier** : la vue Sprints affiche le sprint actif, les sprints futurs,
   puis le Backlog. On y glisse les tickets d'une section à l'autre, ou on utilise
   le menu « Déplacer vers ». La fenêtre d'un ticket propose aussi un champ
   « Sprint ».
3. **Jauge de capacité** : points engagés / capacité, avec « x pts disponibles »,
   « Capacité atteinte » ou « Dépassement de x pts ».
4. **Démarrer** un sprint futur : il devient actif et son périmètre de départ
   (points engagés) est figé ; c'est la base de la ligne idéale.
5. **Terminer** le sprint actif : un bilan affiche les tickets terminés et non
   terminés. Les tickets terminés restent dans le sprint. Les autres reviennent au
   Backlog par défaut, ou vont dans un sprint futur choisi dans la fenêtre. Aucun
   statut Kanban ne change.
6. **Burndown en SVG** : points restants (tickets du sprint non « Terminé ») jour
   par jour, et ligne idéale du périmètre de départ jusqu'à zéro à la fin du sprint.
7. **Vélocité** : moyenne des points livrés par les trois derniers sprints clôturés.
8. **Filtre « Sprint actif »** dans le Backlog et le Kanban.

## Règles (dont les trois pièges de l'atelier)

- **Capacité atteinte pile** : un ajout qui amène les points engagés exactement à
  la capacité est accepté ; seul un dépassement est refusé, avec son calcul
  (« 20 + 1 > 20 pts »). Réestimer un ticket déjà dans le sprint reste possible :
  la jauge signale alors le dépassement.
- **Ticket non estimé** : il est refusé dans un sprint. Un ticket qui redevient
  non estimé retourne au Backlog (statut et sprint).
- **Sprint d'un seul jour** (début = fin) : accepté. Le burndown compte n + 1
  points pour n jours (n ≥ 1) : la ligne idéale `départ × (n − i) / n` ne divise
  jamais par zéro. Un sprint vide (0 point) reste dessinable : l'échelle
  verticale vaut au moins 1.
- La fin ne peut pas précéder le début ; les dates doivent exister au calendrier.
- Démarrer un deuxième sprint pendant qu'un sprint est actif est refusé.
- Un sprint clôturé ne se modifie plus et ne reçoit plus de ticket ; seul un sprint
  futur peut être supprimé (ses tickets retournent au Backlog).
- Les règles des tickets ne changent pas : WIP, Definition of Ready, passage
  obligé par « En revue ».

## Burndown réel

À chaque changement, TaskFlow enregistre pour le sprint actif les points restants
du jour (`releves`). Un jour sans relevé reprend la valeur de la veille. Le jour
courant est toujours calculé en direct. À la clôture, le dernier relevé est figé.

## Persistance et compatibilité

La sauvegarde passe en version 4 : `{ version: 4, tickets, interface, journal,
sprints }`. Les sauvegardes v1 à v3 se chargent toujours. Une sauvegarde v3 qui
contient des sprints de l'ancien format (`ticketIds`, `dateDebut`, `dateFin`,
durée en semaines) est convertie : statuts repris, appartenance transférée sur
`ticket.sprintId`, capacité reprise égale aux points engagés. Un sprint sans
période valide est écarté.

Les sprints relus sont vérifiés : dates inversées, capacité invalide, identifiant
en double, deuxième sprint actif, `sprintId` vers un sprint inconnu, ticket non
estimé dans un sprint ouvert sont écartés ou corrigés, sans écran blanc.

## Auto-tests

T46 à T55 : validation de la création, capacité atteinte pile (T47), ticket non
estimé (T48), un seul sprint par ticket, un seul sprint actif, clôture, burndown
d'un sprint d'un jour et d'un sprint vide (T52), burndown réel, sauvegarde et
migration, sprints trafiqués.

## Hors périmètre

- Plusieurs sprints actifs en parallèle.
- Rapports de sprint exportables, capacité par personne.
- Sprint inscrit dans les exports JSON et CSV des tickets.
