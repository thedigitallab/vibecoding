    // --- Auto-tests T1 à T9 : chacun appelle la vraie fonction (deplacerTicket, calculerStats,
    // modifierTache, parserCSV + importerTickets) sur des données à part, jamais sur le backlog affiché.
    function jeuDeTest() {
        return [
            { id: 1, titre: "Estimé, au Backlog", type: "story", priorite: 1, points: 3, statut: "backlog" },
            { id: 2, titre: "Non estimé, au Backlog", type: "tache", priorite: 2, points: null, statut: "backlog" },
            { id: 3, titre: "En cours A", type: "story", priorite: 1, points: 2, statut: "encours" },
            { id: 4, titre: "En cours B", type: "bug", priorite: 1, points: 5, statut: "encours" },
            { id: 5, titre: "À faire", type: "story", priorite: 2, points: 1, statut: "afaire" }
        ];
    }

    function decrireResultat(r) {
        return r.ok ? `{ ok: true, tickets: [${r.tickets.length} tickets] }` : `{ ok: false, erreur: "${r.erreur}" }`;
    }

    const AUTO_TESTS = [
        { code: 'T1', nom: 'Déplacement valide', run: () => {
            const r = deplacerTicket(jeuDeTest(), 1, 'afaire');
            const ok = r.ok && r.tickets.find(t => t.id === 1).statut === 'afaire';
            return { ok, detail: `deplacerTicket(jeu, 1, "afaire") → ${decrireResultat(r)}` };
        } },
        { code: 'T2', nom: 'Non estimé bloqué au Backlog', run: () => {
            const r = deplacerTicket(jeuDeTest(), 2, 'afaire');
            const ok = !r.ok && r.erreur.includes('non estimé');
            return { ok, detail: `deplacerTicket(jeu, 2, "afaire") → ${decrireResultat(r)}` };
        } },
        { code: 'T3', nom: '3 en cours → le 4e est refusé (limite WIP exacte)', run: () => {
            const r3 = deplacerTicket(jeuDeTest(), 5, 'encours');            // 2 en cours : le 3e doit passer
            const r4 = r3.ok ? deplacerTicket(r3.tickets, 1, 'encours') : r3; // 3 en cours : le 4e doit être refusé
            const ok = r3.ok && !r4.ok && r4.erreur === 'WIP atteint (3/3)';
            return { ok, detail: `3e en cours → ${decrireResultat(r3)}\n4e en cours → ${decrireResultat(r4)}` };
        } },
        { code: 'T4', nom: 'Id inconnu, sans planter', run: () => {
            const r = deplacerTicket(jeuDeTest(), 999, 'afaire');
            const ok = r.ok === false && typeof r.erreur === 'string';
            return { ok, detail: `deplacerTicket(jeu, 999, "afaire") → ${decrireResultat(r)}` };
        } },
        { code: 'T5', nom: "Tableau d'origine intact", run: () => {
            const jeu = jeuDeTest();
            const avant = JSON.stringify(jeu);
            const r = deplacerTicket(jeu, 1, 'afaire');
            deplacerTicket(jeu, 5, 'encours');
            const ok = JSON.stringify(jeu) === avant && r.tickets !== jeu && jeu[0].statut === 'backlog';
            return { ok, detail: ok ? 'Après deux déplacements, le tableau reçu est identique et un nouveau tableau est renvoyé.' : 'Le tableau reçu a été modifié.' };
        } },
        { code: 'T6', nom: 'Stats vides : 0 %, pas NaN', run: () => {
            const s = calculerStats([]);
            const ok = s.pctTermine === 0 && !Number.isNaN(s.pctTermine);
            return { ok, detail: `calculerStats([]) → ${s.pctTermine} % terminé (${s.termines}/${s.total})` };
        } },
        { code: 'T7', nom: 'Redevenu non estimé → retour au Backlog', run: () => {
            const jeu = jeuDeTest();
            const l = modifierTache(jeu, 5, { points: null });   // le ticket 5 est « À faire »
            const t = l.find(x => x.id === 5);
            const ok = t.statut === 'backlog' && t.points === null && jeu[4].statut === 'afaire';
            return { ok, detail: `modifierTache(jeu, 5, { points: null }) → statut "${t.statut}"` };
        } },
        { code: 'T8', nom: 'Fichier piégé : « 4 importés · 2 rejetés », avec ligne et motif', run: () => {
            const r = importerTickets(parserCSV(CSV_PIEGE), TICKETS_INITIAUX, '2026-11-03');
            const ok = texteRapport(r) === '4 importés · 2 rejetés' && r.rejets.map(x => x.ligne).join() === '4,7';
            return { ok, detail: `${texteRapport(r)}\n${r.rejets.map(x => `ligne ${x.ligne} : ${x.motif}`).join('\n')}` };
        } },
        { code: 'T9', nom: 'Titre avec virgule intact, aucun id en double', run: () => {
            const r = importerTickets(parserCSV(CSV_PIEGE), TICKETS_INITIAUX, '2026-11-03');
            const t21 = r.tickets.find(t => t.id === 21);
            const second = r.importes.find(x => x.ligne === 6);
            const ids = r.tickets.map(t => t.id);
            const ok = !!t21 && t21.titre === 'Corriger le login, page d’accueil' && t21.type === 'bug'
                && !!second && second.id !== 21 && new Set(ids).size === ids.length;
            return { ok, detail: `TES-21 → "${t21 ? t21.titre : '?'}" (${t21 ? t21.type : '?'})\nligne 6, id 21 en double → TES-${second ? second.id : '?'}\n${ids.length} tickets, ${new Set(ids).size} ids distincts` };
        } }
    ];

    // --- Auto-tests d'import T10 à T29 : chaque cas passe par analyserImport, comme le bouton Importer.
    // Pour tous : aucune exception, tickets existants intacts, tableau final sain (verifierTableau).
    const ENTETE_CSV = 'id,titre,type,priorite,points,statut';
    const lignesCSV = (...lignes) => [ENTETE_CSV, ...lignes].join('\n');
    const AVEC_GUILLEMETS = [...TICKETS_VALIDES_TEST,
        { id: 36, titre: 'Titre "entre guillemets", avec virgule', type: "bug", priorite: 1, points: null, statut: "backlog", creeLe: "2026-11-01" }];

    const CAS_IMPORT = [
        { code: 'T10', nom: 'Zone vide ou espaces seuls', texte: '  \n\t ',
          verifier: r => !!r.erreur },
        { code: 'T11', nom: 'En-tête seul, sans ticket', texte: ENTETE_CSV + '\n',
          verifier: r => !!r.erreur },
        { code: 'T12', nom: 'JSON illisible (coupé en plein milieu)', texte: '[{"id": 1, "titre":',
          verifier: r => !!r.erreur && r.erreur.startsWith('JSON illisible') },
        { code: 'T13', nom: "JSON qui n'est pas une liste de tickets", texte: '{"nom": "export"}',
          verifier: r => !!r.erreur },
        { code: 'T14', nom: 'JSON : éléments vides, nombres, listes, objets, booléens',
          texte: '[null, 5, "texte", [], {"titre": {"a": 1}, "type": "bug", "priorite": 1}, {"titre": true, "type": "bug", "priorite": 1}]',
          verifier: r => r.importes.length === 0 && r.rejets.length === 6 },
        { code: 'T15', nom: 'Colonne en trop, ligne trop courte',
          texte: ENTETE_CSV + ',auteur\n1,Colonne en plus,bug,1,3,backlog,Équipe\n2,Ligne courte,bug',
          verifier: r => r.importes.length === 1 && r.rejets.length === 1 && r.rejets[0].motif.includes('priorite') },
        { code: 'T16', nom: 'Séparateur « ; » (CSV Excel en français)',
          texte: 'id;titre;type;priorite;points;statut\n1;Export Excel, version FR;bug;1;3;backlog',
          verifier: r => r.importes.length === 1 && r.tickets.some(t => t.titre === 'Export Excel, version FR') },
        { code: 'T17', nom: 'Guillemet jamais refermé',
          texte: lignesCSV('40,"Titre jamais fermé,bug,1,3,backlog', '41,Ligne suivante,bug,1,3,backlog'),
          verifier: r => r.importes.length === 0 && r.rejets.length === 1 && r.rejets[0].motif.includes('guillemet') },
        { code: 'T18', nom: 'Valeurs hors règles : toutes rejetées avec motif',
          texte: lignesCSV('50,Points en lettres,bug,1,abc,backlog', '51,Points à zéro,bug,1,0,backlog', '52,Priorité vide,bug,,3,backlog',
              '53,Type piège,constructor,1,3,backlog', '54,Type piège 2,__proto__,1,3,backlog', '55,Statut inconnu,bug,1,3,archive',
              `56,${'x'.repeat(81)},bug,1,3,backlog`, '57,ab,bug,1,3,backlog'),
          verifier: r => r.importes.length === 0 && r.rejets.length === 8 },
        { code: 'T19', nom: 'Ids vides, invalides ou démesurés : renumérotés',
          texte: lignesCSV(',Sans id,bug,1,3,backlog', 'abc,Id en lettres,bug,1,3,backlog', '-3,Id négatif,bug,1,3,backlog',
              '0,Id zéro,bug,1,3,backlog', '1.5,Id décimal,bug,1,3,backlog', '99999999999999999999,Id démesuré,bug,1,3,backlog',
              '1e400,Id infini,bug,1,3,backlog'),
          verifier: r => r.importes.length === 7 && r.rejets.length === 0 },
        { code: 'T20', nom: 'Limite WIP à l’import : 5 tickets « En cours » pour 3 places',
          texte: lignesCSV(...[1, 2, 3, 4, 5].map(i => `${80 + i},En cours ${i},story,2,3,encours`)),
          verifier: r => r.importes.length === 5 && r.tickets.filter(t => t.statut === 'encours').length === 3 },
        { code: 'T21', nom: 'Non estimé annoncé « Terminé » : gardé au Backlog',
          texte: lignesCSV('90,Pas encore estimé,tache,2,?,termine'),
          verifier: r => r.importes.length === 1 && r.tickets.find(t => t.titre === 'Pas encore estimé').statut === 'backlog' },
        { code: 'T22', nom: 'Titre avec HTML, guillemets doublés et retour à la ligne',
          texte: lignesCSV('60,"<img src=x onerror=alert(1)>",bug,1,3,backlog', '61,"Titre ""cité""\nsur deux lignes",story,2,5,backlog'),
          verifier: r => r.importes.length === 2
              && r.tickets.some(t => t.titre === 'Titre "cité" sur deux lignes')
              && !afficherRapport({ ...r, source: 'test' }).includes('<img') },
        { code: 'T23', nom: 'BOM, fins de ligne Windows et lignes vides',
          texte: '﻿' + ENTETE_CSV + '\r\n\r\n70,Ticket venu de Windows,bug,1,3,backlog\r\n,,,,,\r\n',
          verifier: r => r.importes.length === 1 && r.rejets.length === 0 },
        { code: 'T24', nom: 'Gros fichier : 5 000 lignes en moins de 2 s', duree: true,
          texte: () => lignesCSV(...Array.from({ length: 5000 }, (_, i) => `${1000 + i},Ticket importé n° ${i + 1},story,${1 + i % 3},${[1, 2, 3, 5, 8, 13][i % 6]},backlog`)),
          verifier: (r, ms) => r.importes.length === 5000 && ms < 2000 },
        { code: 'T25', nom: 'Aller-retour CSV sans perte (guillemets, virgule, non estimé)', existants: [],
          texte: () => exporterCSV(AVEC_GUILLEMETS),
          verifier: r => exporterJSON(r.tickets) === exporterJSON(AVEC_GUILLEMETS) },
        { code: 'T26', nom: 'Aller-retour JSON sans perte', existants: [],
          texte: () => exporterJSON(AVEC_GUILLEMETS),
          verifier: r => exporterJSON(r.tickets) === exporterJSON(AVEC_GUILLEMETS) },
        // Le tableau contient TES-1 à TES-13 ; « 30 » plus bas dans le fichier doit garder son id
        { code: 'T27', nom: 'Id en double sous toutes ses formes : un seul garde son id',
          texte: lignesCSV('13,Id déjà pris par le tableau,bug,1,3,backlog', '21,Premier 21,bug,1,3,backlog', '21,Deuxième 21,bug,1,3,backlog',
              '021,Zéro devant,bug,1,3,backlog', ' 21 ,Espaces autour,bug,1,3,backlog', '21.0,Décimal,bug,1,3,backlog',
              ',Sans id A,bug,1,3,backlog', ',Sans id B,bug,1,3,backlog', '0x15,Hexadécimal,bug,1,3,backlog',
              '1e1,Notation exponentielle,bug,1,3,backlog', '30,Id plus bas dans le fichier,bug,1,3,backlog'),
          verifier: r => {
              const id = (titre) => r.tickets.find(t => t.titre === titre).id;
              return r.importes.length === 11
                  && id('Premier 21') === 21 && id('Id plus bas dans le fichier') === 30
                  && id('Id déjà pris par le tableau') !== 13
                  && r.tickets.find(t => t.id === 13).titre === 'Validation Tri';
          } }
    ];

    function testImport(cas) {
        return { code: cas.code, nom: cas.nom, run: () => {
            const avant = JSON.stringify(TICKETS_INITIAUX);
            const texte = typeof cas.texte === 'function' ? cas.texte() : cas.texte;
            const debut = performance.now();
            const r = analyserImport(texte, cas.existants || TICKETS_INITIAUX, '2026-11-03');
            const ms = Math.round(performance.now() - debut);
            const problemes = verifierTableau(r.tickets);
            const intacts = JSON.stringify(TICKETS_INITIAUX) === avant;
            const ok = cas.verifier(r, ms) === true && problemes.length === 0 && intacts;
            const lignes = [
                (r.erreur ? `Rien n'est importé : ${r.erreur}` : texteRapport(r)) + (cas.duree ? ` en ${ms} ms` : ''),
                ...r.rejets.slice(0, 8).map(x => `ligne ${x.ligne} : ${x.motif}`),
                ...problemes.map(p => `Tableau invalide · ${p}`),
                ...(intacts ? [] : ['Les tickets existants ont été modifiés'])
            ];
            return { ok, detail: lignes.join('\n') };
        } };
    }
    AUTO_TESTS.push(...CAS_IMPORT.map(testImport));

    // Imports successifs : chaque tour repart du tableau obtenu au tour précédent
    function importsSuccessifs(textes) {
        let tableau = TICKETS_INITIAUX;
        let importes = 0;
        textes.forEach(texte => {
            const r = analyserImport(texte, tableau, '2026-11-03');
            tableau = r.tickets;
            importes += r.importes.length;
        });
        const ids = tableau.map(t => t.id);
        const doublons = ids.filter((id, i) => ids.indexOf(id) !== i);
        return { tableau, importes, doublons, problemes: verifierTableau(tableau) };
    }

    AUTO_TESTS.push(
        { code: 'T28', nom: 'JSON : même id en nombre et en texte, importé 3 fois (« Importer quand même »)', run: () => {
            const json = JSON.stringify([5, '5', ' 5', 40, 40, null, '40'].map((id, i) =>
                ({ id, titre: `Ticket JSON ${i + 1}`, type: 'story', priorite: 2, points: 3, statut: 'backlog' })));
            const s = importsSuccessifs([json, json, json]);
            const ok = s.importes === 21 && s.tableau.length === 13 + 21 && s.doublons.length === 0 && s.problemes.length === 0;
            return { ok, detail: `3 imports du même fichier → ${s.importes} tickets ajoutés, ${s.tableau.length} au total, ${s.doublons.length} id en double` };
        } },
        { code: 'T29', nom: 'Hasard : 4 imports de 300 lignes aux ids mélangés, CSV et JSON', run: () => {
            let graine = 42;   // suite pseudo-aléatoire fixe : le test donne toujours le même résultat
            const hasard = (n) => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine % n; };
            const unId = () => ['', 'abc', '0', '-1', '1e2', String(1 + hasard(40)), ` ${1 + hasard(40)} `,
                '0' + (1 + hasard(40)), String(ID_MAX), 1 + hasard(40)][hasard(10)];
            const lot = (tour) => Array.from({ length: 300 }, (_, i) =>
                ({ id: unId(), titre: `Tour ${tour} n° ${i + 1}`, type: 'bug', priorite: 1 + hasard(3), points: 3, statut: 'backlog' }));
            const textes = [1, 2, 3, 4].map(tour => {
                const lignes = lot(tour);
                return tour % 2 ? exporterCSV(lignes) : JSON.stringify(lignes);
            });
            const s = importsSuccessifs(textes);
            const ok = s.importes === 1200 && s.doublons.length === 0 && s.problemes.length === 0;
            return { ok, detail: `${s.importes} tickets importés en 4 fois, ${s.tableau.length} au total, ${s.doublons.length} id en double${s.problemes.length ? '\n' + s.problemes.slice(0, 5).join('\n') : ''}` };
        } }
    );

    // --- Auto-tests de sauvegarde T30 à T35 : charger() et sauvegarder() sur un faux localStorage,
    // jamais sur la vraie sauvegarde de l'utilisateur.
    function fauxStockage(contenu) {
        const m = new Map(contenu === undefined ? [] : [[CLE, contenu]]);
        return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), lire: () => m.get(CLE) };
    }
    const estLaDemo = (c) => exporterJSON(c.tickets) === exporterJSON(TICKETS_INITIAUX);

    AUTO_TESTS.push(
        { code: 'T30', nom: 'charger() au premier lancement : la démo', run: () => {
            const c = charger(fauxStockage());
            const ok = c.etat === 'premier' && estLaDemo(c) && c.interface.vue === 'backlog';
            return { ok, detail: `charger(stockage vide) → état "${c.etat}", ${c.tickets.length} tickets` };
        } },
        { code: 'T31', nom: 'sauvegarder() puis charger() : cartes, ordre, vue et filtres identiques', run: () => {
            const stockage = fauxStockage();
            const tickets = deplacerTicket(TICKETS_INITIAUX, 6, 'encours').tickets.reverse();
            const ui = { vue: 'board', recherche: 'export', types: ['bug'], priorites: [1, 3], ordreManuel: true,
                colonnes: { ...Object.fromEntries(Object.keys(colLabels).map(k => [k, true])), creeLe: false },
                mesTickets: true, moi: 'Karim' };
            sauvegarder({ tickets, interface: ui, journal: [] }, stockage);
            const enveloppe = JSON.parse(stockage.lire());
            const c = charger(stockage);
            const ok = enveloppe.version === VERSION_SAUVEGARDE && c.etat === 'restaure'
                && exporterJSON(c.tickets) === exporterJSON(tickets) && JSON.stringify(c.interface) === JSON.stringify(ui);
            return { ok, detail: `enveloppe { version: ${enveloppe.version}, tickets: [${enveloppe.tickets.length}], interface } → état "${c.etat}", vue "${c.interface.vue}", filtres ${c.interface.types.join('+')} · P${c.interface.priorites.join('+P')} · « ${c.interface.recherche} »` };
        } },
        { code: 'T32', nom: 'Sabotage « {oups » : la démo redémarre, sans exception', run: () => {
            const c = charger(fauxStockage('{oups'));
            const ok = c.etat === 'corrompu' && estLaDemo(c);
            return { ok, detail: `charger("{oups") → état "${c.etat}", ${c.tickets.length} tickets de démo` };
        } },
        { code: 'T33', nom: 'Ancienne sauvegarde v1 (tableau nu) : migrée, champs complétés', run: () => {
            const v1 = JSON.stringify([
                { id: 1, titre: 'Ticket v1 complet', type: 'story', priorite: 1, points: 5, statut: 'encours', creeLe: '2026-10-01' },
                { id: 2, titre: 'Ticket v1 sans statut ni date', type: 'bug', priorite: 2, points: 3 },
                { id: 3, titre: 'Ticket v1 sans points', type: 'tache', priorite: 3, statut: 'afaire' }
            ]);
            const c = charger(fauxStockage(v1));
            const [a, b, d] = c.tickets;
            const ok = c.etat === 'migre' && c.tickets.length === 3 && a.statut === 'encours'
                && b.statut === 'backlog' && b.creeLe === '' && d.points === null && d.statut === 'backlog'
                && c.tickets.every(t => Object.values(t).every(v => v !== undefined));
            return { ok, detail: `état "${c.etat}" · TES-2 → statut "${b && b.statut}", date "${b && b.creeLe}" · TES-3 → points ${d && d.points}, statut "${d && d.statut}"` };
        } },
        { code: 'T34', nom: 'Sauvegardes vides, incomplètes ou invalides : jamais d’écran blanc', run: () => {
            const cas = ['', 'null', '42', '"texte"', '{}', '{"version":2}', '{"version":2,"tickets":"x"}',
                '{"version":2,"tickets":[null]}', '{"version":2,"tickets":[{"id":1}]}',
                '{"version":2,"tickets":[{"id":1,"titre":"Doublon","type":"bug","priorite":1,"points":3,"statut":"backlog"},{"id":1,"titre":"Doublon","type":"bug","priorite":1,"points":3,"statut":"backlog"}]}',
                '{"version":2,"tickets":[],"interface":{"vue":"<script>","types":["constructor"],"priorites":[9],"colonnes":"x"}}',
                '{"version":9,"tickets":[]}'];
            const resultats = cas.map(texte => { const c = charger(fauxStockage(texte)); return { texte, c }; });
            const sains = resultats.every(({ c }) => Array.isArray(c.tickets) && verifierTableau(c.tickets).length === 0
                && ['backlog', 'board', 'tests', 'donnees'].includes(c.interface.vue));
            const vide = resultats[10].c;   // sauvegarde v2 d'un tableau vidé : migrée en v3, interface nettoyée
            const ok = sains && vide.etat === 'migre' && vide.tickets.length === 0 && vide.interface.vue === 'backlog'
                && vide.interface.types.length === 0 && resultats[11].c.etat === 'inconnu';
            return { ok, detail: resultats.map(({ texte, c }) => `${(texte || '(vide)').slice(0, 42)} → ${c.etat}`).join('\n') };
        } },
        { code: 'T35', nom: 'localStorage bloqué ou plein : ni exception ni écran blanc', run: () => {
            const bloque = { getItem: () => { throw new Error('SecurityError'); }, setItem: () => { throw new Error('QuotaExceededError'); } };
            const s1 = sauvegarder({ tickets: TICKETS_INITIAUX, interface: lireInterface(null) }, bloque);
            const s2 = sauvegarder({ tickets: TICKETS_INITIAUX }, null);
            const c1 = charger(bloque), c2 = charger(null);
            const ok = s1 === false && s2 === false && estLaDemo(c1) && estLaDemo(c2);
            return { ok, detail: `sauvegarder() → ${s1} (l'interface avertit) · stockage qui refuse → état "${c1.etat}" · aucun stockage → état "${c2.etat}"` };
        } },
        // --- T36 à T40 : ce qu'un utilisateur malin peut trafiquer (localStorage, outils de développement)
        { code: 'T36', nom: 'Date piégée dans la sauvegarde (script, nombre) : rien d’exécutable à l’écran', run: () => {
            const piege = 'xx<img src=x onerror=alert(1)>';
            const tickets = [
                { ...TICKETS_INITIAUX[0], creeLe: piege },
                { ...TICKETS_INITIAUX[1], creeLe: 20261103 },
                { ...TICKETS_INITIAUX[2] }
            ];
            const c = charger(fauxStockage(JSON.stringify({ version: 2, tickets })));
            const dates = c.tickets.map(t => t.creeLe);
            const affichage = [piege, 20261103, null, undefined, {}, '2026-13-45', '2026-11-03'].map(formaterDate);
            const ok = c.etat === 'repare' && c.tickets.length === 3 && dates[0] === '' && dates[1] === '' && dates[2] === '2026-11-03'
                && affichage.slice(0, 6).every(d => d === '') && affichage[6] === '03/11/26';
            return { ok, detail: `état "${c.etat}", dates gardées : ${JSON.stringify(dates)}\nformaterDate(piège, nombre, null, …) → ${JSON.stringify(affichage)}` };
        } },
        { code: 'T37', nom: 'Sauvegarde en partie abîmée : les tickets valides sont gardés', run: () => {
            const tickets = [...TICKETS_INITIAUX,
                { id: 50, titre: 'Priorité trafiquée', type: 'bug', priorite: 9, points: 3, statut: 'backlog', creeLe: '' },
                { id: 1, titre: 'Id volé à TES-1', type: 'bug', priorite: 1, points: 3, statut: 'backlog', creeLe: '' },
                ...[1, 2, 3, 4].map(i => ({ id: 60 + i, titre: `En cours ${i}`, type: 'story', priorite: 2, points: 3, statut: 'encours', creeLe: '' }))];
            const c = charger(fauxStockage(JSON.stringify({ version: 2, tickets })));
            const ok = c.etat === 'repare' && c.ecartes === 1 && c.tickets.length === 13 + 1 + 4
                && verifierTableau(c.tickets).length === 0 && c.tickets.find(t => t.id === 1).titre === TICKETS_INITIAUX[0].titre;
            return { ok, detail: `état "${c.etat}" · ${c.tickets.length} tickets gardés, ${c.ecartes} écarté · « Id volé » → TES-${(c.tickets.find(t => t.titre === 'Id volé à TES-1') || {}).id} · en cours : ${c.tickets.filter(t => t.statut === 'encours').length}/3` };
        } },
        { code: 'T38', nom: 'Formulaire trafiqué (F12) : type ou priorité hors liste refusés', run: () => {
            const essais = [{ type: 'admin', priorite: 1 }, { type: 'constructor', priorite: 1 }, { type: 'bug', priorite: 7 },
                { type: 'bug', priorite: NaN }, { type: 'bug', priorite: '1' }];
            const refus = essais.map(validerProprietes);
            const ok = refus.every(m => typeof m === 'string') && validerProprietes({ type: 'story', priorite: 2 }) === null
                && validerTicket('Titre correct', 2.5) !== null;
            return { ok, detail: refus.map((m, i) => `${JSON.stringify(essais[i])} → ${m}`).join('\n') + '\npoints 2.5 → ' + validerTicket('Titre correct', 2.5) };
        } },
        { code: 'T39', nom: 'Largeurs de colonnes trafiquées dans localStorage', run: () => {
            const defauts = { id: 62, titre: null, type: 92 };
            const cas = [null, 'texte', [1, 2], { id: 'abc', titre: -5, type: 1e9 }, JSON.parse('{"__proto__": {"id": 9}, "id": -500}'), { id: 120, titre: 300, type: 150 }];
            const lus = cas.map(c => lireLargeurs(c, defauts));
            const ok = lus.slice(0, 5).every(l => JSON.stringify(l) === JSON.stringify(defauts))
                && JSON.stringify(lus[5]) === JSON.stringify({ id: 120, titre: 300, type: 150 });
            return { ok, detail: lus.map((l, i) => `${JSON.stringify(cas[i])} → ${JSON.stringify(l)}`).join('\n') };
        } },
        { code: 'T40', nom: 'Interface trafiquée : au moins une colonne du Backlog reste visible', run: () => {
            const toutesCachees = Object.fromEntries(Object.keys(colLabels).map(k => [k, false]));
            const i = lireInterface({ colonnes: toutesCachees, vue: 'board' });
            const ok = colonnesVisibles(i.colonnes).join() === 'titre' && i.vue === 'board';
            return { ok, detail: `toutes les colonnes masquées → visibles : ${colonnesVisibles(i.colonnes).join(', ')}` };
        } }
    );

    // --- Auto-tests TP2 Phase 2 (T41 à T45) : les exigences du Product Owner
    AUTO_TESTS.push(
        { code: 'T41', nom: 'PO 1 · « En revue » (WIP 2) : Terminé seulement depuis En revue', run: () => {
            const jeu = jeuDeTest();                                        // TES-3 et TES-4 sont En cours
            const saut = deplacerTicket(jeu, 3, 'termine');                 // En cours → Terminé : interdit
            const depuisBacklog = deplacerTicket(jeu, 1, 'termine');        // Backlog → Terminé : interdit
            const r1 = deplacerTicket(jeu, 3, 'enrevue');
            const r2 = deplacerTicket(r1.tickets, 3, 'termine');            // En revue → Terminé : permis
            const plein = [3, 4].reduce((l, id) => deplacerTicket(l, id, 'enrevue').tickets, jeu);
            const r3 = deplacerTicket(deplacerTicket(plein, 5, 'encours').tickets, 5, 'enrevue');   // 3e en revue : refusé
            const imp = importerTickets(parserCSV(lignesCSV('90,Déjà terminé ailleurs,bug,1,3,termine')), [], '');
            const ok = !saut.ok && saut.erreur.includes('En revue') && !depuisBacklog.ok
                && r1.ok && r2.ok && r2.tickets.find(t => t.id === 3).statut === 'termine'
                && !r3.ok && r3.erreur === 'WIP atteint (2/2)'
                && imp.tickets[0].statut === 'termine' && COLONNES.map(c => c.id).join() === 'backlog,afaire,encours,enrevue,termine';
            return { ok, detail: `En cours → Terminé : ${decrireResultat(saut)}\nEn revue → Terminé : ${decrireResultat(r2)}\n3e ticket En revue : ${decrireResultat(r3)}\nimport d'un ticket « termine » : ${imp.tickets[0].statut}` };
        } },
        { code: 'T42', nom: 'PO 2 · Sauvegarde v2 sans « assigne » : migrée en v3 sans erreur', run: () => {
            const v2 = JSON.stringify({ version: 2,
                tickets: deplacerTicket(TICKETS_INITIAUX.map(({ assigne, ...t }) => t), 6, 'encours').tickets,
                interface: { vue: 'board', recherche: '', types: [], priorites: [1], ordreManuel: false } });
            const c = charger(fauxStockage(v2));
            const ok = c.etat === 'migre' && c.tickets.length === 13 && c.tickets.every(t => t.assigne === null)
                && c.tickets.find(t => t.id === 6).statut === 'encours' && c.interface.vue === 'board'
                && c.interface.mesTickets === false && EQUIPE.includes(c.interface.moi) && c.journal.length === 0;
            return { ok, detail: `v2 (sans assigne) → état "${c.etat}", ${c.tickets.length} tickets, assigne = ${JSON.stringify(c.tickets[0].assigne)}, vue "${c.interface.vue}", journal vide` };
        } },
        { code: 'T43', nom: 'PO 2 · Filtre « Mes tickets » et champ assigne (formulaire, import)', run: () => {
            const filtre = (mes, moiTest, types = new Set()) => filtrerTaches(TICKETS_INITIAUX, { recherche: '', types, priorites: new Set(), mesTickets: mes, moi: moiTest });
            const karim = filtre(true, 'Karim'), karimBugs = filtre(true, 'Karim', new Set(['bug'])), tous = filtre(false, 'Karim');
            const imp = importerTickets(parserCSV('id,titre,type,priorite,points,statut,assigne\n1,Assigné en minuscules,bug,1,3,backlog,karim\n2,Assigné inconnu,bug,1,3,backlog,Zorro'), [], '');
            const ok = karim.length > 0 && karim.every(t => t.assigne === 'Karim') && karimBugs.every(t => t.type === 'bug' && t.assigne === 'Karim')
                && tous.length === 13 && imp.tickets[0].assigne === 'Karim' && imp.tickets[1].assigne === null
                && validerProprietes({ type: 'bug', priorite: 1, assigne: 'Zorro' }) !== null && validerProprietes({ type: 'bug', priorite: 1, assigne: null }) === null;
            return { ok, detail: `Mes tickets (Karim) : ${karim.map(t => 'TES-' + t.id).join(', ')} · + Bug : ${karimBugs.length}\nimport « karim » → ${imp.tickets[0].assigne} · « Zorro » → ${imp.tickets[1].assigne} (${imp.importes[1].notes.join('')})` };
        } },
        { code: 'T44', nom: 'PO 3 · « Annuler » restaure exactement l’état précédent, même après F5', run: () => {
            const t0 = TICKETS_INITIAUX.map(t => ({ ...t }));
            let tickets = t0, j = [];
            const bouger = (id, vers) => { const avant = tickets; tickets = deplacerTicket(tickets, id, vers).tickets; j = noterDeplacement(j, avant, tickets, id, '2026-11-03T10:00:00Z'); };
            bouger(1, 'afaire'); const t1 = tickets;
            bouger(1, 'encours');
            const stockage = fauxStockage();                               // F5 : sauvegarde puis rechargement
            sauvegarder({ tickets, interface: lireInterface(null), journal: j }, stockage);
            const c = charger(stockage);
            const u1 = annulerDernier(c.journal, c.tickets);
            const u2 = annulerDernier(u1.journal, u1.tickets);
            const u3 = annulerDernier(u2.journal, u2.tickets);
            // 12 déplacements : le journal n'en garde que 10
            for (let i = 0; i < 6; i++) { bouger(13, 'afaire'); bouger(13, 'backlog'); }
            const change = annulerDernier(j, modifierTache(tickets, 2, { titre: 'Modifié après coup' }));
            const ok = c.journal.length === 2 && u1.ok && exporterJSON(u1.tickets) === exporterJSON(t1)
                && u2.ok && exporterJSON(u2.tickets) === exporterJSON(t0) && !u3.ok
                && j.length === TAILLE_JOURNAL && !change.ok;
            return { ok, detail: `après F5 : journal de ${c.journal.length} · Annuler → état d'avant ${u1.ok ? 'identique' : 'différent'} · 2e Annuler → état de départ ${u2.ok && exporterJSON(u2.tickets) === exporterJSON(t0) ? 'identique' : 'différent'} · 3e : ${u3.erreur}\n12 déplacements → journal de ${j.length}\ntableau modifié depuis → ${change.erreur}` };
        } },
        { code: 'T45', nom: 'Journal trafiqué dans localStorage : écarté, tickets gardés', run: () => {
            const tickets = TICKETS_INITIAUX;
            const cas = ['"x"', '[1,2]', '[{"id":1}]', JSON.stringify([{ id: 1, titre: 'x', de: 'backlog', vers: 'afaire', quand: 'x', empreinteApres: 'x', avant: [{ id: 'pirate' }] }])];
            const lus = cas.map(jr => charger(fauxStockage(`{"version":3,"tickets":${JSON.stringify(tickets)},"journal":${jr}}`)));
            const ok = lus.every(c => c.etat === 'restaure' && c.tickets.length === 13 && c.journal.length === 0);
            return { ok, detail: cas.map((jr, i) => `${jr.slice(0, 40)} → journal de ${lus[i].journal.length}, ${lus[i].tickets.length} tickets`).join('\n') };
        } }
    );

    // --- Auto-tests sprint (T46 à T55), selon docs/spec.md.
    // Contrat attendu pour Dev-JS :
    // planifierSprint(sprints, { id, dureeSemaines, dateDebut, dateFin })
    // demarrerSprint(sprints, sprintId, tickets, dateEffet)
    // ajouterTicketSprint(sprints, tickets, sprintId, ticketId, dateEffet)
    // mettreAJourTacheSprint(sprints, tickets, ticketId, champs, dateEffet)
    // retirerTicketSprint(sprints, sprintId, ticketId, dateEffet)
    // terminerSprint(sprints, sprintId, tickets, dateEffet)
    // calculerBurndown(sprint, tickets, jusquAu) -> { jours: [{ date, pointsReels, pointsIdeaux }] }
    // Chaque mutation renvoie { ok, sprints, tickets? , erreur? }; les fonctions pures
    // reçoivent des données de test isolées. Les dates d'effet sont explicites pour être déterministes.
    // sauvegarder/charger doivent également conserver l'état « sprints » sous la clé existante.
    function exigerFonctionSprint(nom) {
        const fonction = globalThis[nom];
        if (typeof fonction !== 'function') throw new Error(`API sprint absente : ${nom}`);
        return fonction;
    }

    function sprintsPlanifiesPourTest(...definitions) {
        const planifier = exigerFonctionSprint('planifierSprint');
        return definitions.reduce((sprints, d) => {
            const r = planifier(sprints, d);
            if (!r.ok) throw new Error(r.erreur || `Planification de TES-${d.id} refusée`);
            return r.sprints;
        }, []);
    }

    function exigerMutationSprint(r, operation) {
        if (!r || !r.ok) throw new Error(r && r.erreur ? r.erreur : `${operation} refusée`);
        return r;
    }

    const DATE_SPRINT_TEST = {
        debut: '2026-11-02',
        finSemaine: '2026-11-08',
        debutSuivant: '2026-11-09',
        finDeuxSemaines: '2026-11-15'
    };

    // Interception temporaire pour les tests qui rendent une vue : aucun clic de test
    // ne doit écrire dans le localStorage réel, même si la garde d'initialisation manque.
    let ecrituresNavigationAvantChargement = null;
    function avecStockageNavigateurIsole(action) {
        const stockageOriginal = Object.getOwnPropertyDescriptor(window, 'localStorage');
        const valeurs = Object.create(null);
        const stockageSimule = {
            ecritures: [],
            getItem: cle => Object.hasOwn(valeurs, cle) ? valeurs[cle] : null,
            setItem: (cle, valeur) => {
                stockageSimule.ecritures.push([cle, String(valeur)]);
                valeurs[cle] = String(valeur);
            }
        };
        try {
            Object.defineProperty(window, 'localStorage', {
                configurable: true,
                enumerable: stockageOriginal ? stockageOriginal.enumerable : true,
                writable: true,
                value: stockageSimule
            });
            if (window.localStorage !== stockageSimule) throw new Error('Interception isolée de localStorage indisponible');
            return { resultat: action(), ecritures: stockageSimule.ecritures };
        } finally {
            const descripteurActuel = Object.getOwnPropertyDescriptor(window, 'localStorage');
            if (descripteurActuel && descripteurActuel.value === stockageSimule) {
                if (stockageOriginal) Object.defineProperty(window, 'localStorage', stockageOriginal);
                else delete window.localStorage;
            }
        }
    }

    AUTO_TESTS.push(
        { code: 'T46', nom: 'PO Sprint 1 · Vue « Sprints » accessible depuis la navigation', run: () => {
            const bouton = [...document.querySelectorAll('button')]
                .find(el => el.textContent.trim().startsWith('Sprints'));
            if (!bouton) {
                return { ok: false, detail: 'Aucun bouton « Sprints » trouvé dans la navigation.' };
            }
            const vueAvant = currentView;
            const essai = avecStockageNavigateurIsole(() => {
                try {
                    bouton.click();
                    const contenu = document.getElementById('viewContainer').innerText;
                    return { contenu, vueOuverte: currentView === 'sprints' };
                } finally {
                    setView(vueAvant);
                }
            });
            if (ecrituresNavigationAvantChargement === null) {
                ecrituresNavigationAvantChargement = essai.ecritures.length;
            }
            const { contenu, vueOuverte } = essai.resultat;
            const ok = vueOuverte && /Sprints/i.test(contenu) && /Planifier/i.test(contenu);
            return { ok, detail: ok
                ? 'Le bouton ouvre la vue dédiée, avec un titre « Sprints » et une action de planification.'
                : `Vue « Sprints » ouverte : ${vueOuverte} · contenu : ${contenu.slice(0, 180)}` };
        } },
        { code: 'T47', nom: 'PO Sprint 2 · Durée calendaire exacte et dates obligatoires', run: () => {
            const planifier = exigerFonctionSprint('planifierSprint');
            const valides = [
                planifier([], { id: 4601, dureeSemaines: 1, dateDebut: DATE_SPRINT_TEST.debut, dateFin: DATE_SPRINT_TEST.finSemaine }),
                planifier([], { id: 4602, dureeSemaines: 2, dateDebut: DATE_SPRINT_TEST.debut, dateFin: DATE_SPRINT_TEST.finDeuxSemaines })
            ];
            const invalide = planifier([], { id: 4603, dureeSemaines: 2, dateDebut: DATE_SPRINT_TEST.debut, dateFin: '2026-11-14' });
            const sansDates = planifier([], { id: 4604, dureeSemaines: 1, dateDebut: '', dateFin: '' });
            const ok = valides.every(r => r.ok) && !invalide.ok && !sansDates.ok
                && valides[0].sprints[0].dateFin === DATE_SPRINT_TEST.finSemaine
                && valides[1].sprints[0].dateFin === DATE_SPRINT_TEST.finDeuxSemaines;
            return { ok, detail: `1 semaine → ${valides[0].ok ? 'acceptée' : 'refusée'} (02–08/11) · 2 semaines → ${valides[1].ok ? 'acceptée' : 'refusée'} (02–15/11)\nPériode de 13 jours → ${invalide.ok ? 'acceptée à tort' : 'refusée'} · sans dates → ${sansDates.ok ? 'accepté à tort' : 'non planifié/refusé'}` };
        } },
        { code: 'T48', nom: 'PO Sprint 3 · Un seul sprint actif, démarrage sans changer les statuts', run: () => {
            const demarrer = exigerFonctionSprint('demarrerSprint');
            const sprints = sprintsPlanifiesPourTest(
                { id: 4801, dureeSemaines: 1, dateDebut: DATE_SPRINT_TEST.debut, dateFin: DATE_SPRINT_TEST.finSemaine },
                { id: 4802, dureeSemaines: 1, dateDebut: DATE_SPRINT_TEST.debutSuivant, dateFin: '2026-11-15' }
            );
            const tickets = [
                { id: 481, titre: 'À faire conservé', type: 'story', priorite: 1, points: 3, statut: 'afaire' },
                { id: 482, titre: 'En revue conservé', type: 'bug', priorite: 2, points: 5, statut: 'enrevue' }
            ];
            const avant = JSON.stringify(tickets);
            const premier = demarrer(sprints, 4801, tickets, DATE_SPRINT_TEST.debut);
            const second = premier.ok ? demarrer(premier.sprints, 4802, tickets, DATE_SPRINT_TEST.debutSuivant) : premier;
            const actif = premier.ok && premier.sprints.find(s => s.id === 4801);
            const ok = premier.ok && !second.ok && JSON.stringify(tickets) === avant
                && actif && actif.statut === 'actif'
                && tickets.map(t => t.statut).join() === 'afaire,enrevue';
            return { ok, detail: `Démarrage du premier : ${premier.ok ? 'actif' : premier.erreur} · second démarrage : ${second.ok ? 'accepté à tort' : 'refusé'}\nStatuts avant/après : ${tickets.map(t => t.statut).join(', ')}` };
        } },
        { code: 'T49', nom: 'PO Sprint 4 · Seuls les tickets estimés et non déjà membres sont ajoutés', run: () => {
            const ajouter = exigerFonctionSprint('ajouterTicketSprint');
            const sprints = sprintsPlanifiesPourTest(
                { id: 4901, dureeSemaines: 1, dateDebut: DATE_SPRINT_TEST.debut, dateFin: DATE_SPRINT_TEST.finSemaine },
                { id: 4902, dureeSemaines: 1, dateDebut: DATE_SPRINT_TEST.debutSuivant, dateFin: '2026-11-15' }
            );
            const tickets = [
                { id: 491, titre: 'Estimé', type: 'story', priorite: 1, points: 3, statut: 'backlog' },
                { id: 492, titre: 'Non estimé', type: 'tache', priorite: 2, points: null, statut: 'backlog' }
            ];
            const accepte = ajouter(sprints, tickets, 4901, 491, DATE_SPRINT_TEST.debut);
            const nonEstime = ajouter(accepte.sprints, tickets, 4901, 492, DATE_SPRINT_TEST.debut);
            const dejaMembre = ajouter(accepte.sprints, tickets, 4902, 491, DATE_SPRINT_TEST.debut);
            const occurrences = accepte.sprints.flatMap(s => s.ticketIds || s.tickets || [])
                .filter(id => id === 491 || (id && id.id === 491)).length;
            const ok = accepte.ok && !nonEstime.ok && !dejaMembre.ok && occurrences === 1;
            return { ok, detail: `Ticket estimé : ${accepte.ok ? 'ajouté' : accepte.erreur} · non estimé : ${nonEstime.ok ? 'accepté à tort' : 'refusé'} · déjà membre : ${dejaMembre.ok ? 'accepté à tort' : 'refusé'} · appartenances du ticket 491 : ${occurrences}` };
        } },
        { code: 'T50', nom: 'PO Sprint 5 · Redevenir non estimé retire du sprint et reste au Backlog', run: () => {
            const ajouter = exigerFonctionSprint('ajouterTicketSprint');
            const maj = exigerFonctionSprint('mettreAJourTacheSprint');
            const sprints = sprintsPlanifiesPourTest({ id: 5001, dureeSemaines: 1, dateDebut: DATE_SPRINT_TEST.debut, dateFin: DATE_SPRINT_TEST.finSemaine });
            const tickets = [{ id: 501, titre: 'Estimation retirée', type: 'story', priorite: 1, points: 3, statut: 'afaire' }];
            const membre = exigerMutationSprint(ajouter(sprints, tickets, 5001, 501, DATE_SPRINT_TEST.debut), 'Ajout au sprint');
            const modifie = exigerMutationSprint(maj(membre.sprints, tickets, 501, { points: null }, '2026-11-04'), 'Modification du ticket');
            const ticket = modifie.tickets.find(t => t.id === 501);
            const sprint = modifie.sprints.find(s => s.id === 5001);
            const appartenance = sprint && (sprint.ticketIds || sprint.tickets || []);
            const estMembre = Array.isArray(appartenance) && appartenance.some(x => x === 501 || (x && x.id === 501));
            const ok = ticket && ticket.points === null && ticket.statut === 'backlog' && !estMembre;
            return { ok, detail: `Après retrait de l’estimation : points ${ticket && ticket.points}, statut ${ticket && ticket.statut}, encore membre : ${!!estMembre}` };
        } },
        { code: 'T51', nom: 'PO Sprint 6 · Fin et report des seuls tickets inachevés, sans changement de statut', run: () => {
            const ajouter = exigerFonctionSprint('ajouterTicketSprint');
            const demarrer = exigerFonctionSprint('demarrerSprint');
            const terminer = exigerFonctionSprint('terminerSprint');
            let sprints = sprintsPlanifiesPourTest(
                { id: 5101, dureeSemaines: 1, dateDebut: DATE_SPRINT_TEST.debut, dateFin: DATE_SPRINT_TEST.finSemaine },
                { id: 5102, dureeSemaines: 1, dateDebut: DATE_SPRINT_TEST.debutSuivant, dateFin: '2026-11-15' }
            );
            const tickets = [
                { id: 511, titre: 'À reporter', type: 'story', priorite: 1, points: 5, statut: 'afaire' },
                { id: 512, titre: 'Terminé', type: 'bug', priorite: 2, points: 3, statut: 'termine' }
            ];
            sprints = ajouter(sprints, tickets, 5101, 511, DATE_SPRINT_TEST.debut).sprints;
            sprints = ajouter(sprints, tickets, 5101, 512, DATE_SPRINT_TEST.debut).sprints;
            sprints = demarrer(sprints, 5101, tickets, DATE_SPRINT_TEST.debut).sprints;
            const avant = JSON.stringify(tickets.map(t => [t.id, t.statut]));
            const fin = terminer(sprints, 5101, tickets, DATE_SPRINT_TEST.finSemaine);
            const suivant = fin.ok && fin.sprints.find(s => s.id === 5102);
            const membres = suivant && (suivant.ticketIds || suivant.tickets || []);
            const ids = Array.isArray(membres) ? membres.map(x => typeof x === 'object' ? x.id : x) : [];
            const ok = fin.ok && ids.includes(511) && !ids.includes(512)
                && JSON.stringify(tickets.map(t => [t.id, t.statut])) === avant
                && tickets[0].statut === 'afaire' && tickets[1].statut === 'termine';
            return { ok, detail: `Sprint suivant : ${ids.join(', ') || 'aucun membre'} · statuts inchangés : ${tickets.map(t => `${t.id}=${t.statut}`).join(', ')}` };
        } },
        { code: 'T52', nom: 'PO Sprint 7 · Sans sprint suivant, création sans dates et durée conservée', run: () => {
            const ajouter = exigerFonctionSprint('ajouterTicketSprint');
            const demarrer = exigerFonctionSprint('demarrerSprint');
            const terminer = exigerFonctionSprint('terminerSprint');
            let sprints = sprintsPlanifiesPourTest({ id: 5201, dureeSemaines: 2, dateDebut: DATE_SPRINT_TEST.debut, dateFin: DATE_SPRINT_TEST.finDeuxSemaines });
            const tickets = [{ id: 521, titre: 'À reporter', type: 'story', priorite: 1, points: 2, statut: 'afaire' }];
            sprints = ajouter(sprints, tickets, 5201, 521, DATE_SPRINT_TEST.debut).sprints;
            sprints = demarrer(sprints, 5201, tickets, DATE_SPRINT_TEST.debut).sprints;
            const fin = terminer(sprints, 5201, tickets, DATE_SPRINT_TEST.finDeuxSemaines);
            const suivant = fin.ok && fin.sprints.find(s => s.id !== 5201 && (s.ticketIds || s.tickets || []).length);
            const ok = !!suivant && suivant.dureeSemaines === 2
                && !suivant.dateDebut && !suivant.dateFin
                && (suivant.ticketIds || suivant.tickets || []).some(x => x === 521 || (x && x.id === 521));
            return { ok, detail: suivant
                ? `Sprint créé : durée ${suivant.dureeSemaines}, dates ${JSON.stringify([suivant.dateDebut, suivant.dateFin])}, membres ${JSON.stringify(suivant.ticketIds || suivant.tickets)}`
                : 'Aucun sprint suivant contenant le ticket reporté.' };
        } },
        { code: 'T53', nom: 'PO Sprint 8 · Tickets, sprints et appartenances persistent au rechargement', run: () => {
            const stockage = fauxStockage();
            const sprints = sprintsPlanifiesPourTest({ id: 5301, dureeSemaines: 1, dateDebut: DATE_SPRINT_TEST.debut, dateFin: DATE_SPRINT_TEST.finSemaine });
            const tickets = TICKETS_INITIAUX.map(t => ({ ...t }));
            const ajout = exigerMutationSprint(exigerFonctionSprint('ajouterTicketSprint')(sprints, tickets, 5301, 1, DATE_SPRINT_TEST.debut), 'Ajout au sprint');
            const enregistre = sauvegarder({ tickets, sprints: ajout.sprints, interface: lireInterface(null), journal: [] }, stockage);
            const recharge = charger(stockage);
            const ok = enregistre && exporterJSON(recharge.tickets) === exporterJSON(tickets)
                && exporterJSON(recharge.sprints) === exporterJSON(ajout.sprints)
                && recharge.tickets.length === TICKETS_INITIAUX.length;
            return { ok, detail: `Sauvegarde : ${enregistre} · tickets rechargés : ${recharge.tickets.length}/${TICKETS_INITIAUX.length} · sprints rechargés : ${Array.isArray(recharge.sprints) ? recharge.sprints.length : 'absents'}` };
        } },
        { code: 'T54', nom: 'PO Sprint 9 · Burndown vide : sept jours à zéro, valeurs finies', run: () => {
            const demarrer = exigerFonctionSprint('demarrerSprint');
            const sprints = sprintsPlanifiesPourTest({ id: 5401, dureeSemaines: 1, dateDebut: DATE_SPRINT_TEST.debut, dateFin: DATE_SPRINT_TEST.finSemaine });
            const actif = demarrer(sprints, 5401, [], DATE_SPRINT_TEST.debut);
            const burndown = exigerFonctionSprint('calculerBurndown')(actif.sprints[0], [], DATE_SPRINT_TEST.finSemaine);
            const jours = burndown.jours || [];
            const ok = actif.ok && jours.length === 7 && jours.every(j =>
                Number.isFinite(j.pointsReels) && Number.isFinite(j.pointsIdeaux)
                && j.pointsReels === 0 && j.pointsIdeaux === 0);
            return { ok, detail: `${jours.length} jours · valeurs réelles : ${jours.map(j => j.pointsReels).join(', ') || 'aucune'} · idéal fini : ${jours.every(j => Number.isFinite(j.pointsIdeaux))}` };
        } },
        { code: 'T55', nom: 'PO Sprint 10 · Burndown réel daté, ligne idéale figée au démarrage', run: () => {
            const planifier = exigerFonctionSprint('planifierSprint');
            const ajouter = exigerFonctionSprint('ajouterTicketSprint');
            const demarrer = exigerFonctionSprint('demarrerSprint');
            const maj = exigerFonctionSprint('mettreAJourTacheSprint');
            const retirer = exigerFonctionSprint('retirerTicketSprint');
            const calculer = exigerFonctionSprint('calculerBurndown');
            const ticketsInitiaux = [
                { id: 551, titre: 'Membre A', type: 'story', priorite: 1, points: 5, statut: 'afaire' },
                { id: 552, titre: 'Membre B', type: 'bug', priorite: 2, points: 3, statut: 'enrevue' },
                { id: 553, titre: 'Ajout actif', type: 'tache', priorite: 3, points: 2, statut: 'backlog' }
            ];
            let sprints = sprintsPlanifiesPourTest({ id: 5501, dureeSemaines: 1, dateDebut: DATE_SPRINT_TEST.debut, dateFin: DATE_SPRINT_TEST.finSemaine });
            sprints = ajouter(sprints, ticketsInitiaux, 5501, 551, DATE_SPRINT_TEST.debut).sprints;
            sprints = ajouter(sprints, ticketsInitiaux, 5501, 552, DATE_SPRINT_TEST.debut).sprints;
            sprints = demarrer(sprints, 5501, ticketsInitiaux, DATE_SPRINT_TEST.debut).sprints;
            const ligneIdealeInitiale = calculer(sprints[0], ticketsInitiaux, DATE_SPRINT_TEST.finSemaine).jours.map(j => j.pointsIdeaux);
            let tickets = ticketsInitiaux;
            let r = maj(sprints, tickets, 552, { statut: 'termine' }, '2026-11-03');
            tickets = r.tickets; sprints = r.sprints;
            r = ajouter(sprints, tickets, 5501, 553, '2026-11-04');
            tickets = r.tickets || tickets; sprints = r.sprints;
            r = maj(sprints, tickets, 551, { points: 8 }, '2026-11-05');
            tickets = r.tickets; sprints = r.sprints;
            r = retirer(sprints, 5501, 551, '2026-11-06');
            sprints = r.sprints;
            const apres = calculer(sprints[0], tickets, DATE_SPRINT_TEST.finSemaine).jours;
            const reelsAttendus = [8, 5, 7, 10, 2, 2, 2];
            const ok = apres.length === 7
                && apres.every((j, i) => j.pointsReels === reelsAttendus[i])
                && JSON.stringify(apres.map(j => j.pointsIdeaux)) === JSON.stringify(ligneIdealeInitiale)
                && ligneIdealeInitiale[0] === 8 && ligneIdealeInitiale[6] === 0
                && tickets.map(t => t.statut).join() === 'afaire,termine,backlog';
            return { ok, detail: `Points réels par jour : ${apres.map(j => j.pointsReels).join(', ')} (attendu ${reelsAttendus.join(', ')})\nLigne idéale inchangée : ${JSON.stringify(apres.map(j => j.pointsIdeaux)) === JSON.stringify(ligneIdealeInitiale)} · statuts après changements : ${tickets.map(t => t.statut).join(', ')}` };
        } },
        { code: 'T56', nom: 'Garde d’initialisation · le clic de T46 ne sauvegarde pas avant charger()', run: () => {
            const ok = ecrituresNavigationAvantChargement === 0;
            return { ok, detail: ecrituresNavigationAvantChargement === null
                ? 'Aucune preuve isolée du clic de T46 avant le chargement.'
                : `${ecrituresNavigationAvantChargement} écriture(s) interceptée(s) pendant le premier clic et le retour de T46 avant charger()` };
        } }
    );

    // Lance les tests ; une exception compte comme un échec, sans arrêter les autres
    function lancerTests(tests) {
        return tests.map(t => {
            try { return { code: t.code, nom: t.nom, ...t.run() }; }
            catch (e) { return { code: t.code, nom: t.nom, ok: false, detail: `Exception : ${e.message}` }; }
        });
    }

    initialiserTaskFlow();
