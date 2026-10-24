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
    emptyBody:
      'Angka di sini akan terisi setelah kamu bermain. Permainan pertama, Susun Ayat, sedang disiapkan.',
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
      description: 'Susun potongan ayat Al-Qur’an ke urutan yang benar.',
    },
  },
  susunAyatEntry: {
    intro:
      'Susun ayat-ayat utuh ke urutan yang benar. Ketuk kartu untuk menempatkannya, atau tahan lalu seret. Tidak ada batas waktu.',
    challengesTitle: 'Tantangan',
    levelTitle: '{{surah}} · ayat {{from}}–{{to}}',
    ayahCount: '{{count}} ayat',
    completed: 'Selesai',
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
    instructions: 'Susun ayat dari atas ke bawah sesuai urutannya.',
    slotLabel: 'Urutan {{number}}',
    emptySlot: 'Ketuk kartu di bawah untuk mengisi',
    poolTitle: 'Kartu ayat',
    poolEmpty: 'Semua kartu sudah ditempatkan.',
    check: 'Periksa',
    hint: 'Petunjuk ({{count}})',
    noHints: 'Petunjuk habis',
    hintLocked: 'Dikunci oleh petunjuk',
    tryAgain: 'Hampir! Kartu yang ditandai belum di tempatnya. Coba tukar lagi.',
    fillAll: 'Isi semua urutan dulu, lalu periksa.',
    cardHintPool: 'Ketuk untuk menempatkan di urutan kosong berikutnya. Tahan untuk menyeret.',
    cardHintPlaced: 'Ketuk untuk mengembalikan ke kumpulan kartu. Tahan untuk menyeret.',
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
    unlockedTitle: 'Belum ada catatan hafalan',
    unlockedBody:
      'Pelacak hafalan sedang dikembangkan. Nanti kamu bisa memilih rentang ayat dan menandai statusnya sendiri.',
    statuses: 'Status yang direncanakan: sedang dipelajari, diulang, hafal.',
  },
  statistics: {
    gameTitle: 'Aktivitas permainan',
    gameCaption: 'Dihitung otomatis dari permainan di perangkat ini.',
    hafalanTitle: 'Hafalan (dicatat sendiri)',
    hafalanCaption:
      'Hafalan hanya berubah jika kamu mencatatnya sendiri. Skor permainan tidak memengaruhinya.',
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
      'Efek suara pendek untuk ketukan dan penyelesaian akan hadir nanti. Tidak ada musik latar.',
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
