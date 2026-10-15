/* =========================================================
   LITTLE BELIEVERS - INTERACTIVE MINI-GAMES ENGINE
   ========================================================= */

let currentActiveGame = null;

function showGameMenu() {
  if (currentActiveGame && currentActiveGame.cleanup) {
    currentActiveGame.cleanup();
  }
  document.getElementById('game-menu-grid').style.display = 'grid';
  document.getElementById('active-game-area').style.display = 'none';
  document.getElementById('game-canvas-container').innerHTML = '';
}

function exitGameMenu() {
  showGameMenu();
  goHome();
}

function closeVictoryModal() {
  const modal = document.getElementById('victory-modal');
  if (modal) modal.remove();
  showGameMenu();
}

/* ---------------------------------------------------------
   GAME 1: CATCH THE GOOD DEEDS (FALLING GAME)
   --------------------------------------------------------- */
function startFallingGame() {
  document.getElementById('game-menu-grid').style.display = 'none';
  document.getElementById('active-game-area').style.display = 'block';

  const container = document.getElementById('game-canvas-container');
  container.innerHTML = `
    <div class="game-instruction-banner">
      💡 <strong>How to Play:</strong> Move your basket left and right to catch the good deeds and collect stars!
    </div>
    <div class="falling-game-box">
      <div class="game-header-bar">
        <span>⭐ Stars: <strong id="falling-score">0</strong></span>
        <span>❤️ Lives: <strong id="falling-lives">3</strong></span>
      </div>
      <div id="play-field" class="play-field">
        <div id="basket" class="basket">🧺 Basket</div>
      </div>
    </div>
  `;

  let score = 0;
  let lives = 3;
  let basketX = 150;
  const field = document.getElementById('play-field');
  const basket = document.getElementById('basket');
  
  const goodItems = [
    { text: "😊 Smile", score: 1 },
    { text: "🤝 Share", score: 1 },
    { text: "💬 Bismillah", score: 2 },
    { text: "🤲 Dua", score: 2 },
    { text: "🧹 Clean Up", score: 1 },
    { text: "📖 Qur'an", score: 2 }
  ];

  const badItems = [
    { text: "💧 Waste Water", score: -1 },
    { text: "😠 Argue", score: -1 }
  ];

  function moveBasket(e) {
    const rect = field.getBoundingClientRect();
    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    basketX = clientX - rect.left - 45;
    if (basketX < 0) basketX = 0;
    if (basketX > rect.width - 90) basketX = rect.width - 90;
    basket.style.left = basketX + 'px';
  }

  field.addEventListener('mousemove', moveBasket);
  field.addEventListener('touchmove', moveBasket);

  let gameInterval = setInterval(() => {
    if (lives <= 0) return;

    const isGood = Math.random() > 0.3;
    const pool = isGood ? goodItems : badItems;
    const itemData = pool[Math.floor(Math.random() * pool.length)];

    const item = document.createElement('div');
    item.className = 'falling-item ' + (isGood ? 'item-good' : 'item-bad');
    item.textContent = itemData.text;
    
    const fieldWidth = field.clientWidth - 80;
    const startX = Math.floor(Math.random() * fieldWidth);
    item.style.left = startX + 'px';
    item.style.top = '0px';
    field.appendChild(item);

    let posY = 0;
    let fallInterval = setInterval(() => {
      posY += 4;
      item.style.top = posY + 'px';

      const basketRect = basket.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      if (
        itemRect.bottom >= basketRect.top &&
        itemRect.left < basketRect.right &&
        itemRect.right > basketRect.left &&
        itemRect.top < basketRect.bottom
      ) {
        clearInterval(fallInterval);
        item.remove();
        if (isGood) {
          score += itemData.score;
        } else {
          lives -= 1;
        }
        document.getElementById('falling-score').textContent = score;
        document.getElementById('falling-lives').textContent = lives;

        if (lives <= 0) {
          clearInterval(gameInterval);
          showVictoryModal("MashaAllah! 🎉", "You collected " + score + " Stars!", "⭐");
        }
      }

      if (posY > field.clientHeight - 40) {
        clearInterval(fallInterval);
        if (item.parentNode) item.remove();
      }
    }, 20);

  }, 1600);

  currentActiveGame = {
    cleanup: () => {
      clearInterval(gameInterval);
      field.removeEventListener('mousemove', moveBasket);
      field.removeEventListener('touchmove', moveBasket);
    }
  };
}

/* ---------------------------------------------------------
   GAME 2: ARABIC LETTER MEMORY MATCH
   --------------------------------------------------------- */
function startMemoryGame() {
  document.getElementById('game-menu-grid').style.display = 'none';
  document.getElementById('active-game-area').style.display = 'block';

  const container = document.getElementById('game-canvas-container');
  
  const allArabicLetters = [
    'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 
    'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 
    'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 
    'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'
  ];

  const selectedLetters = [...allArabicLetters].sort(() => Math.random() - 0.5).slice(0, 6);
  let deck = [...selectedLetters, ...selectedLetters].sort(() => Math.random() - 0.5);
  
  container.innerHTML = `
    <div class="game-instruction-banner">
      💡 <strong>How to Play:</strong> Tap any two cards to turn them over and find matching Arabic letter pairs!
    </div>
    <div class="memory-game-box">
      <h3 style="color:#7B2CBF; text-align:center; margin-bottom:12px;">Match the Arabic Pairs! 🃏</h3>
      <div class="memory-grid" id="memory-grid"></div>
    </div>
  `;

  const grid = document.getElementById('memory-grid');
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matches = 0;

  deck.forEach((char) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.char = char;
    card.innerHTML = `<span class="card-inner">❓</span>`;
    
    card.addEventListener('click', () => {
      if (lockBoard || card === firstCard || card.classList.contains('matched')) return;

      card.classList.add('flipped');
      card.querySelector('.card-inner').textContent = char;

      if (!firstCard) {
        firstCard = card;
        return;
      }

      secondCard = card;
      lockBoard = true;

      if (firstCard.dataset.char === secondCard.dataset.char) {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matches++;
        resetCards();
        if (matches === selectedLetters.length) {
          setTimeout(() => {
            showVictoryModal("MashaAllah! 🎉", "Well done! You matched all the Arabic letters!", "✨");
          }, 300);
        }
      } else {
        setTimeout(() => {
          firstCard.classList.remove('flipped');
          secondCard.classList.remove('flipped');
          firstCard.querySelector('.card-inner').textContent = '❓';
          secondCard.querySelector('.card-inner').textContent = '❓';
          resetCards();
        }, 800);
      }
    });

    grid.appendChild(card);
  });

  function resetCards() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
  }

  currentActiveGame = { cleanup: () => {} };
}

/* ---------------------------------------------------------
   GAME 3: WUDU STEP ORDER PUZZLE
   --------------------------------------------------------- */
function startWuduGame() {
  document.getElementById('game-menu-grid').style.display = 'none';
  document.getElementById('active-game-area').style.display = 'block';

  const container = document.getElementById('game-canvas-container');

  const wuduSteps = [
    { step: 1, name: "Wash Hands 🤲", icon: "💧" },
    { step: 2, name: "Rinse Mouth 👄", icon: "🌊" },
    { step: 3, name: "Clean Nose 👃", icon: "✨" },
    { step: 4, name: "Wash Face 👤", icon: "💦" },
    { step: 5, name: "Wash Arms 💪", icon: "🚿" },
    { step: 6, name: "Wipe Head 🧕", icon: "🌧️" },
    { step: 7, name: "Wash Feet 🦶", icon: "🦶" }
  ];

  let currentStepIndex = 0;
  let shuffledSteps = [...wuduSteps].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="game-instruction-banner">
      💡 <strong>How to Play:</strong> Tap the steps in the correct order from Step 1 to Step 7 to complete Wudu!
    </div>
    <div class="wudu-game-box">
      <h3 style="color:#2B9348; text-align:center; margin-bottom:6px;">Wudu Sequence Challenge 🚿</h3>
      
      <div class="wudu-target-banner">
        <span>Target Step <strong id="wudu-target-num">1</strong>:</span>
        <span id="wudu-target-name">${wuduSteps[0].name}</span>
      </div>

      <div class="wudu-cards-grid" id="wudu-grid"></div>
    </div>
  `;

  const grid = document.getElementById('wudu-grid');

  function renderWuduCards() {
    grid.innerHTML = '';
    shuffledSteps.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'wudu-card';
      card.innerHTML = `
        <div style="font-size:2.2rem;">${item.icon}</div>
        <div style="font-family:'Fredoka'; font-size:1rem; margin-top:4px;">${item.name}</div>
      `;

      card.addEventListener('click', () => {
        if (item.step === wuduSteps[currentStepIndex].step) {
          card.classList.add('correct-step');
          currentStepIndex++;
          if (currentStepIndex < wuduSteps.length) {
            document.getElementById('wudu-target-num').textContent = currentStepIndex + 1;
            document.getElementById('wudu-target-name').textContent = wuduSteps[currentStepIndex].name;
          } else {
            setTimeout(() => {
              showWuduBadgeModal();
            }, 300);
          }
        } else {
          card.classList.add('wrong-step');
          setTimeout(() => card.classList.remove('wrong-step'), 600);
        }
      });

      grid.appendChild(card);
    });
  }

  renderWuduCards();
  currentActiveGame = { cleanup: () => {} };
}

/* ---------------------------------------------------------
   CENTERED POP-UP MODAL ENGINE
   --------------------------------------------------------- */
function showVictoryModal(title, subtext, icon) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const modal = document.createElement('div');
  modal.id = 'victory-modal';
  modal.className = 'victory-modal-overlay';
  modal.innerHTML = `
    <div class="victory-card">
      <div class="victory-icon-bounce">${icon}</div>
      <h1 class="victory-title">${title}</h1>
      <p class="victory-subtext">${subtext}</p>
      <button class="modal-play-btn" onclick="closeVictoryModal()">Play Again 🌟</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function showWuduBadgeModal() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const modal = document.createElement('div');
  modal.id = 'victory-modal';
  modal.className = 'victory-modal-overlay';
  modal.innerHTML = `
    <div class="victory-card wudu-badge-card">
      <div class="badge-ribbon">NEW BADGE UNLOCKED!</div>
      <div class="wudu-badge-icon">🚿⭐</div>
      <h1 class="victory-title" style="color:#0284C7;">Well Done! MashaAllah</h1>
      <p class="victory-subtext">You completed all Wudu steps in perfect order!</p>
      <button class="modal-play-btn" style="background:#0284C7; border-color:#0369A1; box-shadow:0 6px 0 #0369A1;" onclick="closeVictoryModal()">Play Again 🌟</button>
    </div>
  `;
  document.body.appendChild(modal);
}