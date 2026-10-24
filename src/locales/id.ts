/**
 * Indonesian UI strings. This file defines the canonical key structure;
 * every other locale must provide exactly the same keys (see i18n.test.ts).
 *
 * Quran text never lives here. Difficulty labels are provisional until
 * Islamic terminology is reviewed.
 */
const id = {
  common: {
    appName: 'Suna',
    back: 'Kembali',
    comingSoon: 'Segera hadir',
    locked: 'Terkunci',
    premium: 'Premium',
    devOnly: 'Khusus pengembangan',
    demoData: 'Data contoh',
    loading: 'Memuat…',
  },
  tabs: {
    home: 'Home',
    hafalan: 'Hafalan',
    statistics: 'Statistik',
    profile: 'Profil',
  },
  home: {
    notificationsA11y: 'Buka notifikasi',
    notificationsUnreadA11y: 'Buka notifikasi, ada yang belum dibaca',
    welcomeTitle: 'Selamat datang di Suna',
    welcomeMessage: 'Belajar, susun, dan mainkan.',
    mascotA11y: 'Maskot Suna. Ketuk untuk menyapa.',
    statsTitle: 'Ringkasan kamu',
    gamesTitle: 'Suna Games',
    leaderboardTitle: 'Leaderboard Suna',
    hafalanTitle: 'Daftar hafalan kamu',
  },
  stats: {
    completedChallenges: 'Tantangan selesai',
    practiceSessions: 'Sesi latihan',
    lastActivity: 'Aktivitas terakhir',
    never: 'Belum ada',
    emptyTitle: 'Belum ada aktivitas',
    emptyBody: 'Angka di sini akan terisi setelah kamu bermain. Mulai dengan Susun Ayat di bawah.',
  },
  games: {
    open: 'Lihat',
    availability: {
      available: 'Tersedia',
      preview: 'Dalam pengembangan',
      comingSoon: 'Segera hadir',
    },
    susunAyat: {
      title: 'Susun Ayat',
      description: 'Susun ayat dan kata Al-Qur’an ke urutan yang benar.',
    },
  },
  susunAyatEntry: {
    intro:
      'Susun ayat utuh, atau kata-kata dalam satu ayat, ke urutan yang benar. Seret kartu ke kotak jawaban (atau ketuk). Tidak ada batas waktu.',
    challengesTitle: 'Tantangan',
    levelTitle: '{{surah}} · ayat {{from}}–{{to}}',
    levelTitleWords: '{{surah}} · kata ayat {{from}}–{{to}}',
    levelTitleWordsOne: '{{surah}} · kata ayat {{ayah}}',
    ayahCount: '{{count}} ayat',
    wordCount_one: '{{count}} kata',
    wordCount_other: '{{count}} kata',
    completed: 'Selesai',
    completedTimes_one: 'Selesai',
    completedTimes_other: 'Selesai {{count}}×',
    noHintsBadge: 'Tanpa petunjuk',
    mode: {
      orderAyat: 'Susun ayat',
      orderWords: 'Susun kata',
    },
    difficultyTitle: 'Tingkat kesulitan',
    all: 'Semua',
    difficultyRule: {
      beginner: 'Pemula: 2–4 kartu dan petunjuk paling banyak. Label masih sementara.',
      medium: 'Menengah: 4–7 kartu. Label masih sementara.',
      hard: 'Sulit: 8–12 kata, petunjuk lebih sedikit. Label masih sementara.',
      expert:
        'Ahli: 13 kata atau lebih dari beberapa ayat, tanpa pemisah ayat. Label masih sementara.',
    },
    practiceTitle: 'Latihan acak',
    practiceBody:
      'Membuka tantangan acak sesuai tingkat yang dipilih, mendahulukan yang belum kamu selesaikan.',
    practice: 'Mulai latihan',
    play: 'Mainkan',
    playAgain: 'Main lagi',
    locked: 'Terkunci (premium)',
    difficulty: {
      beginner: 'Pemula',
      medium: 'Menengah',
      hard: 'Sulit',
      expert: 'Ahli',
    },
    difficultyNote: 'Label tingkat kesulitan masih sementara.',
    sourceTitle: 'Sumber teks',
    sourceBody:
      'Teks Al-Qur’an: Tanzil Quran Text ({{type}}, versi {{version}}), lisensi CC BY 3.0. Teks ditampilkan apa adanya tanpa perubahan.',
    sourceLink: 'Buka tanzil.net',
    reviewPending:
      'Peninjauan teks dan pembagian tantangan oleh penelaah yang kompeten masih dalam proses.',
    note: 'Menyelesaikan teka-teki tidak otomatis menandai ayat sebagai hafal.',
  },
  susunAyatPlay: {
    instructionsWords: 'Seret kata ke kotak, dari kanan ke kiri seperti tulisan Arab dibaca.',
    lockedTitle: 'Tantangan ini bagian dari premium',
    lockedBody: 'Tantangan pengenalan gratis tetap terbuka. Pembelian belum tersedia di versi ini.',
    instructions: 'Seret ayat ke kotak, dari atas ke bawah sesuai urutannya.',
    slotLabel: 'Urutan {{number}}',
    emptySlot: 'Seret kartu ke sini',
    poolTitle: 'Kartu ayat',
    poolTitleWords: 'Kartu kata',
    poolEmpty: 'Semua kartu sudah ditempatkan.',
    hint: 'Petunjuk ({{count}})',
    noHints: 'Petunjuk habis',
    hintLocked: 'Dikunci oleh petunjuk',
    tryAgain: 'Hampir! Kartu yang ditandai belum di tempatnya. Coba tukar lagi.',
    cardHintPool: 'Seret ke kotak jawaban, atau ketuk untuk mengisi kotak kosong berikutnya.',
    cardHintPlaced: 'Seret ke kotak lain untuk menukar, atau ketuk untuk mengembalikannya.',
    wrongMark: 'Belum tepat',
    unknownLevel: 'Tantangan tidak ditemukan.',
    results: {
      title: 'Urutannya benar!',
      body: 'Bagus sekali. Ini bacaan lengkapnya:',
      hintsUsed_one: 'Memakai {{count}} petunjuk',
      hintsUsed_other: 'Memakai {{count}} petunjuk',
      noHints: 'Tanpa petunjuk',
      next: 'Tantangan berikutnya',
      backToList: 'Kembali ke daftar',
      ayahNumber: 'Ayat {{number}}',
    },
  },
  leaderboard: {
    demoNotice: 'Ini data contoh untuk pengembangan, bukan peringkat sungguhan.',
    unavailableTitle: 'Leaderboard belum tersedia',
    unavailableBody:
      'Leaderboard online akan hadir nanti dan bersifat opsional. Bermain tetap bisa tanpa akun.',
    points: '{{count}} poin',
    rank: 'Peringkat {{rank}}',
  },
  hafalan: {
    title: 'Pelacak hafalan',
    description:
      'Catat sendiri ayat yang sedang kamu pelajari, ulangi, dan sudah hafal. Catatan hafalan terpisah dari skor permainan.',
    lockedTitle: 'Fitur premium',
    lockedBody:
      'Pelacak hafalan termasuk dalam paket premium. Pembelian belum tersedia di versi ini.',
    learnMore: 'Lihat isi paket premium',
    emptyTitle: 'Belum ada catatan hafalan',
    emptyBody:
      'Tambahkan rentang ayat, lalu tandai sendiri statusnya: sedang dipelajari, diulang, atau hafal.',
    selfReported:
      'Status hanya berubah jika kamu mengubahnya. Menyelesaikan permainan tidak menandai ayat sebagai hafal.',
    add: 'Tambah rentang ayat',
    open: 'Buka pelacak hafalan',
    listTitle: 'Catatan kamu',
    summaryTitle: 'Ringkasan',
    status: {
      learning: 'Sedang dipelajari',
      reviewing: 'Diulang',
      memorized: 'Hafal',
    },
    ayatCount_one: '{{count}} ayat',
    ayatCount_other: '{{count}} ayat',
    ofQuran: '{{memorized}} dari {{total}} ayat Al-Qur’an ditandai hafal',
    surahsTracked: 'Surah dicatat',
    surahsMemorized: 'Surah hafal penuh',
    lastActivity: 'Terakhir dicatat',
    surahLabel: 'Surah {{number}}',
    rangeLabel: 'Ayat {{from}}–{{to}}',
    singleAyahLabel: 'Ayat {{ayah}}',
    entryA11y: '{{surah}}, {{range}}, {{status}}',
    statusSince: '{{status}} sejak {{date}}',
    reviewedOn: 'Terakhir diulang {{date}}',
    editor: {
      newTitle: 'Tambah hafalan',
      editTitle: 'Ubah hafalan',
      surah: 'Surah',
      chooseSurah: 'Pilih surah',
      searchSurah: 'Cari nomor atau nama surah',
      ayahTotal: '{{count}} ayat',
      noSurahFound: 'Surah tidak ditemukan.',
      fromAyah: 'Dari ayat',
      toAyah: 'Sampai ayat',
      wholeSurah: 'Seluruh surah',
      decrease: 'Kurangi {{label}}',
      increase: 'Tambah {{label}}',
      status: 'Status',
      note: 'Catatan (opsional)',
      notePlaceholder: 'Misalnya: setor ke ustadz hari Jumat',
      save: 'Simpan',
      saving: 'Menyimpan…',
      logReview: 'Catat sudah diulang hari ini',
      reviewLogged: 'Murajaah hari ini tercatat.',
      delete: 'Hapus catatan ini',
      deleteConfirm: 'Hapus rentang ini beserta riwayatnya? Tindakan ini tidak bisa dibatalkan.',
      deleteYes: 'Ya, hapus',
      cancel: 'Batal',
      notFound: 'Catatan ini tidak ditemukan. Mungkin sudah dihapus.',
      historyTitle: 'Riwayat',
      saveFailed: 'Gagal menyimpan. Coba lagi.',
      errors: {
        surah: 'Pilih surah terlebih dahulu.',
        bounds: 'Nomor ayat di luar jumlah ayat surah ini.',
        order: 'Ayat awal harus sebelum atau sama dengan ayat akhir.',
        overlap:
          'Rentang ini bertumpuk dengan catatan lain ({{range}}). Ubah catatan itu atau pilih ayat lain.',
      },
    },
    event: {
      created: 'Ditambahkan sebagai “{{status}}”',
      status_changed: 'Status diubah ke “{{status}}”',
      range_changed: 'Rentang ayat diubah',
      reviewed: 'Diulang (murajaah)',
    },
    source: 'Daftar surah dan jumlah ayat: Tanzil Quran Text (Uthmani {{version}}), tanzil.net.',
  },
  statistics: {
    gameTitle: 'Aktivitas permainan',
    gameCaption: 'Dihitung otomatis dari permainan di perangkat ini.',
    hafalanTitle: 'Hafalan (dicatat sendiri)',
    hafalanCaption:
      'Hafalan hanya berubah jika kamu mencatatnya sendiri. Skor permainan tidak memengaruhinya.',
    susunAyat: {
      completed: '{{completed}} dari {{total}} tantangan selesai',
      attempts: 'Percobaan',
      finished: 'Percobaan selesai',
      noHints: 'Selesai tanpa petunjuk',
      activeDays: 'Hari aktif',
      byDifficulty: 'Per tingkat kesulitan',
      byMode: 'Per mode',
      recent: 'Percobaan terakhir',
      recentEmpty: 'Belum ada percobaan.',
      removedLevel: 'Tantangan sudah tidak tersedia',
      statusDone: 'selesai',
      statusLeft: 'belum selesai',
    },
    hafalanEmpty: 'Belum ada catatan hafalan.',
  },
  profile: {
    localTitle: 'Profil lokal',
    localName: 'Pemain Suna',
    localBody: 'Progres disimpan di perangkat ini. Tidak perlu akun untuk bermain.',
    settingsTitle: 'Pengaturan',
    language: 'Bahasa',
    languageSystem: 'Sistem',
    languageId: 'Indonesia',
    languageEn: 'English',
    sound: 'Efek suara',
    soundCaption:
      'Bunyi dan getar pendek saat memindah kartu dan menyelesaikan tantangan. Tidak ada musik latar.',
    reduceMotion: 'Kurangi gerakan',
    reduceMotionCaption: 'Hentikan animasi maskot dan transisi yang tidak perlu.',
    reduceMotionSystem: 'Aktif karena pengaturan sistem perangkat.',
    premiumTitle: 'Premium',
    premiumRow: 'Tentang paket premium',
    aboutTitle: 'Tentang',
    support: 'Bantuan & masukan',
    privacy: 'Kebijakan privasi',
    version: 'Versi {{version}}',
    devTitle: 'Pratinjau entitlement',
    devBody:
      'Hanya untuk pengembangan. Mengubah tampilan terkunci/terbuka, bukan bukti pembelian, dan tidak ada di build produksi.',
  },
  premium: {
    title: 'Paket premium',
    intro:
      'Suna bisa dimainkan gratis. Paket premium adalah pembelian satu kali yang membuka fitur berikut.',
    includesTitle: 'Termasuk',
    susunAyatContents:
      'Saat ini: {{premium}} tantangan premium dari {{premiumSurahs}} surah. {{free}} tantangan pengenalan tetap gratis.',
    excludesTitle: 'Tidak termasuk',
    features: {
      hafalan_tracker: {
        title: 'Pelacak hafalan',
        body: 'Catat status hafalan per rentang ayat secara mandiri.',
      },
      susun_ayat_full: {
        title: 'Susun Ayat lengkap',
        body: 'Semua tantangan Susun Ayat di luar set pengenalan gratis, sesuai daftar konten paket di aplikasi.',
      },
    },
    excludes: {
      futureGames: 'Permainan baru lain di masa depan',
      allQuran: 'Jaminan seluruh isi Al-Qur’an',
      online: 'Fitur online (akun, sinkronisasi, leaderboard)',
    },
    priceNote: 'Harga akan ditampilkan dari App Store atau Google Play saat pembelian tersedia.',
    unavailable: 'Pembelian belum tersedia di versi ini.',
    active: 'Aktif (pratinjau pengembangan)',
  },
  notifications: {
    title: 'Notifikasi',
    emptyTitle: 'Belum ada notifikasi',
    emptyBody: 'Pesan dari Suna akan muncul di sini. Kami tidak mengirim notifikasi push.',
  },
  settings: {
    loadError: 'Gagal memuat pengaturan. Nilai bawaan dipakai.',
  },
};

export default id;

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringRecord<T[K]>;
};

export type TranslationResources = DeepStringRecord<typeof id>;
