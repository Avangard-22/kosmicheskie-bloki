/**
 * @fileoverview Модуль управления сохранением и загрузкой игры.
 * Использует localStorage для хранения состояния.
 */

// --- Конфигурация ---
const CONFIG = {
  STORAGE_KEY: 'cosmicBlocksSave',
  MAX_SAVE_AGE_MS: 30 * 24 * 60 * 60 * 1000, // 30 дней
  VERSION: '1.0'
};

// --- Структуры по умолчанию ---
const DEFAULT_GAME_STATE = {
  coins: 0,
  totalDamageDealt: 0,
  clickPower: 1,
  clickUpgradeLevel: 0,
  currentLocation: 'mercury',
  critChance: 0.001,
  critMultiplier: 2.0,
  helperDamageBonus: 0.3,
  helperUpgradeLevel: 0,
  boboCoinBonus: 0,
  critChanceUpgradeLevel: 0,
  critMultiplierUpgradeLevel: 0,
  gameActive: false,
  helperActive: false,
  helperTimeLeft: 0,
  comboCount: 0,
  lastDestroyTime: 0,
  shopItems: {
    timeWarp: { purchased: false, active: false, timeLeft: 0 },
    crystalBoost: { purchased: false, active: false, timeLeft: 0 },
    powerSurge: { purchased: false, active: false, timeLeft: 0 }
  },
  achievements: {}
};

const DEFAULT_GAME_METRICS = {
  startTime: Date.now(),
  blocksDestroyed: 0,
  upgradesBought: 0,
  totalClicks: 0,
  sessions: 1,
  totalCrits: 0,
  totalCoinsEarned: 0,
  helpersBought: 0,
  boostersUsed: 0,
  maxCombo: 0
};

/**
 * Класс для управления сохранением и загрузкой состояния игры.
 */
export class SaveLoadManager {

  /**
   * Конструктор менеджера сохранений.
   * @param {Object} gameState - Объект состояния игры (передаётся сюда).
   * @param {Object} gameMetrics - Объект метрик игры (передаётся сюда).
   */
  constructor(gameState, gameMetrics) {
    if (!gameState || !gameMetrics) {
      throw new Error("SaveLoadManager: Требуются gameState и gameMetrics для инициализации.");
    }

    this.gameState = gameState;
    this.gameMetrics = gameMetrics;

    // Инициализируем состояние при создании экземпляра
    this._initializeState();
  }

  /**
   * Инициализирует состояние игры и метрик.
   * Пытается загрузить сохранение, иначе использует значения по умолчанию.
   * @private
   */
  _initializeState() {
    console.log('--- Инициализация SaveLoadManager ---');
    const saved = this._loadRawSave();

    if (saved) {
      console.log('Найдено сохранение, пробуем загрузить.');
      try {
        this._restoreFromSave(saved);
        console.log('✅ Игра загружена из сохранения.');
        // Инкрементируем сессию при загрузке сохранения
        this.gameMetrics.sessions = (this.gameMetrics.sessions || 0) + 1;
      } catch (e) {
        console.error('❌ Ошибка при загрузке сохранения:', e);
        console.log('Загружаются начальные значения.');
        this._setDefaultState();
      }
    } else {
      console.log('Сохранение не найдено, используются начальные значения.');
      this._setDefaultState();
    }
    console.log('--- Инициализация SaveLoadManager завершена ---');
  }

  /**
   * Устанавливает начальные значения состояния и метрик.
   * @private
   */
  _setDefaultState() {
    Object.assign(this.gameState, JSON.parse(JSON.stringify(DEFAULT_GAME_STATE)));
    Object.assign(this.gameMetrics, JSON.parse(JSON.stringify(DEFAULT_GAME_METRICS)));
  }

  /**
   * Загружает сырые данные сохранения из localStorage.
   * @returns {Object|null} Объект сохранения или null, если не найдено или просрочено.
   * @private
   */
  _loadRawSave() {
    const rawSave = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!rawSave) {
      return null;
    }

    let parsedSave;
    try {
      parsedSave = JSON.parse(rawSave);
    } catch (e) {
      console.error('❌ Ошибка парсинга JSON сохранения:', e);
      localStorage.removeItem(CONFIG.STORAGE_KEY); // Удаляем битое сохранение
      return null;
    }

    // Проверка на устаревание
    const saveAge = Date.now() - (parsedSave.timestamp || 0);
    if (saveAge > CONFIG.MAX_SAVE_AGE_MS) {
      console.log('Сохранение устарело (> 30 дней), удаляется.');
      localStorage.removeItem(CONFIG.STORAGE_KEY);
      return null;
    }

    return parsedSave;
  }

  /**
   * Восстанавливает состояние игры и метрик из сохранённых данных.
   * @param {Object} savedData - Данные из localStorage.
   * @private
   */
  _restoreFromSave(savedData) {
    // Восстанавливаем gameState, дополняя его значениями по умолчанию
    this._mergeState(this.gameState, DEFAULT_GAME_STATE, savedData.gameState);

    // Восстанавливаем gameMetrics, дополняя их значениями по умолчанию
    this._mergeState(this.gameMetrics, DEFAULT_GAME_METRICS, savedData.gameMetrics);

    // Обеспечиваем, что sessions существует, даже если его не было в старом сохранении
    if (this.gameMetrics.sessions === undefined) {
      this.gameMetrics.sessions = 1;
    }
  }

  /**
   * Вспомогательная функция для безопасного слияния состояний.
   * Копирует значения из source в target, заполняя недостающие из defaults.
   * @param {Object} target - Целевой объект для обновления.
   * @param {Object} defaults - Объект значений по умолчанию.
   * @param {Object} source - Исходный объект (например, из сохранения).
   * @private
   */
  _mergeState(target, defaults, source) {
    const merged = JSON.parse(JSON.stringify(defaults)); // Начинаем с дефолтов
    if (source) {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            // Рекурсивно мерджим вложенные объекты (например, shopItems, achievements)
            this._mergeState(target[key] = target[key] || {}, defaults[key] || {}, source[key]);
          } else {
            // Простые значения перезаписываются
            target[key] = source[key];
          }
        }
      }
    } else {
      // Если source не определён, просто используем defaults
      Object.assign(target, merged);
    }
  }


  /**
   * Сохраняет текущее состояние игры и метрик в localStorage.
   * @returns {boolean} true, если сохранение прошло успешно.
   */
  saveGame() {
    try {
      const saveData = {
        gameState: JSON.parse(JSON.stringify(this.gameState)), // Глубокое копирование
        gameMetrics: JSON.parse(JSON.stringify(this.gameMetrics)), // Глубокое копирование
        timestamp: Date.now(),
        version: CONFIG.VERSION
      };

      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(saveData));
      console.log('💾 Игра сохранена в localStorage.');

      // Вызываем глобальную функцию для обновления UI, если она существует
      if (typeof window.updateContinueButton === 'function') {
        window.updateContinueButton();
      }
      return true;
    } catch (e) {
      console.error('❌ Ошибка сохранения игры:', e);
      return false;
    }
  }

  /**
   * Сбрасывает текущее состояние и удаляет сохранение из localStorage.
   * @returns {boolean} true, если сброс прошёл успешно.
   */
  resetGame() {
    this._setDefaultState();
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    console.log('🔄 Игра сброшена, сохранение удалено.');

    // Вызываем глобальную функцию для обновления UI, если она существует
    if (typeof window.updateContinueButton === 'function') {
      window.updateContinueButton();
    }
    return true;
  }
}

// --- Экспорт для использования в других модулях ---
// window.SaveLoadManager = SaveLoadManager; // Можно экспортировать глобально, если нужно.
// export default SaveLoadManager; // Или как default export.