import type {Locale} from '@/content/dictionary';

/*
 * Copy for homepage sections 02–04. Product nouns (Entries, Till, Closures, Staff, Cash report,
 * "Renewals to verify", "Shift uncovered tomorrow", …) are taken from the approved Aureon mockups
 * (apps/mockups: components/gestionale/nav.tsx, i18n/dictionaries.ts, components/shared/app-shell.tsx).
 * Every interface scene is illustrative: no people, figures, IDs or live data.
 */

export type RoleId = 'member' | 'desk' | 'manager';
export type StationIcon = 'entry' | 'schedule' | 'team' | 'overview';

export interface Station { icon: StationIcon; title: string; text: string; who: string[] }
export interface Callout { title: string; text: string }
export interface ProductRole {
  id: RoleId; tab: string; hint: string; eyebrow: string; title: string; text: string;
  callouts: [Callout, Callout, Callout];
}
export interface Moment { time: string; title: string; origin: RoleId; lanes: Record<RoleId, string | null> }


export type DetailId = 'member' | 'schedule' | 'desk' | 'radio';
export interface Detail {
  id: DetailId; title: string; body: string; points: [string, string, string]; caption: string;
  card: {label: string; rows: [string, string][]};
}

export interface SectionsCopy {
  s02: {
    kicker: string; title: [string, string]; lead: string;
    imageAlt: string; imageLabel: string; imageNote: string;
    pathLabel: string; stations: [Station, Station, Station, Station]; note: string;
  };
  s03: {
    kicker: string; title: string; lead: string; disclosure: string; selector: string; anatomy: string;
    roles: [ProductRole, ProductRole, ProductRole];
    ui: {
      member: { today: string; greeting: string; nextClass: string; className: string; classMeta: string; appointment: string; appointmentName: string; appointmentMeta: string; progress: string; progressNote: string; book: string; bookings: string; bookingList: [string, string][]; tabs: [string, string, string, string, string] };
      desk: { app: string; nav: string[]; view: string; today: string; columns: [string, string, string]; statuses: [string, string, string, string]; classes: string; classList: [string, string][]; notice: string; noticeText: string };
      manager: { app: string; nav: string[]; view: string; week: string; notices: [string, string, string]; chartA: string; chartB: string; staff: string; staffRows: [string, string, string] };
    };
  };
  s04: {
    kicker: string; title: string; lead: string; lanes: Record<RoleId, string>;
    stepLabel: string; prev: string; next: string; starts: string; inView: string; note: string;
    moments: [Moment, Moment, Moment, Moment, Moment];
    outro: string; outroLink: string;
  };
  s05: { kicker: string; title: string; lead: string; note: string; items: [Detail, Detail, Detail, Detail] };
  s06: {
    kicker: string; title: [string, string]; bodyWithApp: string; bodyNoApp: string;
    explore: string; openApp: string; previewNote: string; revisit: string; revisitLinks: [string, string][]; caption: string;
  };
  footer: { platform: string; language: string; tagline: string };
}

export const sections: Record<Locale, SectionsCopy> = {
  en: {
    s02: {
      kicker: 'ONE COHERENT SYSTEM',
      title: ['A gym is more', 'than its equipment.'],
      lead: 'Every visit crosses a door, a timetable, a team and a set of decisions. Aureon connects those moments, and each person works from the view built for their job.',
      imageAlt: 'Close-up of a loaded barbell resting in a power rack, with the Aureon chevron lit on a timber wall behind it.',
      imageLabel: 'THE FLOOR',
      imageNote: 'Where every visit starts',
      pathLabel: 'From the training floor to the office',
      stations: [
        {icon: 'entry', title: 'Entries', text: 'Arrivals are recorded at the front desk, next to the member’s record and membership.', who: ['Member', 'Reception']},
        {icon: 'schedule', title: 'Classes & agenda', text: 'Classes, the course timetable and trainer appointments share one calendar.', who: ['Course coordinator', 'Personal trainer']},
        {icon: 'team', title: 'Team', text: 'Shifts, tasks and leave keep the people running the club in step.', who: ['Reception', 'Coordinators']},
        {icon: 'overview', title: 'Management', text: 'Memberships, staff, till closures and complaints come together in the manager’s overview.', who: ['Manager']},
      ],
      note: 'Modules and roles as defined in the current Aureon product.',
    },
    s03: {
      kicker: 'THE PLATFORM IN CONTEXT',
      title: 'Different roles. One connected picture.',
      lead: 'Pick a perspective. The same club looks different from the member’s phone, the front desk and the manager’s office.',
      disclosure: 'Representative concept based on the Aureon product structure. No live data.',
      selector: 'Choose a perspective',
      anatomy: 'What you’re looking at',
      roles: [
        {id: 'member', tab: 'Member', hint: 'In the app', eyebrow: 'MEMBER EXPERIENCE', title: 'Your training, within reach.', text: 'Classes, bookings, trainer appointments and progress, organised around one member’s week.',
          callouts: [{title: 'Next class', text: 'Booked sessions appear first, with time and place.'}, {title: 'Trainer appointment', text: 'Personal-trainer time sits beside the class timetable.'}, {title: 'Member sections', text: 'Dashboard, Training, Agenda, Bookings and Profile, the member’s own navigation.'}]},
        {id: 'desk', tab: 'Front desk', hint: 'At reception', eyebrow: 'FRONT DESK', title: 'The details that shape a welcome.', text: 'Entries, member records, memberships and the till: the desk’s day in the order reception actually uses it.',
          callouts: [{title: 'Entries', text: 'Each arrival is listed with the membership status the desk needs to see.'}, {title: 'Today’s classes', text: 'The day’s timetable stays in view while people check in.'}, {title: 'Notices', text: 'Items such as renewals to verify are raised for the desk to handle.'}]},
        {id: 'manager', tab: 'Management', hint: 'In the office', eyebrow: 'CLUB MANAGEMENT', title: 'See how the whole club fits.', text: 'Members, memberships, staff, till closures and complaints: the manager reads the club rather than running the desk.',
          callouts: [{title: 'This week', text: 'Notices like a ready weekly report or an uncovered shift come to the manager.'}, {title: 'Overview', text: 'Operational views summarise the club. Shown here without data.'}, {title: 'Manager sections', text: 'Staff, Cash report, Closures and Complaints sit in the manager’s own navigation.'}]},
      ],
      ui: {
        member: {today: 'Today', greeting: 'Your week at the club', nextClass: 'Next class', className: 'Strength foundations', classMeta: '18:30 · Studio 2', appointment: 'Trainer appointment', appointmentName: 'Programme review', appointmentMeta: 'Thu · 09:15', progress: 'Progress', progressNote: 'Training log', book: 'Book', bookings: 'Upcoming bookings', bookingList: [['Mobility', 'Sat · 10:00'], ['Indoor cycling', 'Mon · 19:00']], tabs: ['Dashboard', 'Training', 'Agenda', 'Bookings', 'Profile']},
        desk: {app: 'Reception', nav: ['Dashboard', 'Members', 'Memberships', 'CRM', 'Till', 'Entries', 'Classes', 'Tasks'], view: 'Entries', today: 'Today', columns: ['Member', 'Time', 'Status'], statuses: ['Active', 'Renewal to verify', 'Active', 'Class booked'], classes: 'Today’s classes', classList: [['07:00', 'Mobility'], ['12:30', 'Functional circuit'], ['18:30', 'Strength foundations'], ['20:00', 'Indoor cycling']], notice: 'Renewals to verify', noticeText: 'Review before the evening shift'},
        manager: {app: 'Manager', nav: ['Dashboard', 'Members', 'Missed', 'Memberships', 'Staff', 'Cash report', 'Tasks', 'Calendar', 'Closures', 'Complaints'], view: 'Dashboard', week: 'This week', notices: ['Weekly report ready', 'Shift uncovered tomorrow', 'Till closures to read'], chartA: 'Memberships', chartB: 'Entries by hour', staff: 'Staff on shift', staffRows: ['Reception', 'Course coordinator', 'Personal trainer']},
      },
    },
    s04: {
      kicker: 'ONE CLUB, THREE VIEWPOINTS',
      title: 'One connected day.',
      lead: 'Follow a single day at the club. Each moment starts with one person and shows up in someone else’s view. That is the system at work.',
      lanes: {member: 'Member', desk: 'Front desk', manager: 'Management'},
      stepLabel: 'Moment', prev: 'Previous moment', next: 'Next moment', starts: 'Starts here', inView: 'In view', note: 'An illustrative day. Not live data.',
      moments: [
        {time: '07:10', title: 'Tonight’s class, booked', origin: 'member', lanes: {member: 'Books a place in the 18:30 class from the app.', desk: 'Tonight’s class list includes the booking.', manager: 'The calendar shows the day’s classes.'}},
        {time: '09:30', title: 'An arrival', origin: 'member', lanes: {member: 'Arrives at the club for a morning session.', desk: 'The visit is recorded in Entries.', manager: 'Entries feed the club overview.'}},
        {time: '13:00', title: 'A renewal to check', origin: 'desk', lanes: {member: 'Receives a notification about the membership.', desk: 'A notice flags renewals to verify.', manager: 'Memberships stay visible in the manager’s view.'}},
        {time: '17:30', title: 'Tomorrow’s cover', origin: 'manager', lanes: {member: null, desk: 'Reception plans cover through shifts and tasks.', manager: 'Spots a shift uncovered tomorrow.'}},
        {time: '22:00', title: 'Closing the day', origin: 'desk', lanes: {member: 'Sees tomorrow’s agenda in the app.', desk: 'Closes the shift and the till.', manager: 'Reads the closures and the weekly report.'}},
      ],
      outro: 'Every one of these moments is a real workflow in the product.',
      outroLink: 'Look closer at the details',
    },
    s05: {
      kicker: 'A CLOSER LOOK',
      title: 'Behind every session, the platform at work.',
      lead: 'Four parts of the product, explained plainly. Open one to see where it lives in the club.',
      note: 'Illustrative scenes and interface details. What each club sees depends on its own setup.',
      items: [
        {id: 'member', title: 'Member journeys', body: 'Members get their own view of the club: profile, membership, training, progress and bookings in one place. Each club decides what its members see.', points: ['Profile & membership', 'Training & progress', 'Configured per club'], caption: 'Training floor · the member’s side',
          card: {label: 'Member view', rows: [['Membership', 'Active'], ['Next class', '18:30'], ['Training log', 'This week']]}},
        {id: 'schedule', title: 'Scheduling that connects', body: 'Classes, the course timetable and personal-trainer appointments are planned in the same system members book from, so the club and its members share one calendar.', points: ['Classes & timetable', 'Trainer appointments', 'Member bookings'], caption: 'Functional area · class and trainer time',
          card: {label: 'Thursday', rows: [['07:00', 'Mobility · class'], ['09:15', 'Programme review · trainer'], ['18:30', 'Strength foundations · class']]}},
        {id: 'desk', title: 'A working front desk', body: 'Entries, member records, memberships and the till are laid out in the order reception uses them, with notices such as renewals to verify.', points: ['Entries', 'Members & memberships', 'Till & shift close'], caption: 'From the desk · the whole floor in view',
          card: {label: 'Entries · Today', rows: [['07:12', 'Active'], ['07:40', 'Renewal to verify'], ['08:05', 'Active']]}},
        {id: 'radio', title: 'Sound, part of the space', body: 'Aureon Radio plays from a browser: an audio library, playlists, a schedule and announcements for the club floor. No extra radio hardware is required.', points: ['Library & playlists', 'Schedule', 'Announcements'], caption: 'Overhead · light and sound for the room',
          card: {label: 'Radio · Now playing', rows: [['Playlist', 'Morning floor'], ['Schedule', 'Evening classes'], ['Announcement', '18:25']]}},
      ],
    },
    s06: {
      kicker: 'READY WHEN YOUR CLUB IS',
      title: ['The best experience', 'is the one that feels connected.'],
      bodyWithApp: 'Already using Aureon? Open your gym’s verified application, or keep exploring what sits behind it.',
      bodyNoApp: 'Take another look at how Aureon connects members, the front desk and management, one club at a time.',
      explore: 'Explore the platform', openApp: 'Open your club’s app',
      previewNote: 'App entry is not configured in this preview.',
      revisit: 'Revisit',
      revisitLinks: [['platform', 'One coherent system'], ['connected', 'Different roles'], ['gyms', 'One connected day'], ['details', 'A closer look']],
      caption: 'AUREON · THE CLUB, CONNECTED',
    },
    footer: {platform: 'Platform', language: 'Language', tagline: 'Members, front desk and management, connected.'},
  },
  sq: {
    s02: {
      kicker: 'NJË SISTEM I LIDHUR',
      title: ['Një palestër është më shumë', 'se pajisjet e saj.'],
      lead: 'Çdo vizitë kalon nga dera, orari, ekipi dhe vendimet e përditshme. Aureon i lidh këto momente, ndërsa secili punon me pamjen e ndërtuar për rolin e vet.',
      imageAlt: 'Pamje nga afër e një shufre me pesha mbi një rack force, me shenjën Aureon të ndriçuar në murin prej druri.',
      imageLabel: 'SALLA',
      imageNote: 'Aty ku nis çdo vizitë',
      pathLabel: 'Nga salla e stërvitjes te zyra',
      stations: [
        {icon: 'entry', title: 'Hyrjet', text: 'Mbërritjet regjistrohen në recepsion, pranë kartelës dhe anëtarësimit të anëtarit.', who: ['Anëtari', 'Recepsioni']},
        {icon: 'schedule', title: 'Klasat dhe agjenda', text: 'Klasat, orari i kurseve dhe takimet me trajnerin ndajnë të njëjtin kalendar.', who: ['Koordinatori i kurseve', 'Trajneri personal']},
        {icon: 'team', title: 'Ekipi', text: 'Turnet, detyrat dhe lejet e mbajnë stafin të koordinuar.', who: ['Recepsioni', 'Koordinatorët']},
        {icon: 'overview', title: 'Drejtimi', text: 'Anëtarësimet, stafi, mbylljet e arkës dhe ankesat bashkohen në pamjen e menaxherit.', who: ['Menaxheri']},
      ],
      note: 'Modulet dhe rolet sipas produktit aktual Aureon.',
    },
    s03: {
      kicker: 'PLATFORMA NË PRAKTIKË',
      title: 'Role të ndryshme. Një pamje e lidhur.',
      lead: 'Zgjidhni një këndvështrim. E njëjta palestër duket ndryshe nga telefoni i anëtarit, nga recepsioni dhe nga zyra e menaxherit.',
      disclosure: 'Koncept përfaqësues bazuar në strukturën e produktit Aureon. Pa të dhëna reale.',
      selector: 'Zgjidhni një këndvështrim',
      anatomy: 'Çfarë po shihni',
      roles: [
        {id: 'member', tab: 'Anëtari', hint: 'Në aplikacion', eyebrow: 'PËRVOJA E ANËTARIT', title: 'Stërvitja juaj, gjithmonë pranë.', text: 'Klasat, rezervimet, takimet me trajnerin dhe progresi, të organizuara rreth javës së një anëtari.',
          callouts: [{title: 'Klasa e radhës', text: 'Seancat e rezervuara shfaqen të parat, me orë dhe vend.'}, {title: 'Takimi me trajnerin', text: 'Koha me trajnerin personal qëndron pranë orarit të klasave.'}, {title: 'Seksionet e anëtarit', text: 'Paneli, Stërvitja, Agjenda, Rezervimet dhe Profili, navigimi i vetë anëtarit.'}]},
        {id: 'desk', tab: 'Recepsioni', hint: 'Në sportel', eyebrow: 'RECEPSIONI', title: 'Detajet që krijojnë mirëpritjen.', text: 'Hyrjet, kartelat e anëtarëve, anëtarësimet dhe arka: dita e recepsionit në rendin që e përdor realisht.',
          callouts: [{title: 'Hyrjet', text: 'Çdo mbërritje shfaqet me statusin e anëtarësimit që i duhet recepsionit.'}, {title: 'Klasat e sotme', text: 'Orari i ditës mbetet i dukshëm ndërsa njerëzit hyjnë.'}, {title: 'Njoftimet', text: 'Çështje si rinovimet për t’u verifikuar i dalin recepsionit për t’i trajtuar.'}]},
        {id: 'manager', tab: 'Drejtimi', hint: 'Në zyrë', eyebrow: 'DREJTIMI I PALESTRËS', title: 'Gjithçka në një pamje më të qartë.', text: 'Anëtarët, anëtarësimet, stafi, mbylljet e arkës dhe ankesat: menaxheri e lexon palestrën, nuk e drejton sportelin.',
          callouts: [{title: 'Këtë javë', text: 'Njoftime si raporti javor gati ose një turn i pambuluar i vijnë menaxherit.'}, {title: 'Përmbledhja', text: 'Pamjet operacionale përmbledhin palestrën. Këtu pa të dhëna.'}, {title: 'Seksionet e menaxherit', text: 'Stafi, Raporti i arkës, Mbylljet dhe Ankesat janë në navigimin e menaxherit.'}]},
      ],
      ui: {
        member: {today: 'Sot', greeting: 'Java juaj në palestër', nextClass: 'Klasa e radhës', className: 'Bazat e forcës', classMeta: '18:30 · Studio 2', appointment: 'Takim me trajnerin', appointmentName: 'Rishikimi i programit', appointmentMeta: 'Enj · 09:15', progress: 'Progresi', progressNote: 'Ditari i stërvitjes', book: 'Rezervo', bookings: 'Rezervimet e ardhshme', bookingList: [['Lëvizshmëri', 'Sht · 10:00'], ['Çiklizëm në sallë', 'Hën · 19:00']], tabs: ['Paneli', 'Stërvitja', 'Agjenda', 'Rezervimet', 'Profili']},
        desk: {app: 'Recepsioni', nav: ['Paneli', 'Anëtarët', 'Anëtarësimet', 'CRM', 'Arka', 'Hyrjet', 'Klasat', 'Detyrat'], view: 'Hyrjet', today: 'Sot', columns: ['Anëtari', 'Ora', 'Statusi'], statuses: ['Aktiv', 'Rinovim për verifikim', 'Aktiv', 'Klasë e rezervuar'], classes: 'Klasat e sotme', classList: [['07:00', 'Lëvizshmëri'], ['12:30', 'Qark funksional'], ['18:30', 'Bazat e forcës'], ['20:00', 'Çiklizëm në sallë']], notice: 'Rinovime për t’u verifikuar', noticeText: 'Kontrolloni para turnit të mbrëmjes'},
        manager: {app: 'Menaxheri', nav: ['Paneli', 'Anëtarët', 'Të humburit', 'Anëtarësimet', 'Stafi', 'Raporti i arkës', 'Detyrat', 'Kalendari', 'Mbylljet', 'Ankesat'], view: 'Paneli', week: 'Këtë javë', notices: ['Raporti javor është gati', 'Turn i pambuluar nesër', 'Mbyllje arke për t’u lexuar'], chartA: 'Anëtarësimet', chartB: 'Hyrjet sipas orës', staff: 'Stafi në turn', staffRows: ['Recepsioni', 'Koordinatori i kurseve', 'Trajneri personal']},
      },
    },
    s04: {
      kicker: 'NJË PALESTËR, TRE KËNDVËSHTRIME',
      title: 'Një ditë e lidhur.',
      lead: 'Ndiqni një ditë të vetme në palestër. Çdo moment nis nga një person dhe shfaqet në pamjen e dikujt tjetër. Ky është sistemi në punë.',
      lanes: {member: 'Anëtari', desk: 'Recepsioni', manager: 'Drejtimi'},
      stepLabel: 'Momenti', prev: 'Momenti i mëparshëm', next: 'Momenti tjetër', starts: 'Nis këtu', inView: 'E sheh', note: 'Një ditë ilustruese. Pa të dhëna reale.',
      moments: [
        {time: '07:10', title: 'Klasa e mbrëmjes, e rezervuar', origin: 'member', lanes: {member: 'Rezervon një vend në klasën e 18:30 nga aplikacioni.', desk: 'Lista e klasës së mbrëmjes përfshin rezervimin.', manager: 'Kalendari tregon klasat e ditës.'}},
        {time: '09:30', title: 'Një mbërritje', origin: 'member', lanes: {member: 'Mbërrin në palestër për një seancë mëngjesi.', desk: 'Vizita regjistrohet te Hyrjet.', manager: 'Hyrjet ushqejnë përmbledhjen e palestrës.'}},
        {time: '13:00', title: 'Një rinovim për të kontrolluar', origin: 'desk', lanes: {member: 'Merr një njoftim për anëtarësimin.', desk: 'Një njoftim sinjalizon rinovimet për t’u verifikuar.', manager: 'Anëtarësimet mbeten të dukshme në pamjen e menaxherit.'}},
        {time: '17:30', title: 'Mbulimi i nesërm', origin: 'manager', lanes: {member: null, desk: 'Recepsioni planifikon mbulimin me turne dhe detyra.', manager: 'Vë re një turn të pambuluar për nesër.'}},
        {time: '22:00', title: 'Mbyllja e ditës', origin: 'desk', lanes: {member: 'Shikon agjendën e nesërme në aplikacion.', desk: 'Mbyll turnin dhe arkën.', manager: 'Lexon mbylljet dhe raportin javor.'}},
      ],
      outro: 'Secili prej këtyre momenteve është një proces real në produkt.',
      outroLink: 'Shikoni detajet nga afër',
    },
    s05: {
      kicker: 'MË NË DETAJE',
      title: 'Pas çdo seance, platforma në punë.',
      lead: 'Katër pjesë të produktit, të shpjeguara thjesht. Hapni një për të parë ku jeton në palestër.',
      note: 'Skena dhe detaje ndërfaqeje ilustruese. Ajo që sheh çdo palestër varet nga konfigurimi i saj.',
      items: [
        {id: 'member', title: 'Rrugëtimi i anëtarit', body: 'Anëtarët kanë pamjen e tyre të palestrës: profilin, anëtarësimin, stërvitjen, progresin dhe rezervimet në një vend. Çdo palestër vendos çfarë shohin anëtarët e saj.', points: ['Profili dhe anëtarësimi', 'Stërvitja dhe progresi', 'Konfigurim për çdo palestër'], caption: 'Salla e stërvitjes · ana e anëtarit',
          card: {label: 'Pamja e anëtarit', rows: [['Anëtarësimi', 'Aktiv'], ['Klasa e radhës', '18:30'], ['Ditari i stërvitjes', 'Këtë javë']]}},
        {id: 'schedule', title: 'Orari i lidhur', body: 'Klasat, orari i kurseve dhe takimet me trajnerin personal planifikohen në të njëjtin sistem nga i cili rezervojnë anëtarët, ndaj palestra dhe anëtarët ndajnë një kalendar.', points: ['Klasat dhe orari', 'Takimet me trajnerin', 'Rezervimet e anëtarëve'], caption: 'Zona funksionale · koha e klasave dhe trajnerëve',
          card: {label: 'E enjte', rows: [['07:00', 'Lëvizshmëri · klasë'], ['09:15', 'Rishikimi i programit · trajner'], ['18:30', 'Bazat e forcës · klasë']]}},
        {id: 'desk', title: 'Recepsion funksional', body: 'Hyrjet, kartelat e anëtarëve, anëtarësimet dhe arka renditen sipas mënyrës si i përdor recepsioni, me njoftime si rinovimet për t’u verifikuar.', points: ['Hyrjet', 'Anëtarët dhe anëtarësimet', 'Arka dhe mbyllja e turnit'], caption: 'Nga recepsioni · gjithë salla në pamje',
          card: {label: 'Hyrjet · Sot', rows: [['07:12', 'Aktiv'], ['07:40', 'Rinovim për verifikim'], ['08:05', 'Aktiv']]}},
        {id: 'radio', title: 'Tingulli, pjesë e hapësirës', body: 'Aureon Radio luan nga shfletuesi: bibliotekë audio, playlist-a, orar dhe njoftime për sallën. Nuk nevojitet pajisje shtesë radioje.', points: ['Biblioteka dhe playlist-at', 'Orari', 'Njoftimet'], caption: 'Lart · drita dhe tingulli i sallës',
          card: {label: 'Radio · Po luhet', rows: [['Playlist', 'Mëngjesi në sallë'], ['Orari', 'Klasat e mbrëmjes'], ['Njoftim', '18:25']]}},
      ],
    },
    s06: {
      kicker: 'KUR PALESTRA JUAJ ËSHTË GATI',
      title: ['Përvoja më e mirë', 'është ajo që ndihet e lidhur.'],
      bodyWithApp: 'E përdorni tashmë Aureon? Hapni aplikacionin e verifikuar të palestrës suaj ose vazhdoni të zbuloni çfarë ka pas tij.',
      bodyNoApp: 'Shikoni sërish si Aureon lidh anëtarët, recepsionin dhe drejtimin, palestër pas palestre.',
      explore: 'Zbulo platformën', openApp: 'Hap aplikacionin e palestrës',
      previewNote: 'Lidhja e aplikacionit nuk është konfiguruar në këtë version prove.',
      revisit: 'Rishikoni',
      revisitLinks: [['platform', 'Një sistem i lidhur'], ['connected', 'Role të ndryshme'], ['gyms', 'Një ditë e lidhur'], ['details', 'Më në detaje']],
      caption: 'AUREON · PALESTRA, E LIDHUR',
    },
    footer: {platform: 'Platforma', language: 'Gjuha', tagline: 'Anëtarët, recepsioni dhe drejtimi, të lidhur.'},
  },
  it: {
    s02: {
      kicker: 'UN SISTEMA CONNESSO',
      title: ['Una palestra è molto più', 'delle sue attrezzature.'],
      lead: 'Ogni visita attraversa un ingresso, un palinsesto, un team e tante decisioni. Aureon collega questi momenti, e ognuno lavora dalla vista pensata per il proprio ruolo.',
      imageAlt: 'Primo piano di un bilanciere carico appoggiato su un rack, con il chevron Aureon illuminato sulla parete in legno.',
      imageLabel: 'LA SALA',
      imageNote: 'Dove inizia ogni visita',
      pathLabel: 'Dalla sala pesi all’ufficio',
      stations: [
        {icon: 'entry', title: 'Ingressi', text: 'Gli arrivi vengono registrati in reception, accanto alla scheda e all’abbonamento del socio.', who: ['Socio', 'Reception']},
        {icon: 'schedule', title: 'Corsi e agenda', text: 'Corsi, palinsesto e appuntamenti con il trainer condividono un unico calendario.', who: ['Coordinatore Corsi', 'Personal Trainer']},
        {icon: 'team', title: 'Team', text: 'Turni, attività e ferie tengono coordinato chi manda avanti il club.', who: ['Reception', 'Coordinatori']},
        {icon: 'overview', title: 'Direzione', text: 'Abbonamenti, staff, chiusure di cassa e reclami confluiscono nella vista del manager.', who: ['Manager']},
      ],
      note: 'Moduli e ruoli come definiti nell’attuale prodotto Aureon.',
    },
    s03: {
      kicker: 'LA PIATTAFORMA NEL CONTESTO',
      title: 'Ruoli diversi. Una visione connessa.',
      lead: 'Scegli una prospettiva. Lo stesso club appare diverso dal telefono del socio, dalla reception e dall’ufficio del manager.',
      disclosure: 'Concept rappresentativo basato sulla struttura del prodotto Aureon. Nessun dato reale.',
      selector: 'Scegli una prospettiva',
      anatomy: 'Cosa stai guardando',
      roles: [
        {id: 'member', tab: 'Socio', hint: 'Nell’app', eyebrow: 'ESPERIENZA SOCIO', title: 'Il tuo allenamento, a portata di mano.', text: 'Corsi, prenotazioni, appuntamenti con il trainer e progressi, organizzati attorno alla settimana del socio.',
          callouts: [{title: 'Prossimo corso', text: 'Le sessioni prenotate compaiono per prime, con orario e sala.'}, {title: 'Appuntamento con il trainer', text: 'Il tempo con il personal trainer sta accanto al palinsesto.'}, {title: 'Sezioni del socio', text: 'Dashboard, Allenamento, Agenda, Prenotazioni e Profilo: la navigazione del socio.'}]},
        {id: 'desk', tab: 'Reception', hint: 'Al banco', eyebrow: 'RECEPTION', title: 'I dettagli di una buona accoglienza.', text: 'Ingressi, schede soci, abbonamenti e cassa: la giornata del banco nell’ordine in cui la reception la usa davvero.',
          callouts: [{title: 'Ingressi', text: 'Ogni arrivo compare con lo stato dell’abbonamento che serve alla reception.'}, {title: 'Corsi di oggi', text: 'Il palinsesto del giorno resta visibile mentre le persone entrano.'}, {title: 'Avvisi', text: 'Voci come i rinnovi da verificare vengono segnalate alla reception.'}]},
        {id: 'manager', tab: 'Direzione', hint: 'In ufficio', eyebrow: 'GESTIONE DEL CLUB', title: 'Una visione più chiara di ogni attività.', text: 'Soci, abbonamenti, staff, chiusure di cassa e reclami: il manager legge il club invece di gestire il banco.',
          callouts: [{title: 'Questa settimana', text: 'Avvisi come il report settimanale pronto o un turno scoperto arrivano al manager.'}, {title: 'Panoramica', text: 'Le viste operative riassumono il club. Qui senza dati.'}, {title: 'Sezioni del manager', text: 'Staff, Report cassa, Chiusure e Reclami sono nella navigazione del manager.'}]},
      ],
      ui: {
        member: {today: 'Oggi', greeting: 'La tua settimana al club', nextClass: 'Prossimo corso', className: 'Fondamentali di forza', classMeta: '18:30 · Sala 2', appointment: 'Appuntamento con il trainer', appointmentName: 'Revisione della scheda', appointmentMeta: 'Gio · 09:15', progress: 'Progressi', progressNote: 'Diario di allenamento', book: 'Prenota', bookings: 'Prossime prenotazioni', bookingList: [['Mobilità', 'Sab · 10:00'], ['Indoor cycling', 'Lun · 19:00']], tabs: ['Dashboard', 'Allenamento', 'Agenda', 'Prenotazioni', 'Profilo']},
        desk: {app: 'Reception', nav: ['Dashboard', 'Soci', 'Abbonamenti', 'CRM', 'Cassa', 'Ingressi', 'Corsi', 'Attività'], view: 'Ingressi', today: 'Oggi', columns: ['Socio', 'Ora', 'Stato'], statuses: ['Attivo', 'Rinnovo da verificare', 'Attivo', 'Corso prenotato'], classes: 'Corsi di oggi', classList: [['07:00', 'Mobilità'], ['12:30', 'Circuito funzionale'], ['18:30', 'Fondamentali di forza'], ['20:00', 'Indoor cycling']], notice: 'Rinnovi da verificare', noticeText: 'Da controllare prima del turno serale'},
        manager: {app: 'Manager', nav: ['Dashboard', 'Soci', 'Mancati', 'Abbonamenti', 'Staff', 'Report cassa', 'Attività', 'Calendario', 'Chiusure', 'Reclami'], view: 'Dashboard', week: 'Questa settimana', notices: ['Report settimanale pronto', 'Turno scoperto domani', 'Chiusure di cassa da leggere'], chartA: 'Abbonamenti', chartB: 'Ingressi per ora', staff: 'Staff in turno', staffRows: ['Reception', 'Coordinatore Corsi', 'Personal Trainer']},
      },
    },
    s04: {
      kicker: 'UN CLUB, TRE PUNTI DI VISTA',
      title: 'Una giornata connessa.',
      lead: 'Segui una sola giornata al club. Ogni momento parte da una persona e compare nella vista di qualcun altro. È il sistema al lavoro.',
      lanes: {member: 'Socio', desk: 'Reception', manager: 'Direzione'},
      stepLabel: 'Momento', prev: 'Momento precedente', next: 'Momento successivo', starts: 'Parte da qui', inView: 'Lo vede', note: 'Una giornata illustrativa. Nessun dato reale.',
      moments: [
        {time: '07:10', title: 'Il corso di stasera, prenotato', origin: 'member', lanes: {member: 'Prenota un posto nel corso delle 18:30 dall’app.', desk: 'La lista del corso di stasera include la prenotazione.', manager: 'Il calendario mostra i corsi del giorno.'}},
        {time: '09:30', title: 'Un arrivo', origin: 'member', lanes: {member: 'Arriva al club per una sessione mattutina.', desk: 'La visita viene registrata negli Ingressi.', manager: 'Gli ingressi alimentano la panoramica del club.'}},
        {time: '13:00', title: 'Un rinnovo da controllare', origin: 'desk', lanes: {member: 'Riceve una notifica sull’abbonamento.', desk: 'Un avviso segnala i rinnovi da verificare.', manager: 'Gli abbonamenti restano visibili nella vista del manager.'}},
        {time: '17:30', title: 'La copertura di domani', origin: 'manager', lanes: {member: null, desk: 'La reception organizza la copertura con turni e attività.', manager: 'Nota un turno scoperto domani.'}},
        {time: '22:00', title: 'La chiusura della giornata', origin: 'desk', lanes: {member: 'Vede l’agenda di domani nell’app.', desk: 'Chiude il turno e la cassa.', manager: 'Legge le chiusure e il report settimanale.'}},
      ],
      outro: 'Ognuno di questi momenti è un flusso reale del prodotto.',
      outroLink: 'Guarda i dettagli da vicino',
    },
    s05: {
      kicker: 'NEL DETTAGLIO',
      title: 'Dietro ogni sessione, la piattaforma al lavoro.',
      lead: 'Quattro parti del prodotto, spiegate con semplicità. Aprine una per vedere dove vive nel club.',
      note: 'Scene e dettagli d’interfaccia illustrativi. Ciò che vede ogni club dipende dalla sua configurazione.',
      items: [
        {id: 'member', title: 'Percorsi dei soci', body: 'I soci hanno la propria vista del club: profilo, abbonamento, allenamento, progressi e prenotazioni in un unico posto. Ogni club decide cosa vedono i suoi soci.', points: ['Profilo e abbonamento', 'Allenamento e progressi', 'Configurato per club'], caption: 'Sala pesi · il lato del socio',
          card: {label: 'Vista socio', rows: [['Abbonamento', 'Attivo'], ['Prossimo corso', '18:30'], ['Diario di allenamento', 'Questa settimana']]}},
        {id: 'schedule', title: 'Pianificazione connessa', body: 'Corsi, palinsesto e appuntamenti con il personal trainer si pianificano nello stesso sistema da cui prenotano i soci, così club e soci condividono un unico calendario.', points: ['Corsi e palinsesto', 'Appuntamenti con il trainer', 'Prenotazioni dei soci'], caption: 'Area funzionale · tempo per corsi e trainer',
          card: {label: 'Giovedì', rows: [['07:00', 'Mobilità · corso'], ['09:15', 'Revisione della scheda · trainer'], ['18:30', 'Fondamentali di forza · corso']]}},
        {id: 'desk', title: 'Una reception operativa', body: 'Ingressi, schede soci, abbonamenti e cassa sono disposti nell’ordine in cui li usa la reception, con avvisi come i rinnovi da verificare.', points: ['Ingressi', 'Soci e abbonamenti', 'Cassa e chiusura turno'], caption: 'Dal banco · tutta la sala sotto controllo',
          card: {label: 'Ingressi · Oggi', rows: [['07:12', 'Attivo'], ['07:40', 'Rinnovo da verificare'], ['08:05', 'Attivo']]}},
        {id: 'radio', title: 'Il suono, parte dello spazio', body: 'Aureon Radio funziona dal browser: libreria audio, playlist, palinsesto e annunci per la sala. Non serve hardware radio aggiuntivo.', points: ['Libreria e playlist', 'Palinsesto', 'Annunci'], caption: 'In alto · luce e suono della sala',
          card: {label: 'Radio · In riproduzione', rows: [['Playlist', 'Mattina in sala'], ['Palinsesto', 'Corsi serali'], ['Annuncio', '18:25']]}},
      ],
    },
    s06: {
      kicker: 'QUANDO IL TUO CLUB È PRONTO',
      title: ['L’esperienza migliore', 'è quella che si sente connessa.'],
      bodyWithApp: 'Usi già Aureon? Apri l’applicazione verificata della tua palestra, oppure continua a scoprire cosa c’è dietro.',
      bodyNoApp: 'Riguarda come Aureon collega soci, reception e direzione, un club alla volta.',
      explore: 'Esplora la piattaforma', openApp: 'Apri l’app del tuo club',
      previewNote: 'Il link dell’app non è configurato in questa anteprima.',
      revisit: 'Rivedi',
      revisitLinks: [['platform', 'Un sistema connesso'], ['connected', 'Ruoli diversi'], ['gyms', 'Una giornata connessa'], ['details', 'Nel dettaglio']],
      caption: 'AUREON · IL CLUB, CONNESSO',
    },
    footer: {platform: 'Piattaforma', language: 'Lingua', tagline: 'Soci, reception e direzione, connessi.'},
  },
};
