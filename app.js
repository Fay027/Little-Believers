// ==========================================
// STATE MANAGEMENT & GLOBAL CONFIG
// ==========================================
let currentAge = '3-5';

// ==========================================
// NAVIGATION SYSTEM
// ==========================================
function openSection(id) {
  // Stop any active Dua audio or speech when switching sections
  stopDuaAudio();

  const homeView = document.getElementById('home-view');
  if (homeView) homeView.style.display = 'none';

  document.querySelectorAll('.sub-view').forEach(v => {
    v.style.display = 'none';
    v.classList.remove('active');
  });
  
  // Checks for either 'duas-view' or 'duas-section'
  const targetView = document.getElementById(id + '-view') || document.getElementById(id + '-section');
  if (targetView) {
    targetView.style.display = 'block';
    targetView.classList.add('active');
  }

  // Trigger section loaders in order
  if (id === 'surahs') showSurahList();
  if (id === 'duas') renderDuas();
  if (id === 'alphabets') renderAlphabet();
  if (id === 'games' && typeof showGameMenu === 'function') showGameMenu();
}

function goHome() {
  // Stop all active audio
  if (activeSurahAudio) pauseAyahAudio();
  stopDuaAudio();

  document.querySelectorAll('.sub-view').forEach(v => {
    v.style.display = 'none';
    v.classList.remove('active');
  });

  showSurahList(); // Resets back to the list for next time

  const homeView = document.getElementById('home-view');
  if (homeView) homeView.style.display = 'block';
}

function playAudio(filename) {
  const audio = new Audio('audio/' + filename);
  audio.play().catch(e => {
    console.log("Audio file missing or blocked:", filename);
  });
}
// ==========================================
// SURAHS MODULE (AYAH BY AYAH)
// ==========================================
const surahsDatabase = {
  fatiha: {
    surahNum: 1,
    title: 'Surah Al-Fatiha', subtitle: 'The Opening • 7 Ayahs', color: '#457B9D',
    ayahs: [
      { id: 1, arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', transliteration: 'Bismillahir-Rahmanir-Rahim', meaning: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
      { id: 2, arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ', transliteration: 'Alhamdu lillahi Rabbil-alamin', meaning: 'Praise be to Allah, Lord of the worlds.' },
      { id: 3, arabic: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', transliteration: 'Ar-Rahmanir-Rahim', meaning: 'The Entirely Merciful, the Especially Merciful.' },
      { id: 4, arabic: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ', transliteration: 'Maliki Yawmid-Din', meaning: 'Sovereign of the Day of Recompense.' },
      { id: 5, arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', transliteration: 'Iyyaka na\'budu wa iyyaka nasta\'in', meaning: 'It is You we worship and You we ask for help.' },
      { id: 6, arabic: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', transliteration: 'Ihdinas-Siratal-Mustaqim', meaning: 'Guide us to the straight path.' },
      { id: 7, arabic: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ', transliteration: 'Siratal-ladhina an\'amta \'alayhim ghayril-maghdubi \'alayhim wa lad-dallin', meaning: 'The path of those upon whom You have bestowed favor, not of those who have earned Your anger or of those who are astray.' }
    ]
  },
  asr: {
    surahNum: 103,
    title: 'Surah Al-Asr', subtitle: 'The Declining Day • 3 Ayahs', color: '#118AB2',
    ayahs: [
      { id: 1, arabic: 'وَالْعَصْرِ', transliteration: 'Wal-\'asr', meaning: 'By time,' },
      { id: 2, arabic: 'إِنَّ الإِنسَانَ لَفِي خُسْرٍ', transliteration: 'Innal-insana lafi khusr', meaning: 'Indeed, mankind is in loss,' },
      { id: 3, arabic: 'إِلاَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', transliteration: 'Illalladhina amanu wa \'amilus-salihati wa tawasaw bil-haqqi wa tawasaw bis-sabr', meaning: 'Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.' }
    ]
  },
  fil: {
    surahNum: 105,
    title: 'Surah Al-Fil', subtitle: 'The Elephant • 5 Ayahs', color: '#8D7B68',
    ayahs: [
      { id: 1, arabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ', transliteration: 'Alam tara kayfa fa\'ala rabbuka bi-ashabil-fil', meaning: 'Have you not considered how your Lord dealt with the companions of the elephant?' },
      { id: 2, arabic: 'أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ', transliteration: 'Alam yaj\'al kaydahum fi tadlil', meaning: 'Did He not make their plan go astray?' },
      { id: 3, arabic: 'وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ', transliteration: 'Wa arsala \'alayhim tayran ababil', meaning: 'And He sent against them birds in flocks,' },
      { id: 4, arabic: 'تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ', transliteration: 'Tarmihim bihijaratim min sijjil', meaning: 'Striking them with stones of hard clay,' },
      { id: 5, arabic: 'فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ', transliteration: 'Fa-ja\'alahum ka\'asfim ma\'kul', meaning: 'And He made them like eaten straw.' }
    ]
  },
  quraish: {
    surahNum: 106,
    title: 'Surah Quraish', subtitle: 'Quraish • 4 Ayahs', color: '#D4A373',
    ayahs: [
      { id: 1, arabic: 'لإِيلافِ قُرَيْشٍ', transliteration: 'Li-ilafi quraish', meaning: 'For the accustomed security of Quraish -' },
      { id: 2, arabic: 'إِيلافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ', transliteration: 'Ilafihim rihlatash-shitai was-saif', meaning: 'Their accustomed security [in] the caravan of winter and summer -' },
      { id: 3, arabic: 'فَلْيَعْبُدُوا رَبَّ هَذَا الْبَيْتِ', transliteration: 'Falya\'budu rabba hadhal-bait', meaning: 'Let them worship the Lord of this House,' },
      { id: 4, arabic: 'الَّذِي أَطْعَمَهُم مِّن جُوعٍ وَآمَنَهُم مِّنْ خَوْفٍ', transliteration: 'Alladhi at\'amahum min ju\'iw-wa amanahum min khawf', meaning: 'Who has fed them, [saving them] from hunger and made them safe, [saving them] from fear.' }
    ]
  },
  maun: {
    surahNum: 107,
    title: 'Surah Al-Ma\'un', subtitle: 'Small Kindnesses • 7 Ayahs', color: '#2A9D8F',
    ayahs: [
      { id: 1, arabic: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ', transliteration: 'Ara\'aytalladhi yukadhibu bid-din', meaning: 'Have you seen the one who denies the Recompense?' },
      { id: 2, arabic: 'فَذَلِكَ الَّذِي يَدُعُّ الْيَتِيمَ', transliteration: 'Fadhalikalladhi yadu\'\'ul-yatim', meaning: 'For that is the one who drives away the orphan' },
      { id: 3, arabic: 'وَلا يَحُضُّ عَلَى طَعَامِ الْمِسْكِينِ', transliteration: 'Wa la yahuddu \'ala ta\'amil-miskin', meaning: 'And does not encourage the feeding of the poor.' },
      { id: 4, arabic: 'فَوَيْلٌ لِّلْمُصَلِّينَ', transliteration: 'Fawaylul-lil-musallin', meaning: 'So woe to those who pray' },
      { id: 5, arabic: 'الَّذِينَ هُمْ عَن صَلاتِهِمْ سَاهُونَ', transliteration: 'Alladhina hum \'an salatihim sahun', meaning: 'Who are heedless of their prayer -' },
      { id: 6, arabic: 'الَّذِينَ هُمْ يُرَاؤُونَ', transliteration: 'Alladhina hum yura\'un', meaning: 'Those who make a show [of their deeds]' },
      { id: 7, arabic: 'وَيَمْنَعُونَ الْمَاعُونَ', transliteration: 'Wa yamna\'unal-ma\'un', meaning: 'And withhold simple assistance.' }
    ]
  },
  kawthar: {
    surahNum: 108,
    title: 'Surah Al-Kawthar', subtitle: 'Abundance • 3 Ayahs', color: '#E76F51',
    ayahs: [
      { id: 1, arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', transliteration: 'Inna a\'tainakal-kawthar', meaning: 'Indeed, We have granted you, [O Muhammad], al-Kawthar.' },
      { id: 2, arabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ', transliteration: 'Fasalli lirabbika wanhar', meaning: 'So pray to your Lord and sacrifice [to Him alone].' },
      { id: 3, arabic: 'إِنَّ شَانِئَكَ هُوَ الأَبْتَرُ', transliteration: 'Inna shani\'aka huwal-abtar', meaning: 'Indeed, your enemy is the one cut off.' }
    ]
  },
  kafirun: {
    surahNum: 109,
    title: 'Surah Al-Kafirun', subtitle: 'The Disbelievers • 6 Ayahs', color: '#38B000',
    ayahs: [
      { id: 1, arabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ', transliteration: 'Qul ya ayyuhal-kafirun', meaning: 'Say, "O disbelievers,' },
      { id: 2, arabic: 'لَا أَعْبُدُ مَا تَعْبُدُونَ', transliteration: 'La a\'budu ma ta\'budun', meaning: 'I do not worship what you worship.' },
      { id: 3, arabic: 'وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ', transliteration: 'Wa la antum \'abiduna ma a\'bud', meaning: 'Nor are you worshippers of what I worship.' },
      { id: 4, arabic: 'وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ', transliteration: 'Wa la ana \'abidum ma \'abadtum', meaning: 'Nor will I be a worshipper of what you worship.' },
      { id: 5, arabic: 'وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ', transliteration: 'Wa la antum \'abiduna ma a\'bud', meaning: 'Nor will you be worshippers of what I worship.' },
      { id: 6, arabic: 'لَكُمْ دِينُكُمْ وَلِيَ دِينِ', transliteration: 'Lakum dinukum wa liya din', meaning: 'For you is your religion, and for me is my religion."' }
    ]
  },
  nasr: {
    surahNum: 110,
    title: 'Surah An-Nasr', subtitle: 'The Divine Support • 3 Ayahs', color: '#F4A261',
    ayahs: [
      { id: 1, arabic: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ', transliteration: 'Idha jaa nasrullahi wal-fath', meaning: 'When the victory of Allah has come and the conquest,' },
      { id: 2, arabic: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا', transliteration: 'Wa ra\'aitan-nasa yadkhuluna fi dinillahi afwaja', meaning: 'And you see the people entering the religion of Allah in multitudes,' },
      { id: 3, arabic: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ إِنَّهُ كَانَ تَوَّابًا', transliteration: 'Fasabbih bihamdi rabbika wastaghfirh, innahu kana tawwaba', meaning: 'Then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance.' }
    ]
  },
  masad: {
    surahNum: 111,
    title: 'Surah Al-Masad', subtitle: 'The Palm Fiber • 5 Ayahs', color: '#A8201A',
    ayahs: [
      { id: 1, arabic: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ', transliteration: 'Tabbat yada abi lahabiw-wa tabb', meaning: 'May the hands of Abu Lahab be ruined, and ruined is he.' },
      { id: 2, arabic: 'مَا أَغْنَى عَنْهُ مَالُهُ وَمَا كَسَبَ', transliteration: 'Ma aghna \'anhu maluhu wa ma kasab', meaning: 'His wealth will not avail him or that which he gained.' },
      { id: 3, arabic: 'سَيَصْلَى نَارًا ذَاتَ لَهَبٍ', transliteration: 'Sayasla naran dhata lahab', meaning: 'He will [enter to] burn in a Fire of [blazing] flame' },
      { id: 4, arabic: 'وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ', transliteration: 'Wamra\'atuhu hammalatal-hatab', meaning: 'And his wife [as well] - the carrier of firewood.' },
      { id: 5, arabic: 'فِي جِيدِهَا حَبْلٌ مِّن مَّسَدٍ', transliteration: 'Fi jidiha hablum mim masad', meaning: 'Around her neck is a rope of twisted fiber.' }
    ]
  },
  ikhlas: {
    surahNum: 112,
    title: 'Surah Al-Ikhlas', subtitle: 'The Sincerity • 4 Ayahs', color: '#E8A800',
    ayahs: [
      { id: 1, arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', transliteration: 'Qul huwallahu ahad', meaning: 'Say, "He is Allah, [who is] One,' },
      { id: 2, arabic: 'اللَّهُ الصَّمَدُ', transliteration: 'Allahus-samad', meaning: 'Allah, the Eternal Refuge.' },
      { id: 3, arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', transliteration: 'Lam yalid wa lam yulad', meaning: 'He neither begets nor is born,' },
      { id: 4, arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', transliteration: 'Wa lam yakul lahu kufuwan ahad', meaning: 'Nor is there to Him any equivalent."' }
    ]
  },
  falaq: {
    surahNum: 113,
    title: 'Surah Al-Falaq', subtitle: 'The Daybreak • 5 Ayahs', color: '#7B2CBF',
    ayahs: [
      { id: 1, arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', transliteration: 'Qul a\'udhu birabbil-falaq', meaning: 'Say, "I seek refuge in the Lord of daybreak' },
      { id: 2, arabic: 'مِن شَرِّ مَا خَلَقَ', transliteration: 'Min sharri ma khalaq', meaning: 'From the evil of that which He created' },
      { id: 3, arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', transliteration: 'Wa min sharri ghasiqin idha waqab', meaning: 'And from the evil of darkness when it settles' },
      { id: 4, arabic: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', transliteration: 'Wa min sharrin-naffathati fil-\'uqad', meaning: 'And from the evil of the blowers in knots' },
      { id: 5, arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', transliteration: 'Wa min sharri hasidin idha hasad', meaning: 'And from the evil of an envier when he envies."' }
    ]
  },
  nas: {
    surahNum: 114,
    title: 'Surah An-Nas', subtitle: 'Mankind • 6 Ayahs', color: '#E63946',
    ayahs: [
      { id: 1, arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', transliteration: 'Qul a\'udhu birabbin-nas', meaning: 'Say, "I seek refuge in the Lord of mankind,' },
      { id: 2, arabic: 'مَلِكِ النَّاسِ', transliteration: 'Malikin-nas', meaning: 'The Sovereign of mankind,' },
      { id: 3, arabic: 'إِلَٰهِ النَّاسِ', transliteration: 'Ilahin-nas', meaning: 'The God of mankind,' },
      { id: 4, arabic: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', transliteration: 'Min sharril-waswasil-khannas', meaning: 'From the evil of the retreating whisperer -' },
      { id: 5, arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', transliteration: 'Alladhi yuwaswisu fi sudurin-nas', meaning: 'Who whispers into the breasts of mankind -' },
      { id: 6, arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ', transliteration: 'Minal-jinnati wan-nas', meaning: 'From among the jinn and mankind."' }
    ]
  }
};

let activeSurahAudio = null;
let currentPlayingPath = null;
let currentSurahKey = null;

function showSurahList() {
  if (activeSurahAudio) pauseAyahAudio();
  
  const listContainer = document.getElementById('surah-list-container');
  const detailContainer = document.getElementById('surah-detail-container');
  
  if (listContainer) listContainer.style.display = 'block';
  if (detailContainer) detailContainer.style.display = 'none';
}

function openSurahDetail(surahKey) {
  currentSurahKey = surahKey;
  
  const listContainer = document.getElementById('surah-list-container');
  const detailContainer = document.getElementById('surah-detail-container');

  if (listContainer) listContainer.style.display = 'none';
  if (detailContainer) detailContainer.style.display = 'block';

  renderSurah(surahKey);
}

function renderSurah(key) {
  const surah = surahsDatabase[key];
  const titleElem = document.getElementById('active-surah-title');
  const subtitleElem = document.getElementById('active-surah-subtitle');
  const container = document.getElementById('fatiha-ayah-list');
  const bismillahBox = document.getElementById('bismillah-container');

  if (!surah || !container) return;

  if (titleElem) titleElem.textContent = surah.title;
  if (subtitleElem) {
    subtitleElem.textContent = surah.subtitle;
    subtitleElem.style.color = surah.color;
  }

  // Toggle Bismillah header container based on Surah
  if (bismillahBox) {
    if (key === 'fatiha') {
      bismillahBox.style.display = 'none'; // Hide for Fatiha (since Bismillah is Ayah 1)
    } else {
      bismillahBox.style.display = 'block';
    }
  }

  container.innerHTML = surah.ayahs.map(item => `
    <div class="fun-card" style="margin-bottom: 16px; border-left: 6px solid ${surah.color};">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="background:${surah.color}; color:#fff; font-weight:700; border-radius:50%; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; font-size:0.85rem;">${item.id}</span>
        <span style="font-weight:700; color:#8D7B68; font-size:0.85rem;">Ayah ${item.id}</span>
      </div>
      
      <div class="arabic-text" style="font-size: 1.8rem; line-height: 2.2; text-align: right; margin: 12px 0;">${item.arabic}</div>
      <div style="font-weight:700; color:${surah.color}; margin-bottom:4px;">${item.transliteration}</div>
      <p style="font-size:0.9rem; color:#7A6F64; margin-bottom:12px;">"${item.meaning}"</p>
      
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="play-bubble-btn" style="background:${surah.color}; border-color:#222; box-shadow:0 4px 0px #222; padding:8px 14px; font-size:0.9rem;" onclick="playAyahAudio(${surah.surahNum}, ${item.id})">▶ Play</button>
        <button class="play-bubble-btn" style="background:#E63946; border-color:#9D0208; box-shadow:0 4px 0px #9D0208; padding:8px 14px; font-size:0.9rem;" onclick="pauseAyahAudio()">⏸ Pause</button>
      </div>
    </div>
  `).join('');
}

// Function to play Bismillah audio (0.mp3)
function playBismillah() {
  if (!currentSurahKey) return;
  const surah = surahsDatabase[currentSurahKey];
  if (surah) {
    playAyahAudio(surah.surahNum, 0);
  }
}

function playAyahAudio(surahNum, ayahNum) {
  const audioPath = `audio/surah_${surahNum}/${ayahNum}.mp3`;

  // Resume if same track was paused
  if (activeSurahAudio && currentPlayingPath === audioPath) {
    if (activeSurahAudio.paused) {
      activeSurahAudio.play().catch(e => console.log("Audio playback error:", e));
    }
    return;
  }

  // Stop previous track if playing a different Ayah
  if (activeSurahAudio) {
    activeSurahAudio.pause();
  }

  // Play new track
  currentPlayingPath = audioPath;
  activeSurahAudio = new Audio(audioPath);
  activeSurahAudio.play().catch(e => console.log("Audio file missing or error loading:", e));
}

function pauseAyahAudio() {
  if (activeSurahAudio && !activeSurahAudio.paused) {
    activeSurahAudio.pause();
  }
}
// ==========================================
// DUAS & KALIMAS MODULE (CARD + DETAIL VIEW)
// ==========================================
const duasDatabase = {
  tayyibb: {
    id: 1,
    title: "Declaration of Faith",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ",
    transliteration: "La ilaha illallahu Muhammadur-Rasulullah",
    meaning: "There is no deity worthy of worship except Allah, and Muhammad is the Messenger of Allah.",
    audioPath: "audio/Tayyibb.mp3"
  },
  shahada: {
    id: 2,
    title: "Testimony of Faith",
    arabic: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    transliteration: "Ash-hadu an la ilaha illallahu wa ash-hadu anna Muhammadan 'abduhu wa rasuluh",
    meaning: "I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is His servant and Messenger.",
    audioPath: "audio/Shahada.mp3"
  },
  durood1: {
    id: 3,
    title: "Sending Blessings upon the Prophet (Short)",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    transliteration: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad",
    meaning: "O Allah, send blessings upon Muhammad and upon the family of Muhammad.",
    audioPath: "audio/Durood_1.mp3"
  },
  durood2: {
    id: 4,
    title: "Durood Ibrahim",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammadin, kama sallaita 'ala Ibrahima wa 'ala ali Ibrahima, innaka Hamidun Majid",
    meaning: "O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim. Indeed, You are Praiseworthy and Glorious.",
    audioPath: "audio/Durood_2.mp3"
  },
  beforeEating: {
    id: 5,
    title: "Before Eating",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    meaning: "In the name of Allah.",
    audioPath: "audio/Before_Eating.mp3"
  },
  afterEating: {
    id: 6,
    title: "After Eating",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghairi haulin minni wa la quwwah",
    meaning: "Praise be to Allah who has fed me this and provided it for me without any strength or power on my part.",
    audioPath: "audio/After_Eating.mp3"
  },
  beforeWudhu: {
    id: 7,
    title: "Before Wudhu",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    meaning: "In the name of Allah.",
    audioPath: "audio/Before_Wudhu.mp3"
  },
  afterWudhu1: {
    id: 8,
    title: "After Wudhu (Part 1)",
    arabic: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    transliteration: "Ash-hadu an la ilaha illallahu wahdahu la sharika lahu wa ash-hadu anna Muhammadan 'abduhu wa rasuluh",
    meaning: "I testify that there is no deity worthy of worship except Allah alone, without partner, and I testify that Muhammad is His servant and Messenger.",
    audioPath: "audio/After_Wudhu.mp3"
  },
  afterWudhu2: {
    id: 9,
    title: "After Wudhu (Part 2)",
    arabic: "اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
    transliteration: "Allahummaj-'alni minat-tawwabina waj-'alni minal-mutatahhirin",
    meaning: "O Allah, make me among those who turn to You in repentance, and make me among those who purify themselves.",
    audioPath: "audio/After_Wudhu2.mp3"
  },
  beforeEnteringToilet: {
    id: 10,
    title: "Before Entering the Bathroom",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    transliteration: "Allahumma inni a'udhu bika minal-khubuthi wal-khaba'ith",
    meaning: "O Allah, I seek refuge in You from evil and evil spirits.",
    audioPath: "audio/Before_Entering_Toilet.mp3"
  },
  afterLeavingToilet: {
    id: 11,
    title: "After Leaving the Bathroom",
    arabic: "غُفْرَانَكَ",
    transliteration: "Ghufranaka",
    meaning: "I ask You (Allah) for forgiveness.",
    audioPath: "audio/After_Leaving_Toilet.mp3"
  },
  beforeLeavingHome: {
    id: 12,
    title: "Before Leaving Home",
    arabic: "بِسْمِ اللَّهِ ، تَوَكَّلْتُ عَلَى اللَّهِ ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Bismillahi, tawakkaltu 'alallahi, wa la hawla wa la quwwata illa billah",
    meaning: "In the name of Allah, I place my trust in Allah; there is no might or power except with Allah.",
    audioPath: "audio/Before_Leaving_Home.mp3"
  },
  beforeSleeping: {
    id: 13,
    title: "Before Sleeping",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika-llahumma amutu wa ahya",
    meaning: "In Your name, O Allah, I die and I live.",
    audioPath: "audio/Before_Sleeping.mp3"
  },
  afterWakingUp: {
    id: 14,
    title: "After Waking Up",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilaihin-nushur",
    meaning: "Praise is to Allah Who gave us life after having taken it from us, and unto Him is the resurrection.",
    audioPath: "audio/After_Waking_Up.mp3"
  }
};
let activeDuaAudio = null;

// Render List of Cards
function renderDuas() {
  const container = document.getElementById('duas-card-grid');
  if (!container) return;

  // Make sure list view is shown and detail is hidden on render
  document.getElementById('dua-list-container').style.display = 'block';
  document.getElementById('dua-detail-container').style.display = 'none';

  container.innerHTML = Object.keys(duasDatabase).map(key => {
    const item = duasDatabase[key];
    return `
      <div class="fun-card" style="cursor: pointer; border-left: 6px solid #2A9D8F;" onclick="openDuaDetail('${key}')">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="color: #1D3557; margin-bottom: 4px;">${item.title}</h3>
            <p style="color: #2A9D8F; font-weight: 700; font-size: 0.9rem; margin: 0;">${item.transliteration ? item.transliteration.substring(0, 30) + '...' : ''}</p>
          </div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #1D3557;">🤲</div>
        </div>
      </div>
    `;
  }).join('');
}

// Open Detail View for Selected Dua
function openDuaDetail(key) {
  const item = duasDatabase[key];
  if (!item) return;

  stopDuaAudio();

  document.getElementById('dua-list-container').style.display = 'none';
  const detailContainer = document.getElementById('dua-detail-container');
  detailContainer.style.display = 'block';

  const content = document.getElementById('dua-detail-content');
  content.innerHTML = `
    <div class="fun-card" style="border-left: 6px solid #2A9D8F; margin-top: 12px;">
      <h2 style="color: #1D3557; margin-bottom: 4px;">${item.title}</h2>
      
      <div class="arabic-text" style="font-size: 2rem; text-align: center; margin: 24px 0; line-height: 2; color: #1D3557;">
        ${item.arabic}
      </div>

      <div style="font-weight: 700; color: #2A9D8F; font-size: 1.1rem; text-align: center; margin-bottom: 8px;">
        ${item.transliteration}
      </div>

      <p style="font-size: 1rem; color: #7A6F64; text-align: center; font-style: italic; margin-bottom: 24px;">
        "${item.meaning}"
      </p>

      <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
        <button class="play-bubble-btn" style="background:#2A9D8F; border-color:#1D6F65; box-shadow:0 4px 0px #1D6F65; padding:12px 20px; font-size:1rem;" onclick="playDuaAudio('${key}')">▶ Play Recitation</button>
        <button class="play-bubble-btn" style="background:#E63946; border-color:#9D0208; box-shadow:0 4px 0px #9D0208; padding:12px 20px; font-size:1rem;" onclick="pauseDuaAudio()">⏸ Pause</button>
      </div>
    </div>
  `;
}

// Close Detail View and Return to Dua List
function closeDuaDetail() {
  stopDuaAudio();
  document.getElementById('dua-detail-container').style.display = 'none';
  document.getElementById('dua-list-container').style.display = 'block';
}

// Play Audio for Dua (Plays or Resumes Audio)
function playDuaAudio(key) {
  const item = duasDatabase[key];
  if (!item || !item.audioPath) return;

  // If clicking play while paused, resume playing right from where it stopped
  if (activeDuaAudio && activeDuaAudio.src.includes(item.audioPath)) {
    if (activeDuaAudio.paused) {
      activeDuaAudio.play().catch(e => console.error("Error resuming audio:", e));
    }
    return;
  }

  // Stop any other currently active audio track before starting a new one
  stopDuaAudio();

  // Load and play the new audio path
  activeDuaAudio = new Audio(item.audioPath);
  activeDuaAudio.play().catch(e => {
    console.error("Audio playback failed for path:", item.audioPath, e);
    alert("Could not load audio file: " + item.audioPath + "\n\nPlease verify that the file exists in your audio folder.");
  });
}

// Pause Audio (Holds current time position so play resumes naturally)
function pauseDuaAudio() {
  if (activeDuaAudio && !activeDuaAudio.paused) {
    activeDuaAudio.pause();
  }
}

// Stop Audio (Used when leaving pages or switching items)
function stopDuaAudio() {
  if (activeDuaAudio) {
    activeDuaAudio.pause();
    activeDuaAudio.currentTime = 0;
    activeDuaAudio = null;
  }
}

// ==========================================
// ARABIC ALPHABET MODULE
// ==========================================
const arabicAlphabet = [
  { char: 'أ', name: 'Alif', file: '001-alif.mp3' },
  { char: 'ب', name: 'Ba', file: '002-ba.mp3' },
  { char: 'ت', name: 'Ta', file: '003-taa.mp3' },
  { char: 'ث', name: 'Tha', file: '004-tha.mp3' },
  { char: 'ج', name: 'Jeem', file: '005-jeem.mp3' },
  { char: 'ح', name: 'Ḥa', file: '006-haa.mp3' },
  { char: 'خ', name: 'Kha', file: '007-khaa.mp3' },
  { char: 'د', name: 'Dal', file: '008-dal.mp3' },
  { char: 'ذ', name: 'Dhal', file: '009-dhal.mp3' },
  { char: 'ر', name: 'Raa', file: '010-raa.mp3' },
  { char: 'ز', name: 'Zaa', file: '011-jaa.mp3' },
  { char: 'س', name: 'Seen', file: '012-seen.mp3' },
  { char: 'ش', name: 'Sheen', file: '013-sheen.mp3' },
  { char: 'ص', name: 'Sad', file: '014-saad.mp3' },
  { char: 'ض', name: 'Dhad', file: '015-dhaad.mp3' },
  { char: 'ط', name: 'Toa', file: '016-toa.mp3' },
  { char: 'ظ', name: 'Dhaa', file: '017-dhaa.mp3' },
  { char: 'ع', name: 'Ayn', file: '018-ain.mp3' },
  { char: 'غ', name: 'Ghayn', file: '019-ghain.mp3' },
  { char: 'ف', name: 'Fa', file: '020-faa.mp3' },
  { char: 'ق', name: 'Qaf', file: '021-qaaf.mp3' },
  { char: 'ك', name: 'Kaf', file: '022-kaaf.mp3' },
  { char: 'ل', name: 'Lam', file: '023-laam.mp3' },
  { char: 'م', name: 'Meem', file: '024-meem.mp3' },
  { char: 'ن', name: 'Noon', file: '025-noon.mp3' },
  { char: 'و', name: 'Waaw', file: '026-waw.mp3' },
  { char: 'هـ', name: 'Ha', file: '027-ha.mp3' },
  { char: 'ء', name: 'Hamza', file: '028-hamza.mp3' },
  { char: 'ي', name: 'Ya', file: '029-yaa.mp3' }
];

function renderAlphabet() {
  const grid = document.getElementById('full-alphabet-grid');
  if (!grid) return;

  grid.innerHTML = arabicAlphabet.map(item => `
    <div class="letter-card" onclick="playAudio('${item.file}')">
      <div class="letter-arabic">${item.char}</div>
      <div class="letter-name">${item.name}</div>
    </div>
  `).join('');
}

// ==========================================
// STORYBOOK / EBOOK MODULE (SINGLE PAGE VIEW)
// ==========================================
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

let currentPdfDoc = null;
let currentPageNum = 1;
let totalPdfPages = 0;
let isRenderingPage = false;

async function openBookReader(pdfPath, title) {
  const modal = document.getElementById('reader-modal');
  const modalTitle = document.getElementById('modal-book-title');
  const pageIndicator = document.getElementById('page-num-indicator');

  if (!modal) return;

  modalTitle.textContent = title;
  modal.style.display = 'flex';
  if (pageIndicator) pageIndicator.textContent = 'Loading...';

  if (typeof pdfjsLib === 'undefined') {
    alert('PDF reader library failed to load. Please refresh the page.');
    return;
  }

  try {
    currentPageNum = 1;
    currentPdfDoc = await pdfjsLib.getDocument(pdfPath).promise;
    totalPdfPages = currentPdfDoc.numPages;

    renderPdfPage(currentPageNum);
  } catch (error) {
    console.error('Error loading story PDF:', error);
    alert('Could not open this storybook: ' + pdfPath);
    closeBookReader();
  }
}

async function renderPdfPage(num) {
  if (!currentPdfDoc || isRenderingPage) return;
  isRenderingPage = true;

  try {
    const page = await currentPdfDoc.getPage(num);
    const canvas = document.getElementById('pdf-single-canvas');
    const container = document.getElementById('single-page-wrapper');
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    
    // 1. Calculate unscaled viewport
    const unscaledViewport = page.getViewport({ scale: 1.0 });

    // 2. Get container dimensions
    const containerWidth = container.clientWidth || 400;
    const containerHeight = container.clientHeight || 500;

    // 3. Find fit ratio so page fits without stretching
    const scaleX = containerWidth / unscaledViewport.width;
    const scaleY = containerHeight / unscaledViewport.height;
    const fitScale = Math.min(scaleX, scaleY);

    // 4. Use device pixel ratio for crisp text
    const dpr = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: fitScale * dpr });

    // 5. Set internal canvas dimensions
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // 6. Set CSS dimensions to match container fit
    canvas.style.width = `${viewport.width / dpr}px`;
    canvas.style.height = `${viewport.height / dpr}px`;

    // 7. Render
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;

    const pageIndicator = document.getElementById('page-num-indicator');
    if (pageIndicator) {
      pageIndicator.textContent = `Page ${num} of ${totalPdfPages}`;
    }

    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (prevBtn) prevBtn.style.opacity = num <= 1 ? '0.4' : '1';
    if (nextBtn) nextBtn.style.opacity = num >= totalPdfPages ? '0.4' : '1';

  } catch (err) {
    console.error('Error rendering page:', err);
  } finally {
    isRenderingPage = false;
  }
}

function changePage(offset) {
  const newPage = currentPageNum + offset;
  if (newPage >= 1 && newPage <= totalPdfPages) {
    currentPageNum = newPage;
    renderPdfPage(currentPageNum);
  }
}

function closeBookReader() {
  const modal = document.getElementById('reader-modal');
  if (modal) modal.style.display = 'none';

  currentPdfDoc = null;
  currentPageNum = 1;
  totalPdfPages = 0;
  isRenderingPage = false;

  const canvas = document.getElementById('pdf-single-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ==========================================
// INITIAL LOAD EVENT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  renderDuas();
});