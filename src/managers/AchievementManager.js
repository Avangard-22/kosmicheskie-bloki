/**
 * @fileoverview Модуль управления достижениями.
 * Управляет прогрессом, разблокировкой, отображением и наградами.
 */

import { Localization } from '../core/Localization.js'; // Предполагаем, что Localization находится здесь

// --- Структура достижений ---
const ACHIEVEMENT_CATEGORIES = {
  blockBreaker: {
    levels: [
      { id: 'novice', target: 10, reward: 100, name: 'Новичок', description: 'Разрушить блоков' },
      { id: 'apprentice', target: 50, reward: 250, name: 'Ученик', description: 'Разрушить блоков' },
      { id: 'journeyman', target: 200, reward: 500, name: 'Подмастерье', description: 'Разрушить блоков' },
      { id: 'expert', target: 1000, reward: 1000, name: 'Эксперт', description: 'Разрушить блоков' },
      { id: 'master', target: 5000, reward: 2500, name: 'Мастер', description: 'Разрушить блоков' },
      { id: 'grandmaster', target: 20000, reward: 5000, name: 'Гроссмейстер', description: 'Разрушить блоков' },
      { id: 'legend', target: 100000, reward: 10000, name: 'Легенда', description: 'Разрушить блоков' }
    ],
    icon: 'fas fa-hammer',
  },
  crystalCollector: {
    levels: [
      { id: 'rich', target: 1000, reward: 500, name: 'Богач', description: 'Собрать кристаллов' },
      { id: 'wealthy', target: 10000, reward: 2500, name: 'Состоятельный', description: 'Собрать кристаллов' },
      { id: 'millionaire', target: 100000, reward: 10000, name: 'Миллионер', description: 'Собрать кристаллов' },
      { id: 'tycoon', target: 1000000, reward: 25000, name: 'Магнат', description: 'Собрать кристаллов' },
      { id: 'crystalKing', target: 10000000, reward: 100000, name: 'Король кристаллов', description: 'Собрать кристаллов' }
    ],
    icon: 'fas fa-gem',
  },
  critSpecialist: {
    levels: [
      { id: 'critMaster', target: 50, reward: 300, name: 'Мастер крита', description: 'Нанести критических ударов' },
      { id: 'critExpert', target: 500, reward: 1500, name: 'Эксперт крита', description: 'Нанести критических ударов' },
      { id: 'critChampion', target: 2500, reward: 5000, name: 'Чемпион крита', description: 'Нанести критических ударов' },
      { id: 'critGod', target: 10000, reward: 20000, name: 'Бог крита', description: 'Нанести критических ударов' }
    ],
    icon: 'fas fa-star',
  },
  upgrader: {
    levels: [
      { id: 'upgradeStarter', target: 5, reward: 200, name: 'Начинающий улучшатель', description: 'Купить улучшений' },
      { id: 'upgradeEnthusiast', target: 15, reward: 500, name: 'Энтузиаст улучшений', description: 'Купить улучшений' },
      { id: 'upgradeMaster', target: 30, reward: 1000, name: 'Мастер улучшений', description: 'Купить улучшений' },
      { id: 'upgradePerfectionist', target: 50, reward: 2500, name: 'Перфекционист улучшений', description: 'Купить улучшений' }
    ],
    icon: 'fas fa-chart-line',
  },
  helperExpert: {
    levels: [
      { id: 'helperNovice', target: 1, reward: 300, name: 'Новичок помощников', description: 'Нанять помощников' },
      { id: 'helperSpecialist', target: 5, reward: 1000, name: 'Специалист помощников', description: 'Нанять помощников' },
      { id: 'helperMaster', target: 10, reward: 2500, name: 'Мастер помощников', description: 'Нанять помощников' }
    ],
    icon: 'fas fa-robot',
  },
  boosterUser: {
    levels: [
      { id: 'boosterBeginner', target: 3, reward: 200, name: 'Начинающий бустер', description: 'Использовать бустов' },
      { id: 'boosterRegular', target: 10, reward: 600, name: 'Регулярный бустер', description: 'Использовать бустов' },
      { id: 'boosterAddict', target: 25, reward: 1500, name: 'Зависимый от бустов', description: 'Использовать бустов' }
    ],
    icon: 'fas fa-bolt',
  },
  planetExplorer: {
    levels: [
      { id: 'mercuryExplorer', target: 1, reward: 100, name: 'Исследователь Меркурия', description: 'Исследовать планет' },
      { id: 'venusExplorer', target: 2, reward: 200, name: 'Исследователь Венеры', description: 'Исследовать планет' },
      { id: 'earthExplorer', target: 3, reward: 300, name: 'Исследователь Земли', description: 'Исследовать планет' },
      { id: 'marsExplorer', target: 4, reward: 400, name: 'Исследователь Марса', description: 'Исследовать планет' },
      { id: 'jupiterExplorer', target: 5, reward: 500, name: 'Исследователь Юпитера', description: 'Исследовать планет' },
      { id: 'saturnExplorer', target: 6, reward: 600, name: 'Исследователь Сатурна', description: 'Исследовать планет' },
      { id: 'uranusExplorer', target: 7, reward: 700, name: 'Исследователь Урана', description: 'Исследовать планет' },
      { id: 'neptuneExplorer', target: 8, reward: 800, name: 'Исследователь Нептуна', description: 'Исследовать планет' },
      { id: 'plutoExplorer', target: 9, reward: 900, name: 'Исследователь Плутона', description: 'Исследовать планет' }
    ],
    icon: 'fas fa-globe-americas',
  },
  comboMaster: {
    levels: [
      { id: 'comboApprentice', target: 10, reward: 200, name: 'Ученик комбо', description: 'Достигнуть комбо' },
      { id: 'comboExpert', target: 25, reward: 500, name: 'Эксперт комбо', description: 'Достигнуть комбо' },
      { id: 'comboMaster', target: 50, reward: 1000, name: 'Мастер комбо', description: 'Достигнуть комбо' },
      { id: 'comboGod', target: 100, reward: 2500, name: 'Бог комбо', description: 'Достигнуть комбо' }
    ],
    icon: 'fas fa-fire',
  }
};

/**
 * Класс для управления достижениями.
 */
export class AchievementManager {
  /**
   * Конструктор менеджера достижений.
   * @param {Object} gameState - Объект состояния игры (передаётся сюда).
   * @param {Object} gameMetrics - Объект метрик игры (передаётся сюда).
   * @param {Localization} localization - Экземпляр класса Localization.
   * @param {Function} saveGameFn - Функция сохранения игры (передаётся сюда).
   * @param {Function} updateHUDFn - Функция обновления HUD (передаётся сюда).
   * @param {Function} updateUpgradeButtonsFn - Функция обновления кнопок улучшений (передаётся сюда).
   * @param {Function} playSoundFn - Функция воспроизведения звука (передаётся сюда).
   */
  constructor(gameState, gameMetrics, localization, saveGameFn, updateHUDFn, updateUpgradeButtonsFn, playSoundFn) {
    if (!gameState || !gameMetrics || !localization || !saveGameFn || !updateHUDFn || !updateUpgradeButtonsFn || !playSoundFn) {
      throw new Error("AchievementManager: Требуются gameState, gameMetrics, localization, saveGameFn, updateHUDFn, updateUpgradeButtonsFn, playSoundFn для инициализации.");
    }

    this.gameState = gameState;
    this.gameMetrics = gameMetrics;
    this.localization = localization;
    this.saveGame = saveGameFn;
    this.updateHUD = updateHUDFn;
    this.updateUpgradeButtons = updateUpgradeButtonsFn;
    this.playSound = playSoundFn;

    this.categories = ACHIEVEMENT_CATEGORIES;
    this.totalAchievements = this._calculateTotalAchievements();
    this.unlockedAchievements = 0;

    // Состояние UI
    this.achievementsPanelVisible = false;
    this.achievementsPanelElement = null;
    this.achievementsBtnElement = null;
  }

  /**
   * Инициализирует систему достижений.
   * Должна вызываться после инициализации gameState и gameMetrics.
   */
  init() {
    console.log('--- Инициализация AchievementManager ---');
    this._initializeState(); // Инициализирует структуру в gameState
    this._createAchievementsPanel();
    this._setupEventHandlers();
    this._updateAchievementsDisplay();
    this._checkSavedAchievements(); // Синхронизирует прогресс при загрузке
    console.log('--- Инициализация AchievementManager завершена ---');
  }

  /**
   * Инициализирует структуру достижений в gameState, если она отсутствует.
   * @private
   */
  _initializeState() {
    if (!this.gameState.achievements) {
      this.gameState.achievements = {};
    }

    for (const [categoryId, category] of Object.entries(this.categories)) {
      if (!this.gameState.achievements[categoryId]) {
        this.gameState.achievements[categoryId] = {
          progress: 0,
          levels: {}
        };
      }

      for (const level of category.levels) {
        if (!this.gameState.achievements[categoryId].levels[level.id]) {
          this.gameState.achievements[categoryId].levels[level.id] = {
            unlocked: false,
            progress: 0
          };
        }
      }
    }
  }

  /**
   * Рассчитывает общее количество достижений.
   * @private
   * @returns {number}
   */
  _calculateTotalAchievements() {
    let count = 0;
    for (const category of Object.values(this.categories)) {
      count += category.levels.length;
    }
    return count;
  }

  /**
   * Создаёт HTML-панель достижений.
   * @private
   */
  _createAchievementsPanel() {
    // Находим элементы UI
    this.achievementsContainerElement = document.getElementById('achievementsContainer');
    this.achievementsPanelElement = document.getElementById('achievementsPanel');
    this.achievementsBtnElement = document.getElementById('achievementsBtn');

    if (!this.achievementsContainerElement || !this.achievementsPanelElement || !this.achievementsBtnElement) {
      console.warn('⚠️ Элементы UI для достижений не найдены.');
      return;
    }

    // Очищаем панель
    this.achievementsPanelElement.innerHTML = '';

    // Заголовок
    const title = document.createElement('h3');
    this.localization.applyTranslation(title, 'achievements.title'); // Используем localization
    title.style.marginBottom = '15px';
    this.achievementsPanelElement.appendChild(title);

    // Прогресс-бар всех достижений
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      width: 100%;
      background: #333;
      border-radius: 10px;
      margin-bottom: 15px;
      overflow: hidden;
      border: 2px solid #444;
    `;
    const progressBar = document.createElement('div');
    progressBar.id = 'achievementsProgressBar';
    progressBar.style.cssText = `
      height: 10px;
      background: linear-gradient(90deg, #4CAF50, #8BC34A);
      width: 0%;
      border-radius: 5px;
      transition: width 0.5s ease;
    `;
    const progressText = document.createElement('div');
    progressText.id = 'achievementsProgressText';
    progressText.style.cssText = `
      text-align: center;
      font-size: 0.8em;
      color: #fff;
      padding: 5px;
      font-family: 'Orbitron', sans-serif;
    `;
    progressContainer.appendChild(progressBar);
    this.achievementsPanelElement.appendChild(progressContainer);
    this.achievementsPanelElement.appendChild(progressText);

    // Категории
    for (const [categoryId, category] of Object.entries(this.categories)) {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'achievement-category';
      categoryDiv.style.cssText = `
        margin-bottom: 20px;
        border-bottom: 1px solid #444;
        padding-bottom: 10px;
      `;

      const categoryTitle = document.createElement('div');
      categoryTitle.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        font-weight: bold;
        color: #4FC3F7;
        font-size: 1.1em;
      `;
      categoryTitle.innerHTML = `<i class="${category.icon}"></i> <span style="margin-left: 8px;">${category.levels[0].description}</span>`; // Берём описание из первого уровня
      categoryDiv.appendChild(categoryTitle);

      // Уровни достижений в категории
      category.levels.forEach((level, index) => {
        const achievementId = `${categoryId}_${level.id}`;
        const achievementItem = document.createElement('div');
        achievementItem.className = 'achievement-item';
        achievementItem.id = `achievement${this._capitalizeFirstLetter(achievementId)}`;
        achievementItem.style.cssText = `
          background: linear-gradient(135deg, rgba(40, 40, 60, 0.8), rgba(30, 30, 50, 0.9));
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          border: 1px solid #444;
          position: relative;
          transition: all 0.3s ease;
        `;

        // Цвет фона в зависимости от уровня
        const levelColors = [
          'rgba(100, 150, 255, 0.1)',
          'rgba(100, 200, 255, 0.15)',
          'rgba(150, 100, 255, 0.2)',
          'rgba(200, 100, 255, 0.25)',
          'rgba(255, 100, 150, 0.3)',
          'rgba(255, 150, 100, 0.35)',
          'rgba(255, 200, 100, 0.4)'
        ];
        achievementItem.style.background = levelColors[index % levelColors.length];

        // Иконка
        const icon = document.createElement('i');
        icon.className = category.icon;
        icon.style.cssText = `font-size: 1.5em; margin-right: 10px; color: #FFD700;`;

        // Текст
        const textDiv = document.createElement('div');
        textDiv.style.flex = '1';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'achievement-name';
        nameSpan.style.cssText = `font-weight: bold; display: block; color: #fff;`;
        nameSpan.textContent = level.name;
        const descSpan = document.createElement('span');
        descSpan.className = 'achievement-description';
        descSpan.style.cssText = `font-size: 0.8em; color: #ccc; display: block;`;
        descSpan.textContent = `${level.description}: ${level.target}`;

        // Прогресс
        const progressDiv = document.createElement('div');
        progressDiv.className = 'achievement-progress';
        progressDiv.style.cssText = `font-size: 0.9em; color: #4FC3F7; font-family: 'Orbitron', sans-serif;`;

        // Награда
        const rewardDiv = document.createElement('div');
        rewardDiv.className = 'achievement-reward';
        rewardDiv.style.cssText = `font-size: 0.8em; color: #FFD700; margin-left: 10px; display: flex; align-items: center;`;
        rewardDiv.innerHTML = `<i class="fas fa-gem" style="margin-right: 3px;"></i>${level.reward}`;

        textDiv.appendChild(nameSpan);
        textDiv.appendChild(descSpan);
        textDiv.appendChild(progressDiv);
        achievementItem.appendChild(icon);
        achievementItem.appendChild(textDiv);
        achievementItem.appendChild(rewardDiv);
        categoryDiv.appendChild(achievementItem);
      });

      this.achievementsPanelElement.appendChild(categoryDiv);
    }

    // Стили панели
    this.achievementsPanelElement.style.cssText = `
      position: fixed;
      bottom: 70px;
      right: 20px;
      width: 90%;
      max-width: 500px;
      max-height: 70vh;
      background: linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(10, 10, 30, 0.98));
      border: 3px solid #FFD700;
      border-radius: 15px;
      padding: 20px;
      z-index: 1000;
      display: none;
      flex-direction: column;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    `;

    // Обновляем счётчик на кнопке
    this._updateAchievementsCounter();
  }

  /**
   * Настраивает обработчики событий для UI.
   * @private
   */
  _setupEventHandlers() {
    if (!this.achievementsBtnElement || !this.achievementsPanelElement) return;

    this.achievementsBtnElement.addEventListener('click', () => this.toggleAchievementsPanel());
    this.achievementsBtnElement.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.toggleAchievementsPanel();
    }, { passive: false });

    // Закрытие при клике вне панели
    document.addEventListener('click', (e) => {
      if (this.achievementsPanelVisible &&
          !this.achievementsPanelElement.contains(e.target) &&
          !this.achievementsBtnElement.contains(e.target)) {
        this.hideAchievementsPanel();
      }
    });
  }

  /**
   * Переключает видимость панели достижений.
   */
  toggleAchievementsPanel() {
    if (this.achievementsPanelVisible) {
      this.hideAchievementsPanel();
    } else {
      this.showAchievementsPanel();
      // Скрыть панель магазина, если открыта
      // window.shopSystem?.hideShopPanel(); // Зависимость от глобального объекта, лучше передать через конструктор
      if (this.shopSystemRef) this.shopSystemRef.hideShopPanel();
    }
  }

  /**
   * Показывает панель достижений.
   */
  showAchievementsPanel() {
    if (this.achievementsPanelElement) {
      this.achievementsPanelElement.style.display = 'flex';
      this.achievementsPanelVisible = true;
      this._updateAchievementsDisplay();
    }
  }

  /**
   * Скрывает панель достижений.
   */
  hideAchievementsPanel() {
    if (this.achievementsPanelElement) {
      this.achievementsPanelElement.style.display = 'none';
      this.achievementsPanelVisible = false;
    }
  }

  /**
   * Обновляет прогресс достижения в указанной категории.
   * @param {string} categoryId - ID категории (например, 'blockBreaker').
   * @param {number} value - Новое значение прогресса.
   */
  updateProgress(categoryId, value) {
    const categoryData = this.categories[categoryId];
    if (!categoryData || !this.gameState.achievements[categoryId]) return;

    // Обновляем прогресс для категории
    this.gameState.achievements[categoryId].progress = value;

    // Проверяем каждый уровень достижения в категории
    for (const level of categoryData.levels) {
      const achievementState = this.gameState.achievements[categoryId].levels[level.id];
      if (!achievementState) continue;

      // Если достижение уже разблокировано, пропускаем
      if (achievementState.unlocked) continue;

      // Проверяем, достигнута ли цель
      if (value >= level.target) {
        this.unlockAchievement(categoryId, level.id);
      }
    }

    this._updateAchievementsDisplay();
    this.saveGame();
  }

  /**
   * Разблокирует достижение.
   * @param {string} categoryId - ID категории.
   * @param {string} levelId - ID уровня достижения.
   * @private
   */
  unlockAchievement(categoryId, levelId) {
    const categoryData = this.categories[categoryId];
    const level = categoryData.levels.find(l => l.id === levelId);
    if (!level || !this.gameState.achievements[categoryId] || !this.gameState.achievements[categoryId].levels[levelId]) return;

    const achievementState = this.gameState.achievements[categoryId].levels[levelId];

    // Если уже разблокировано, выходим
    if (achievementState.unlocked) return;

    // Разблокируем
    achievementState.unlocked = true;
    achievementState.progress = level.target;

    // Награда
    this.gameState.coins += level.reward;

    // Обновляем счётчик
    this.unlockedAchievements++;

    // Обновляем UI
    this._updateAchievementsCounter();
    this.updateHUD();
    this.updateUpgradeButtons();

    // Показываем уведомление
    this._showAchievementNotification(categoryId, levelId);

    // Звук
    this.playSound('upgradeSound');

    // Вибрация
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    // Сохраняем
    this.saveGame();
  }

  /**
   * Показывает уведомление о разблокировке достижения.
   * @param {string} categoryId - ID категории.
   * @param {string} levelId - ID уровня достижения.
   * @private
   */
  _showAchievementNotification(categoryId, levelId) {
    const categoryData = this.categories[categoryId];
    const level = categoryData.levels.find(l => l.id === levelId);
    if (!level) return;

    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 140, 0, 0.95));
      color: #000;
      padding: 15px 25px;
      border-radius: 15px;
      z-index: 2000;
      text-align: center;
      font-family: 'Orbitron', sans-serif;
      font-weight: bold;
      box-shadow: 0 5px 25px rgba(255, 215, 0, 0.5);
      animation: achievementSlideDown 0.5s ease-out;
      max-width: 350px;
      width: 90%;
      border: 3px solid #fff;
    `;

    const levelStars = '★'.repeat(categoryData.levels.findIndex(l => l.id === levelId) + 1);
    notification.innerHTML = `
      <div style="font-size: 1.1em; margin-bottom: 5px; color: #000;">${levelStars}</div>
      <div style="font-size: 1.5em; margin-bottom: 8px; color: #000; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">🏆 ДОСТИЖЕНИЕ!</div>
      <div style="font-size: 1.2em; margin-bottom: 10px; color: #000;">${level.name}</div>
      <div style="font-size: 0.9em; margin-bottom: 10px; color: #333;">${level.description}: ${level.target}</div>
      <div style="font-size: 1em; color: #000; background: rgba(255,255,255,0.3); padding: 5px 10px; border-radius: 10px;">
        Награда: <i class="fas fa-gem" style="color: #2196F3;"></i> <strong>${level.reward}</strong>
      </div>
      <div style="margin-top: 10px; font-size: 0.8em; color: #555;">${this.unlockedAchievements}/${this.totalAchievements}</div>
    `;

    document.body.appendChild(notification);

    // Анимация исчезновения
    setTimeout(() => {
      notification.style.animation = 'achievementSlideUp 0.5s ease-in forwards';
      setTimeout(() => {
        if (notification.parentNode) document.body.removeChild(notification);
      }, 500);
    }, 3000);

    // Добавляем CSS для анимаций, если его ещё нет
    if (!document.getElementById('achievement-animations')) {
      const style = document.createElement('style');
      style.id = 'achievement-animations';
      style.textContent = `
        @keyframes achievementSlideDown {
          from { top: -100px; opacity: 0; transform: translateX(-50%) scale(0.8); }
          to { top: 20%; opacity: 1; transform: translateX(-50%) scale(1); }
        }
        @keyframes achievementSlideUp {
          from { top: 20%; opacity: 1; transform: translateX(-50%) scale(1); }
          to { top: -100px; opacity: 0; transform: translateX(-50%) scale(0.8); }
        }
        .achievement-item.unlocked {
          border-color: #FFD700 !important;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
        }
        .achievement-item.unlocked .achievement-progress {
          color: #4CAF50 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Обновляет счётчик разблокированных достижений на кнопке.
   * @private
   */
  _updateAchievementsCounter() {
    if (!this.achievementsBtnElement) return;

    // Пересчитываем количество разблокированных
    this.unlockedAchievements = 0;
    for (const [categoryId, category] of Object.entries(this.categories)) {
      const categoryState = this.gameState.achievements[categoryId];
      if (!categoryState) continue;
      for (const level of category.levels) {
        const achievementState = categoryState.levels[level.id];
        if (achievementState && achievementState.unlocked) {
          this.unlockedAchievements++;
        }
      }
    }

    const countSpan = this.achievementsBtnElement.querySelector('#achievementsCount');
    if (countSpan) {
      countSpan.textContent = `${this.unlockedAchievements}/${this.totalAchievements}`;
    }
    this._updateAchievementsProgressBar();
  }

  /**
   * Обновляет прогресс-бар всех достижений.
   * @private
   */
  _updateAchievementsProgressBar() {
    const progressBar = document.getElementById('achievementsProgressBar');
    const progressText = document.getElementById('achievementsProgressText');
    if (!progressBar || !progressText) return;

    const progress = this.totalAchievements > 0 ? (this.unlockedAchievements / this.totalAchievements) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Разблокировано: ${this.unlockedAchievements}/${this.totalAchievements} (${Math.round(progress)}%)`;
  }

  /**
   * Обновляет отображение всех достижений в панели.
   * @private
   */
  _updateAchievementsDisplay() {
    // Обновляем счётчики (уже делается в _updateAchievementsCounter)
    this._updateAchievementsCounter();

    for (const [categoryId, category] of Object.entries(this.categories)) {
      const categoryState = this.gameState.achievements[categoryId];
      if (!categoryState) continue;

      for (const level of category.levels) {
        const achievementId = `${categoryId}_${level.id}`;
        const achievementItem = document.getElementById(`achievement${this._capitalizeFirstLetter(achievementId)}`);
        if (!achievementItem) continue;

        const achievementState = categoryState.levels[level.id];
        if (!achievementState) continue;

        const progressElement = achievementItem.querySelector('.achievement-progress');
        if (!progressElement) continue;

        if (achievementState.unlocked) {
          progressElement.textContent = 'РАЗБЛОКИРОВАНО';
          progressElement.style.color = '#4CAF50';
          achievementItem.classList.add('unlocked');
        } else {
          const currentProgress = categoryState.progress;
          const percent = Math.min((currentProgress / level.target) * 100, 100);
          progressElement.textContent = `${Math.round(percent)}% (${currentProgress}/${level.target})`;
          progressElement.style.color = '#4FC3F7';
          achievementItem.classList.remove('unlocked');
        }
      }
    }
  }

  /**
   * Проверяет сохранённый прогресс и разблокирует достижения, если условия выполнены.
   * @private
   */
  _checkSavedAchievements() {
    // Синхронизируем прогресс с gameMetrics
    // Это вызывается один раз при инициализации
    this.updateProgress('blockBreaker', this.gameMetrics.blocksDestroyed || 0);
    this.updateProgress('crystalCollector', this.gameMetrics.totalCoinsEarned || 0);
    this.updateProgress('critSpecialist', this.gameMetrics.totalCrits || 0);
    this.updateProgress('upgrader', this.gameMetrics.upgradesBought || 0);
    this.updateProgress('helperExpert', this.gameMetrics.helpersBought || 0);
    this.updateProgress('boosterUser', this.gameMetrics.boostersUsed || 0);

    const planetOrder = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    const planetIndex = planetOrder.indexOf(this.gameState.currentLocation) + 1;
    this.updateProgress('planetExplorer', planetIndex);

    this.updateProgress('comboMaster', this.gameMetrics.maxCombo || 0);
  }

  // --- API методы для вызова из других модулей ---

  /**
   * Инкрементирует счётчик разрушенных блоков и обновляет соответствующее достижение.
   * @param {number} count - Количество блоков (по умолчанию 1).
   */
  incrementBlocksDestroyed(count = 1) {
    this.gameMetrics.blocksDestroyed = (this.gameMetrics.blocksDestroyed || 0) + count;
    this.updateProgress('blockBreaker', this.gameMetrics.blocksDestroyed);
  }

  /**
   * Инкрементирует счётчик заработанных кристаллов и обновляет соответствующее достижение.
   * @param {number} amount - Количество кристаллов.
   */
  incrementCoinsEarned(amount) {
    this.gameMetrics.totalCoinsEarned = (this.gameMetrics.totalCoinsEarned || 0) + amount;
    this.updateProgress('crystalCollector', this.gameMetrics.totalCoinsEarned);
  }

  /**
   * Инкрементирует счётчик критических ударов и обновляет соответствующее достижение.
   * @param {number} count - Количество ударов (по умолчанию 1).
   */
  incrementCrits(count = 1) {
    this.gameMetrics.totalCrits = (this.gameMetrics.totalCrits || 0) + count;
    this.updateProgress('critSpecialist', this.gameMetrics.totalCrits);
  }

  /**
   * Инкрементирует счётчик купленных улучшений и обновляет соответствующее достижение.
   * @param {number} count - Количество улучшений (по умолчанию 1).
   */
  incrementUpgrades(count = 1) {
    this.gameMetrics.upgradesBought = (this.gameMetrics.upgradesBought || 0) + count;
    this.updateProgress('upgrader', this.gameMetrics.upgradesBought);
  }

  /**
   * Инкрементирует счётчик нанятых помощников и обновляет соответствующее достижение.
   * @param {number} count - Количество помощников (по умолчанию 1).
   */
  incrementHelpers(count = 1) {
    this.gameMetrics.helpersBought = (this.gameMetrics.helpersBought || 0) + count;
    this.updateProgress('helperExpert', this.gameMetrics.helpersBought);
  }

  /**
   * Инкрементирует счётчик использованных бустов и обновляет соответствующее достижение.
   * @param {number} count - Количество бустов (по умолчанию 1).
   */
  incrementBoosters(count = 1) {
    this.gameMetrics.boostersUsed = (this.gameMetrics.boostersUsed || 0) + count;
    this.updateProgress('boosterUser', this.gameMetrics.boostersUsed);
  }

  /**
   * Обновляет прогресс достижений, связанных с исследованием планет.
   * @param {number} level - Уровень (номер планеты).
   */
  updatePlanetProgress(level) {
    this.updateProgress('planetExplorer', level);
  }

  /**
   * Обновляет прогресс достижений, связанных с комбо.
   * @param {number} combo - Текущее максимальное комбо.
   */
  updateCombo(combo) {
    if (combo > (this.gameMetrics.maxCombo || 0)) {
      this.gameMetrics.maxCombo = combo;
      this.updateProgress('comboMaster', combo);
    }
  }

  // --- Вспомогательные функции ---
  /**
   * @private
   */
  _capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // --- Методы для интеграции с другими системами ---
  /**
   * Устанавливает ссылку на ShopManager для скрытия его панели.
   * @param {Object} shopSystemRef - Ссылка на экземпляр ShopManager или его API.
   */
  setShopSystemReference(shopSystemRef) {
    this.shopSystemRef = shopSystemRef;
  }
}

// --- Экспорт для использования в других модулях ---
// export default AchievementManager; // Можно использовать как default export