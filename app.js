    /* =====================================================================
       1. DONNÉES & ÉTAT
       Toutes les variables et listes de départ, au même endroit.
       ===================================================================== */

    // Données initiales imposées (13 tickets en mémoire brute) ; gardées pour « Réinitialiser »
    const TICKETS_INITIAUX = [
        { id: 1, titre: "US1 : Ajouter un ticket par un formulaire validé", type: "story", priorite: 1, points: 5, statut: "backlog", assigne: "Camille", creeLe: "2026-11-03" },
        { id: 2, titre: "US2 : Lire le backlog trié (priorité 1 en haut, petits points)", type: "story", priorite: 1, points: 3, statut: "backlog", assigne: "Camille", creeLe: "2026-11-03" },
        { id: 3, titre: "US3 : Combiner recherche texte + filtre type + filtre priorité", type: "story", priorite: 1, points: 8, statut: "backlog", assigne: "Karim", creeLe: "2026-11-03" },
        { id: 4, titre: "US4 : Voir en en-tête les KPI en temps réel", type: "story", priorite: 2, points: 5, statut: "backlog", assigne: "Léa", creeLe: "2026-11-03" },
        { id: 5, titre: "US5 : Supprimer un ticket avec confirmation UI (sans confirm)", type: "story", priorite: 2, points: 3, statut: "backlog", assigne: null, creeLe: "2026-11-03" },
        { id: 6, titre: "Correction crash affichage profil mobile", type: "bug", priorite: 1, points: 2, statut: "backlog", assigne: "Karim", creeLe: "2026-11-01" },
        { id: 7, titre: "Migration base de données utilisateurs", type: "tache", priorite: 2, points: 13, statut: "backlog", assigne: "Hugo", creeLe: "2026-11-02" },
        { id: 8, titre: "Export PDF des factures mensuelles", type: "story", priorite: 3, points: 5, statut: "backlog", assigne: null, creeLe: "2026-11-02" },
        { id: 9, titre: "Intégration widget météo espace client", type: "story", priorite: 3, points: 2, statut: "backlog", assigne: "Léa", creeLe: "2026-11-03" },
        { id: 10, titre: "Correction lien pied de page brisé", type: "bug", priorite: 3, points: 1, statut: "backlog", assigne: "Karim", creeLe: "2026-11-04" },
        { id: 11, titre: "Étude d'impact architecture cloud", type: "tache", priorite: 1, points: null, statut: "backlog", assigne: "Hugo", creeLe: "2026-11-04" },
        { id: 12, titre: "Audit accessibilité RGAA", type: "tache", priorite: 2, points: null, statut: "backlog", assigne: null, creeLe: "2026-11-04" },
        { id: 13, titre: "Validation Tri", type: "tache", priorite: 1, points: 1, statut: "backlog", assigne: "Camille", creeLe: "2026-11-05" }
    ];
    let tasks = TICKETS_INITIAUX.map(t => ({ ...t }));

    // V3 : export CSV de l'ancien outil du chef de projet, recopié tel quel (piégé)
    const CSV_PIEGE = [
        'id,titre,type,priorite,points,statut',
        '21,"Corriger le login, page d’accueil",bug,1,3,afaire',
        '22,Export PDF des factures,Story ,2,8,backlog',
        '23,,tache,3,2,backlog',
        '24,Notifications e-mail,story,2,?,backlog',
        '21,Tableau de bord client,story,1,5,encours',
        '25,Audit accessibilité,tache,4,3,backlog'
    ].join('\n');

    // Debug : les mêmes pièges en JSON (titre vide, « Story », « ? », id 21 en double, priorité 4)
    const JSON_PIEGE = [
        { id: 21, titre: "Corriger le login, page d’accueil", type: "bug", priorite: 1, points: 3, statut: "afaire" },
        { id: 22, titre: "Export PDF des factures", type: "Story ", priorite: 2, points: 8, statut: "backlog" },
        { id: 23, titre: "", type: "tache", priorite: 3, points: 2, statut: "backlog" },
        { id: 24, titre: "Notifications e-mail", type: "story", priorite: 2, points: "?", statut: "backlog" },
        { id: 21, titre: "Tableau de bord client", type: "story", priorite: 1, points: 5, statut: "encours" },
        { id: 25, titre: "Audit accessibilité", type: "tache", priorite: 4, points: 3, statut: "backlog" }
    ];

    // Debug : un lot sans erreur (virgule dans un titre, non estimé au Backlog, une seule carte En cours)
    const TICKETS_VALIDES_TEST = [
        { id: 31, titre: "Afficher l'historique des commandes", type: "story", priorite: 2, points: 5, statut: "afaire", assigne: "Léa", creeLe: "2026-11-03" },
        { id: 32, titre: "Corriger l'arrondi, montant TTC", type: "bug", priorite: 1, points: 2, statut: "encours", assigne: "Karim", creeLe: "2026-11-03" },
        { id: 33, titre: "Rédiger la note de migration", type: "tache", priorite: 3, points: null, statut: "backlog", assigne: null, creeLe: "2026-11-03" },
        { id: 34, titre: "Filtrer les factures par date", type: "story", priorite: 2, points: 3, statut: "backlog", assigne: "Camille", creeLe: "2026-11-03" },
        { id: 35, titre: "Mettre à jour les dépendances", type: "tache", priorite: 3, points: 1, statut: "termine", assigne: "Hugo", creeLe: "2026-11-03" }
    ];

    // État de l'interface
    let currentView = 'backlog';      // 'backlog', 'board', 'tests' ou 'donnees'
    let deletingId = null;            // ticket en attente de confirmation de suppression
    let editingId = null;             // ticket ouvert dans la modale (null = création)
    let activeTypes = new Set();      // filtre type (vide = tous)
    let activePriorities = new Set(); // filtre priorité (vide = toutes)
    let isManualSort = false;         // true après un glisser-déposer
    let resultatsTests = [];          // résultats du panneau Auto-tests
    let importTexte = '';             // zone d'import : CSV ou JSON collé, ou contenu du fichier choisi
    let fichierImport = null;         // nom du fichier chargé dans la zone (null = texte collé ou vide)
    let rapportImport = null;         // dernier rapport d'import (I5)
    let formatExport = 'json';        // 'json' ou 'csv'
    let dernierExport = null;         // tableau au moment du dernier export (JSON), pour vérifier l'aller-retour
    let confirmVider = false;         // confirmation « Vider le tableau » affichée
    let dernierImportTexte = null;    // contenu du dernier import réussi, pour éviter un double import
    let confirmReimport = false;      // avertissement « déjà importé » affiché
    let idsImportes = new Set();      // tickets du dernier import, marqués dans le Backlog et le Kanban
    let debugFormat = 'csv';          // bloc Debug : 'csv' ou 'json'
    let debugVariante = 'piege';      // bloc Debug : 'valide' ou 'piege'
    let mesTickets = false;           // TP2 · filtre « Mes tickets »
    let moi = 'Camille';              // TP2 · membre de l'équipe qui utilise l'écran
    let journal = [];                 // TP2 · 10 derniers déplacements, du plus récent au plus ancien
    let sprints = [];                 // Sprints planifiés, actifs et terminés

    // Colonnes visibles du Backlog
    let visibleCols = {
        id: true, titre: true, type: true, priorite: true,
        points: true, statut: true, assigne: true, creeLe: true, actions: true
    };

    // Largeurs des colonnes du Backlog (px ; null = colonne souple), mémorisées
    const defaultColWidths = { id: 62, titre: null, type: 92, priorite: 58, points: 96, statut: 112, assigne: 108, creeLe: 68, actions: 64 };
    let colWidths = { ...defaultColWidths };
    try { colWidths = lireLargeurs(JSON.parse(localStorage.getItem('taskflow-cols')), defaultColWidths); } catch (e) {}

    // Colonnes du Kanban, pilotées par les données : une ligne ajoutée = une colonne
    // wip = nombre maximum de tickets dans la colonne (null = sans limite)
    // depuis = seule colonne d'où l'on peut entrer dans celle-ci (règle R5, absente = toutes)
    const COLONNES = [
        { id: "backlog", titre: "Backlog", wip: null },
        { id: "afaire", titre: "À faire", wip: null },
        { id: "encours", titre: "En cours", wip: 3 },
        { id: "enrevue", titre: "En revue", wip: 2 },                       // TP2 · demande du PO
        { id: "termine", titre: "Terminé", wip: null, depuis: "enrevue" }   // TP2 · Terminé seulement depuis En revue
    ];

    // TP2 · Équipe du projet : valeurs possibles du champ « assigne » (null = non assigné)
    const EQUIPE = ['Camille', 'Hugo', 'Karim', 'Léa'];
    const TAILLE_JOURNAL = 10;

    // Règles et libellés
    const POINTS_VALIDES = [1, 2, 3, 5, 8, 13];
    const ID_MAX = 999999999;          // au-delà, un id importé est renuméroté
    const colLabels = {
        id: 'ID', titre: 'Titre', type: 'Type', priorite: 'Priorité',
        points: 'Points', statut: 'Statut', assigne: 'Assigné', creeLe: 'Date de création', actions: 'Actions'
    };
    const headLabels = { id: 'ID', titre: 'Titre', type: 'Type', priorite: 'Prio', points: 'Points', statut: 'Statut', assigne: 'Assigné', creeLe: 'Créé le', actions: '' };
    const typeLabels = { story: 'Story', bug: 'Bug', tache: 'Tâche' };
    const statusLabels = Object.fromEntries(COLONNES.map(c => [c.id, c.titre]));
    const prioLabels = { 1: 'Priorité haute', 2: 'Priorité moyenne', 3: 'Priorité basse' };


    // V4 · Sauvegarde versionnée : { version: 3, tickets, interface, journal, sprints } dans localStorage
    // v1 = tableau nu · v2 = { version, tickets, interface } · v3 (TP2) = + champ assigne et journal
    // Le stockage est un paramètre : les auto-tests passent un faux localStorage.
    const CLE = 'taskflow';
    const VERSION_SAUVEGARDE = 3;

    function stockageNavigateur() {
        try { return window.localStorage; } catch (e) { return null; }   // stockage bloqué (navigation privée stricte…)
    }

    // → true si c'est enregistré ; false si le stockage est plein ou bloqué (l'application continue)
    function sauvegarder(etat, stockage = stockageNavigateur()) {
        try { stockage.setItem(CLE, JSON.stringify({ version: VERSION_SAUVEGARDE, ...etat })); return true; }
        catch (e) { return false; }
    }

    // → { etat, tickets, interface, journal, sprints } ; jamais d'exception, au pire la démo
    function charger(stockage = stockageNavigateur()) {
        let brut = null;
        try { brut = stockage.getItem(CLE); } catch (e) { /* lecture impossible : premier lancement */ }
        return lireSauvegarde(brut);
    }


    /* =====================================================================
       2. FONCTIONS MÉTIER (calculs et filtres purs avec return)
       Ni lecture du DOM ni modification des variables globales :
       elles reçoivent des données et retournent un résultat.
       ===================================================================== */

    // Minuscules sans accents, pour une recherche tolérante
    function normaliserTexte(str) {
        return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    }

    // Les dates sprint sont manipulées en UTC pour éviter les décalages de fuseau horaire.
    function dateSprintValide(date) {
        if (!estUneDate(date)) return false;
        const [annee, mois, jour] = date.split('-').map(Number);
        const d = new Date(Date.UTC(annee, mois - 1, jour));
        return d.getUTCFullYear() === annee && d.getUTCMonth() === mois - 1 && d.getUTCDate() === jour;
    }

    function decalerDateSprint(date, jours) {
        const [annee, mois, jour] = date.split('-').map(Number);
        const d = new Date(Date.UTC(annee, mois - 1, jour + jours));
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    }

    function normaliserSprint(brut) {
        if (!brut || typeof brut !== 'object' || Array.isArray(brut)
            || !Number.isSafeInteger(brut.id) || brut.id < 1
            || !Number.isSafeInteger(brut.dureeSemaines) || brut.dureeSemaines < 1
            || !['a_planifier', 'planifie', 'actif', 'termine'].includes(brut.statut)) return null;
        const dateDebut = typeof brut.dateDebut === 'string' && dateSprintValide(brut.dateDebut) ? brut.dateDebut : '';
        const dateFin = typeof brut.dateFin === 'string' && dateSprintValide(brut.dateFin) ? brut.dateFin : '';
        if ((dateDebut || dateFin) && (!dateDebut || !dateFin || dateFin !== decalerDateSprint(dateDebut, brut.dureeSemaines * 7 - 1))) return null;
        if ((brut.statut === 'a_planifier' && dateDebut) || (brut.statut !== 'a_planifier' && !dateDebut)) return null;
        const ticketIds = Array.isArray(brut.ticketIds) ? [...new Set(brut.ticketIds.filter(Number.isSafeInteger))] : [];
        const instantaneDepart = Array.isArray(brut.instantaneDepart) ? brut.instantaneDepart
            .filter(x => x && Number.isSafeInteger(x.ticketId) && POINTS_VALIDES.includes(x.points) && COLONNES.some(c => c.id === x.statut))
            .map(x => ({ ticketId: x.ticketId, points: x.points, statut: x.statut })) : [];
        const evenements = Array.isArray(brut.evenements) ? brut.evenements.filter(e =>
            e && dateSprintValide(e.date) && Number.isSafeInteger(e.ticketId)
            && ['ajout', 'retrait', 'points', 'statut'].includes(e.type)
            && (e.type !== 'points' || POINTS_VALIDES.includes(e.points))
            && (e.type !== 'statut' || COLONNES.some(c => c.id === e.statut))
        ).map(e => ({ ...e })) : [];
        return {
            id: brut.id, nom: typeof brut.nom === 'string' ? brut.nom.slice(0, 80) : `Sprint ${brut.id}`,
            dureeSemaines: brut.dureeSemaines, dateDebut, dateFin, statut: brut.statut,
            ticketIds, instantaneDepart, evenements,
            pointsDepart: Number.isFinite(brut.pointsDepart) && brut.pointsDepart >= 0 ? brut.pointsDepart : null,
            demarreLe: typeof brut.demarreLe === 'string' && dateSprintValide(brut.demarreLe) ? brut.demarreLe : ''
        };
    }

    function lireSprints(brut, tickets) {
        if (!Array.isArray(brut)) return [];
        const connus = new Set(tickets.map(t => t.id));
        const estimes = new Set(tickets.filter(t => POINTS_VALIDES.includes(t.points)).map(t => t.id));
        const ids = new Set(), membres = new Set();
        let actifPresent = false;
        return brut.map(normaliserSprint).filter(s => {
            if (!s || ids.has(s.id)) return false;
            if (s.statut === 'actif' && actifPresent) return false;
            ids.add(s.id);
            if (s.statut === 'actif') actifPresent = true;
            s.ticketIds = s.ticketIds.filter(id => connus.has(id)
                && (s.statut === 'termine' || (estimes.has(id) && !membres.has(id))));
            if (s.statut !== 'termine') s.ticketIds.forEach(id => membres.add(id));
            s.instantaneDepart = s.instantaneDepart.filter(x => connus.has(x.ticketId));
            return true;
        });
    }

    // US3 : recherche texte + filtre type + filtre priorité (+ TP2 : « Mes tickets »), cumulés
    function filtrerTaches(liste, filtres) {
        const recherche = normaliserTexte(filtres.recherche);
        return liste.filter(t =>
            normaliserTexte(t.titre).includes(recherche) &&
            (filtres.types.size === 0 || filtres.types.has(t.type)) &&
            (filtres.priorites.size === 0 || filtres.priorites.has(t.priorite)) &&
            (!filtres.mesTickets || t.assigne === filtres.moi)
        );
    }

    // US2 : priorité 1 en haut, puis les plus petits points, non estimés en bas
    function comparerTaches(a, b) {
        if (a.priorite !== b.priorite) return a.priorite - b.priorite;
        if (a.points === null && b.points === null) return 0;
        if (a.points === null) return 1;
        if (b.points === null) return -1;
        return a.points - b.points;
    }

    function trierTaches(liste) {
        return [...liste].sort(comparerTaches);
    }

    // US4 : les trois compteurs d'en-tête
    function calculerCompteurs(liste) {
        return {
            tickets: liste.length,
            points: liste.reduce((somme, t) => somme + (t.points || 0), 0),
            nonEstimes: liste.filter(t => t.points === null).length
        };
    }

    // Nombre de tickets par priorité (en-têtes de groupe du Backlog)
    function compterParPriorite(liste) {
        return liste.reduce((acc, t) => ({ ...acc, [t.priorite]: (acc[t.priorite] || 0) + 1 }), {});
    }

    // US1 : retourne le message d'erreur, ou null si le ticket est valide
    function validerTicket(titreBrut, points) {
        if (titreBrut.startsWith(' ')) return "Le titre ne peut pas commencer par un espace.";
        const titre = titreBrut.trim();
        if (titre.length < 3 || titre.length > 80) return "Le titre doit faire entre 3 et 80 caractères.";
        if (points !== null && !POINTS_VALIDES.includes(points)) return "Les points doivent suivre la suite 1-2-3-5-8-13, ou « Non estimé ».";
        return null;
    }

    function prochainId(liste) {
        return liste.reduce((max, t) => t.id > max ? t.id : max, 0) + 1;   // reduce : sans limite de taille
    }

    function creerTache(liste, champs, date) {
        return [...liste, { id: prochainId(liste), ...champs, creeLe: date }];
    }

    // R2 · un ticket qui redevient non estimé retourne au Backlog (Definition of Ready)
    function modifierTache(liste, id, champs) {
        return liste.map(t => {
            if (t.id !== id) return t;
            const modifie = { ...t, ...champs };
            return modifie.points === null ? { ...modifie, statut: COLONNES[0].id } : modifie;
        });
    }

    // US5
    function supprimerTache(liste, id) {
        return liste.filter(t => t.id !== id);
    }

    // R1 à R5 : déplace un ticket vers une autre colonne du Kanban
    // contexte 'import' : le ticket est posé directement dans sa colonne (R5 ne s'applique qu'aux déplacements)
    // → { ok: true, tickets: nouveauTableau }  ou  { ok: false, erreur: "..." }
    function deplacerTicket(tickets, id, versStatut, contexte = 'deplacement') {
        const ticket = tickets.find(t => t.id === id);
        if (!ticket) return { ok: false, erreur: `Ticket introuvable (id ${id})` };

        const colonne = COLONNES.find(c => c.id === versStatut);
        if (!colonne) return { ok: false, erreur: `Colonne inconnue (${versStatut})` };

        if (ticket.statut === versStatut) return { ok: true, tickets: tickets };

        // R2 · Definition of Ready : un ticket non estimé ne quitte pas le Backlog
        if (ticket.points === null && ticket.statut === COLONNES[0].id) {
            return { ok: false, erreur: "Ticket non estimé : il reste dans le Backlog (Definition of Ready)" };
        }

        // R5 · Passage obligé (TP2) : « Terminé » ne s'atteint que depuis « En revue », lu dans COLONNES
        if (colonne.depuis && ticket.statut !== colonne.depuis && contexte !== 'import') {
            const source = COLONNES.find(c => c.id === colonne.depuis);
            return { ok: false, erreur: `accessible seulement depuis « ${source ? source.titre : colonne.depuis} »` };
        }

        // R1 · WIP : la colonne refuse le ticket qui dépasserait sa limite
        const dansColonne = tickets.filter(t => t.statut === versStatut).length;
        if (colonne.wip !== null && dansColonne >= colonne.wip) {
            return { ok: false, erreur: `WIP atteint (${dansColonne}/${colonne.wip})` };
        }

        // R4 · Immuable : nouveau tableau et nouvel objet, le tableau reçu reste intact
        return { ok: true, tickets: tickets.map(t => t.id === id ? { ...t, statut: versStatut } : t) };
    }

    // Avancement du tableau (dernière colonne = terminé) ; liste vide → 0 %, jamais NaN
    function calculerStats(tickets) {
        const fin = COLONNES[COLONNES.length - 1].id;
        const total = tickets.length;
        const termines = tickets.filter(t => t.statut === fin).length;
        return { total, termines, pctTermine: total === 0 ? 0 : Math.round(termines * 100 / total) };
    }

    // Planification et cycle de vie des sprints. Les tableaux et objets reçus restent immuables.
    function planifierSprint(liste, definition) {
        const source = Array.isArray(liste) ? liste : [];
        const d = definition || {};
        const duree = d.dureeSemaines;
        const debut = d.dateDebut || '';
        if (!Number.isSafeInteger(d.id) || d.id < 1) return { ok: false, erreur: 'Identifiant de sprint invalide.' };
        if (!Number.isSafeInteger(duree) || duree < 1) return { ok: false, erreur: 'La durée doit être un nombre entier de semaines supérieur à zéro.' };
        if (debut && !dateSprintValide(debut)) return { ok: false, erreur: 'Choisissez une date de début valide.' };
        const fin = debut ? decalerDateSprint(debut, duree * 7 - 1) : '';
        if (debut && !dateSprintValide(fin)) return { ok: false, erreur: 'La période du sprint dépasse les dates prises en charge.' };
        const existant = source.find(s => s.id === d.id);
        if (existant && (!['a_planifier', 'planifie'].includes(existant.statut) || existant.dateDebut || existant.dateFin)) {
            return { ok: false, erreur: 'Ce sprint ne peut plus être planifié.' };
        }
        const sprint = existant
            ? { ...existant, nom: typeof d.nom === 'string' && d.nom.trim() ? d.nom.trim().slice(0, 80) : existant.nom,
                dureeSemaines: duree, dateDebut: debut, dateFin: fin, statut: debut ? 'planifie' : 'a_planifier' }
            : { id: d.id, nom: typeof d.nom === 'string' && d.nom.trim() ? d.nom.trim().slice(0, 80) : `Sprint ${d.id}`,
                dureeSemaines: duree, dateDebut: debut, dateFin: fin, statut: debut ? 'planifie' : 'a_planifier',
                ticketIds: [], instantaneDepart: [], evenements: [], pointsDepart: null, demarreLe: '' };
        const sprints = existant ? source.map(s => s.id === d.id ? sprint : s) : [...source, sprint];
        return { ok: true, sprints };
    }

    function demarrerSprint(liste, sprintId, tickets, dateEffet) {
        const source = Array.isArray(liste) ? liste : [];
        const sprint = source.find(s => s.id === sprintId);
        if (!sprint) return { ok: false, erreur: 'Sprint introuvable.' };
        if (source.some(s => s.statut === 'actif')) return { ok: false, erreur: 'Un sprint est déjà actif.' };
        if (sprint.statut !== 'planifie' || !dateSprintValide(sprint.dateDebut) || !dateSprintValide(sprint.dateFin)) {
            return { ok: false, erreur: 'Seul un sprint planifié avec des dates peut démarrer.' };
        }
        const date = dateSprintValide(dateEffet) ? dateEffet : sprint.dateDebut;
        const parId = new Map((tickets || []).map(t => [t.id, t]));
        const instantaneDepart = sprint.ticketIds.map(id => parId.get(id)).filter(t => t && POINTS_VALIDES.includes(t.points))
            .map(t => ({ ticketId: t.id, points: t.points, statut: t.statut }));
        const demarre = { ...sprint, statut: 'actif', demarreLe: date,
            instantaneDepart, evenements: [], pointsDepart: instantaneDepart.reduce((n, t) => n + t.points, 0) };
        return { ok: true, sprints: source.map(s => s.id === sprintId ? demarre : s) };
    }

    function ajouterTicketSprint(liste, tickets, sprintId, ticketId, dateEffet) {
        const source = Array.isArray(liste) ? liste : [];
        const sprint = source.find(s => s.id === sprintId);
        if (!sprint || sprint.statut === 'termine') return { ok: false, erreur: 'Sprint introuvable ou terminé.' };
        const ticket = (tickets || []).find(t => t.id === ticketId);
        if (!ticket) return { ok: false, erreur: 'Ticket introuvable.' };
        if (!POINTS_VALIDES.includes(ticket.points)) return { ok: false, erreur: 'Seuls les tickets estimés peuvent être ajoutés à un sprint.' };
        if (source.some(s => s.statut !== 'termine' && s.ticketIds.includes(ticketId))) return { ok: false, erreur: 'Ce ticket appartient déjà à un sprint.' };
        const date = dateSprintValide(dateEffet) ? dateEffet : (sprint.dateDebut || new Date().toISOString().slice(0, 10));
        const maj = { ...sprint, ticketIds: [...sprint.ticketIds, ticketId] };
        if (sprint.statut === 'actif') maj.evenements = [...sprint.evenements, { date, type: 'ajout', ticketId, points: ticket.points, statut: ticket.statut }];
        return { ok: true, sprints: source.map(s => s.id === sprintId ? maj : s) };
    }

    function retirerTicketSprint(liste, sprintId, ticketId, dateEffet) {
        const source = Array.isArray(liste) ? liste : [];
        const sprint = source.find(s => s.id === sprintId);
        if (!sprint || sprint.statut === 'termine') return { ok: false, erreur: 'Sprint introuvable ou terminé.' };
        if (!sprint.ticketIds.includes(ticketId)) return { ok: false, erreur: 'Ce ticket ne fait pas partie du sprint.' };
        const date = dateSprintValide(dateEffet) ? dateEffet : new Date().toISOString().slice(0, 10);
        const maj = { ...sprint, ticketIds: sprint.ticketIds.filter(id => id !== ticketId) };
        if (sprint.statut === 'actif') maj.evenements = [...sprint.evenements, { date, type: 'retrait', ticketId }];
        return { ok: true, sprints: source.map(s => s.id === sprintId ? maj : s) };
    }

    function mettreAJourTacheSprint(listeSprints, tickets, ticketId, champs, dateEffet) {
        const ancien = (tickets || []).find(t => t.id === ticketId);
        if (!ancien) return { ok: false, erreur: 'Ticket introuvable.' };
        const modifie = { ...ancien, ...(champs || {}) };
        const erreur = validerTicket(modifie.titre, modifie.points) || validerProprietes(modifie);
        if (erreur) return { ok: false, erreur };
        if (!COLONNES.some(c => c.id === modifie.statut)) return { ok: false, erreur: 'Statut inconnu.' };
        const proprietes = { ...(champs || {}) };
        delete proprietes.statut;
        let nouveauxTickets = modifierTache(tickets, ticketId, proprietes);
        const cibleStatut = modifie.points === null ? 'backlog' : modifie.statut;
        if (cibleStatut !== nouveauxTickets.find(t => t.id === ticketId).statut) {
            const mouvement = deplacerTicket(nouveauxTickets, ticketId, cibleStatut);
            if (!mouvement.ok) return { ok: false, erreur: mouvement.erreur };
            nouveauxTickets = mouvement.tickets;
        }
        const date = dateSprintValide(dateEffet) ? dateEffet : new Date().toISOString().slice(0, 10);
        const sprints = historiserChangementsSprint(listeSprints, tickets, nouveauxTickets, date);
        return { ok: true, sprints, tickets: nouveauxTickets };
    }

    function historiserChangementsSprint(listeSprints, avant, apres, dateEffet) {
        const date = dateSprintValide(dateEffet) ? dateEffet : new Date().toISOString().slice(0, 10);
        return (listeSprints || []).map(sprint => {
            if (sprint.statut === 'termine') {
                const idsRestants = sprint.ticketIds.filter(id => apres.some(t => t.id === id));
                return idsRestants.length === sprint.ticketIds.length ? sprint : { ...sprint, ticketIds: idsRestants };
            }
            let ticketIds = [...sprint.ticketIds], evenements = [...sprint.evenements];
            for (const id of new Set([...avant.map(t => t.id), ...apres.map(t => t.id)])) {
                const a = avant.find(t => t.id === id), b = apres.find(t => t.id === id);
                if (!a || !ticketIds.includes(id)) continue;
                if (!b || b.points === null) {
                    ticketIds = ticketIds.filter(x => x !== id);
                    if (sprint.statut === 'actif') evenements.push({ date, type: 'retrait', ticketId: id });
                    continue;
                }
                if (sprint.statut !== 'actif') continue;
                if (a.points !== b.points && POINTS_VALIDES.includes(b.points)) evenements.push({ date, type: 'points', ticketId: id, points: b.points });
                if (a.statut !== b.statut && COLONNES.some(c => c.id === b.statut)) evenements.push({ date, type: 'statut', ticketId: id, statut: b.statut });
            }
            return { ...sprint, ticketIds, evenements };
        });
    }

    function terminerSprint(liste, sprintId, tickets, dateEffet) {
        const source = Array.isArray(liste) ? liste : [];
        const sprint = source.find(s => s.id === sprintId);
        if (!sprint || sprint.statut !== 'actif') return { ok: false, erreur: 'Seul un sprint actif peut être terminé.' };
        const date = dateSprintValide(dateEffet) ? dateEffet : sprint.dateFin;
        const suivants = source.filter(s => s.id !== sprintId && s.statut === 'planifie' && dateSprintValide(s.dateDebut))
            .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut) || a.id - b.id);
        let sprints = source.map(s => s.id === sprintId ? { ...s, statut: 'termine', termineLe: date } : s);
        let suivant = suivants.find(s => s.dateDebut > sprint.dateDebut
            || (s.dateDebut === sprint.dateDebut && s.id > sprint.id));
        if (!suivant) {
            const id = source.reduce((max, s) => Math.max(max, s.id), 0) + 1;
            suivant = { id, nom: `Sprint ${id}`, dureeSemaines: sprint.dureeSemaines, dateDebut: '', dateFin: '',
                statut: 'a_planifier', ticketIds: [], instantaneDepart: [], evenements: [], pointsDepart: null, demarreLe: '' };
            sprints = [...sprints, suivant];
        }
        const parId = new Map((tickets || []).map(t => [t.id, t]));
        const reporter = sprint.ticketIds.filter(id => {
            const t = parId.get(id);
            return t && t.statut !== 'termine' && POINTS_VALIDES.includes(t.points);
        });
        if (reporter.length) sprints = sprints.map(s => s.id === suivant.id
            ? { ...s, ticketIds: [...new Set([...s.ticketIds, ...reporter])] } : s);
        return { ok: true, sprints };
    }

    function calculerBurndown(sprint, tickets, jusquAu) {
        if (!sprint || !dateSprintValide(sprint.dateDebut) || !dateSprintValide(sprint.dateFin)) return { jours: [] };
        const fin = dateSprintValide(jusquAu) ? (jusquAu < sprint.dateFin ? jusquAu : sprint.dateFin) : sprint.dateFin;
        if (fin < sprint.dateDebut) return { jours: [] };
        const totalJours = Math.round((Date.parse(`${sprint.dateFin}T00:00:00Z`) - Date.parse(`${sprint.dateDebut}T00:00:00Z`)) / 86400000) + 1;
        let ideal = Number.isFinite(sprint.pointsDepart) ? sprint.pointsDepart : sprint.ticketIds.reduce((somme, id) => {
            const t = (tickets || []).find(x => x.id === id);
            return somme + (t && POINTS_VALIDES.includes(t.points) ? t.points : 0);
        }, 0);
        const membres = new Map();
        if (sprint.statut === 'actif' || sprint.statut === 'termine') {
            (sprint.instantaneDepart || []).forEach(x => membres.set(x.ticketId, { points: x.points, statut: x.statut }));
        } else {
            sprint.ticketIds.forEach(id => {
                const t = (tickets || []).find(x => x.id === id);
                if (t && POINTS_VALIDES.includes(t.points)) membres.set(id, { points: t.points, statut: t.statut });
            });
            ideal = [...membres.values()].reduce((sum, t) => sum + t.points, 0);
        }
        const evenements = [...(sprint.evenements || [])].sort((a, b) => a.date.localeCompare(b.date));
        const jours = [];
        for (let date = sprint.dateDebut; date <= fin; date = decalerDateSprint(date, 1)) {
            evenements.filter(e => e.date === date).forEach(e => {
                if (e.type === 'ajout') membres.set(e.ticketId, { points: e.points, statut: e.statut });
                else if (e.type === 'retrait') membres.delete(e.ticketId);
                else if (membres.has(e.ticketId)) {
                    const membre = membres.get(e.ticketId);
                    if (e.type === 'points') membre.points = e.points;
                    if (e.type === 'statut') membre.statut = e.statut;
                }
            });
            const pointsReels = [...membres.values()].reduce((sum, t) => sum + (t.statut === 'termine' ? 0 : t.points), 0);
            const index = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${sprint.dateDebut}T00:00:00Z`)) / 86400000);
            const pointsIdeaux = totalJours <= 1 ? 0 : ideal * (totalJours - 1 - index) / (totalJours - 1);
            jours.push({ date, pointsReels, pointsIdeaux });
        }
        return { jours };
    }

    // Les auto-tests du navigateur appellent directement ces fonctions pures.
    Object.assign(globalThis, {
        planifierSprint, demarrerSprint, ajouterTicketSprint, mettreAJourTacheSprint,
        retirerTicketSprint, terminerSprint, calculerBurndown
    });

    // V3 · Tableau de bord : points terminés / total, avancement, WIP, non estimés, points par colonne
    function calculerTableauDeBord(tickets) {
        const fin = COLONNES[COLONNES.length - 1].id;
        const somme = (liste) => liste.reduce((s, t) => s + (t.points || 0), 0);
        const pointsTotal = somme(tickets);
        const pointsTermines = somme(tickets.filter(t => t.statut === fin));
        return {
            pointsTermines,
            pointsTotal,
            pctAvancement: pointsTotal === 0 ? 0 : Math.round(pointsTermines * 100 / pointsTotal),
            // une entrée par colonne limitée (En cours 3, En revue 2…)
            wips: COLONNES.filter(c => c.wip !== null)
                .map(c => ({ titre: c.titre, occupes: tickets.filter(t => t.statut === c.id).length, limite: c.wip })),
            nonEstimes: tickets.filter(t => t.points === null).length,
            parColonne: COLONNES.map(c => {
                const liste = tickets.filter(t => t.statut === c.id);
                return { id: c.id, titre: c.titre, points: somme(liste), tickets: liste.length };
            })
        };
    }

    // Format reconnu d'après le contenu (collage ou fichier) : '[' ou '{' = JSON, sinon CSV
    function detecterFormat(texte) {
        const debut = texte.replace(/^﻿/, '').trim();
        if (debut === '') return null;
        return debut[0] === '[' || debut[0] === '{' ? 'json' : 'csv';
    }

    // I1 · Lit un CSV ; une virgule entre guillemets reste dans le titre
    // → [{ numero: 2, valeurs: { id: "21", titre: "Corriger le login, page d’accueil", ... } }, ...]
    // numero = ligne du fichier (en-tête = ligne 1), pour que le rapport cite la bonne ligne
    function parserCSV(texte) {
        const src = texte.replace(/^﻿/, '');   // BOM laissé par Excel
        // Séparateur lu sur l'en-tête : « ; » pour un CSV d'Excel en français, sinon « , »
        const entete = src.split(/\r\n|\n|\r/, 1)[0];
        const sep = entete.split(';').length > entete.split(',').length ? ';' : ',';
        const lignes = [];
        let champs = [], champ = '', entreGuillemets = false, numero = 1, debut = 1;
        const finDeLigne = () => {
            champs.push(champ);
            if (champs.some(c => c.trim() !== '')) lignes.push({ numero: debut, champs });
            champs = []; champ = '';
        };
        for (let i = 0; i < src.length; i++) {
            const c = src[i];
            if (entreGuillemets) {
                if (c === '"' && src[i + 1] === '"') { champ += '"'; i++; }   // "" = guillemet dans le texte
                else if (c === '"') entreGuillemets = false;
                else { if (c === '\n') numero++; champ += c; }
            } else if (c === '"') entreGuillemets = true;
            else if (c === sep) { champs.push(champ); champ = ''; }
            else if (c === '\n' || c === '\r') {
                if (c === '\r' && src[i + 1] === '\n') i++;              // fin de ligne Windows
                finDeLigne();
                numero++;
                debut = numero;
            } else champ += c;
        }
        finDeLigne();
        // Guillemet jamais refermé : la ligne a avalé la fin du fichier, elle sera rejetée
        if (entreGuillemets && lignes.length > 0) lignes[lignes.length - 1].erreur = 'guillemet non fermé : la suite du fichier est illisible';

        // La 1re ligne donne le nom des colonnes (« Priorité », « CREELE »… → nom exact du champ)
        const [titres, ...donnees] = lignes;
        if (!titres) return [];
        const CHAMPS = ['id', 'titre', 'type', 'priorite', 'points', 'statut', 'assigne', 'creeLe'];
        const noms = titres.champs.map(n => {
            const nom = normaliserTexte(n.trim());
            return CHAMPS.find(c => c.toLowerCase() === nom) || nom;
        });
        return donnees.map(l => ({ numero: l.numero, erreur: l.erreur, valeurs: Object.fromEntries(noms.map((nom, i) => [nom, l.champs[i]])) }));
    }

    // Lit un JSON : une liste de tickets (ou { tickets: [...] }), même forme que parserCSV
    // numero = position du ticket dans la liste
    function lireJSON(texte) {
        let donnees;
        try { donnees = JSON.parse(texte.replace(/^﻿/, '')); }
        catch (e) { return { ok: false, erreur: `JSON illisible : ${e.message}` }; }
        const liste = Array.isArray(donnees) ? donnees : donnees && Array.isArray(donnees.tickets) ? donnees.tickets : null;
        if (!liste) return { ok: false, erreur: 'Le JSON doit contenir une liste de tickets.' };
        return { ok: true, lignes: liste.map((valeurs, i) => ({ numero: i + 1, valeurs })) };
    }

    // Id lu dans un fichier : entier de 1 à ID_MAX, sinon null (au-delà, les nombres perdent leur précision)
    // Texte : chiffres seulement (« 021 » = 21) ; « 0x15 », « 1e1 », « 21.0 » ne sont pas des ids
    function idValide(v) {
        const n = typeof v === 'number' ? v
            : typeof v === 'string' && /^\d+$/.test(v.trim()) ? Number(v.trim())
            : NaN;
        return Number.isInteger(n) && n >= 1 && n <= ID_MAX ? n : null;
    }

    // I2 à I4 · Transforme les lignes lues (CSV ou JSON) en tickets, sans jamais modifier `existants`
    // Seules les lignes valides entrent ; les autres sont rejetées avec leur motif.
    // → { tickets: nouveauTableau, importes: [{ ligne, id, notes }], rejets: [{ ligne, motif }] }
    function importerTickets(lignes, existants, date) {
        // Les nouveaux ids partent au-delà de tous les ids connus, ceux du fichier compris :
        // un ticket renuméroté ne prend jamais l'id d'une ligne suivante
        // (reduce et non Math.max(...liste), qui plante sur un très gros fichier)
        const plusGrand = (max, n) => n > max ? n : max;
        let idLibre = Math.max(
            existants.reduce((max, t) => plusGrand(max, t.id), 0),
            lignes.reduce((max, l) => plusGrand(max, (l.valeurs && idValide(l.valeurs.id)) || 0), 0)
        ) + 1;
        const pris = new Set(existants.map(t => t.id));
        let tickets = existants;
        const importes = [], rejets = [];

        lignes.forEach(({ numero, valeurs, erreur }) => {
            const rejeter = (motif) => rejets.push({ ligne: numero, motif });
            if (erreur) return rejeter(erreur);
            if (!valeurs || typeof valeurs !== 'object' || Array.isArray(valeurs)) return rejeter("ce n'est pas un ticket");
            const brut = (nom) => valeurs[nom] === undefined || valeurs[nom] === null ? '' : String(valeurs[nom]);
            const val = (nom) => brut(nom).trim();
            const notes = [];

            // I3 · Rejets avec motif
            const absent = ['titre', 'type', 'priorite'].find(nom => valeurs[nom] === undefined);
            if (absent) return rejeter(`champ « ${absent} » absent`);
            // JSON : un champ qui contient une liste, un objet ou un booléen n'est pas lisible
            const illisible = ['id', 'titre', 'type', 'priorite', 'points', 'statut', 'assigne', 'creeLe']
                .find(nom => valeurs[nom] !== null && (typeof valeurs[nom] === 'object' || typeof valeurs[nom] === 'boolean'));
            if (illisible) return rejeter(`champ « ${illisible} » illisible (ni texte ni nombre)`);
            const titre = val('titre').replace(/\s+/g, ' ');   // retours à la ligne et tabulations → espace
            if (titre === '') return rejeter('titre vide');
            const erreurTitre = validerTicket(titre, null);
            if (erreurTitre) return rejeter(erreurTitre);

            // I2 · « Story » → "story" (espaces, majuscules, accents)
            // hasOwn : « constructor » ou « __proto__ » ne sont pas des types, même si tout objet JS les possède
            const type = normaliserTexte(val('type'));
            if (!Object.hasOwn(typeLabels, type)) return rejeter(`type inconnu (« ${val('type')} »)`);
            if (type !== brut('type')) notes.push(`type « ${brut('type')} » → ${type}`);

            const priorite = Number(val('priorite'));
            if (![1, 2, 3].includes(priorite)) return rejeter(`priorité hors 1–3 (${val('priorite') || 'vide'})`);

            // I2 · « ? » ou vide → null (et pas 0 : Number("") vaut 0)
            const ptsBrut = val('points');
            const points = ptsBrut === '' || ptsBrut === '?' ? null : Number(ptsBrut);
            if (points !== null && !POINTS_VALIDES.includes(points)) return rejeter(`points hors suite 1-2-3-5-8-13 (${ptsBrut})`);
            if (ptsBrut === '?') notes.push('points « ? » → non estimé');

            const statutBrut = normaliserTexte(val('statut')).replace(/\s+/g, '');
            const colonne = statutBrut === ''
                ? COLONNES[0]
                : COLONNES.find(c => c.id === statutBrut || normaliserTexte(c.titre).replace(/\s+/g, '') === statutBrut);
            if (!colonne) return rejeter(`statut inconnu (« ${val('statut')} »)`);

            // I4 · Id invalide ou déjà pris (ticket existant ou ligne précédente du fichier) → nouvel id
            const idLu = val('id');
            let id = idValide(idLu);
            if (id === null || pris.has(id)) {
                const nouvel = idLibre++;
                notes.push(idLu === '' ? `sans id → TES-${nouvel}`
                    : id === null ? `id « ${idLu} » invalide → TES-${nouvel}`
                    : `id ${idLu} déjà pris → TES-${nouvel}`);
                id = nouvel;
            }
            pris.add(id);

            // Date de création conservée si le fichier en donne une valide (export TaskFlow), sinon date du jour
            const dateLue = val('creeLe');
            const creeLe = /^\d{4}-\d{2}-\d{2}$/.test(dateLue) && !Number.isNaN(Date.parse(dateLue)) ? dateLue : date;

            // TP2 · assigne : membre de l'équipe (« karim » → Karim) ; inconnu → non assigné, sans perdre le ticket
            const assigneLu = val('assigne');
            const assigne = EQUIPE.find(m => normaliserTexte(m) === normaliserTexte(assigneLu)) || null;
            if (assigneLu !== '' && assigne === null) notes.push(`assigné « ${assigneLu} » inconnu → non assigné`);

            // Le ticket naît au Backlog puis passe par deplacerTicket : WIP et Definition of Ready s'appliquent
            // (contexte 'import' : il est posé dans sa colonne, sans exiger le passage par « En revue »)
            tickets = [...tickets, { id, titre, type, priorite, points, statut: COLONNES[0].id, assigne, creeLe }];
            if (colonne.id !== COLONNES[0].id) {
                const res = deplacerTicket(tickets, id, colonne.id, 'import');
                if (res.ok) tickets = res.tickets;
                else notes.push(`gardé au Backlog au lieu de « ${colonne.titre} » : ${res.erreur}`);
            }
            importes.push({ ligne: numero, id, notes });
        });

        return { tickets, importes, rejets };
    }

    // Contrôle d'un tableau entier : liste des règles cassées (vide = tableau sain)
    // Sert aux auto-tests : aucun import ne doit pouvoir produire un tableau invalide.
    function verifierTableau(tickets) {
        const problemes = [];
        const ids = new Set();
        tickets.forEach(t => {
            const ref = `TES-${t.id}`;
            if (!Number.isSafeInteger(t.id) || t.id < 1) problemes.push(`${ref} : id invalide`);
            if (ids.has(t.id)) problemes.push(`${ref} : id en double`);
            ids.add(t.id);
            if (typeof t.titre !== 'string' || validerTicket(t.titre, null)) problemes.push(`${ref} : titre invalide`);
            if (!Object.hasOwn(typeLabels, t.type)) problemes.push(`${ref} : type invalide`);
            if (t.creeLe !== '' && !estUneDate(t.creeLe)) problemes.push(`${ref} : date invalide`);
            if (!(t.assigne === null || EQUIPE.includes(t.assigne))) problemes.push(`${ref} : assigné inconnu`);
            if (![1, 2, 3].includes(t.priorite)) problemes.push(`${ref} : priorité invalide`);
            if (!(t.points === null || POINTS_VALIDES.includes(t.points))) problemes.push(`${ref} : points invalides`);
            if (!COLONNES.some(c => c.id === t.statut)) problemes.push(`${ref} : statut invalide`);
            else if (t.points === null && t.statut !== COLONNES[0].id) problemes.push(`${ref} : non estimé hors Backlog`);
        });
        COLONNES.filter(c => c.wip !== null).forEach(c => {
            const n = tickets.filter(t => t.statut === c.id).length;
            if (n > c.wip) problemes.push(`« ${c.titre} » : WIP dépassé (${n}/${c.wip})`);
        });
        return problemes;
    }

    // V4 · Migration explicite : la v1 sauvegardait un tableau nu, parfois sans statut, points ni date.
    // Chaque champ manquant reçoit une valeur par défaut au lieu de rester undefined.
    function migrerV1versV2(liste) {
        return liste.map(t => {
            const points = t && t.points !== undefined ? t.points : null;
            return {
                id: t && t.id,
                titre: t && t.titre,
                type: t && t.type,
                priorite: t && t.priorite,
                points,
                statut: points === null ? COLONNES[0].id : (t.statut || COLONNES[0].id),   // non estimé = Backlog
                creeLe: t && typeof t.creeLe === 'string' ? t.creeLe : ''
            };
        });
    }

    // TP2 · Migration v2 → v3 : les tickets sauvegardés hier n'ont pas de champ « assigne » → non assigné
    function migrerV2versV3(liste) {
        return liste.map(t => t && typeof t === 'object' && !Array.isArray(t)
            ? { ...t, assigne: t.assigne === undefined ? null : t.assigne }
            : t);
    }

    // Réglages d'affichage sauvegardés : chaque valeur est vérifiée, sinon valeur par défaut
    function lireInterface(brut) {
        const s = brut && typeof brut === 'object' && !Array.isArray(brut) ? brut : {};
        return {
            vue: ['backlog', 'board', 'sprints', 'tests', 'donnees'].includes(s.vue) ? s.vue : 'backlog',
            recherche: typeof s.recherche === 'string' ? s.recherche : '',
            types: Array.isArray(s.types) ? s.types.filter(t => Object.hasOwn(typeLabels, t)) : [],
            priorites: Array.isArray(s.priorites) ? s.priorites.filter(p => [1, 2, 3].includes(p)) : [],
            ordreManuel: s.ordreManuel === true,
            colonnes: colonnesAvecAuMoinsUne(Object.fromEntries(Object.keys(colLabels).map(k =>
                [k, s.colonnes && typeof s.colonnes[k] === 'boolean' ? s.colonnes[k] : true]))),
            mesTickets: s.mesTickets === true,
            moi: EQUIPE.includes(s.moi) ? s.moi : EQUIPE[0]
        };
    }

    // Backlog sans aucune colonne = liste vide incompréhensible : le titre reste alors affiché
    function colonnesAvecAuMoinsUne(colonnes) {
        return colonnesVisibles(colonnes).length > 0 ? colonnes : { ...colonnes, titre: true };
    }

    // --- TP2 · Journal des déplacements et « Annuler »
    // Les tableaux étant immuables, chaque entrée garde le tableau d'AVANT le déplacement :
    // annuler = le restaurer tel quel. L'empreinte du tableau d'APRÈS dit si rien n'a changé depuis.
    function empreinte(tickets) {
        const s = exporterJSON(tickets);
        let h = 5381;
        for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
        return `${h.toString(36)}-${s.length}`;
    }

    // Ajoute une entrée si le ticket a changé de colonne (un simple réordonnancement n'est pas un déplacement)
    function noterDeplacement(journalActuel, avant, apres, id, quand) {
        const a = avant.find(t => t.id === id), b = apres.find(t => t.id === id);
        if (!a || !b || a.statut === b.statut) return journalActuel;
        const entree = { id, titre: b.titre, de: a.statut, vers: b.statut, quand, avant, empreinteApres: empreinte(apres) };
        return [entree, ...journalActuel].slice(0, TAILLE_JOURNAL);
    }

    // → { ok, tickets, journal, annule } ou { ok: false, erreur }
    function annulerDernier(journalActuel, tickets) {
        const [dernier, ...reste] = journalActuel;
        if (!dernier) return { ok: false, erreur: 'Aucun déplacement à annuler' };
        if (empreinte(tickets) !== dernier.empreinteApres) {
            return { ok: false, erreur: `Impossible d'annuler : le tableau a changé depuis le déplacement de TES-${dernier.id}` };
        }
        return { ok: true, tickets: dernier.avant.map(t => ({ ...t })), journal: reste, annule: dernier };
    }

    // Journal relu dans la sauvegarde : une entrée douteuse est écartée (jamais restaurée)
    function lireJournal(brut) {
        if (!Array.isArray(brut)) return [];
        const colonne = (id) => COLONNES.some(c => c.id === id);
        return brut.filter(e => e && typeof e === 'object' && Number.isSafeInteger(e.id) && typeof e.titre === 'string'
                && colonne(e.de) && colonne(e.vers) && typeof e.quand === 'string' && typeof e.empreinteApres === 'string'
                && Array.isArray(e.avant) && e.avant.every(t => t && typeof t === 'object') && verifierTableau(e.avant).length === 0)
            .slice(0, TAILLE_JOURNAL);
    }

    // Lecture du texte sauvegardé → { etat, tickets, interface, journal }
    // etat : 'premier' (rien), 'restaure', 'migre' (v1 ou v2), 'repare' (tickets invalides écartés),
    //        'corrompu' (illisible, rien à sauver), 'inconnu' (version future)
    // Une sauvegarde douteuse n'est jamais affichée telle quelle, et jamais d'écran blanc.
    function lireSauvegarde(texte) {
        const demo = (etat) => ({ etat, tickets: TICKETS_INITIAUX.map(t => ({ ...t })), interface: lireInterface(null), journal: [], sprints: [] });
        if (texte === null || texte === undefined) return demo('premier');
        let brut;
        try { brut = JSON.parse(texte); } catch (e) { return demo('corrompu'); }

        const enveloppe = brut && typeof brut === 'object' && !Array.isArray(brut) && Array.isArray(brut.tickets);
        let tickets, interfaceBrute = null, journalBrut = null, sprintsBruts = null, etat;
        if (Array.isArray(brut)) {                                   // v1 : tableau nu → v2 → v3
            tickets = migrerV2versV3(migrerV1versV2(brut));
            etat = 'migre';
        } else if (enveloppe && brut.version === 2) {                // v2 : sans « assigne » ni journal → v3
            tickets = migrerV2versV3(brut.tickets);
            interfaceBrute = brut.interface;
            etat = 'migre';
        } else if (enveloppe && brut.version === VERSION_SAUVEGARDE) {
            tickets = brut.tickets;
            interfaceBrute = brut.interface;
            journalBrut = brut.journal;
            sprintsBruts = brut.sprints;
            etat = 'restaure';
        } else {
            return demo(brut && typeof brut === 'object' && typeof brut.version === 'number' && brut.version > VERSION_SAUVEGARDE ? 'inconnu' : 'corrompu');
        }
        if (tickets.every(t => t && typeof t === 'object') && verifierTableau(tickets).length === 0) {
            return { etat, tickets: tickets.map(t => ({ ...t })), interface: lireInterface(interfaceBrute), journal: lireJournal(journalBrut), sprints: lireSprints(sprintsBruts, tickets), ecartes: 0 };
        }
        // Sauvegarde en partie abîmée : plutôt que tout perdre, on la repasse par les règles de l'import
        // (champs vérifiés, ids en double renumérotés, WIP respecté) et on garde ce qui est valide.
        // Le journal ne correspond plus au tableau réparé : il repart de zéro.
        const r = importerTickets(tickets.map((valeurs, i) => ({ numero: i + 1, valeurs })), [], '');
        if (r.tickets.length === 0) return demo('corrompu');
        return { etat: 'repare', tickets: r.tickets, interface: lireInterface(interfaceBrute), journal: [], sprints: lireSprints(sprintsBruts, r.tickets), ecartes: r.rejets.length };
    }

    // Import d'un texte collé ou d'un fichier : format détecté, puis mêmes règles pour CSV et JSON
    // → résultat d'importerTickets + { format }, ou { format, erreur } si rien n'est lisible
    function analyserImport(texte, existants, date) {
        const format = detecterFormat(texte);
        const echec = (erreur) => ({ format, erreur, tickets: existants, importes: [], rejets: [] });
        if (!format) return echec('La zone est vide.');
        let lignes;
        if (format === 'json') {
            const lu = lireJSON(texte);
            if (!lu.ok) return echec(lu.erreur);
            lignes = lu.lignes;
        } else {
            lignes = parserCSV(texte);
            if (lignes.length > 0 && !('titre' in lignes[0].valeurs)) {
                return echec('En-tête CSV sans colonne « titre » (attendu : id,titre,type,priorite,points,statut).');
            }
        }
        if (lignes.length === 0) return echec('Aucun ticket dans le fichier.');
        return { format, ...importerTickets(lignes, existants, date) };
    }

    // I5 · Phrase du rapport : « 4 importés · 2 rejetés »
    function texteRapport(r) {
        const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
        return `${pluriel(r.importes.length, 'importé')} · ${pluriel(r.rejets.length, 'rejeté')}`;
    }

    // Export de tous les tickets, tous les champs, dans l'ordre du tableau
    // (champs toujours dans le même ordre, quel que soit le chemin par lequel le ticket a été créé)
    const CHAMPS_TICKET = ['id', 'titre', 'type', 'priorite', 'points', 'statut', 'assigne', 'creeLe'];
    function exporterJSON(tickets) {
        return JSON.stringify(tickets.map(t => Object.fromEntries(CHAMPS_TICKET.map(k => [k, t[k] === undefined ? null : t[k]]))), null, 2);
    }

    // Même contenu en CSV ; réimportable (guillemets si virgule, points vides = non estimé)
    function exporterCSV(tickets) {
        const colonnes = CHAMPS_TICKET;
        const champ = (v) => {
            const s = v === null || v === undefined ? '' : String(v);
            return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        return [colonnes.join(','), ...tickets.map(t => colonnes.map(c => champ(t[c])).join(','))].join('\n');
    }

    // Debug : fichier de test à télécharger → { nom, contenu }
    function fichierDeTest(format, variante) {
        const nom = `backlog-${variante === 'piege' ? 'piege' : 'valide'}.${format}`;
        if (variante === 'piege') return { nom, contenu: format === 'csv' ? CSV_PIEGE : JSON.stringify(JSON_PIEGE, null, 2) };
        return { nom, contenu: format === 'csv' ? exporterCSV(TICKETS_VALIDES_TEST) : exporterJSON(TICKETS_VALIDES_TEST) };
    }

    // Glisser-déposer : place le ticket juste avant la cible (même ordre, statut inchangé)
    function deplacerAvant(liste, idDeplace, idCible) {
        if (idDeplace === idCible) return liste;
        const tache = liste.find(t => t.id === idDeplace);
        const reste = liste.filter(t => t.id !== idDeplace);
        const index = reste.findIndex(t => t.id === idCible);
        if (!tache || index === -1) return liste;
        return [...reste.slice(0, index), tache, ...reste.slice(index)];
    }

    // Glisser-déposer sur le fond d'une colonne : le ticket passe en bas de la liste
    function mettreEnFin(liste, idDeplace) {
        const tache = liste.find(t => t.id === idDeplace);
        if (!tache) return liste;
        return [...liste.filter(t => t.id !== idDeplace), tache];
    }

    // Date au format AAAA-MM-JJ et qui existe au calendrier (« 2026-13-45 » non)
    function estUneDate(v) {
        return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
    }

    // 2026-11-03 -> 03/11/26 ; tout le reste → "" (la date part dans le HTML : rien d'autre ne doit passer)
    function formaterDate(iso) {
        if (!estUneDate(iso)) return "";
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y.slice(2)}`;
    }

    // Formulaire : type et priorité doivent venir de la liste, même si le HTML a été trafiqué (F12)
    function validerProprietes(champs) {
        if (!Object.hasOwn(typeLabels, champs.type)) return `Type inconnu (« ${champs.type} »).`;
        if (![1, 2, 3].includes(champs.priorite)) return 'La priorité doit être P1, P2 ou P3.';
        // assigne absent (appel d'avant le TP2) = non assigné
        const assigne = champs.assigne === undefined ? null : champs.assigne;
        if (!(assigne === null || EQUIPE.includes(assigne))) return `« ${assigne} » ne fait pas partie de l'équipe.`;
        return null;
    }

    // Largeurs de colonnes relues dans localStorage : nombres raisonnables seulement, sinon valeur par défaut
    function lireLargeurs(brut, defauts) {
        const s = brut && typeof brut === 'object' && !Array.isArray(brut) ? brut : {};
        return Object.fromEntries(Object.keys(defauts).map(k => {
            const v = Object.hasOwn(s, k) ? s[k] : undefined;
            if (v === null && defauts[k] === null) return [k, null];
            return [k, Number.isFinite(v) && v >= 44 && v <= 1200 ? Math.round(v) : defauts[k]];
        }));
    }

    function echapperHTML(str) {
        return str.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
    }

    // Grille du Backlog : colonnes visibles, modèle CSS et largeur minimale
    function colonnesVisibles(colonnes) {
        return Object.keys(colonnes).filter(k => colonnes[k]);
    }

    function modeleGrille(colonnes, largeurs) {
        return colonnesVisibles(colonnes)
            .map(k => largeurs[k] == null ? 'minmax(160px, 1fr)' : `${largeurs[k]}px`).join(' ');
    }

    // Au-delà de cette largeur, le tableau défile horizontalement
    function largeurMinGrille(colonnes, largeurs) {
        const keys = colonnesVisibles(colonnes);
        return keys.reduce((somme, k) => somme + (largeurs[k] == null ? 160 : largeurs[k]), 0) + 14 * (keys.length - 1) + 48;
    }

    /* =====================================================================
       3. AFFICHAGE UI & ÉVÉNEMENTS
       Met à jour le HTML à partir des fonctions métier de la zone 2,
       et réagit aux clics, à la saisie et au glisser-déposer.
       ===================================================================== */

    // --- Éléments de la page
    const searchInput = document.getElementById('searchInput');
    const viewContainer = document.getElementById('viewContainer');
    const modalOverlay = document.getElementById('modalOverlay');
    const taskForm = document.getElementById('taskForm');
    const titleInput = document.getElementById('title');
    const titleError = document.getElementById('titleError');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubmitBtn = document.getElementById('modalSubmitBtn');

    // --- Petits gabarits HTML (icônes inspirées de Linear / Plane)
    function prioBars(p) {
        const on = 4 - p;
        return `<svg class="bars" viewBox="0 0 14 14">${[0, 1, 2].map(i =>
            `<rect x="${1 + i * 4.5}" y="${9 - i * 3.5}" width="3" height="${4 + i * 3.5}" rx="0.8" class="${i < on ? 'on' : 'off'}"/>`
        ).join('')}</svg>`;
    }

    function statusIcon(st) {
        const c = { backlog: 'var(--text-3)', afaire: 'var(--text-2)', encours: 'var(--progress)', enrevue: 'var(--story)', termine: 'var(--accent)' }[st] || 'var(--text-3)';
        if (st === 'enrevue') return `<svg class="st-ic" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.6" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M7 3.6A3.4 3.4 0 1 1 3.6 7H7Z" fill="${c}"/></svg>`;
        if (st === 'termine') return `<svg class="st-ic" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="${c}"/><path d="M4.4 7.2l1.8 1.8 3.4-3.6" fill="none" stroke="var(--surface)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        if (st === 'encours') return `<svg class="st-ic" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.6" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M7 3.6A3.4 3.4 0 0 1 7 10.4Z" fill="${c}"/></svg>`;
        if (st === 'afaire') return `<svg class="st-ic" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.6" fill="none" stroke="${c}" stroke-width="1.6"/></svg>`;
        return `<svg class="st-ic" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.6" fill="none" stroke="${c}" stroke-width="1.6" stroke-dasharray="2.2 2"/></svg>`;
    }

    const typeTag = (t) => `<span class="label"><i class="dot dot-${t.type}"></i>${typeLabels[t.type]}</span>`;
    const prioTag = (t) => `<span class="prio prio-${t.priorite}" title="${prioLabels[t.priorite]}">${prioBars(t.priorite)}P${t.priorite}</span>`;
    const pointsTag = (t) => t.points === null
        ? `<span class="pts pts-none">Non estimé</span>`
        : `<span class="pts"><b>${t.points}</b>pt${t.points > 1 ? 's' : ''}</span>`;
    const statusTag = (t) => `<span class="status">${statusIcon(t.statut)}${statusLabels[t.statut]}</span>`;
    // TP2 · pastille de la personne assignée (initiale + couleur fixe par membre)
    const avatar = (nom) => nom
        ? `<span class="avatar av-${EQUIPE.indexOf(nom) % 4}" title="Assigné à ${nom}">${nom[0]}</span>`
        : `<span class="avatar av-vide" title="Non assigné"></span>`;
    const assigneTag = (t) => `<span class="assigne">${avatar(t.assigne)}${t.assigne || '<i>Personne</i>'}</span>`;

    const ICON_EDIT = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15.2 5.2l3.6 3.6M4 20l1-4.5L16.4 4.1a2.5 2.5 0 013.5 3.5L8.5 19 4 20z"/></svg>`;
    const ICON_TRASH = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3"/></svg>`;
    const ICON_LEFT = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 5v14L5 12z"/></svg>`;
    const ICON_RIGHT = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    const ICON_ALERT = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>`;
    const ICON_CHECK = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
    const ICON_CROSS = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
    const ICON_UNDO = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 010 11H11"/></svg>`;
    const ICON_RESET =`<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3.5 12a8.5 8.5 0 102.5-6M3.5 4v4.5H8"/></svg>`;
    const ICON_DOWNLOAD =`<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"/></svg>`;
    const ICON_UPLOAD =`<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"/></svg>`;
    const ICON_PLUS =`<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`;

    function prochainIdSprint() {
        return sprints.reduce((max, sprint) => Math.max(max, sprint.id), 0) + 1;
    }

    function traceBurndown(sprint) {
        const jusquAu = sprint.statut === 'actif' ? new Date().toISOString().slice(0, 10) : sprint.dateFin;
        const jours = calculerBurndown(sprint, tasks, jusquAu).jours;
        if (!jours.length) return `<p class="fmt">Le burndown sera disponible après la planification des dates.</p>`;
        const w = 720, h = 235, x0 = 48, x1 = 700, y0 = 22, y1 = 184;
        const max = Math.max(1, ...jours.flatMap(j => [j.pointsReels, j.pointsIdeaux]));
        const coords = (cle) => jours.map((j, i) => {
            const x = x0 + (jours.length < 2 ? 0 : i * (x1 - x0) / (jours.length - 1));
            const y = y1 - j[cle] * (y1 - y0) / max;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
        return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Burndown des points estimés restants" style="width:100%;height:auto;min-height:180px">
            <line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" stroke="var(--border-strong)"/>
            <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}" stroke="var(--border-strong)"/>
            <polyline points="${coords('pointsIdeaux')}" fill="none" stroke="var(--text-3)" stroke-width="2" stroke-dasharray="6 5"/>
            <polyline points="${coords('pointsReels')}" fill="none" stroke="var(--accent)" stroke-width="3"/>
            ${jours.map((j, i) => {
                const x = x0 + (jours.length < 2 ? 0 : i * (x1 - x0) / (jours.length - 1));
                return `<text x="${x}" y="208" text-anchor="middle" fill="var(--text-3)" font-size="10">${echapperHTML(j.date.slice(5))}</text>`;
            }).join('')}
            <text x="8" y="${y0 + 4}" fill="var(--text-3)" font-size="10">${max} pt</text>
            <text x="8" y="${y1}" fill="var(--text-3)" font-size="10">0 pt</text>
        </svg><div class="io-actions"><span class="fmt"><b style="color:var(--accent)">━</b> Réel</span><span class="fmt"><b style="color:var(--text-3)">┄</b> Idéal</span></div>`;
    }

    function formulairePlanification(sprint) {
        const suffixe = sprint ? `-${sprint.id}` : '-nouveau';
        const nom = sprint ? `<input name="nom" type="text" maxlength="80" placeholder="Nom du sprint" value="${echapperHTML(sprint.nom)}">` : '';
        const duree = sprint ? sprint.dureeSemaines : 1;
        const fin = sprint ? sprint.dateFin : '';
        const messageFin = fin ? 'Fin calculée automatiquement.' : 'Choisissez une date de début.';
        return `<form class="io-actions" onsubmit="${sprint ? `planifierSprintUI(${sprint.id}, event)` : 'creerSprintUI(event)'}">
            ${nom}
            <label class="fmt">Durée en semaines
                <input name="dureeSemaines" id="sprint-duree${suffixe}" type="number" min="1" step="1" value="${duree}" required oninput="actualiserFinSprint(this.form)">
            </label>
            <label class="fmt">Début <input name="dateDebut" type="date" value="${sprint ? sprint.dateDebut : ''}" oninput="actualiserFinSprint(this.form)"></label>
            <label class="fmt">Fin <input name="dateFin" type="date" value="${fin}" readonly aria-describedby="sprint-fin-info${suffixe}"></label>
            <span class="fmt" id="sprint-fin-info${suffixe}" aria-live="polite">${messageFin}</span>
            <button type="submit" class="btn btn-primary">${sprint ? 'Planifier' : 'Créer et planifier'}</button>
        </form>`;
    }

    function actualiserFinSprint(form) {
        const champDebut = form.querySelector('[name="dateDebut"]');
        const champDuree = form.querySelector('[name="dureeSemaines"]');
        const champFin = form.querySelector('[name="dateFin"]');
        const messageFin = form.querySelector('[id^="sprint-fin-info"]');
        const debut = champDebut.value;
        const duree = Number(champDuree.value);
        if (!debut) {
            champFin.value = '';
            messageFin.textContent = 'Choisissez une date de début.';
            return;
        }
        if (!dateSprintValide(debut)) {
            champFin.value = '';
            messageFin.textContent = 'Choisissez une date de début valide.';
            return;
        }
        if (!Number.isSafeInteger(duree) || duree < 1) {
            champFin.value = '';
            messageFin.textContent = 'Entrez une durée entière positive.';
            return;
        }
        const fin = decalerDateSprint(debut, duree * 7 - 1);
        if (!dateSprintValide(fin)) {
            champFin.value = '';
            messageFin.textContent = 'La période dépasse les dates prises en charge.';
            return;
        }
        champFin.value = fin;
        messageFin.textContent = 'Fin calculée automatiquement.';
    }

    function afficherSprints() {
        const tries = [...sprints].sort((a, b) => {
            if (!a.dateDebut) return b.dateDebut ? 1 : a.id - b.id;
            if (!b.dateDebut) return -1;
            return a.dateDebut.localeCompare(b.dateDebut) || a.id - b.id;
        });
        const cartes = tries.map(sprint => {
            const membres = sprint.ticketIds.map(id => tasks.find(t => t.id === id)).filter(Boolean);
            const disponibles = tasks.filter(t => POINTS_VALIDES.includes(t.points)
                && !sprints.some(s => s.statut !== 'termine' && s.ticketIds.includes(t.id)));
            const statut = { a_planifier: 'À planifier', planifie: 'Planifié', actif: 'Actif', termine: 'Terminé' }[sprint.statut];
            const listeTickets = membres.length ? `<ul class="report">${membres.map(t => `<li>
                <span class="ln">TES-${t.id}</span><span>${echapperHTML(t.titre)}</span>${statusTag(t)}${pointsTag(t)}
                ${sprint.statut !== 'termine' ? `<button class="btn-xs" type="button" onclick="retirerDuSprint(${sprint.id}, ${t.id})" title="Retirer du sprint">Retirer</button>` : ''}
            </li>`).join('')}</ul>` : `<p class="fmt">Aucun ticket membre pour l’instant.</p>`;
            const actions = sprint.statut === 'a_planifier'
                ? formulairePlanification(sprint)
                : sprint.statut === 'planifie'
                    ? `<button class="btn btn-primary" type="button" onclick="demarrerSprintUI(${sprint.id})">Démarrer</button>`
                : sprint.statut === 'actif'
                    ? `<button class="btn btn-primary" type="button" onclick="terminerSprintUI(${sprint.id})">Terminer le sprint</button>`
                    : '';
            const ajouter = sprint.statut !== 'termine' ? `<form class="io-actions" onsubmit="ajouterAuSprint(${sprint.id}, event)">
                <label class="fmt">Ajouter un ticket estimé
                    <select name="ticketId" required>
                        <option value="">Choisir un ticket…</option>
                        ${disponibles.map(t => `<option value="${t.id}">TES-${t.id} · ${echapperHTML(t.titre)} (${t.points} pts)</option>`).join('')}
                    </select>
                </label><button class="btn" type="submit" ${disponibles.length ? '' : 'disabled'}>Ajouter</button>
            </form>` : '';
            const plage = sprint.dateDebut ? `${formaterDate(sprint.dateDebut)} – ${formaterDate(sprint.dateFin)}` : 'Période à planifier';
            return `<section class="io-card">
                <div class="io-actions"><h2>${echapperHTML(sprint.nom)}</h2><span class="chip is-on">${statut}</span>${actions}</div>
                <p>${plage} · ${sprint.dureeSemaines} semaine${sprint.dureeSemaines > 1 ? 's' : ''} · ${membres.length} ticket${membres.length > 1 ? 's' : ''}</p>
                ${sprint.dateDebut ? `<div>${traceBurndown(sprint)}</div>` : ''}
                <h3>Tickets membres</h3>${listeTickets}${ajouter}
            </section>`;
        }).join('');
        viewContainer.innerHTML = `<div class="io">
            <section class="io-card"><h2>Sprints</h2><p>Planifiez les périodes, associez des tickets estimés et suivez leur burndown sans changer leur statut Kanban.</p>
                ${formulairePlanification(null)}</section>
            ${cartes || '<section class="io-card"><p>Aucun sprint planifié. Créez un sprint pour commencer.</p></section>'}
        </div>`;
    }

    function creerSprintUI(e) {
        e.preventDefault();
        const f = e.currentTarget;
        const r = planifierSprint(sprints, { id: prochainIdSprint(), dureeSemaines: Number(f.querySelector('[name="dureeSemaines"]').value),
            dateDebut: f.querySelector('[name="dateDebut"]').value });
        if (!r.ok) return afficherMessage(r.erreur);
        sprints = r.sprints;
        mettreAJourEcran();
    }

    function planifierSprintUI(id, e) {
        e.preventDefault();
        const f = e.currentTarget;
        const sprint = sprints.find(s => s.id === id);
        const nom = f.querySelector('[name="nom"]');
        const r = planifierSprint(sprints, { id, dureeSemaines: Number(f.querySelector('[name="dureeSemaines"]').value),
            dateDebut: f.querySelector('[name="dateDebut"]').value,
            nom: nom ? nom.value : sprint && sprint.nom });
        if (!r.ok) return afficherMessage(r.erreur);
        sprints = r.sprints;
        mettreAJourEcran();
    }

    function demarrerSprintUI(id) {
        const r = demarrerSprint(sprints, id, tasks, new Date().toISOString().slice(0, 10));
        if (!r.ok) return afficherMessage(r.erreur);
        sprints = r.sprints;
        mettreAJourEcran();
    }

    function terminerSprintUI(id) {
        const r = terminerSprint(sprints, id, tasks, new Date().toISOString().slice(0, 10));
        if (!r.ok) return afficherMessage(r.erreur);
        sprints = r.sprints;
        mettreAJourEcran();
    }

    function ajouterAuSprint(id, e) {
        e.preventDefault();
        const ticketId = Number(e.currentTarget.querySelector('[name="ticketId"]').value);
        const r = ajouterTicketSprint(sprints, tasks, id, ticketId, new Date().toISOString().slice(0, 10));
        if (!r.ok) return afficherMessage(r.erreur);
        sprints = r.sprints;
        mettreAJourEcran();
    }

    function retirerDuSprint(sprintId, ticketId) {
        const r = retirerTicketSprint(sprints, sprintId, ticketId, new Date().toISOString().slice(0, 10));
        if (!r.ok) return afficherMessage(r.erreur);
        sprints = r.sprints;
        mettreAJourEcran();
    }

    // --- Rendu principal : appelé après chaque changement d'état
    function mettreAJourEcran() {
        mettreAJourControles();

        const visibles = filtrerTaches(tasks, { recherche: searchInput.value, types: activeTypes, priorites: activePriorities, mesTickets, moi });
        const affichees = isManualSort ? visibles : trierTaches(visibles);

        // US4 : compteurs
        const compteurs = calculerCompteurs(tasks);
        document.getElementById('kpiCount').textContent = compteurs.tickets;
        document.getElementById('kpiPoints').textContent = compteurs.points;
        document.getElementById('kpiUnestimated').textContent = compteurs.nonEstimes;
        document.getElementById('kpiUnestWrap').classList.toggle('is-warn', compteurs.nonEstimes > 0);
        document.getElementById('navCount').textContent = compteurs.tickets;

        document.getElementById('resultCount').textContent = `${affichees.length} / ${tasks.length}`;
        document.getElementById('statusLabel').innerHTML = isManualSort
            ? `Ordre manuel · <button class="linkish" onclick="resetSort()">Rétablir le tri</button>`
            : `Tri : priorité, puis points`;

        // Badge du panneau Auto-tests
        const verts = resultatsTests.filter(t => t.ok).length;
        const badge = document.getElementById('testBadge');
        badge.textContent = `${verts}/${resultatsTests.length}`;
        badge.className = `nav-badge ${verts === resultatsTests.length ? 'ok' : 'ko'}`;

        if (currentView === 'backlog') afficherBacklog(affichees);
        else if (currentView === 'board') afficherKanban(affichees);
        else if (currentView === 'donnees') afficherDonnees();
        else if (currentView === 'sprints') afficherSprints();
        else afficherTests();

        // V4 · chaque changement passe par ce rendu : on sauvegarde ici, une seule fois
        // (sauf pendant la reprise d'un autre onglet, sinon les deux onglets se renverraient la balle)
        if (initialisationTerminee && !repriseAutreOnglet) {
            const ok = sauvegarder(etatASauvegarder());
            if (!ok && sauvegardeOk) afficherMessage('Sauvegarde impossible (stockage plein ou bloqué) : exportez vos tickets avant de fermer');
            sauvegardeOk = ok;
        }
    }

    let initialisationTerminee = false; // les auto-tests peuvent rendre une vue avant la reprise de la sauvegarde
    let sauvegardeOk = true;           // dernier essai de sauvegarde réussi ? (avertir une fois, pas à chaque clic)
    let repriseAutreOnglet = false;    // rendu déclenché par un autre onglet : ne pas resauvegarder

    // Deux onglets ouverts : un changement de tickets dans l'un apparaît dans l'autre,
    // au lieu que chacun écrase en silence le travail de l'autre
    window.addEventListener('storage', (e) => {
        if (e.key !== CLE || e.newValue === null) return;
        const c = lireSauvegarde(e.newValue);
        if (c.etat !== 'restaure' || (exporterJSON(c.tickets) === exporterJSON(tasks)
            && JSON.stringify(c.sprints) === JSON.stringify(sprints))) return;
        tasks = c.tickets;
        journal = c.journal;
        sprints = c.sprints;
        deletingId = null;
        repriseAutreOnglet = true;
        mettreAJourEcran();
        repriseAutreOnglet = false;
        afficherMessage('Tableau mis à jour depuis un autre onglet');
    });

    // Ce qui survit à F5 : les cartes (et leur ordre), la vue, les filtres, les colonnes du Backlog
    // et (TP2) le journal des déplacements, pour qu'« Annuler » marche encore après rechargement
    function etatASauvegarder() {
        return {
            tickets: tasks,
            interface: {
                vue: currentView,
                recherche: searchInput.value,
                types: [...activeTypes],
                priorites: [...activePriorities],
                ordreManuel: isManualSort,
                colonnes: visibleCols,
                mesTickets,
                moi
            },
            journal,
            sprints
        };
    }

    function appliquerInterface(i) {
        currentView = i.vue;
        searchInput.value = i.recherche;
        activeTypes = new Set(i.types);
        activePriorities = new Set(i.priorites);
        isManualSort = i.ordreManuel;
        visibleCols = { ...i.colonnes };
        mesTickets = i.mesTickets;
        moi = i.moi;
    }

    // « Réinitialiser la démo » (barre latérale), avec confirmation dans la page
    let confirmDemo = false;
    function afficherZoneDemo() {
        document.getElementById('zoneDemo').innerHTML = confirmDemo
            ? `<div class="demo-confirm"><b>Revenir aux 13 tickets de départ ?</b>Tickets, filtres et vue seront remis à zéro.
                   <button class="btn-xs danger" onclick="reinitialiserDemo()">Réinitialiser</button><button class="btn-xs" onclick="annulerDemo()">Annuler</button></div>`
            : `<button class="demo-btn" onclick="demanderDemo()" title="Réinitialiser la démo">${ICON_RESET}<span>Réinitialiser la démo</span></button>`;
    }

    function demanderDemo() {
        confirmDemo = true;
        afficherZoneDemo();
    }

    function annulerDemo() {
        confirmDemo = false;
        afficherZoneDemo();
    }

    function reinitialiserDemo() {
        tasks = TICKETS_INITIAUX.map(t => ({ ...t }));
        sprints = [];
        appliquerInterface(lireInterface(null));
        journal = [];
        confirmDemo = false;
        deletingId = null;
        rapportImport = null;
        idsImportes = new Set();
        dernierImportTexte = null;
        afficherZoneDemo();
        mettreAJourEcran();
        afficherMessage('Démo réinitialisée : 13 tickets de départ');
    }

    // État visuel des onglets, filtres et du menu Affichage
    function mettreAJourControles() {
        document.getElementById('btn-view-backlog').classList.toggle('is-on', currentView === 'backlog');
        document.getElementById('btn-view-board').classList.toggle('is-on', currentView === 'board');
        document.getElementById('btn-view-sprints').classList.toggle('is-on', currentView === 'sprints');
        document.querySelector('#btn-view-sprints .nav-count').textContent = sprints.length;
        document.getElementById('btn-view-tests').classList.toggle('is-on', currentView === 'tests');
        document.getElementById('btn-view-donnees').classList.toggle('is-on', currentView === 'donnees');
        document.getElementById('crumbView').textContent = { backlog: 'Backlog', board: 'Kanban', sprints: 'Sprints', tests: 'Auto-tests', donnees: 'Import / Export' }[currentView];
        document.querySelector('.filterbar').style.display = ['tests', 'donnees', 'sprints'].includes(currentView) ? 'none' : '';

        document.getElementById('btn-type-all').classList.toggle('is-on', activeTypes.size === 0);
        ['story', 'bug', 'tache'].forEach(t => {
            document.getElementById(`btn-type-${t}`).classList.toggle('is-on', activeTypes.has(t));
        });

        document.getElementById('btn-prio-all').classList.toggle('is-on', activePriorities.size === 0);
        [1, 2, 3].forEach(p => {
            document.getElementById(`btn-prio-${p}`).classList.toggle('is-on', activePriorities.has(p));
        });

        // TP2 · « Mes tickets » + qui je suis
        const boutonMes = document.getElementById('btn-mes-tickets');
        boutonMes.classList.toggle('is-on', mesTickets);
        boutonMes.title = mesTickets
            ? `Filtre actif : seulement les tickets assignés à ${moi}. Cliquer pour tout revoir.`
            : `Afficher seulement les tickets assignés à ${moi}`;
        boutonMes.innerHTML = `${avatar(moi)}Mes tickets <span class="chip-n">${tasks.filter(t => t.assigne === moi).length}</span>`;
        afficherProfil();

        // Le menu Affichage ne concerne que le Backlog
        document.getElementById('columnsToggleContainer').style.display = currentView === 'backlog' ? '' : 'none';
    }

    // --- Vue Backlog (US2)
    function afficherBacklog(liste) {
        if (liste.length === 0) {
            viewContainer.innerHTML = `
                <div class="empty">
                    <div class="empty-ic"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></div>
                    <strong>Aucun ticket trouvé</strong>
                    ${mesTickets && !tasks.some(t => t.assigne === moi)
                        ? `Aucun ticket n'est assigné à ${moi} pour l'instant.`
                        : 'Aucun ticket ne correspond à ces filtres combinés.'}
                    <div><button class="btn" onclick="resetFilters()">Effacer les filtres</button></div>
                </div>`;
            return;
        }

        const keys = colonnesVisibles(visibleCols);
        const parPriorite = compterParPriorite(liste);

        let html = `
        <div class="list" id="backlogList" style="--cols: ${modeleGrille(visibleCols, colWidths)}; --min-w: ${largeurMinGrille(visibleCols, colWidths)}px;">
            <div class="row-grid list-head">
                ${keys.map(k => `<span class="th">${headLabels[k]}${k === 'actions' ? '' :
                    `<i class="col-resizer" onmousedown="startResize(event, '${k}')" ondblclick="resetColWidth('${k}')" title="Glisser pour redimensionner · double-clic pour réinitialiser"></i>`}</span>`).join('')}
            </div>
        `;

        let lastPrio = null;
        liste.forEach(t => {
            // Regroupement par priorité (uniquement en tri automatique)
            if (!isManualSort && t.priorite !== lastPrio) {
                lastPrio = t.priorite;
                html += `<div class="group-head prio-${t.priorite}">${prioBars(t.priorite)}${prioLabels[t.priorite]} <span class="n">${parPriorite[t.priorite]}</span></div>`;
            }

            html += `
                <div draggable="true"
                     ondragstart="drag(event, ${t.id})"
                     ondragend="dragEnd(event)"
                     ondragover="allowDrop(event)"
                     ondragenter="dragEnterBacklog(event, this)"
                     ondragleave="dragLeaveBacklog(event, this)"
                     ondrop="dropBacklog(event, ${t.id}, this)"
                     class="backlog-row row-grid ${idsImportes.has(t.id) ? 'is-new' : ''}">
                    ${visibleCols.id ? `<span class="tes-id">TES-${t.id}</span>` : ''}
                    ${visibleCols.titre ? `<span class="cell-title" title="${echapperHTML(t.titre)}">${echapperHTML(t.titre)}</span>` : ''}
                    ${visibleCols.type ? typeTag(t) : ''}
                    ${visibleCols.priorite ? prioTag(t) : ''}
                    ${visibleCols.points ? `<span>${pointsTag(t)}</span>` : ''}
                    ${visibleCols.statut ? statusTag(t) : ''}
                    ${visibleCols.assigne ? assigneTag(t) : ''}
                    ${visibleCols.creeLe ? `<span class="cell-date">${formaterDate(t.creeLe)}</span>` : ''}
                    ${visibleCols.actions ? `
                    <div class="actions">
                        ${deletingId === t.id ? `
                            <div class="confirm">
                                Supprimer ?
                                <button type="button" onclick="executeDelete(${t.id})" class="btn-xs danger">Oui</button>
                                <button type="button" onclick="cancelDelete()" class="btn-xs">Non</button>
                            </div>
                        ` : `
                            <button type="button" onclick="openEditModal(${t.id})" class="icon-btn" title="Modifier">${ICON_EDIT}</button>
                            <button type="button" onclick="requestDelete(${t.id})" class="icon-btn danger" title="Supprimer">${ICON_TRASH}</button>
                        `}
                    </div>` : ''}
                </div>
            `;
        });

        html += `</div>`;
        viewContainer.innerHTML = html;
    }

    // --- Vue Kanban : une colonne par élément de COLONNES
    function afficherKanban(liste) {
        // V3 : tableau de bord, recalculé à chaque rendu donc à chaque déplacement
        const tdb = calculerTableauDeBord(tasks);
        const maxPoints = Math.max(1, ...tdb.parColonne.map(c => c.points));
        const couleurBarre = { backlog: 'var(--text-3)', afaire: 'var(--accent)', encours: 'var(--progress)', enrevue: 'var(--story)', termine: 'var(--tache)' };
        let html = `
            <div class="dash">
                <div class="dash-kpis">
                    <div class="dash-kpi"><span>Points terminés</span><b>${tdb.pointsTermines} <small>/ ${tdb.pointsTotal}</small></b></div>
                    <div class="dash-kpi"><span>Avancement</span><b>${tdb.pctAvancement} %</b><div class="progress"><i style="width: ${tdb.pctAvancement}%"></i></div></div>
                    ${tdb.wips.map(w => `<div class="dash-kpi ${w.occupes >= w.limite ? 'is-full' : ''}"><span>WIP ${w.titre}</span><b>${w.occupes} / ${w.limite}</b></div>`).join('')}
                    <div class="dash-kpi ${tdb.nonEstimes > 0 ? 'is-warn' : ''}"><span>Non estimés</span><b>${tdb.nonEstimes}</b></div>
                </div>
                <div class="dash-bars">
                    ${tdb.parColonne.map(c => `
                        <div class="bar-row">
                            <span>${c.titre}</span>
                            <div class="bar-track"><i style="width: ${c.points * 100 / maxPoints}%; --c: ${couleurBarre[c.id] || 'var(--accent)'}"></i></div>
                            <em><b>${c.points}</b> pts · ${c.tickets} ticket${c.tickets > 1 ? 's' : ''}</em>
                        </div>`).join('')}
                </div>
            </div>
            ${afficherJournal()}
            <div class="board">`;

        COLONNES.forEach((col, index) => {
            const colTasks = liste.filter(t => t.statut === col.id);
            const occupes = tasks.filter(t => t.statut === col.id).length;
            const compteur = col.wip === null
                ? `<span class="n">${colTasks.length}</span>`
                : `<span class="wip ${occupes >= col.wip ? 'is-full' : ''}" title="Limite WIP : ${col.wip} tickets maximum">${occupes} / ${col.wip}</span>`;

            html += `
            <div class="kanban-column"
                 ondragover="allowDrop(event)"
                 ondragenter="dragEnterKanban(event, this)"
                 ondragleave="dragLeaveKanban(event, this)"
                 ondrop="dropKanban(event, '${col.id}', this)">
                <div class="col-head">
                    ${statusIcon(col.id)}
                    ${col.titre} ${compteur}
                    <button type="button" class="icon-btn" onclick="openModal('${col.id}')" title="Ajouter dans « ${col.titre} »">${ICON_PLUS}</button>
                </div>
                <div class="col-body">
                    ${colTasks.length === 0 ? `<div class="col-empty">Aucun ticket</div>` : ''}
            `;

            colTasks.forEach(t => {
                const avant = COLONNES[index - 1];
                const apres = COLONNES[index + 1];
                html += `
                    <article draggable="true"
                         ondragstart="drag(event, ${t.id})"
                         ondragend="dragEnd(event)"
                         ondragover="allowDrop(event)"
                         ondragenter="dragEnterKanbanCard(event, this)"
                         ondragleave="dragLeaveKanbanCard(event, this)"
                         ondrop="dropKanbanCard(event, ${t.id}, '${col.id}', this)"
                         class="kanban-card ${idsImportes.has(t.id) ? 'is-new' : ''}">
                        <div class="card-top">
                            <span class="tes-id">TES-${t.id}</span>
                            ${idsImportes.has(t.id) ? `<span class="new-tag">Importé</span>` : ''}
                            <button type="button" onclick="openEditModal(${t.id})" class="icon-btn" title="Modifier">${ICON_EDIT}</button>
                        </div>
                        <h4 class="card-title">${echapperHTML(t.titre)}</h4>
                        <div class="card-props">
                            <span class="prio-only prio-${t.priorite}" title="${prioLabels[t.priorite]}">${prioBars(t.priorite)}</span>
                            ${typeTag(t)}
                            ${pointsTag(t)}
                            ${avatar(t.assigne)}
                            <span class="move">
                                <button type="button" class="move-btn" onclick="moveTicket(${t.id}, -1)" ${avant ? `title="Vers « ${avant.titre} »"` : 'disabled'}>${ICON_LEFT}</button>
                                <button type="button" class="move-btn" onclick="moveTicket(${t.id}, 1)" ${apres ? `title="Vers « ${apres.titre} »"` : 'disabled'}>${ICON_RIGHT}</button>
                            </span>
                        </div>
                    </article>
                `;
            });

            html += `
                </div>
            </div>`;
        });

        html += `</div>`;
        viewContainer.innerHTML = html;
    }

    // --- TP2 · Journal des 10 derniers déplacements + « Annuler » (aussi Ctrl+Z)
    function afficherJournal() {
        const heure = (iso) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); };
        const ligne = (e) => `TES-${e.id} · ${statusLabels[e.de]} → ${statusLabels[e.vers]}`;
        const [dernier] = journal;
        return `
            <div class="journal">
                <button class="btn" onclick="annuler()" ${dernier ? '' : 'disabled'} title="Annuler le dernier déplacement (Ctrl+Z)">${ICON_UNDO}Annuler</button>
                <span class="journal-dernier">${dernier
                    ? `Dernier : <b>${ligne(dernier)}</b> <em>${heure(dernier.quand)}</em>`
                    : 'Aucun déplacement pour l’instant'}</span>
                ${journal.length ? `
                <details class="journal-liste">
                    <summary>Journal (${journal.length}/${TAILLE_JOURNAL})</summary>
                    <ol>${journal.map(e => `<li><span>${ligne(e)}</span><span class="journal-titre">${echapperHTML(e.titre)}</span><em>${heure(e.quand)}</em></li>`).join('')}</ol>
                </details>` : ''}
            </div>`;
    }

    // Ajoute au journal le déplacement qui vient d'avoir lieu (avant = tableau d'avant, tasks = tableau d'après)
    function journaliser(avant, id) {
        journal = noterDeplacement(journal, avant, tasks, id, new Date().toISOString());
    }

    function annuler() {
        const r = annulerDernier(journal, tasks);
        if (!r.ok) return afficherMessage(r.erreur);
        tasks = r.tickets;
        journal = r.journal;
        deletingId = null;
        mettreAJourEcran();
        afficherMessage(`Annulé : TES-${r.annule.id} revient en « ${statusLabels[r.annule.de]} »`);
    }

    // --- Vue Auto-tests
    function afficherTests() {
        const verts = resultatsTests.filter(t => t.ok).length;
        const tous = verts === resultatsTests.length;
        viewContainer.innerHTML = `
            <div class="tests">
                <div class="tests-head">
                    <div>
                        <h2>Auto-tests</h2>
                        <p>Chaque test appelle la vraie fonction de la zone 2 (<code>deplacerTicket</code>, <code>analyserImport</code>…) sur des données à part. T10 à T29 : imports piégés, aucun ne doit planter ni casser le tableau. T30 à T40 : sauvegarde, rechargement et données trafiquées. T41 à T45 : exigences du Product Owner (TP2 Phase 2).</p>
                    </div>
                    <span class="score ${tous ? 'ok' : 'ko'}">${verts} / ${resultatsTests.length} au vert</span>
                    <button class="btn" onclick="relancerTests()">Relancer</button>
                </div>
                <ol class="test-list">
                    ${resultatsTests.map(t => `
                        <li class="test ${t.ok ? 'pass' : 'fail'}">
                            <span class="test-ic">${t.ok ? ICON_CHECK : ICON_CROSS}</span>
                            <div>
                                <span class="test-code">${t.code}</span><b>${t.nom}</b>
                                <p class="test-detail">${echapperHTML(t.detail)}</p>
                            </div>
                        </li>`).join('')}
                </ol>
            </div>`;
    }

    function relancerTests() {
        resultatsTests = lancerTests(AUTO_TESTS);
        mettreAJourEcran();
    }

    // --- V3 · Vue Import / Export
    const libelleFormat = (format) => format ? `${format.toUpperCase()} détecté` : '';

    function afficherDonnees() {
        viewContainer.innerHTML = `
            <div class="io">
                <section class="io-card">
                    <h2>Importer</h2>
                    <p>Collez un CSV ou un JSON, ou choisissez un fichier : le format est reconnu automatiquement. Seules les lignes valides sont importées, chaque rejet est expliqué.</p>
                    <div class="dropzone" id="dropzone"
                         ondragenter="survolDepot(event, true)" ondragover="survolDepot(event, true)"
                         ondragleave="survolDepot(event, false)" ondrop="deposerFichier(event)">
                        <textarea spellcheck="false" placeholder="Glissez un fichier CSV ou JSON ici, ou collez son contenu&#10;&#10;id,titre,type,priorite,points,statut&#10;21,Corriger le login,bug,1,3,afaire" oninput="importTexte = this.value; fichierImport = null; majEtatImport()">${echapperHTML(importTexte)}</textarea>
                        <div class="dropzone-voile">${ICON_UPLOAD}Déposez le fichier CSV ou JSON</div>
                    </div>
                    <div class="io-actions">
                        <label class="btn file-btn">${ICON_UPLOAD}Choisir un fichier<input type="file" accept=".csv,.json,.txt,text/csv,application/json,text/plain" onchange="lireFichier(this)"></label>
                        <span id="sourceImport">${sourceImport()}</span>
                        <button class="btn btn-primary" id="btnImporter" onclick="importer(false)" ${importTexte.trim() && !confirmReimport ? '' : 'disabled'}>Importer</button>
                    </div>
                    ${confirmReimport ? `
                    <div class="reimport" id="confirmReimport">
                        ${ICON_ALERT}
                        <span><b>Ce contenu a déjà été importé.</b> L'importer de nouveau ajoutera les mêmes tickets en double, sous de nouveaux ids.</span>
                        <span class="reimport-actions">
                            <button class="btn" onclick="effacerImport()">Annuler</button>
                            <button class="btn danger" onclick="importer(true)">Importer quand même</button>
                        </span>
                    </div>` : ''}
                    ${rapportImport ? afficherRapport(rapportImport) : ''}
                </section>
                <section class="io-card">
                    <h2>Exporter</h2>
                    <p>Les ${tasks.length} tickets du tableau, sans tenir compte des filtres.</p>
                    <div class="io-actions">
                        <div class="seg">
                            <button class="chip ${formatExport === 'json' ? 'is-on' : ''}" onclick="choisirFormatExport('json')">JSON</button>
                            <button class="chip ${formatExport === 'csv' ? 'is-on' : ''}" onclick="choisirFormatExport('csv')">CSV</button>
                        </div>
                        <div class="io-actions debug-boutons">
                            <button class="btn" onclick="copierExport()" ${tasks.length ? '' : 'disabled'}>Copier</button>
                            <button class="btn btn-primary" onclick="telechargerExport()" ${tasks.length ? '' : 'disabled'}>${ICON_DOWNLOAD}Télécharger ${nomExport()}</button>
                        </div>
                    </div>
                    <pre class="debug-apercu" id="apercuExport">${tasks.length ? echapperHTML(contenuExport()) : 'Le tableau est vide : rien à exporter.'}</pre>
                </section>
                ${afficherDebug()}
            </div>`;
    }

    // Debug : fichiers de test (valide ou piégé, CSV ou JSON) à télécharger puis importer
    function afficherDebug() {
        const fichier = fichierDeTest(debugFormat, debugVariante);
        const attendu = analyserImport(fichier.contenu, [], '');
        return `
            <section class="io-card io-debug">
                <h2>Debug · fichiers de test</h2>
                <p>Téléchargez un fichier, puis glissez-le dans la zone d'import ci-dessus (ou copiez-le et collez-le).</p>
                <div class="io-actions">
                    <div class="seg">
                        <button class="chip ${debugFormat === 'csv' ? 'is-on' : ''}" onclick="choisirDebug('csv', debugVariante)">CSV</button>
                        <button class="chip ${debugFormat === 'json' ? 'is-on' : ''}" onclick="choisirDebug('json', debugVariante)">JSON</button>
                    </div>
                    <div class="seg">
                        <button class="chip ${debugVariante === 'valide' ? 'is-on' : ''}" onclick="choisirDebug(debugFormat, 'valide')">Valide</button>
                        <button class="chip ${debugVariante === 'piege' ? 'is-on' : ''}" onclick="choisirDebug(debugFormat, 'piege')">Piégé</button>
                    </div>
                    <span class="fmt">Attendu à l'import : ${texteRapport(attendu)}</span>
                    <div class="io-actions debug-boutons">
                        <button class="btn" onclick="copierFichierTest()">Copier</button>
                        <button class="btn btn-primary" onclick="telechargerFichierTest()">${ICON_DOWNLOAD}Télécharger ${fichier.nom}</button>
                    </div>
                </div>
                <pre class="debug-apercu" id="apercuDebug">${echapperHTML(fichier.contenu)}</pre>
                <div class="io-actions debug-vider">
                    <span class="fmt">Aller-retour : Exporter → Vider le tableau → Importer le fichier exporté.</span>
                    ${confirmVider
                        ? `<span class="confirm-inline">Supprimer les ${tasks.length} tickets ? <button class="btn-xs danger" onclick="viderTableau()">Oui</button><button class="btn-xs" onclick="annulerVider()">Non</button></span>`
                        : `<button class="btn vider" onclick="demanderVider()" ${tasks.length ? '' : 'disabled'}>Vider le tableau (${tasks.length})</button>`}
                </div>
            </section>`;
    }

    function choisirDebug(format, variante) {
        debugFormat = format;
        debugVariante = variante;
        mettreAJourEcran();
    }

    // Copie du fichier de test ; si le navigateur refuse, l'aperçu est sélectionné pour un Ctrl+C
    function copierFichierTest() {
        const fichier = fichierDeTest(debugFormat, debugVariante);
        navigator.clipboard.writeText(fichier.contenu)
            .then(() => afficherMessage(`${fichier.nom} copié dans le presse-papiers`))
            .catch(() => {
                getSelection().selectAllChildren(document.getElementById('apercuDebug'));
                afficherMessage('Copie refusée par le navigateur : texte sélectionné, faites Ctrl+C');
            });
    }

    function telechargerFichierTest() {
        const fichier = fichierDeTest(debugFormat, debugVariante);
        telecharger(fichier.nom, fichier.contenu, debugFormat);
    }

    // Téléchargement : lien classique dans le fichier local ; dans un artefact claude.ai,
    // les liens de téléchargement sont bloqués, on passe par la capacité « downloads »
    async function telecharger(nom, contenu, format) {
        const downloads = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
        if (downloads) {
            try { await downloads.save({ filename: nom, data: contenu }); }
            catch (e) { if (e.code !== 'declined') afficherMessage(`Téléchargement impossible (${e.code})`); }
            return;
        }
        const lien = document.createElement('a');
        lien.href = URL.createObjectURL(new Blob([contenu], { type: format === 'json' ? 'application/json' : 'text/csv' }));
        lien.download = nom;
        lien.click();
        URL.revokeObjectURL(lien.href);
    }

    // Ce qui est dans la zone : nom du fichier (ou « Texte collé ») + format détecté, avec × pour vider
    function sourceImport() {
        if (!importTexte.trim()) return `<span class="fmt">Aucun fichier sélectionné</span>`;
        return `<span class="file-chip"><span>${echapperHTML(fichierImport || 'Texte collé')}</span><em>${libelleFormat(detecterFormat(importTexte))}</em>`
            + `<button type="button" onclick="effacerImport()" title="Vider la zone">${ICON_CROSS}</button></span>`;
    }

    // Mise à jour pendant la saisie, sans redessiner la zone de texte
    function majEtatImport() {
        if (confirmReimport) {          // le contenu a changé : l'avertissement de doublon ne vaut plus
            confirmReimport = false;
            document.getElementById('confirmReimport').remove();
        }
        document.getElementById('sourceImport').innerHTML = sourceImport();
        document.getElementById('btnImporter').disabled = !importTexte.trim();
    }

    function effacerImport() {
        importTexte = '';
        fichierImport = null;
        confirmReimport = false;
        mettreAJourEcran();
    }

    // Glisser-déposer d'un fichier sur la zone d'import
    function survolDepot(e, actif) {
        if (!e.dataTransfer || ![...e.dataTransfer.types].includes('Files')) return;
        e.preventDefault();
        const zone = document.getElementById('dropzone');
        if (actif) zone.classList.add('is-over');
        else if (!zone.contains(e.relatedTarget)) zone.classList.remove('is-over');
    }

    function deposerFichier(e) {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        document.getElementById('dropzone').classList.remove('is-over');
        chargerFichier(e.dataTransfer.files[0]);
    }

    // I5 · Rapport d'import : la phrase exacte, puis chaque rejet et chaque ticket importé
    function afficherRapport(r) {
        const source = `<span class="fmt">${echapperHTML(r.source)}${r.format ? ` · ${r.format.toUpperCase()}` : ''}${r.identique ? ' · identique au dernier export' : ''}</span>`;
        if (r.erreur) {
            return `<div class="report"><div class="report-head"><span class="ko">Rien n'a été importé</span>${source}</div><ul><li class="rej">${echapperHTML(r.erreur)}</li></ul></div>`;
        }
        const repere = r.format === 'json' ? 'Ticket' : 'Ligne';
        const ligne = (classe, numero, texte) => `<li class="${classe}"><span class="ln">${repere} ${numero}</span><span>${echapperHTML(texte)}</span></li>`;
        const importes = r.importes.map(x => {
            const t = r.tickets.find(tk => tk.id === x.id);
            return ligne('', x.ligne, `TES-${x.id} · ${t.titre} → ${statusLabels[t.statut]}${x.notes.length ? ` (${x.notes.join(' ; ')})` : ''}`);
        });
        return `
            <div class="report">
                <div class="report-head">
                    <span class="${r.rejets.length ? 'ko' : 'ok'}">${texteRapport(r)}</span>
                    ${source}
                </div>
                ${r.rejets.length ? `<div class="report-sub">Rejetés</div><ul>${r.rejets.map(x => ligne('rej', x.ligne, x.motif)).join('')}</ul>` : ''}
                ${importes.length ? `<div class="report-sub">Importés</div><ul>${importes.join('')}</ul>` : ''}
                ${importes.length ? `<div class="report-foot"><button class="btn" onclick="setView('backlog')">Voir dans le Backlog</button><button class="btn" onclick="setView('board')">Voir le Kanban</button></div>` : ''}
            </div>`;
    }

    // Fichier choisi sur le poste : son contenu va dans la zone d'import, le format est détecté
    function lireFichier(input) {
        if (input.files[0]) chargerFichier(input.files[0]);
    }

    function chargerFichier(fichier) {
        const lecteur = new FileReader();
        lecteur.onload = () => {
            importTexte = lecteur.result;
            fichierImport = fichier.name;
            rapportImport = null;
            confirmReimport = false;
            mettreAJourEcran();
        };
        lecteur.onerror = () => afficherMessage(`Impossible de lire « ${fichier.name} »`);
        lecteur.readAsText(fichier);
    }

    // forcer = true seulement depuis « Importer quand même » (même contenu que le dernier import)
    function importer(forcer) {
        if (!importTexte.trim()) return;
        if (!forcer && importTexte === dernierImportTexte) {
            confirmReimport = true;
            mettreAJourEcran();
            return;
        }
        // Filet de sécurité : une erreur imprévue s'affiche dans le rapport et le tableau reste tel quel
        let r;
        try { r = analyserImport(importTexte, tasks, new Date().toISOString().split('T')[0]); }
        catch (e) { r = { erreur: `Erreur inattendue pendant l'import (${e.message}). Le tableau n'a pas été modifié.`, tickets: tasks, importes: [], rejets: [] }; }
        r.source = fichierImport || 'Texte collé';
        r.identique = !r.erreur && dernierExport !== null && exporterJSON(r.tickets) === dernierExport;
        tasks = r.tickets;
        rapportImport = r;
        confirmReimport = false;
        if (!r.erreur) {
            // Import fait : la zone se vide (le bouton se grise) et les tickets importés sont marqués
            dernierImportTexte = importTexte;
            idsImportes = new Set(r.importes.map(x => x.id));
            importTexte = '';
            fichierImport = null;
        }
        mettreAJourEcran();
    }

    // Export : toujours le tableau actuel, au format choisi
    const contenuExport = () => formatExport === 'json' ? exporterJSON(tasks) : exporterCSV(tasks);
    const nomExport = () => `taskflow-export.${formatExport}`;

    function choisirFormatExport(format) {
        formatExport = format;
        mettreAJourEcran();
    }

    function copierExport() {
        dernierExport = exporterJSON(tasks);   // référence pour « identique au dernier export »
        navigator.clipboard.writeText(contenuExport())
            .then(() => afficherMessage(`${tasks.length} tickets copiés en ${formatExport.toUpperCase()}`))
            .catch(() => {
                getSelection().selectAllChildren(document.getElementById('apercuExport'));
                afficherMessage('Copie refusée par le navigateur : texte sélectionné, faites Ctrl+C');
            });
    }

    function telechargerExport() {
        dernierExport = exporterJSON(tasks);
        telecharger(nomExport(), contenuExport(), formatExport);
    }

    // Vider le tableau, avec confirmation dans l'interface (comme US5)
    function demanderVider() {
        confirmVider = true;
        mettreAJourEcran();
    }

    function annulerVider() {
        confirmVider = false;
        mettreAJourEcran();
    }

    function viderTableau() {
        sprints = historiserChangementsSprint(sprints, tasks, [], new Date().toISOString().slice(0, 10))
            .map(s => s.statut === 'actif' ? s : { ...s, ticketIds: [] });
        tasks = [];
        isManualSort = false;
        confirmVider = false;
        rapportImport = null;
        dernierImportTexte = null;      // tableau vide : réimporter le même fichier ne crée plus de doublon
        idsImportes = new Set();
        journal = [];
        mettreAJourEcran();
    }

    // --- Kanban : boutons ◀ ▶ (R3) et message de refus, sans alert()
    let toastTimer = null;
    function afficherMessage(msg) {
        const toast = document.getElementById('toast');
        toast.innerHTML = `${ICON_ALERT}<span>${echapperHTML(msg)}</span>`;
        toast.classList.add('is-on');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-on'), 3500);
    }

    // Même phrase de refus partout : boutons ◀ ▶, glisser-déposer et formulaire
    function messageRefus(res, versStatut) {
        const col = COLONNES.find(c => c.id === versStatut);
        return col ? `« ${col.titre} » : ${res.erreur}` : res.erreur;
    }

    // Applique le résultat de deplacerTicket ; retourne true si le déplacement est accepté
    function appliquerResultat(res, versStatut) {
        if (!res.ok) {
            afficherMessage(messageRefus(res, versStatut));
            return false;
        }
        tasks = res.tickets;
        return true;
    }

    function moveTicket(id, sens) {
        const ticket = tasks.find(t => t.id === id);
        if (!ticket) return;
        const cible = COLONNES[COLONNES.findIndex(c => c.id === ticket.statut) + sens];
        if (!cible) return;
        const avant = tasks;
        const resultat = deplacerTicket(tasks, id, cible.id);
        if (!resultat.ok) return appliquerResultat(resultat, cible.id);
        tasks = resultat.tickets;
        sprints = historiserChangementsSprint(sprints, avant, tasks, new Date().toISOString().slice(0, 10));
        journaliser(avant, id);
        mettreAJourEcran();
    }

    // --- Vues et thème
    function setView(view) {
        if (!['backlog', 'board', 'sprints', 'tests', 'donnees'].includes(view)) return;
        currentView = view;
        mettreAJourEcran();
    }

    function setTheme(t) {
        document.documentElement.dataset.theme = t;
        try { localStorage.setItem('taskflow-theme', t); } catch (e) {}
        mettreAJourInterrupteurTheme();
    }

    function mettreAJourInterrupteurTheme() {
        const t = document.documentElement.dataset.theme;
        document.getElementById('theme-light').classList.toggle('is-on', t === 'light');
        document.getElementById('theme-dark').classList.toggle('is-on', t === 'dark');
    }

    // --- Filtres (US3), multiples et cumulatifs
    function toggleType(type) {
        if (activeTypes.has(type)) activeTypes.delete(type);
        else activeTypes.add(type);
        mettreAJourEcran();
    }

    function clearTypes() {
        activeTypes.clear();
        mettreAJourEcran();
    }

    function togglePriority(prio) {
        if (activePriorities.has(prio)) activePriorities.delete(prio);
        else activePriorities.add(prio);
        mettreAJourEcran();
    }

    function clearPriorities() {
        activePriorities.clear();
        mettreAJourEcran();
    }

    function resetFilters() {
        searchInput.value = '';
        activeTypes.clear();
        activePriorities.clear();
        mesTickets = false;
        mettreAJourEcran();
    }

    function resetSort() {
        isManualSort = false;
        mettreAJourEcran();
    }

    // --- Menu Affichage : colonnes visibles et largeurs
    function toggleColumnMenu() {
        const menu = document.getElementById('columnMenu');
        menu.classList.toggle('hidden');
        if (!menu.classList.contains('hidden')) {
            menu.innerHTML = Object.keys(visibleCols).map(col => `
                <label>
                    <input type="checkbox" ${visibleCols[col] ? 'checked' : ''} onchange="toggleColumn('${col}')">
                    ${colLabels[col]}
                </label>
            `).join('') + `<button type="button" class="menu-reset" onclick="resetAllColWidths()">Réinitialiser les largeurs</button>`;
        }
    }

    function toggleColumn(col) {
        if (visibleCols[col] && colonnesVisibles(visibleCols).length === 1) {
            afficherMessage('Gardez au moins une colonne affichée');
            toggleColumnMenu(); toggleColumnMenu();   // recoche la case dans le menu ouvert
            return;
        }
        visibleCols[col] = !visibleCols[col];
        mettreAJourEcran();
    }

    function saveColWidths() {
        try { localStorage.setItem('taskflow-cols', JSON.stringify(colWidths)); } catch (e) {}
    }

    // Redimensionnement d'une colonne par sa poignée
    function startResize(e, col) {
        e.preventDefault();
        e.stopPropagation();
        const th = e.target.parentElement;
        const list = document.getElementById('backlogList');
        const startX = e.clientX;
        const startW = th.getBoundingClientRect().width;
        const min = col === 'titre' ? 120 : 44;
        document.body.classList.add('is-resizing');
        th.classList.add('is-resizing');

        const onMove = (ev) => {
            colWidths[col] = Math.max(min, Math.round(startW + ev.clientX - startX));
            list.style.setProperty('--cols', modeleGrille(visibleCols, colWidths));
            list.style.setProperty('--min-w', `${largeurMinGrille(visibleCols, colWidths)}px`);
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.classList.remove('is-resizing');
            th.classList.remove('is-resizing');
            saveColWidths();
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    function resetColWidth(col) {
        colWidths[col] = defaultColWidths[col];
        saveColWidths();
        mettreAJourEcran();
    }

    function resetAllColWidths() {
        colWidths = { ...defaultColWidths };
        saveColWidths();
        mettreAJourEcran();
    }

    // --- Modale de création / édition (US1)
    function showTitleError(msg) {
        titleInput.classList.add('is-invalid');
        titleError.textContent = msg;
        titleError.classList.remove('hidden');
    }

    function clearTitleError() {
        titleInput.classList.remove('is-invalid');
        titleError.classList.add('hidden');
    }

    function showFormError(msg) {
        const el = document.getElementById('formError');
        el.textContent = msg;
        el.classList.toggle('hidden', !msg);
    }

    function openModal(statut) {
        editingId = null;
        taskForm.reset();
        showFormError('');
        if (statut) document.getElementById('statut').value = statut;
        modalTitle.textContent = 'Nouveau ticket';
        modalSubmitBtn.innerText = "Créer le ticket";
        modalOverlay.classList.add('is-open');
        setTimeout(() => titleInput.focus(), 50);
    }

    function openEditModal(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        editingId = id;

        titleInput.value = task.titre;
        document.getElementById('type').value = task.type;
        document.getElementById('priorite').value = task.priorite;
        document.getElementById('assigne').value = task.assigne || '';
        document.getElementById('points').value = task.points === null ? 'null' : task.points;
        document.getElementById('statut').value = task.statut || 'backlog';

        showFormError('');
        modalTitle.textContent = `TES-${id}`;
        modalSubmitBtn.innerText = "Enregistrer";
        modalOverlay.classList.add('is-open');
        setTimeout(() => titleInput.focus(), 50);
    }

    function closeModal() {
        modalOverlay.classList.remove('is-open');
        editingId = null;
        taskForm.reset();
        clearTitleError();
        showFormError('');
        modalSubmitBtn.disabled = false;
    }

    // --- Suppression avec confirmation dans l'interface (US5)
    function requestDelete(id) {
        deletingId = id;
        mettreAJourEcran();
    }

    function cancelDelete() {
        deletingId = null;
        mettreAJourEcran();
    }

    function executeDelete(id) {
        const avant = tasks;
        tasks = supprimerTache(tasks, id);
        sprints = historiserChangementsSprint(sprints, avant, tasks, new Date().toISOString().slice(0, 10));
        deletingId = null;
        mettreAJourEcran();
    }

    // --- Glisser-déposer (mode focus)
    // L'id voyage dans un type propre à TaskFlow : un texte « 5 » sélectionné ailleurs
    // et lâché sur une colonne ne peut pas se faire passer pour le ticket TES-5
    const TYPE_GLISSE = 'application/x-taskflow-ticket';

    function drag(e, id) {
        e.dataTransfer.setData(TYPE_GLISSE, id);
        e.dataTransfer.setData("text/plain", `TES-${id}`);   // lâché dans un champ texte : « TES-5 »
        e.dataTransfer.effectAllowed = "move";
        setTimeout(() => {
            e.target.classList.add('dragging-active');
            document.body.classList.add('is-dragging-mode');
        }, 0);
    }

    function dragEnd(e) {
        e.target.classList.remove('dragging-active');
        document.body.classList.remove('is-dragging-mode');
        document.querySelectorAll('.drop-zone-kanban, .drop-zone-kanban-card, .drop-zone-backlog')
            .forEach(el => el.classList.remove('drop-zone-kanban', 'drop-zone-kanban-card', 'drop-zone-backlog'));
    }

    // Piège 1 · sans preventDefault sur dragover, le navigateur refuse le dépôt sans rien dire
    function allowDrop(e) {
        e.preventDefault();
    }

    // Applique un déplacement calculé par la zone 2 (si la liste a changé) ; le journal note les changements de colonne
    function appliquerDeplacement(nouvelleListe, id) {
        if (nouvelleListe === tasks) return;
        const avant = tasks;
        tasks = nouvelleListe;
        sprints = historiserChangementsSprint(sprints, avant, tasks, new Date().toISOString().slice(0, 10));
        isManualSort = true;
        journaliser(avant, id);
        mettreAJourEcran();
    }

    // Piège 2 · getData renvoie toujours du texte : Number(...), sinon find ne trouve rien.
    // Un fichier ou un texte lâché sur le tableau n'a pas ce type : NaN, le dépôt est ignoré.
    const idGlisse = (e) => Number(e.dataTransfer.getData(TYPE_GLISSE) || NaN);
    const estUnTicket = (id) => Number.isInteger(id) && tasks.some(t => t.id === id);

    // Lignes du Backlog
    function dragEnterBacklog(e, el) {
        e.preventDefault();
        el.classList.add('drop-zone-backlog');
    }

    function dragLeaveBacklog(e, el) {
        if (!el.contains(e.relatedTarget)) el.classList.remove('drop-zone-backlog');
    }

    function dropBacklog(e, targetId, el) {
        e.preventDefault();
        e.stopPropagation();
        el.classList.remove('drop-zone-backlog');
        if (!estUnTicket(idGlisse(e))) return;
        appliquerDeplacement(deplacerAvant(tasks, idGlisse(e), targetId), idGlisse(e));
    }

    // Colonnes du tableau
    function dragEnterKanban(e, el) {
        e.preventDefault();
        el.classList.add('drop-zone-kanban');
    }

    function dragLeaveKanban(e, el) {
        if (!el.contains(e.relatedTarget)) el.classList.remove('drop-zone-kanban');
    }

    // Piège 3 · le dépôt n'est qu'un autre bouton ◀ ▶ : il passe par deplacerTicket (WIP, Definition of Ready)
    // et affiche son refus avec appliquerResultat, le même message que les boutons
    function dropKanban(e, newStatus, el) {
        e.preventDefault();
        el.classList.remove('drop-zone-kanban');
        const id = idGlisse(e);
        if (!estUnTicket(id)) return;
        const res = deplacerTicket(tasks, id, newStatus);
        if (!res.ok) return appliquerResultat(res, newStatus);
        appliquerDeplacement(mettreEnFin(res.tickets, id), id);
    }

    // Cartes du tableau (réordonnancement)
    function dragEnterKanbanCard(e, el) {
        e.preventDefault();
        e.stopPropagation(); // évite le surlignage de la colonne
        el.classList.add('drop-zone-kanban-card');
    }

    function dragLeaveKanbanCard(e, el) {
        e.stopPropagation();
        if (!el.contains(e.relatedTarget)) el.classList.remove('drop-zone-kanban-card');
    }

    function dropKanbanCard(e, targetId, newStatus, el) {
        e.preventDefault();
        e.stopPropagation();
        el.classList.remove('drop-zone-kanban-card');
        const id = idGlisse(e);
        if (!estUnTicket(id)) return;
        const res = deplacerTicket(tasks, id, newStatus);
        if (!res.ok) return appliquerResultat(res, newStatus);
        appliquerDeplacement(deplacerAvant(res.tickets, id, targetId), id);
    }

    // --- Écouteurs
    searchInput.addEventListener('input', mettreAJourEcran);

    // Un fichier lâché à côté de la zone d'import ne s'ouvre pas dans l'onglet
    ['dragover', 'drop'].forEach(type => window.addEventListener(type, (e) => {
        if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault();
    }));

    // Validation en temps réel : un titre qui commence par un espace bloque la création
    titleInput.addEventListener('input', () => {
        if (titleInput.value.startsWith(' ')) {
            showTitleError("Le titre ne peut pas commencer par un espace.");
            modalSubmitBtn.disabled = true;
        } else {
            clearTitleError();
            modalSubmitBtn.disabled = false;
        }
    });

    // Choisir « Non estimé » remet le statut sur Backlog (Definition of Ready)
    document.getElementById('points').addEventListener('change', (e) => {
        if (e.target.value === 'null') document.getElementById('statut').value = COLONNES[0].id;
    });

    // Envoi du formulaire : validation (zone 2), puis création ou édition
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pointsVal = document.getElementById('points').value;
        const points = pointsVal === 'null' ? null : Number(pointsVal);   // « 2.5 » ou « 8abc » → refusés, pas tronqués

        const erreur = validerTicket(titleInput.value, points);
        if (erreur) {
            showTitleError(erreur);
            return;
        }
        clearTitleError();

        const champs = {
            titre: titleInput.value.trim(),
            type: document.getElementById('type').value,
            priorite: Number(document.getElementById('priorite').value),
            points: points,
            assigne: document.getElementById('assigne').value || null
        };
        // Les listes déroulantes peuvent avoir été modifiées dans les outils de développement
        const erreurProprietes = validerProprietes(champs);
        if (erreurProprietes) {
            showFormError(erreurProprietes);
            return;
        }
        // Un nouveau ticket naît au Backlog ; le statut choisi passe ensuite par les règles R1–R2
        const id = editingId || prochainId(tasks);
        const avant = tasks.find(t => t.id === editingId);
        const liste = editingId
            ? modifierTache(tasks, editingId, champs)
            : creerTache(tasks, { ...champs, statut: COLONNES[0].id }, new Date().toISOString().split('T')[0]);
        // Non estimé = Backlog (Definition of Ready), quel que soit le statut choisi
        const statutVoulu = points === null ? COLONNES[0].id : document.getElementById('statut').value;
        let res;
        if (editingId) {
            const maj = mettreAJourTacheSprint(sprints, tasks, id, { ...champs, statut: statutVoulu }, new Date().toISOString().slice(0, 10));
            if (!maj.ok) {
                showFormError(messageRefus(maj, statutVoulu));
                return;
            }
            sprints = maj.sprints;
            res = { ok: true, tickets: maj.tickets };
        } else {
            res = deplacerTicket(liste, id, statutVoulu);
        }
        if (!res.ok) {
            showFormError(messageRefus(res, statutVoulu));
            return;
        }
        const tableauAvant = tasks;
        tasks = res.tickets;
        journaliser(tableauAvant, id);   // un changement de colonne fait depuis le formulaire compte aussi
        if (avant && avant.statut !== COLONNES[0].id && points === null) {
            afficherMessage(`TES-${id} n'est plus estimé : retour au Backlog`);
        }

        closeModal();
        mettreAJourEcran();
    });

    // Fermeture de la modale : clic sur le fond ou Échap
    modalOverlay.addEventListener('mousedown', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) closeModal();
        // TP2 · Ctrl+Z = « Annuler », sauf pendant une saisie (le champ garde son propre Ctrl+Z)
        const enSaisie = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && !enSaisie && !modalOverlay.classList.contains('is-open')) {
            e.preventDefault();
            annuler();
        }
    });

    // TP2 · Filtre « Mes tickets » et choix de la personne
    function toggleMesTickets() {
        mesTickets = !mesTickets;
        mettreAJourEcran();
    }

    function choisirMoi(nom) {
        if (!EQUIPE.includes(nom)) return;
        moi = nom;
        profilOuvert = false;
        mettreAJourEcran();
    }

    // TP2 · Menu de profil (bas de la barre latérale) : l'équipe, avec le nombre de tickets de chacun
    let profilOuvert = false;
    function afficherProfil() {
        const nb = (m) => tasks.filter(t => t.assigne === m).length;
        const pluriel = (n) => `${n} ticket${n > 1 ? 's' : ''}`;
        const zone = document.getElementById('profil');
        zone.classList.toggle('is-open', profilOuvert);
        zone.innerHTML = `
            ${profilOuvert ? `
            <div class="profil-menu">
                <div class="profil-menu-titre">Vous êtes…</div>
                ${EQUIPE.map(m => `
                    <button type="button" class="profil-item" onclick="choisirMoi('${m}')">
                        <span class="coche">${m === moi ? ICON_CHECK : ''}</span>${avatar(m)}${m}<span class="n">${pluriel(nb(m))}</span>
                    </button>`).join('')}
                <div class="profil-menu-titre">Non assignés : ${pluriel(tasks.filter(t => t.assigne === null).length)}</div>
            </div>` : ''}
            <button type="button" class="profil-btn" onclick="basculerProfil(event)" title="Changer de profil : « Mes tickets » affiche les tickets du profil choisi">
                ${avatar(moi)}
                <span class="profil-nom"><b>${moi}</b><small>${pluriel(nb(moi))} assigné${nb(moi) > 1 ? 's' : ''}</small></span>
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M8 9l4-4 4 4M8 15l4 4 4-4"/></svg>
            </button>`;
    }

    function basculerProfil(e) {
        e.stopPropagation();
        profilOuvert = !profilOuvert;
        afficherProfil();
    }

    // Le menu de profil se ferme au clic ailleurs ou avec Échap
    document.addEventListener('click', (e) => {
        if (profilOuvert && !document.getElementById('profil').contains(e.target)) { profilOuvert = false; afficherProfil(); }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && profilOuvert) { profilOuvert = false; afficherProfil(); }
    });

    // Fermeture du menu Affichage au clic extérieur
    document.addEventListener('click', (e) => {
        const container = document.getElementById('columnsToggleContainer');
        const menu = document.getElementById('columnMenu');
        if (!container.contains(e.target) && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    });

    function initialiserTaskFlow() {
    // --- Lancement initial
    document.getElementById('btn-view-board').insertAdjacentHTML('afterend',
        `<button onclick="setView('sprints')" id="btn-view-sprints" class="nav-item">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4m8-4v4M3 9h18M8 13h3m-3 4h3m3-4h3"/></svg>
            Sprints <span class="nav-count">${sprints.length}</span>
        </button>`);
    document.getElementById('prioChips').insertAdjacentHTML('beforeend', [1, 2, 3].map(p =>
        `<button onclick="togglePriority(${p})" id="btn-prio-${p}" class="chip prio-${p}">${prioBars(p)}P${p}</button>`
    ).join(''));
    document.getElementById('statut').innerHTML = COLONNES.map(c => `<option value="${c.id}">${c.titre}</option>`).join('');
    document.getElementById('assigne').innerHTML = `<option value="">Non assigné</option>` + EQUIPE.map(m => `<option value="${m}">${m}</option>`).join('');
    resultatsTests = lancerTests(AUTO_TESTS);
    mettreAJourInterrupteurTheme();

    // V4 · Rechargement de la dernière sauvegarde (cartes, vue, filtres, colonnes)
    const chargement = charger();
    tasks = chargement.tickets;
    journal = chargement.journal;
    sprints = chargement.sprints || [];
    appliquerInterface(chargement.interface);
    initialisationTerminee = true;
    afficherZoneDemo();
    mettreAJourEcran();
    if (chargement.etat === 'corrompu') afficherMessage('Sauvegarde illisible : la démo a été rechargée');
    else if (chargement.etat === 'inconnu') afficherMessage('Sauvegarde d’une version plus récente : la démo a été rechargée');
    else if (chargement.etat === 'migre') afficherMessage(`Ancienne sauvegarde convertie au format v${VERSION_SAUVEGARDE} (tickets non assignés)`);
    else if (chargement.etat === 'repare') afficherMessage(chargement.ecartes > 0
        ? `Sauvegarde réparée : ${chargement.ecartes} ticket${chargement.ecartes > 1 ? 's' : ''} illisible${chargement.ecartes > 1 ? 's' : ''} écarté${chargement.ecartes > 1 ? 's' : ''}`
        : 'Sauvegarde réparée : ids en double ou règles du tableau corrigés');
    }
