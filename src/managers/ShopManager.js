/**
 * @fileoverview Модуль управления магазином и временными бонусами.
 */

import { Localization } from '../core/Localization.js'; // Предполагаем, что Localization находится здесь

// --- Структура товаров магазина ---
const SHOP_ITEMS_CONFIG = {
  timeWarp: {
    id: 'timeWarp',
    name: 'timeWarp', // Используется для перевода
    icon: 'fas fa-hourglass-half',
    baseCost: 250,
    duration: 30000, // 30 секунд
    effect: 'Замедляет движение блоков на 50%', // Используется для перевода
    multiplier: 0.5
  },
  crystalBoost: {
    id: 'crystalBoost',
    name: 'crystalBoost',
    icon: 'fas fa-gem',
    baseCost: 400,
    duration: 60000, // 1 минута
    effect: 'Увеличивает награду за кристаллы на 50%',
    multiplier: 1.5
  },
  powerSurge: {
    id: 'powerSurge',
    name: 'powerSurge',
    icon: 'fas fa-bolt',
    baseCost: 300,
    duration: 45000, // 45 секунд
    effect: 'Увеличивает силу удара на 50%',
    multiplier: 1.5
  }
};

/**
 * Класс для управления магазином и бонусами.
 */
export class ShopManager {
  /**
   * Конструктор менеджера магазина.
   * @param {Object} gameState - Объект состояния игры (передаётся сюда).
   * @param {Object} gameMetrics - Объект метрик игры (передаётся сюда).
   * @param {Localization} localization - Экземпляр класса Localization.
   * @param {Function} saveGameFn - Функция сохранения игры (передаётся сюда).
   * @param {Function} updateHUDFn - Функция обновления HUD (передаётся сюда).
   * @param {Function} updateUpgradeButtonsFn - Функция обновления кнопок улучшений (передаётся сюда).
   * @param {Function} playSoundFn - Функция воспроизведения звука (передаётся сюда).
   * @param {Function} showTooltipFn - Функция показа всплывающей подсказки (передаётся сюда).
   * @param {AchievementManager} achievementManager - Экземпляр AchievementManager (передаётся сюда).
   */
  constructor(gameState, gameMetrics, localization, saveGameFn, updateHUDFn, updateUpgradeButtonsFn, playSoundFn, showTooltipFn, achievementManager) {
    if (!gameState || !gameMetrics || !localization || !saveGameFn || !updateHUDFn || !updateUpgradeButtonsFn || !playSoundFn || !showTooltipFn || !achievementManager) {
      throw new Error("ShopManager: Требуются gameState, gameMetrics, localization, saveGameFn, updateHUDFn, updateUpgradeButtonsFn, playSoundFn, showTooltipFn, achievementManager для инициализации.");
    }

    this.gameState = gameState;
    this.gameMetrics = gameMetrics;
    this.localization = localization;
    this.saveGame = saveGameFn;
    this.updateHUD = updateHUDFn;
    this.updateUpgradeButtons = updateUpgradeButtonsFn;
    this.playSound = playSoundFn;
    this.showTooltip = showTooltipFn;
    this.achievementManager = achievementManager;

    this.items = SHOP_ITEMS_CONFIG;
    this.tickIntervalId = null;

    // Состояние UI
    this.shopPanelVisible = false;
    this.shopPanelElement = null;
    this.shopBtnElement = null;
  }

  /**
   * Инициализирует систему магазина.
   * Должна вызываться после инициализации gameState и других зависимостей.
   */
  init() {
    console.log('--- Инициализация ShopManager ---');
    this._initializeState(); // Инициализирует структуру в gameState
    this._createShopPanel();
    this._setupEventHandlers();
    this._updateShopDisplay();
    // Запускаем таймер для обновления состояния активных бонусов
    this._startTickLoop();
    console.log('--- Инициализация ShopManager завершена ---');
  }

  /**
   * Инициализирует структуру shopItems в gameState, если она отсутствует.
   * @private
   */
  _initializeState() {
    if (!this.gameState.shopItems) {
      this.gameState.shopItems = {};
    }

    for (const [itemId, item] of Object.entries(this.items)) {
      if (!this.gameState.shopItems[itemId]) {
        this.gameState.shopItems[itemId] = {
          purchased: false,
          active: false,
          timeLeft: 0
        };
      }
    }
  }

  /**
   * Создаёт HTML-панель магазина.
   * @private
   */
  _createShopPanel() {
    // Находим элементы UI
    this.shopContainerElement = document.getElementById('shopContainer');
    this.shopPanelElement = document.getElementById('shopPanel');
    this.shopBtnElement = document.getElementById('shopBtn');

    if (!this.shopContainerElement || !this.shopPanelElement || !this.shopBtnElement) {
      console.warn('⚠️ Элементы UI для магазина не найдены.');
      return;
    }

    // Очищаем панель
    this.shopPanelElement.innerHTML = '';

    // Заголовок
    const title = document.createElement('h3');
    this.localization.applyTranslation(title, 'shop.title'); // Используем localization
    title.style.marginBottom = '15px';
    this.shopPanelElement.appendChild(title);

    // Товары
    for (const [itemId, item] of Object.entries(this.items)) {
      const shopItemElement = document.createElement('div');
      shopItemElement.className = 'shop-item';
      shopItemElement.id = `shop${this._capitalizeFirstLetter(itemId)}`;
      shopItemElement.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
        color: white;
        font-size: 0.9em;
      `;

      // Иконка
      const icon = document.createElement('i');
      icon.className = item.icon;
      icon.style.cssText = `font-size: 1.2em; color: #4CAF50; width: 24px;`;
      shopItemElement.appendChild(icon);

      // Название (из перевода)
      const nameSpan = document.createElement('span');
      this.localization.applyTranslation(nameSpan, `shop.${item.name}`); // Используем localization
      shopItemElement.appendChild(nameSpan);

      // Стоимость
      const costDiv = document.createElement('div');
      costDiv.className = 'shop-cost';
      costDiv.style.cssText = `margin-left: auto; color: #FFD54F; font-weight: bold; font-size: 0.9em;`;
      costDiv.textContent = item.baseCost;
      shopItemElement.appendChild(costDiv);

      // Обработчик клика
      shopItemElement.addEventListener('click', () => this.purchaseItem(itemId));
      shopItemElement.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.purchaseItem(itemId);
      }, { passive: false });

      this.shopPanelElement.appendChild(shopItemElement);
    }

    // Стили панели
    this.shopPanelElement.style.cssText = `
      position: absolute;
      bottom: 60px;
      right: 0;
      width: 250px;
      background: rgba(0, 0, 0, 0.85);
      border-radius: 12px;
      padding: 15px;
      display: none;
      flex-direction: column;
      gap: 10px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 31;
    `;
  }

  /**
   * Настраивает обработчики событий для UI.
   * @private
   */
  _setupEventHandlers() {
    if (!this.shopBtnElement || !this.shopPanelElement) return;

    this.shopBtnElement.addEventListener('click', () => this.toggleShopPanel());
    this.shopBtnElement.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.toggleShopPanel();
    }, { passive: false });

    // Закрытие при клике вне панели
    document.addEventListener('click', (e) => {
      if (this.shopPanelVisible &&
          !this.shopPanelElement.contains(e.target) &&
          !this.shopBtnElement.contains(e.target)) {
        this.hideShopPanel();
      }
    });
  }

  /**
   * Запускает цикл обновления активных бонусов.
   * @private
   */
  _startTickLoop() {
    if (this.tickIntervalId) clearInterval(this.tickIntervalId);
    this.tickIntervalId = setInterval(() => {
      this._updateActiveBonuses();
    }, 1000);
  }

  /**
   * Переключает видимость панели магазина.
   */
  toggleShopPanel() {
    if (this.shopPanelVisible) {
      this.hideShopPanel();
    } else {
      this.showShopPanel();
      // Скрыть панель достижений, если открыта
      // window.achievementsSystem?.hideAchievementsPanel(); // Зависимость от глобального объекта, лучше передать через конструктор
      if (this.achievementManagerRef) this.achievementManagerRef.hideAchievementsPanel();
    }
  }

  /**
   * Показывает панель магазина.
   */
  showShopPanel() {
    if (this.shopPanelElement) {
      this.shopPanelElement.style.display = 'flex';
      this.shopPanelVisible = true;
      this._updateShopDisplay();
    }
  }

  /**
   * Скрывает панель магазина.
   */
  hideShopPanel() {
    if (this.shopPanelElement) {
      this.shopPanelElement.style.display = 'none';
      this.shopPanelVisible = false;
    }
  }

  /**
   * Покупает товар магазина.
   * @param {string} itemId - ID товара.
   */
  purchaseItem(itemId) {
    const item = this.items[itemId];
    if (!item) {
      console.warn(`⚠️ Item with ID ${itemId} not found in shop config.`);
      return;
    }

    const itemState = this.gameState.shopItems[itemId];
    if (!itemState) {
      console.error(`❌ Item state for ${itemId} not initialized in gameState.`);
      return;
    }

    // Проверяем, активен ли уже этот бонус
    if (itemState.active) {
      this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].shop.active);
      // или более конкретное сообщение через localization
      return;
    }

    // Проверяем достаточно ли кристаллов
    if (this.gameState.coins < item.baseCost) {
      const msg = this.localization.formatString(
        this.localization.translations[this.localization.getCurrentLanguage()].tooltips.noSave, // Переиспользуем строку, если нет подходящей
        { required: item.baseCost, current: this.gameState.coins }
      );
      this.showTooltip(msg);
      return;
    }

    // Списание кристаллов
    this.gameState.coins -= item.baseCost;
    itemState.purchased = true;
    itemState.active = true;
    itemState.timeLeft = item.duration;

    // Увеличиваем счётчик использованных бустов
    this.gameMetrics.boostersUsed = (this.gameMetrics.boostersUsed || 0) + 1;

    // Обновляем достижения
    this.achievementManager.incrementBoosters(1);

    // Обновляем UI
    this.updateHUD();
    this.updateUpgradeButtons();
    this._updateShopDisplay();

    // Показываем уведомление
    const durationSec = Math.floor(item.duration / 1000);
    const msg = this.localization.formatString(
      this.localization.translations[this.localization.getCurrentLanguage()].tooltips.helperAvailable, // Переиспользуем строку, если нет подходящей
      { duration: durationSec }
    );
    this.showTooltip(msg);

    // Визуальный эффект покупки
    const shopItemElement = document.getElementById(`shop${this._capitalizeFirstLetter(itemId)}`);
    if (shopItemElement) {
      shopItemElement.style.transform = 'scale(1.1)';
      shopItemElement.style.boxShadow = '0 0 15px #4CAF50';
      setTimeout(() => {
        shopItemElement.style.transform = '';
        shopItemElement.style.boxShadow = '';
      }, 300);
    }

    // Сохраняем
    this.saveGame();

    // Звук
    this.playSound('upgradeSound');
  }

  /**
   * Обновляет состояние активных бонусов (уменьшает таймер).
   * @private
   */
  _updateActiveBonuses() {
    let updated = false;
    for (const [itemId, itemState] of Object.entries(this.gameState.shopItems)) {
      if (itemState.active) {
        itemState.timeLeft -= 1000;
        if (itemState.timeLeft <= 0) {
          itemState.active = false;
          itemState.timeLeft = 0;
          updated = true;
          // Уведомление об окончании бонуса
          const msg = this.localization.formatString(
            this.localization.translations[this.localization.getCurrentLanguage()].tooltips.helperEnd, // Переиспользуем строку, если нет подходящей
            { itemName: this.getItemName(itemId) }
          );
          this.showTooltip(msg);
        }
      }
    }

    if (updated) {
      this._updateShopDisplay();
      this.saveGame();
    }
  }

  /**
   * Обновляет отображение магазина (цены, состояния).
   * @private
   */
  _updateShopDisplay() {
    for (const [itemId, itemState] of Object.entries(this.gameState.shopItems)) {
      const shopItemElement = document.getElementById(`shop${this._capitalizeFirstLetter(itemId)}`);
      if (!shopItemElement) continue;

      const item = this.items[itemId];
      const costElement = shopItemElement.querySelector('.shop-cost');
      if (!costElement) continue;

      // Обновляем стоимость/таймер
      if (itemState.active) {
        const timeLeft = Math.ceil(itemState.timeLeft / 1000);
        costElement.textContent = `${timeLeft}s`;
        costElement.style.color = '#4CAF50';
      } else {
        costElement.textContent = item.baseCost;
        // Подсвечиваем если не хватает кристаллов
        if (this.gameState.coins < item.baseCost) {
          costElement.style.color = '#f44336';
        } else {
          costElement.style.color = '#FFD54F';
        }
      }

      // Обновляем состояние
      if (itemState.active) {
        shopItemElement.classList.add('active');
        shopItemElement.classList.remove('disabled');
      } else if (this.gameState.coins < item.baseCost) {
        shopItemElement.classList.add('disabled');
        shopItemElement.classList.remove('active');
      } else {
        shopItemElement.classList.remove('active', 'disabled');
      }
    }
    // Обновляем переводы
    this._updateTranslations();
  }

  /**
   * Обновляет переводы в UI магазина.
   * @private
   */
  _updateTranslations() {
    if (!this.shopPanelElement) return;

    const title = this.shopPanelElement.querySelector('h3');
    if (title) this.localization.applyTranslation(title, 'shop.title');

    for (const [itemId, item] of Object.entries(this.items)) {
      const shopItemElement = document.getElementById(`shop${this._capitalizeFirstLetter(itemId)}`);
      if (!shopItemElement) continue;

      const span = shopItemElement.querySelector('span');
      if (span) {
        this.localization.applyTranslation(span, `shop.${item.name}`);
      }
    }
  }

  /**
   * Возвращает имя товара из переводов.
   * @param {string} itemId - ID товара.
   * @returns {string}
   */
  getItemName(itemId) {
    const item = this.items[itemId];
    if (!item) return itemId;

    // Попробуем получить перевод через localization
    // Предположим, что в translations есть путь `shop.${item.name}`
    const translations = this.localization.translations[this.localization.getCurrentLanguage()];
    if (translations && translations.shop && translations.shop[item.name]) {
      return translations.shop[item.name];
    }
    // Если перевод не найден, возвращаем эффект из конфига или ID
    return item.effect || item.name;
  }

  /**
   * Возвращает модификатор скорости для блоков (для timeWarp).
   * @returns {number}
   */
  getSpeedMultiplier() {
    const itemState = this.gameState.shopItems.timeWarp;
    if (itemState && itemState.active) {
      return this.items.timeWarp.multiplier;
    }
    return 1.0;
  }

  /**
   * Возвращает модификатор награды за кристаллы (для crystalBoost).
   * @returns {number}
   */
  getCrystalMultiplier() {
    const itemState = this.gameState.shopItems.crystalBoost;
    if (itemState && itemState.active) {
      return this.items.crystalBoost.multiplier;
    }
    return 1.0;
  }

  /**
   * Возвращает модификатор силы удара (для powerSurge).
   * @returns {number}
   */
  getPowerMultiplier() {
    const itemState = this.gameState.shopItems.powerSurge;
    if (itemState && itemState.active) {
      return this.items.powerSurge.multiplier;
    }
    return 1.0;
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
   * Устанавливает ссылку на AchievementManager для интеграции.
   * @param {Object} achievementManagerRef - Ссылка на экземпляр AchievementManager или его API.
   */
  setAchievementManagerReference(achievementManagerRef) {
    this.achievementManagerRef = achievementManagerRef;
  }
}

// --- Экспорт для использования в других модулях ---
// export default ShopManager; // Можно использовать как default export