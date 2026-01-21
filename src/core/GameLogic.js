/**
 * @fileoverview Основной класс, управляющий игровой логикой.
 */

import { Localization } from './Localization.js';
import { AchievementManager } from '../managers/AchievementManager.js';
import { ShopManager } from '../managers/ShopManager.js';
import { PlanetBackgroundManager } from '../managers/PlanetBackgroundManager.js';

// --- Конфигурация игры ---
const CONFIG = {
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  blockSpeed: { desktop: 20, mobile: 25 },
  baseClickUpgradeCost: 80,
  baseHelperUpgradeCost: 1500,
  baseCritChanceCost: 500,
  baseCritMultiplierCost: 800,
  baseHelperDmgCost: 1000,
  AU_TO_DAMAGE: 149597870.691,
  COMBO_TIME_WINDOW_MS: { desktop: 2000, mobile: 1500 },
  HELPER_ATTACK_INTERVAL_MS: 1500,
  HELPER_DURATION_MS: 60000,
  BLOCK_SIZE_BASE: { desktop: 60, mobile: 80 },
  EXPLOSION_SIZE: { desktop: 200, mobile: 150 },
  PARTICLE_COUNT: { desktop: 25, mobile: 20 }
};

// --- Астрономические единицы для планет ---
const ASTRONOMICAL_UNITS = {
  mercury: 0.38710,
  venus: 0.72333,
  earth: 1.00000,
  mars: 1.52366,
  jupiter: 5.20336,
  saturn: 9.53707,
  uranus: 19.19126,
  neptune: 30.06896,
  pluto: 39.48200
};

// --- Требования к локациям ---
const LOCATION_REQUIREMENTS = {
  mercury: { damageRequired: 0, targetAU: ASTRONOMICAL_UNITS.mercury, nextLocation: 'venus' },
  venus: { damageRequired: 0, targetAU: ASTRONOMICAL_UNITS.venus, nextLocation: 'earth' },
  earth: { damageRequired: 0, targetAU: ASTRONOMICAL_UNITS.earth, nextLocation: 'mars' },
  mars: { damageRequired: 0, targetAU: ASTRONOMICAL_UNITS.mars, nextLocation: 'jupiter' },
  jupiter: { damageRequired: 0, targetAU: ASTRONOMICAL_UNITS.jupiter, nextLocation: 'saturn' },
  saturn: { damageRequired: 0, targetAU: ASTRONOMICAL_UNITS.saturn, nextLocation: 'uranus' },
  uranus: { damageRequired: 0, targetAU: ASTRONOMICAL_UNITS.uranus, nextLocation: 'neptune' },
  neptune: { damageRequired: 0, targetAU: ASTRONOMICAL_UNITS.neptune, nextLocation: 'pluto' },
  pluto: { damageRequired: 0, targetAU: ASTRONOMICAL_UNITS.pluto, nextLocation: null }
};

// --- Информация о локациях ---
const LOCATIONS_INFO = {
  mercury: { name: "☿ Меркурий", color: "#bb86fc", coinColor: "#a0d2ff", borderColor: "#4a55e0", blockColors: ['#2962ff', '#4fc3f7', '#bb86fc', '#f8bbd0'] },
  venus: { name: "♀ Венера", color: "#ffab91", coinColor: "#a0d2ff", borderColor: "#ff5722", blockColors: ['#ff5722', '#ff9800', '#ff5722', '#e91e63'] },
  earth: { name: "♁ Земля", color: "#80deea", coinColor: "#a0d2ff", borderColor: "#0288d1", blockColors: ['#0288d1', '#29b6f6', '#00bcd4', '#00e5ff'] },
  mars: { name: "♂ Марс", color: "#a5d6a7", coinColor: "#a0d2ff", borderColor: "#388e3c", blockColors: ['#388e3c', '#66bb6a', '#9ccc65', '#d4e157'] },
  jupiter: { name: "♃ Юпитер", color: "#ce93d8", coinColor: "#a0d2ff", borderColor: "#7b1fa2", blockColors: ['#7b1fa2', '#9c27b0', '#ab47bc', '#e1bee7'] },
  saturn: { name: "♄ Сатурн", color: "#ce93d8", coinColor: "#a0d2ff", borderColor: "#7b1fa2", blockColors: ['#7b1fa2', '#9c27b0', '#ab47bc', '#e1bee7'] },
  uranus: { name: "♅ Уран", color: "#ce93d8", coinColor: "#a0d2ff", borderColor: "#7b1fa2", blockColors: ['#7b1fa2', '#9c27b0', '#ab47bc', '#e1bee7'] },
  neptune: { name: "♆ Нептун", color: "#ce93d8", coinColor: "#a0d2ff", borderColor: "#7b1fa2", blockColors: ['#7b1fa2', '#9c27b0', '#ab47bc', '#e1bee7'] },
  pluto: { name: "♇ Плутон", color: "#ce93d8", coinColor: "#a0d2ff", borderColor: "#7b1fa2", blockColors: ['#7b1fa2', '#9c27b0', '#ab47bc', '#e1bee7'] }
};

// --- Редкие блоки ---
const RARE_BLOCKS = {
  GOLD: { name: "gold", chance: 0.03, multiplier: 8, healthMultiplier: 1.8, effect: "Мгновенный бонус", className: "block-gold" },
  RAINBOW: { name: "rainbow", chance: 0.02, multiplier: 5, healthMultiplier: 1.5, effect: "Увеличение силы", className: "block-rainbow" },
  CRYSTAL: { name: "crystal", chance: 0.025, multiplier: 6, healthMultiplier: 1.6, effect: "Время помощника", className: "block-crystal" },
  MYSTERY: { name: "mystery", chance: 0.015, multiplier: 10, healthMultiplier: 2.0, effect: "Случайный бонус", className: "block-mystery" }
};

// --- Балансировка ---
const BALANCE_CONFIG = {
  baseHealth: 80,
  targetClicks: 70,
  healthRandomRange: { min: 0.8, max: 1.3 },
  damageProgression: { baseMultiplier: 1.15, diminishingReturns: 0.96, maxLevelEffect: 60 },
  rewardMultiplier: 2.5,
  comboMultiplier: 0.25,
  randomBonusRange: { min: 0.8, max: 1.5 }
};

/**
 * Класс, управляющий основной логикой игры.
 */
export class GameLogic {
  /**
   * Конструктор GameLogic.
   * @param {Object} gameState - Объект состояния игры (передаётся сюда).
   * @param {Object} gameMetrics - Объект метрик игры (передаётся сюда).
   * @param {Localization} localization - Экземпляр Localization.
   * @param {SaveLoadManager} saveLoadManager - Экземпляр SaveLoadManager.
   * @param {AchievementManager} achievementManager - Экземпляр AchievementManager.
   * @param {ShopManager} shopManager - Экземпляр ShopManager.
   * @param {PlanetBackgroundManager} planetBackgroundManager - Экземпляр PlanetBackgroundManager.
   */
  constructor(gameState, gameMetrics, localization, saveLoadManager, achievementManager, shopManager, planetBackgroundManager) {
    if (!gameState || !gameMetrics || !localization || !saveLoadManager || !achievementManager || !shopManager || !planetBackgroundManager) {
      throw new Error("GameLogic: Все зависимости обязательны для инициализации.");
    }

    this.gameState = gameState;
    this.gameMetrics = gameMetrics;
    this.localization = localization;
    this.saveLoadManager = saveLoadManager;
    this.achievementManager = achievementManager;
    this.shopManager = shopManager;
    this.planetBackgroundManager = planetBackgroundManager;

    // Конфигурация
    this.isMobile = CONFIG.isMobile;
    this.blockSpeed = this.isMobile ? CONFIG.blockSpeed.mobile : CONFIG.blockSpeed.desktop;
    this.COMBO_TIME_WINDOW = this.isMobile ? CONFIG.COMBO_TIME_WINDOW_MS.mobile : CONFIG.COMBO_TIME_WINDOW_MS.desktop;

    // DOM элементы
    this.currentBlock = null;
    this.currentBlockHealth = 0;
    this.helperElement = null;
    this.helperInterval = null;
    this.helperPosition = { x: 0, y: 0 };

    // Привязка контекста
    this.hitBlock = this.hitBlock.bind(this);
    this.animateBlock = this.animateBlock.bind(this);
    this.moveHelperToRandomPosition = this.moveHelperToRandomPosition.bind(this);
    this.helperAttack = this.helperAttack.bind(this);

    // Инициализация вспомогательных функций
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
  }

  /**
   * Инициализирует обработчики событий и начальное состояние.
   */
  init() {
    console.log('--- Инициализация GameLogic ---');
    this.initEventHandlers();
    this.updateHUD();
    this.updateUpgradeButtons();
    this.setLocation(this.gameState.currentLocation);
    this.localization.updateLanguageFlag();
    this.updateContinueButton();
    this.updateAllTranslations();
    console.log('--- Инициализация GameLogic завершена ---');
  }

  /**
   * Инициализирует обработчики событий DOM.
   * @private
   */
  initEventHandlers() {
    // Язык
    const langBtnWelcome = document.getElementById('langBtn-welcome');
    if (langBtnWelcome) {
      langBtnWelcome.addEventListener('click', () => this.localization.switchLanguage());
      langBtnWelcome.addEventListener('touchstart', (e) => { e.preventDefault(); this.localization.switchLanguage(); }, { passive: false });
    }

    // Кнопки основного экрана
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.showSaveScreen());
      startBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.showSaveScreen(); }, { passive: false });
    }

    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        console.log('🔄 Проверка сохранения...');
        const hasSave = this.saveLoadManager.hasSave(); // Предположим, что SaveLoadManager имеет такой метод
        if (hasSave) {
          console.log('✅ Сохранение найдено');
          this.showSaveScreen();
        } else {
          console.log('❌ Сохранение не найдено');
          this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].tooltips.noSave);
          setTimeout(this.hideTooltip, 2000);
        }
      });
      continueBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const hasSave = this.saveLoadManager.hasSave();
        if (hasSave) this.showSaveScreen();
        else {
          this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].tooltips.noSave);
          setTimeout(this.hideTooltip, 2000);
        }
      }, { passive: false });
    }

    // Кнопки экрана сохранения
    const loadSaveBtn = document.getElementById('loadSaveBtn');
    if (loadSaveBtn) {
      loadSaveBtn.addEventListener('click', () => this.continueGame());
      loadSaveBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.continueGame(); }, { passive: false });
    }

    const newGameBtn = document.getElementById('newGameBtn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => this.startGame(true));
      newGameBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.startGame(true); }, { passive: false });
    }

    const cancelSaveBtn = document.getElementById('cancelSaveBtn');
    if (cancelSaveBtn) {
      cancelSaveBtn.addEventListener('click', () => { document.getElementById('saveScreen').style.display = "none"; });
      cancelSaveBtn.addEventListener('touchstart', (e) => { e.preventDefault(); document.getElementById('saveScreen').style.display = "none"; }, { passive: false });
    }

    // Кнопки улучшений
    const upgradeClickBtn = document.getElementById('upgradeClickBtn');
    const upgradeHelperBtn = document.getElementById('upgradeHelperBtn');
    const upgradeCritChanceBtn = document.getElementById('upgradeCritChanceBtn');
    const upgradeCritMultBtn = document.getElementById('upgradeCritMultBtn');
    const upgradeHelperDmgBtn = document.getElementById('upgradeHelperDmgBtn');

    if (upgradeClickBtn) {
      upgradeClickBtn.addEventListener('click', () => this.buyClickPower());
      upgradeClickBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.buyClickPower(); }, { passive: false });
      upgradeClickBtn.addEventListener('mouseenter', () => this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].tooltips.upgradeClick));
      upgradeClickBtn.addEventListener('mouseleave', this.hideTooltip);
    }
    if (upgradeHelperBtn) {
      upgradeHelperBtn.addEventListener('click', () => this.buyHelper());
      upgradeHelperBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.buyHelper(); }, { passive: false });
      upgradeHelperBtn.addEventListener('mouseenter', () => this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].tooltips.upgradeHelper));
      upgradeHelperBtn.addEventListener('mouseleave', this.hideTooltip);
    }
    if (upgradeCritChanceBtn) {
      upgradeCritChanceBtn.addEventListener('click', () => this.buyCritChance());
      upgradeCritChanceBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.buyCritChance(); }, { passive: false });
      upgradeCritChanceBtn.addEventListener('mouseenter', () => this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].tooltips.upgradeCritChance));
      upgradeCritChanceBtn.addEventListener('mouseleave', this.hideTooltip);
    }
    if (upgradeCritMultBtn) {
      upgradeCritMultBtn.addEventListener('click', () => this.buyCritMultiplier());
      upgradeCritMultBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.buyCritMultiplier(); }, { passive: false });
      upgradeCritMultBtn.addEventListener('mouseenter', () => this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].tooltips.upgradeCritMult));
      upgradeCritMultBtn.addEventListener('mouseleave', this.hideTooltip);
    }
    if (upgradeHelperDmgBtn) {
      upgradeHelperDmgBtn.addEventListener('click', () => this.buyHelperDamage());
      upgradeHelperDmgBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.buyHelperDamage(); }, { passive: false });
      upgradeHelperDmgBtn.addEventListener('mouseenter', () => this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].tooltips.upgradeHelperDmg));
      upgradeHelperDmgBtn.addEventListener('mouseleave', this.hideTooltip);
    }

    // Кнопки экрана окончания игры
    const restartBtn = document.getElementById('restartBtn');
    const shareBtn = document.getElementById('shareBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restartGame());
      restartBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.restartGame(); }, { passive: false });
    }
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareResult());
      shareBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.shareResult(); }, { passive: false });
    }

    // Кнопка сохранения
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveLoadManager.saveGame());
      saveBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.saveLoadManager.saveGame(); }, { passive: false });
    }

    // Обработчик изменения размера окна
    window.addEventListener('resize', () => {
      if (this.helperElement) this.moveHelperToRandomPosition();
    });
  }

  // --- Вспомогательные функции ---
  /**
   * @private
   */
  getCurrentSpeed() {
    let baseSpeed = this.blockSpeed;
    const locationIndex = Object.keys(LOCATION_REQUIREMENTS).indexOf(this.gameState.currentLocation);
    if (locationIndex < 3) return baseSpeed * 0.85;
    // Применяем модификатор из магазина (timeWarp)
    return baseSpeed * this.shopManager.getSpeedMultiplier();
  }

  /**
   * @private
   */
  calculateBlockHealth() {
    const currentReq = LOCATION_REQUIREMENTS[this.gameState.currentLocation];
    const locationBonus = 1 + (currentReq.targetAU * 2);
    let baseHealth = BALANCE_CONFIG.baseHealth * locationBonus;
    const targetHealth = this.gameState.clickPower * BALANCE_CONFIG.targetClicks;
    const combinedHealth = (baseHealth + targetHealth) / 2;
    const randomFactor = BALANCE_CONFIG.healthRandomRange.min +
                        Math.random() * (BALANCE_CONFIG.healthRandomRange.max - BALANCE_CONFIG.healthRandomRange.min);
    return Math.floor(combinedHealth * randomFactor);
  }

  /**
   * @private
   */
  calculateClickPower() {
    const basePower = 1;
    const upgradeBonus = this.gameState.clickUpgradeLevel;
    const diminishingEffect = Math.pow(BALANCE_CONFIG.damageProgression.diminishingReturns,
                                      Math.min(this.gameState.clickUpgradeLevel, BALANCE_CONFIG.damageProgression.maxLevelEffect));
    const nonLinearGrowth = Math.sqrt(this.gameState.clickUpgradeLevel + 1);
    return basePower + (upgradeBonus * diminishingEffect * nonLinearGrowth * BALANCE_CONFIG.damageProgression.baseMultiplier);
  }

  /**
   * @private
   */
  getRareBlockType() {
    const rand = Math.random();
    let cumulativeChance = 0;
    for (const [type, block] of Object.entries(RARE_BLOCKS)) {
      cumulativeChance += block.chance;
      if (rand <= cumulativeChance) return type;
    }
    return null;
  }

  /**
   * @private
   */
  announceRareBlock(blockName) {
    const announce = document.createElement('div');
    announce.className = 'rare-block-announce';
    announce.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.8em;
      font-weight: bold;
      color: gold;
      z-index: 50;
      text-shadow: 0 0 10px black;
      animation: fadeInOut 2s;
    `;
    // Используем перевод
    const localizedBlockName = this.localization.translations[this.localization.getCurrentLanguage()].rareBlocks[blockName] || blockName;
    announce.textContent = `🌟 ${localizedBlockName} блок! 🌟`;
    document.body.appendChild(announce);
    setTimeout(() => {
      if (announce.parentNode) document.body.removeChild(announce);
    }, 2000);
  }

  // --- Обновление UI ---
  /**
   * Обновляет отображение HUD.
   */
  updateHUD() {
    const coinsDisplay = document.getElementById('coins-value');
    const clickPowerDisplay = document.getElementById('clickPower-value');
    const critChanceDisplay = document.getElementById('critChance-value');
    const critMultiplierDisplay = document.getElementById('critMultiplier-value');

    if (coinsDisplay) coinsDisplay.textContent = Math.floor(this.gameState.coins).toLocaleString();
    if (clickPowerDisplay) clickPowerDisplay.textContent = Math.round(this.gameState.clickPower);
    if (critChanceDisplay) critChanceDisplay.textContent = `${(this.gameState.critChance * 100).toFixed(1)}%`;
    if (critMultiplierDisplay) critMultiplierDisplay.textContent = `x${this.gameState.critMultiplier.toFixed(1)}`;
  }

  /**
   * Обновляет состояние кнопок улучшений.
   */
  updateUpgradeButtons() {
    const clickCost = Math.floor(CONFIG.baseClickUpgradeCost * Math.pow(1.5, this.gameState.clickUpgradeLevel));
    const upgradeClickBtn = document.getElementById('upgradeClickBtn');
    if (upgradeClickBtn) {
      upgradeClickBtn.querySelector('.upgrade-cost').textContent = clickCost.toLocaleString();
      if (this.gameState.coins >= clickCost) {
        upgradeClickBtn.className = "upgrade-btn btn-available";
        upgradeClickBtn.title = this.localization.translations[this.localization.getCurrentLanguage()].tooltips.upgradeClick;
      } else {
        upgradeClickBtn.className = "upgrade-btn btn-unavailable";
        upgradeClickBtn.title = this.localization.translations[this.localization.getCurrentLanguage()].tooltips.noSave; // или другая строка
      }
    }

    const helperCost = Math.floor(CONFIG.baseHelperUpgradeCost * Math.pow(1.4, this.gameState.helperUpgradeLevel));
    const upgradeHelperBtn = document.getElementById('upgradeHelperBtn');
    if (upgradeHelperBtn) {
      upgradeHelperBtn.querySelector('.upgrade-cost').textContent = helperCost.toLocaleString();
      if (this.gameState.coins >= helperCost && !this.gameState.helperActive) {
        upgradeHelperBtn.className = "upgrade-btn btn-available";
        upgradeHelperBtn.title = this.localization.translations[this.localization.getCurrentLanguage()].tooltips.upgradeHelper;
      } else {
        upgradeHelperBtn.className = "upgrade-btn btn-unavailable";
        upgradeHelperBtn.title = this.gameState.helperActive ? this.localization.translations[this.localization.getCurrentLanguage()].tooltips.helperAvailable : this.localization.translations[this.localization.getCurrentLanguage()].tooltips.noSave;
      }
    }

    const critChanceCost = Math.floor(CONFIG.baseCritChanceCost * Math.pow(1.3, this.gameState.critChanceUpgradeLevel));
    const upgradeCritChanceBtn = document.getElementById('upgradeCritChanceBtn');
    if (upgradeCritChanceBtn) {
      upgradeCritChanceBtn.querySelector('.upgrade-cost').textContent = critChanceCost.toLocaleString();
      if (this.gameState.coins >= critChanceCost) {
        upgradeCritChanceBtn.className = "upgrade-btn btn-available";
        upgradeCritChanceBtn.title = this.localization.translations[this.localization.getCurrentLanguage()].tooltips.upgradeCritChance;
      } else {
        upgradeCritChanceBtn.className = "upgrade-btn btn-unavailable";
        upgradeCritChanceBtn.title = this.localization.translations[this.localization.getCurrentLanguage()].tooltips.noSave;
      }
    }

    const critMultiplierCost = Math.floor(CONFIG.baseCritMultiplierCost * Math.pow(1.25, this.gameState.critMultiplierUpgradeLevel));
    const upgradeCritMultBtn = document.getElementById('upgradeCritMultBtn');
    if (upgradeCritMultBtn) {
      upgradeCritMultBtn.querySelector('.upgrade-cost').textContent = critMultiplierCost.toLocaleString();
      if (this.gameState.coins >= critMultiplierCost) {
        upgradeCritMultBtn.className = "upgrade-btn btn-available";
        upgradeCritMultBtn.title = this.localization.translations[this.localization.getCurrentLanguage()].tooltips.upgradeCritMult;
      } else {
        upgradeCritMultBtn.className = "upgrade-btn btn-unavailable";
        upgradeCritMultBtn.title = this.localization.translations[this.localization.getCurrentLanguage()].tooltips.noSave;
      }
    }

    const helperDmgCost = Math.floor(CONFIG.baseHelperDmgCost * Math.pow(1.8, this.gameState.helperUpgradeLevel));
    const upgradeHelperDmgBtn = document.getElementById('upgradeHelperDmgBtn');
    if (upgradeHelperDmgBtn) {
      upgradeHelperDmgBtn.querySelector('.upgrade-cost').textContent = helperDmgCost.toLocaleString();
      if (this.gameState.coins >= helperDmgCost) {
        upgradeHelperDmgBtn.className = "upgrade-btn btn-available";
        upgradeHelperDmgBtn.title = this.localization.translations[this.localization.getCurrentLanguage()].tooltips.upgradeHelperDmg;
      } else {
        upgradeHelperDmgBtn.className = "upgrade-btn btn-unavailable";
        upgradeHelperDmgBtn.title = this.localization.translations[this.localization.getCurrentLanguage()].tooltips.noSave;
      }
    }
  }

  /**
   * Обновляет прогресс-бар.
   */
  updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const currentReq = LOCATION_REQUIREMENTS[this.gameState.currentLocation];
    const currentAU = this.gameState.totalDamageDealt / CONFIG.AU_TO_DAMAGE;
    const targetAU = currentReq.targetAU;
    const percentage = Math.min(100, (currentAU / targetAU) * 100);

    if (progressBar) progressBar.style.width = percentage + '%';
    if (progressText) {
      this.localization.applyTranslation(progressText, 'progressText', {
        current: currentAU.toFixed(5),
        target: targetAU.toFixed(5),
        percent: percentage.toFixed(1)
      });
    }
  }

  /**
   * Проверяет, нужно ли перейти на следующую локацию.
   */
  checkLocationUpgrade() {
    const currentReq = LOCATION_REQUIREMENTS[this.gameState.currentLocation];
    const nextLocation = currentReq.nextLocation;
    const currentAU = this.gameState.totalDamageDealt / CONFIG.AU_TO_DAMAGE;
    const targetAU = currentReq.targetAU;

    if (nextLocation && currentAU >= targetAU) {
      this.setLocation(nextLocation);
      const tooltipText = this.localization.formatString(
        this.localization.translations[this.localization.getCurrentLanguage()].locationProgress.unlocked,
        { location: LOCATIONS_INFO[nextLocation].name }
      );
      this.showTooltip(tooltipText);
      setTimeout(this.hideTooltip, 3000);
    }
    this.updateProgressBar();
  }

  /**
   * Устанавливает текущую локацию.
   * @param {string} loc - Код локации.
   */
  setLocation(loc) {
    this.gameState.currentLocation = loc;
    const gameTitle = document.getElementById('gameTitle');
    const header = document.getElementById('header');

    if (gameTitle) this.localization.applyTranslation(gameTitle, `gameTitle.${loc}`);
    if (header) header.style.borderColor = LOCATIONS_INFO[loc].borderColor;

    // Обновляем фон через PlanetBackgroundManager
    this.planetBackgroundManager.setPlanet(loc);

    const levelAnnounce = document.getElementById('levelAnnounce');
    if (levelAnnounce) {
      levelAnnounce.textContent = LOCATIONS_INFO[loc].name;
      levelAnnounce.style.color = LOCATIONS_INFO[loc].color;
      levelAnnounce.style.opacity = "1";
      setTimeout(() => {
        levelAnnounce.style.opacity = "0";
      }, 2000);
    }

    // Обновляем достижения по исследованию планет
    const planetOrder = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    const planetIndex = planetOrder.indexOf(loc) + 1;
    this.achievementManager.updatePlanetProgress(planetIndex);

    this.updateProgressBar();
  }

  // --- Визуальные эффекты ---
  /**
   * @private
   */
  createDamageText(damage, block, color = '#ff4444') {
    const rect = block.getBoundingClientRect();
    const text = document.createElement('div');
    text.className = 'damage-text';
    text.textContent = `-${damage}`;
    text.style.color = color;
    let left = rect.left + rect.width / 2;
    let top = rect.top;
    const textWidth = 100;
    if (left < textWidth / 2) left = textWidth / 2;
    if (left > window.innerWidth - textWidth / 2) left = window.innerWidth - textWidth / 2;
    if (top < 50) top = 50;
    text.style.left = left + 'px';
    text.style.top = top + 'px';
    document.body.appendChild(text);

    let opacity = 1;
    let yPos = parseInt(text.style.top);
    function animate() {
      opacity -= 0.02;
      yPos -= 2;
      text.style.opacity = opacity;
      text.style.top = yPos + 'px';
      if (opacity > 0) requestAnimationFrame(animate);
      else if (text.parentNode) document.body.removeChild(text);
    }
    animate();
  }

  /**
   * @private
   */
  showComboText(combo, bonus, block) {
    const rect = block.getBoundingClientRect();
    const text = document.createElement('div');
    text.className = 'combo-text';
    text.textContent = this.localization.formatString(
      this.localization.translations[this.localization.getCurrentLanguage()].tooltips.combo,
      { count: combo, bonus: bonus }
    );
    let left = rect.left + rect.width / 2;
    let top = rect.top;
    const textWidth = 150;
    if (left < textWidth / 2) left = textWidth / 2;
    if (left > window.innerWidth - textWidth / 2) left = window.innerWidth - textWidth / 2;
    if (top < 50) top = 50;
    text.style.left = left + 'px';
    text.style.top = top + 'px';
    document.body.appendChild(text);
    setTimeout(() => { if (text.parentNode) document.body.removeChild(text); }, 1000);
  }

  /**
   * @private
   */
  showRewardText(reward, block) {
    const rect = block.getBoundingClientRect();
    const text = document.createElement('div');
    text.className = 'reward-text';
    text.textContent = this.localization.formatString(
      this.localization.translations[this.localization.getCurrentLanguage()].tooltips.reward,
      { reward: reward }
    );
    let left = rect.left + rect.width / 2;
    let top = rect.top + rect.height / 2;
    const textWidth = 120;
    if (left < textWidth / 2) left = textWidth / 2;
    if (left > window.innerWidth - textWidth / 2) left = window.innerWidth - textWidth / 2;
    if (top < 50) top = 50;
    text.style.left = left + 'px';
    text.style.top = top + 'px';
    document.body.appendChild(text);
    setTimeout(() => { if (text.parentNode) document.body.removeChild(text); }, 1500);
  }

  /**
   * @private
   */
  createExplosion(block) {
    const rect = block.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const explosionSize = this.isMobile ? CONFIG.EXPLOSION_SIZE.mobile : CONFIG.EXPLOSION_SIZE.desktop;
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = centerX + 'px';
    explosion.style.top = centerY + 'px';
    explosion.style.width = explosionSize + 'px';
    explosion.style.height = explosionSize + 'px';
    document.body.appendChild(explosion);

    const particleCount = this.isMobile ? CONFIG.PARTICLE_COUNT.mobile : CONFIG.PARTICLE_COUNT.desktop;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'explosion-particle';
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      const particleSize = this.isMobile ? 10 : 12;
      particle.style.width = particleSize + 'px';
      particle.style.height = particleSize + 'px';
      const location = LOCATIONS_INFO[this.gameState.currentLocation];
      particle.style.backgroundColor = location.blockColors[Math.floor(Math.random() * location.blockColors.length)];
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      document.body.appendChild(particle);
      setTimeout(() => { if (particle.parentNode) document.body.removeChild(particle); }, 800);
    }

    setTimeout(() => { if (explosion.parentNode) document.body.removeChild(explosion); }, 600);
  }

  /**
   * @private
   */
  updateCracks(block, health) {
    if (!block) return;
    const existingCrack = block.querySelector('.crack-overlay');
    if (existingCrack) block.removeChild(existingCrack);

    const maxHealth = parseInt(block.dataset.maxHealth);
    const damageRatio = 1 - (health / maxHealth);

    if (damageRatio > 0.7) addCracks(block, 'crack-3');
    else if (damageRatio > 0.4) addCracks(block, 'crack-2');
    else if (damageRatio > 0.1) addCracks(block, 'crack-1');

    function addCracks(block, crackLevel) {
      const crackOverlay = document.createElement('div');
      crackOverlay.className = `crack-overlay ${crackLevel}`;
      block.appendChild(crackOverlay);
    }
  }

  /**
   * Воспроизводит звук.
   * @param {string} soundId - ID HTML-элемента audio.
   */
  playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log("Audio play failed:", e));
    }
  }

  // --- Основная игровая логика ---
  /**
   * Обрабатывает удар по блоку.
   * @param {HTMLElement} block - HTML-элемент блока.
   * @param {number} damage - Базовый урон.
   */
  hitBlock(block, damage) {
    if (!this.gameState.gameActive) return;
    if (navigator.vibrate) navigator.vibrate(50);
    this.playSound('clickSound');

    block.style.transform = 'translateX(-50%) scale(0.85)';
    setTimeout(() => { block.style.transform = 'translateX(-50%) scale(1);' }, 100);

    let finalDamage = Math.round(damage);

    // Применяем модификатор из магазина (powerSurge)
    if (this.shopManager.getPowerMultiplier() > 1.0) {
        finalDamage = Math.round(finalDamage * this.shopManager.getPowerMultiplier());
    }

    let isCrit = false;
    if (Math.random() < this.gameState.critChance) {
      finalDamage = Math.round(damage * this.gameState.critMultiplier);
      isCrit = true;
      this.gameMetrics.totalCrits = (this.gameMetrics.totalCrits || 0) + 1;
      this.achievementManager.incrementCrits(1);
    }

    this.currentBlockHealth -= finalDamage;
    this.gameState.totalDamageDealt += finalDamage;
    this.gameMetrics.totalClicks = (this.gameMetrics.totalClicks || 0) + 1;

    this.createDamageText(finalDamage, block, isCrit ? '#FFD700' : '#ff4444');
    this.checkLocationUpgrade();

    if (this.currentBlockHealth <= 0) {
      this.destroyBlock(block);
    } else {
      block.textContent = Math.floor(this.currentBlockHealth);
      this.updateCracks(block, this.currentBlockHealth);
    }
  }

  /**
   * Уничтожает блок.
   * @param {HTMLElement} block - HTML-элемент блока.
   * @private
   */
  destroyBlock(block) {
    const now = Date.now();
    if (now - this.gameState.lastDestroyTime < this.COMBO_TIME_WINDOW) {
      this.gameState.comboCount = (this.gameState.comboCount || 0) + 1;
    } else {
      this.gameState.comboCount = 1;
    }
    this.gameState.lastDestroyTime = now;

    const baseReward = 25 + (LOCATION_REQUIREMENTS[this.gameState.currentLocation].targetAU * 100);
    let reward = Math.floor(baseReward * BALANCE_CONFIG.rewardMultiplier);
    const randomBonus = BALANCE_CONFIG.randomBonusRange.min +
                        Math.random() * (BALANCE_CONFIG.randomBonusRange.max - BALANCE_CONFIG.randomBonusRange.min);
    reward = Math.floor(reward * randomBonus);

    // Бонус от Bobo
    if (this.gameState.boboCoinBonus > 0) {
      reward = Math.floor(reward * (1 + this.gameState.boboCoinBonus));
    }

    // Бонус от магазина (усилитель кристаллов)
    if (this.shopManager.getCrystalMultiplier() > 1.0) {
        reward = Math.floor(reward * this.shopManager.getCrystalMultiplier());
    }

    // Проверка на редкий блок
    let isRare = false;
    for (const type in RARE_BLOCKS) {
      if (block.classList.contains(RARE_BLOCKS[type].className)) {
        isRare = true;
        reward = Math.floor(reward * RARE_BLOCKS[type].multiplier);
        break;
      }
    }

    // Бонус за комбо
    if (this.gameState.comboCount > 1) {
      const comboBonus = Math.floor(reward * (this.gameState.comboCount * BALANCE_CONFIG.comboMultiplier));
      reward += comboBonus;
      this.showComboText(this.gameState.comboCount, comboBonus, block);
      this.playSound('comboSound');
    }

    this.gameState.coins += reward;
    this.gameMetrics.blocksDestroyed = (this.gameMetrics.blocksDestroyed || 0) + 1;
    this.gameMetrics.totalCoinsEarned = (this.gameMetrics.totalCoinsEarned || 0) + reward;

    this.achievementManager.incrementBlocksDestroyed(1);
    this.achievementManager.incrementCoinsEarned(reward);

    if (this.gameState.comboCount > (this.gameMetrics.maxCombo || 0)) {
      this.gameMetrics.maxCombo = this.gameState.comboCount;
      this.achievementManager.updateCombo(this.gameState.comboCount);
    }

    this.updateHUD();
    this.updateUpgradeButtons();
    this.playSound('breakSound');
    this.showRewardText(reward, block);
    this.createExplosion(block);

    const gameArea = document.getElementById('gameArea');
    if (gameArea && gameArea.contains(block)) {
      gameArea.removeChild(block);
    }

    this.currentBlock = null;
    this.currentBlockHealth = 0;
    setTimeout(() => { if (this.gameState.gameActive) this.createMovingBlock(); }, 500);
  }

  /**
   * @private
   */
  getBlockSize() {
    const baseSize = this.isMobile ? CONFIG.BLOCK_SIZE_BASE.mobile : CONFIG.BLOCK_SIZE_BASE.desktop;
    const locationIndex = Object.keys(LOCATION_REQUIREMENTS).indexOf(this.gameState.currentLocation);
    if (locationIndex < 3) return baseSize * 1.2;
    return baseSize * (1 + locationIndex * 0.15);
  }

  /**
   * Создаёт новый движущийся блок.
   * @private
   */
  createMovingBlock() {
    const gameArea = document.getElementById('gameArea');
    if (!gameArea) return;

    if (this.currentBlock && gameArea.contains(this.currentBlock)) {
      gameArea.removeChild(this.currentBlock);
    }

    const blockHealth = this.calculateBlockHealth();
    this.currentBlockHealth = blockHealth;
    const block = document.createElement("div");
    block.className = "moving-block";

    const size = this.getBlockSize();
    block.style.width = size + "px";
    block.style.height = size + "px";
    block.style.bottom = "0px";
    block.dataset.maxHealth = blockHealth;

    const theme = LOCATIONS_INFO[this.gameState.currentLocation];
    const colorIndex = Math.floor(Math.random() * theme.blockColors.length);
    const potentialRareType = this.getRareBlockType();

    if (potentialRareType) {
      const rareBlock = RARE_BLOCKS[potentialRareType];
      block.classList.add(rareBlock.className);
      this.currentBlockHealth = Math.floor(this.currentBlockHealth * rareBlock.healthMultiplier);
      // Используем перевод для названия редкого блока
      const localizedRareName = this.localization.translations[this.localization.getCurrentLanguage()].rareBlocks[rareBlock.name] || rareBlock.name;
      block.innerHTML = `🌟<div style="font-size: 0.35em; margin-top: 1px; line-height: 1.1;">${localizedRareName}</div>`;
      this.announceRareBlock(rareBlock.name);
    } else {
      block.style.background = `linear-gradient(135deg, ${theme.blockColors[colorIndex]}, ${theme.blockColors[(colorIndex + 1) % theme.blockColors.length]})`;
      block.style.boxShadow = `0 0 15px ${theme.blockColors[colorIndex]}`;
      block.style.border = `2px solid ${theme.borderColor}`;
      block.textContent = blockHealth;
    }

    block.addEventListener('click', (e) => { e.stopPropagation(); this.hitBlock(block, this.gameState.clickPower); });
    block.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hitBlock(block, this.gameState.clickPower);
    }, { passive: false });

    gameArea.appendChild(block);
    this.currentBlock = block;
    this.animateBlock(block);
  }

  /**
   * Анимирует движение блока.
   * @param {HTMLElement} block - HTML-элемент блока.
   * @private
   */
  animateBlock(block) {
    if (!this.gameState.gameActive) return;
    const speed = this.getCurrentSpeed();
    let position = parseInt(block.style.bottom) || 0;

    const move = () => {
      if (!this.gameState.gameActive || this.currentBlock !== block) return;
      position += speed / 30;
      block.style.bottom = position + "px";
      if (position > window.innerHeight) {
        this.gameOver();
        return;
      }
      requestAnimationFrame(move);
    };
    move();
  }

  /**
   * Завершает игру.
   * @param {string} customMessage - Пользовательское сообщение.
   */
  gameOver(customMessage = null) {
    this.gameState.gameActive = false;
    this.gameState.helperActive = false;

    if (this.helperInterval) {
      clearInterval(this.helperInterval);
      this.helperInterval = null;
    }
    if (this.helperElement && this.helperElement.parentNode) {
      document.body.removeChild(this.helperElement);
      this.helperElement = null;
    }

    const sessionTime = Date.now() - this.gameMetrics.startTime;
    console.log('🎮 [Космический Кликер] Сессия завершена:', {
      session: this.gameMetrics.sessions,
      duration_sec: Math.round(sessionTime / 1000),
      total_damage: this.gameState.totalDamageDealt,
      current_location: this.gameState.currentLocation,
      total_coins: this.gameState.coins,
      blocks_destroyed: this.gameMetrics.blocksDestroyed,
      upgrades_bought: this.gameMetrics.upgradesBought,
      total_clicks: this.gameMetrics.totalClicks
    });

    if (this.currentBlock) {
      const gameArea = document.getElementById('gameArea');
      if (gameArea && gameArea.contains(this.currentBlock)) {
        gameArea.removeChild(this.currentBlock);
      }
      this.currentBlock = null;
    }

    const finalScoreDisplay = document.getElementById('finalScore');
    if (finalScoreDisplay) {
      this.localization.applyTranslation(finalScoreDisplay, 'gameOver.score', {
        damage: Math.floor(this.gameState.totalDamageDealt).toLocaleString()
      });
    }

    const gameOverScreen = document.getElementById('gameOverScreen');
    if (gameOverScreen) gameOverScreen.style.display = "flex";

    if (customMessage) {
      const h2 = gameOverScreen.querySelector('h2');
      if (h2) h2.textContent = customMessage;
    }
  }

  /**
   * Делится результатом.
   */
  shareResult() {
    const shareText = `🎮 Я нанес ${Math.floor(this.gameState.totalDamageDealt).toLocaleString()} урона и собрал ${Math.floor(this.gameState.coins)} Кристаллов в Космическом Кликере! 🌌\nСможешь побить мой рекорд?`;
    if (navigator.share) {
      navigator.share({
        title: 'Мой рекорд в Космическом Кликере!',
        text: shareText
      }).then(() => {
        this.gameState.coins += 50;
        this.updateHUD();
        this.updateUpgradeButtons();
        this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].tooltips.shareSuccess);
        setTimeout(this.hideTooltip, 2000);
        this.saveLoadManager.saveGame();
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Результат скопирован! Поделись с друзьями!');
        this.gameState.coins += 50;
        this.updateHUD();
        this.updateUpgradeButtons();
        this.saveLoadManager.saveGame();
      });
    }
  }

  // --- Вспомогательные функции (Bobo) ---
  /**
   * @private
   */
  moveHelperToRandomPosition() {
    if (!this.helperElement) return;
    let blockRect = { left: window.innerWidth/2, top: window.innerHeight/2 };
    if (this.currentBlock) {
      blockRect = this.currentBlock.getBoundingClientRect();
    }
    let attempts = 0;
    let validPosition = false;
    const safeDistance = 150;
    while (!validPosition && attempts < 20) {
      attempts++;
      const randomX = Math.random() * (window.innerWidth - 60) + 30;
      const randomY = Math.random() * (window.innerHeight - 120) + 60;
      const distance = Math.sqrt(
        Math.pow(randomX - (blockRect.left + blockRect.width/2), 2) +
        Math.pow(randomY - (blockRect.top + blockRect.height/2), 2)
      );
      const safeFromEdges = randomX > 60 && randomX < window.innerWidth - 60 &&
                            randomY > 100 && randomY < window.innerHeight - 60;
      if (distance > safeDistance && safeFromEdges) {
        this.helperPosition = { x: randomX, y: randomY };
        validPosition = true;
      }
    }
    if (!validPosition) {
      this.helperPosition = {
        x: window.innerWidth * 0.7,
        y: window.innerHeight * 0.7
      };
    }
    this.helperElement.style.left = this.helperPosition.x + 'px';
    this.helperElement.style.top = this.helperPosition.y + 'px';
  }

  /**
   * @private
   */
  createHelperElement() {
    if (this.helperElement && this.helperElement.parentNode) {
      document.body.removeChild(this.helperElement);
    }
    this.helperElement = document.createElement('div');
    this.helperElement.className = 'helper';
    document.body.appendChild(this.helperElement);
    this.moveHelperToRandomPosition();
    this.helperElement.style.opacity = '0';
    setTimeout(() => { if (this.helperElement) this.helperElement.style.opacity = '1'; }, 100);
  }

  /**
   * @private
   */
  createHelperEffect() {
    if (!this.currentBlock || !this.helperElement) return;
    const blockRect = this.currentBlock.getBoundingClientRect();
    const helperRect = this.helperElement.getBoundingClientRect();
    const beamContainer = document.createElement('div');
    beamContainer.className = 'helper-beam';
    beamContainer.style.position = 'absolute';
    beamContainer.style.zIndex = '13';
    document.body.appendChild(beamContainer);

    const startX = helperRect.left + helperRect.width / 2;
    const startY = helperRect.top + helperRect.height / 2;
    const endX = blockRect.left + blockRect.width / 2;
    const endY = blockRect.top + blockRect.height / 2;

    const canvas = document.createElement('canvas');
    const maxSize = Math.max(window.innerWidth, window.innerHeight);
    canvas.width = maxSize;
    canvas.height = maxSize;
    beamContainer.appendChild(canvas);
    beamContainer.style.left = '0px';
    beamContainer.style.top = '0px';

    const ctx = canvas.getContext('2d');
    let progress = 0;
    const animationDuration = 300;
    const startTime = Date.now();

    const animateBeam = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      progress = Math.min(elapsed / animationDuration, 1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (progress > 0) {
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        const gradient = ctx.createLinearGradient(startX, startY, currentX, currentY);
        gradient.addColorStop(0, 'rgba(105, 240, 174, 0.9)');
        gradient.addColorStop(0.7, 'rgba(105, 240, 174, 0.5)');
        gradient.addColorStop(1, 'rgba(105, 240, 174, 0)');
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.lineWidth = 4 + (4 * (1 - progress));
        ctx.strokeStyle = gradient;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(currentX, currentY, 8 * (1 - progress), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(105, 240, 174, ${0.7 * (1 - progress)})`;
        ctx.fill();
      }
      if (progress < 1) requestAnimationFrame(animateBeam);
      else setTimeout(() => { if (beamContainer.parentNode) document.body.removeChild(beamContainer); }, 200);
    };
    animateBeam();
    this.playSound('helperSound');

    setTimeout(() => {
      const hitEffect = document.createElement('div');
      hitEffect.style.position = 'absolute';
      hitEffect.style.left = (endX - 10) + 'px';
      hitEffect.style.top = (endY - 10) + 'px';
      hitEffect.style.width = '20px';
      hitEffect.style.height = '20px';
      hitEffect.style.background = 'radial-gradient(circle, #69f0ae, transparent)';
      hitEffect.style.borderRadius = '50%';
      hitEffect.style.zIndex = '15';
      hitEffect.style.opacity = '0.8';
      document.body.appendChild(hitEffect);
      let opacity = 0.8;
      const fadeOut = setInterval(() => {
        opacity -= 0.1;
        hitEffect.style.opacity = opacity;
        if (opacity <= 0) {
          clearInterval(fadeOut);
          if (hitEffect.parentNode) document.body.removeChild(hitEffect);
        }
      }, 30);
    }, animationDuration);
  }

  /**
   * Активирует помощника Bobo.
   * @private
   */
  activateHelper() {
    if (this.gameState.helperActive) return;
    this.gameState.helperActive = true;
    this.gameState.helperTimeLeft = CONFIG.HELPER_DURATION_MS;
    this.gameState.boboCoinBonus = 0.2;
    this.createHelperElement();

    this.helperInterval = setInterval(() => {
      if (this.gameState.helperActive && this.currentBlock && this.gameState.gameActive) {
        this.helperAttack();
      }
    }, CONFIG.HELPER_ATTACK_INTERVAL_MS);

    const helperTimer = setInterval(() => {
      if (!this.gameState.helperActive) {
        clearInterval(helperTimer);
        return;
      }
      this.gameState.helperTimeLeft -= 1000;
      if (this.gameState.helperTimeLeft <= 0) {
        this.gameState.helperActive = false;
        clearInterval(this.helperInterval);
        clearInterval(helperTimer);
        this.gameState.boboCoinBonus = 0;
        if (this.helperElement) {
          this.helperElement.style.opacity = '0';
          setTimeout(() => {
            if (this.helperElement && this.helperElement.parentNode) {
              document.body.removeChild(this.helperElement);
              this.helperElement = null;
            }
          }, 300);
        }
        this.updateUpgradeButtons();
        this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].tooltips.helperEnd);
        setTimeout(this.hideTooltip, 1500);
      }
    }, 1000);

    this.updateUpgradeButtons();
    this.updateHUD();
    this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].tooltips.helperAvailable);
    setTimeout(this.hideTooltip, 2500);
    this.saveLoadManager.saveGame();
  }

  /**
   * Атака помощника Bobo.
   * @private
   */
  helperAttack() {
    if (!this.currentBlock || !this.gameState.helperActive || !this.helperElement) return;
    this.createHelperEffect();

    const baseHelperDmg = this.gameState.clickPower * (1 + this.gameState.helperDamageBonus);
    const upgradedHelperDmg = baseHelperDmg * (1 + this.gameState.helperUpgradeLevel * 0.2);
    // Бонус от магазина (скачок силы) уже применяется в hitBlock
    const finalHelperDmg = upgradedHelperDmg;

    this.currentBlockHealth -= finalHelperDmg;
    this.gameState.totalDamageDealt += finalHelperDmg;
    this.gameMetrics.totalClicks = (this.gameMetrics.totalClicks || 0) + 1;

    this.createDamageText(Math.round(finalHelperDmg), this.currentBlock, '#69f0ae');
    this.checkLocationUpgrade();

    if (this.currentBlockHealth <= 0) {
      this.destroyBlock(this.currentBlock);
    } else {
      this.currentBlock.textContent = Math.floor(this.currentBlockHealth);
      this.updateCracks(this.currentBlock, this.currentBlockHealth);
    }
  }

  // --- Покупки улучшений ---
  /**
   * Покупает улучшение силы клика.
   */
  buyClickPower() {
    const cost = Math.floor(CONFIG.baseClickUpgradeCost * Math.pow(1.5, this.gameState.clickUpgradeLevel));
    if (this.gameState.coins >= cost) {
      this.gameState.coins -= cost;
      this.gameState.clickUpgradeLevel += 1;
      this.gameState.clickPower = this.calculateClickPower();
      this.gameMetrics.upgradesBought = (this.gameMetrics.upgradesBought || 0) + 1;
      this.achievementManager.incrementUpgrades(1);
      this.updateHUD();
      this.updateUpgradeButtons();
      this.playSound('upgradeSound');

      const upgradeBtn = document.getElementById('upgradeClickBtn');
      if (upgradeBtn) {
        upgradeBtn.style.transform = 'scale(1.1)';
        upgradeBtn.style.boxShadow = '0 0 20px #4CAF50';
        setTimeout(() => {
          upgradeBtn.style.transform = 'scale(1)';
          upgradeBtn.style.boxShadow = '';
        }, 300);
      }

      this.showTooltip(this.localization.formatString(
        this.localization.translations[this.localization.getCurrentLanguage()].tooltips.clickPowerUpgrade,
        { power: Math.round(this.gameState.clickPower) }
      ));
      setTimeout(this.hideTooltip, 1500);

      this.saveLoadManager.saveGame();
    } else {
      const upgradeBtn = document.getElementById('upgradeClickBtn');
      if (upgradeBtn) {
        upgradeBtn.style.animation = 'shake 0.5s';
        setTimeout(() => { upgradeBtn.style.animation = ''; }, 500);
      }
    }
  }

  /**
   * Покупает помощника Bobo.
   */
  buyHelper() {
    const cost = Math.floor(CONFIG.baseHelperUpgradeCost * Math.pow(1.4, this.gameState.helperUpgradeLevel));
    if (this.gameState.coins >= cost && !this.gameState.helperActive) {
      this.gameState.coins -= cost;
      this.gameMetrics.helpersBought = (this.gameMetrics.helpersBought || 0) + 1;
      this.achievementManager.incrementHelpers(1);

      const upgradeBtn = document.getElementById('upgradeHelperBtn');
      if (upgradeBtn) {
        upgradeBtn.style.transform = 'scale(1.1)';
        upgradeBtn.style.boxShadow = '0 0 20px #4CAF50';
        setTimeout(() => {
          upgradeBtn.style.transform = 'scale(1)';
          upgradeBtn.style.boxShadow = '';
        }, 300);
      }

      this.activateHelper();
      this.updateHUD();
      this.updateUpgradeButtons();
      this.saveLoadManager.saveGame();
    } else if (this.gameState.helperActive) {
      this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].tooltips.helperAvailable);
      setTimeout(this.hideTooltip, 1500);
    } else {
      const upgradeBtn = document.getElementById('upgradeHelperBtn');
      if (upgradeBtn) {
        upgradeBtn.style.animation = 'shake 0.5s';
        setTimeout(() => { upgradeBtn.style.animation = ''; }, 500);
      }
    }
  }

  /**
   * Покупает улучшение шанса крита.
   */
  buyCritChance() {
    const cost = Math.floor(CONFIG.baseCritChanceCost * Math.pow(1.3, this.gameState.critChanceUpgradeLevel));
    if (this.gameState.coins >= cost) {
      this.gameState.coins -= cost;
      this.gameState.critChance = Math.min(1.0, this.gameState.critChance + 0.001);
      this.gameState.critChanceUpgradeLevel++;
      this.gameMetrics.upgradesBought = (this.gameMetrics.upgradesBought || 0) + 1;
      this.achievementManager.incrementUpgrades(1);
      this.updateHUD();
      this.updateUpgradeButtons();
      this.playSound('upgradeSound');

      const upgradeBtn = document.getElementById('upgradeCritChanceBtn');
      if (upgradeBtn) {
        upgradeBtn.style.transform = 'scale(1.1)';
        upgradeBtn.style.boxShadow = '0 0 20px #FFD700';
        setTimeout(() => {
          upgradeBtn.style.transform = 'scale(1)';
          upgradeBtn.style.boxShadow = '';
        }, 300);
      }

      this.showTooltip(this.localization.formatString(
        this.localization.translations[this.localization.getCurrentLanguage()].tooltips.critChanceUpgrade,
        { chance: (this.gameState.critChance * 100).toFixed(1) }
      ));
      setTimeout(this.hideTooltip, 1500);

      this.saveLoadManager.saveGame();
    } else {
      const upgradeBtn = document.getElementById('upgradeCritChanceBtn');
      if (upgradeBtn) {
        upgradeBtn.style.animation = 'shake 0.5s';
        setTimeout(() => { upgradeBtn.style.animation = ''; }, 500);
      }
    }
  }

  /**
   * Покупает улучшение множителя крита.
   */
  buyCritMultiplier() {
    const cost = Math.floor(CONFIG.baseCritMultiplierCost * Math.pow(1.25, this.gameState.critMultiplierUpgradeLevel));
    if (this.gameState.coins >= cost) {
      this.gameState.coins -= cost;
      this.gameState.critMultiplier += 0.2;
      this.gameState.critMultiplierUpgradeLevel++;
      this.gameMetrics.upgradesBought = (this.gameMetrics.upgradesBought || 0) + 1;
      this.achievementManager.incrementUpgrades(1);
      this.updateHUD();
      this.updateUpgradeButtons();
      this.playSound('upgradeSound');

      const upgradeBtn = document.getElementById('upgradeCritMultBtn');
      if (upgradeBtn) {
        upgradeBtn.style.transform = 'scale(1.1)';
        upgradeBtn.style.boxShadow = '0 0 20px #FFD700';
        setTimeout(() => {
          upgradeBtn.style.transform = 'scale(1)';
          upgradeBtn.style.boxShadow = '';
        }, 300);
      }

      this.showTooltip(this.localization.formatString(
        this.localization.translations[this.localization.getCurrentLanguage()].tooltips.critMultUpgrade,
        { mult: this.gameState.critMultiplier.toFixed(1) }
      ));
      setTimeout(this.hideTooltip, 1500);

      this.saveLoadManager.saveGame();
    } else {
      const upgradeBtn = document.getElementById('upgradeCritMultBtn');
      if (upgradeBtn) {
        upgradeBtn.style.animation = 'shake 0.5s';
        setTimeout(() => { upgradeBtn.style.animation = ''; }, 500);
      }
    }
  }

  /**
   * Покупает улучшение урона помощника.
   */
  buyHelperDamage() {
    const cost = Math.floor(CONFIG.baseHelperDmgCost * Math.pow(1.8, this.gameState.helperUpgradeLevel));
    if (this.gameState.coins >= cost) {
      this.gameState.coins -= cost;
      this.gameState.helperUpgradeLevel += 1;
      this.gameMetrics.upgradesBought = (this.gameMetrics.upgradesBought || 0) + 1;
      this.achievementManager.incrementUpgrades(1);
      this.updateHUD();
      this.updateUpgradeButtons();
      this.playSound('upgradeSound');

      const upgradeBtn = document.getElementById('upgradeHelperDmgBtn');
      if (upgradeBtn) {
        upgradeBtn.style.transform = 'scale(1.1)';
        upgradeBtn.style.boxShadow = '0 0 20px #4CAF50';
        setTimeout(() => {
          upgradeBtn.style.transform = 'scale(1)';
          upgradeBtn.style.boxShadow = '';
        }, 300);
      }

      this.showTooltip(this.localization.formatString(
        this.localization.translations[this.localization.getCurrentLanguage()].tooltips.helperDmgUpgrade,
        { level: this.gameState.helperUpgradeLevel }
      ));
      setTimeout(this.hideTooltip, 1500);

      this.saveLoadManager.saveGame();
    } else {
      const upgradeBtn = document.getElementById('upgradeHelperDmgBtn');
      if (upgradeBtn) {
        upgradeBtn.style.animation = 'shake 0.5s';
        setTimeout(() => { upgradeBtn.style.animation = ''; }, 500);
      }
    }
  }

  // --- Управление игрой ---
  /**
   * Запускает игру.
   * @param {boolean} reset - Сбросить ли игру перед запуском.
   */
  startGame(reset = true) {
    console.log('🚀 Запуск игры, reset =', reset);
    if (reset) {
      this.saveLoadManager.resetGame();
    } else {
      // При продолжении игры используем загруженные данные
      console.log('Продолжение игры с сохранением:', {
        coins: this.gameState.coins,
        damage: this.gameState.totalDamageDealt,
        location: this.gameState.currentLocation
      });
      // Пересчитываем силу удара на основе уровня улучшений
      this.gameState.clickPower = this.calculateClickPower();
    }

    if (this.helperInterval) {
      clearInterval(this.helperInterval);
      this.helperInterval = null;
    }
    if (this.helperElement && this.helperElement.parentNode) {
      document.body.removeChild(this.helperElement);
      this.helperElement = null;
    }

    const gameArea = document.getElementById('gameArea');
    if (gameArea) gameArea.innerHTML = "";

    const welcomeScreen = document.getElementById('welcomeScreen');
    const saveScreen = document.getElementById('saveScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (welcomeScreen) welcomeScreen.style.display = "none";
    if (saveScreen) saveScreen.style.display = "none";
    if (gameOverScreen) gameOverScreen.style.display = "none";

    this.gameState.gameActive = true;
    this.gameState.comboCount = 0;
    this.gameState.lastDestroyTime = 0;

    if (reset) {
      this.gameMetrics.startTime = Date.now();
      this.gameMetrics.blocksDestroyed = 0;
      this.gameMetrics.upgradesBought = 0;
      this.gameMetrics.totalClicks = 0;
      this.gameMetrics.totalCrits = 0;
      this.gameMetrics.totalCoinsEarned = 0;
      this.gameMetrics.helpersBought = 0;
      this.gameMetrics.boostersUsed = 0;
      this.gameMetrics.maxCombo = 0;
    } else {
      this.gameMetrics.startTime = Date.now();
    }

    this.updateHUD();
    this.updateUpgradeButtons();
    this.updateProgressBar();
    this.setLocation(this.gameState.currentLocation);
    this.shopManager.updateShopDisplay();
    this.achievementManager.updateAchievementsDisplay();
    setTimeout(() => this.createMovingBlock(), 500);
    console.log('🎮 Игра запущена', reset ? '(новая)' : '(продолжение)');
  }

  /**
   * Продолжает игру из сохранения.
   */
  continueGame() {
    console.log('🔄 Пытаемся загрузить сохранение...');
    if (this.saveLoadManager.loadGame()) { // Предположим, что loadGame возвращает true/false
      console.log('✅ Загрузка успешна, запускаем игру...');
      this.updateHUD();
      this.updateUpgradeButtons();
      this.updateProgressBar();
      this.setLocation(this.gameState.currentLocation);
      this.startGame(false);

      this.showTooltip(this.localization.formatString(
        'Игра загружена! Кристаллы: {coins}, Урон: {damage}', // Или использовать строку из translations
        {
          coins: Math.floor(this.gameState.coins).toLocaleString(),
          damage: Math.floor(this.gameState.totalDamageDealt).toLocaleString()
        }
      ));
      setTimeout(this.hideTooltip, 3000);
    } else {
      console.log('❌ Не удалось загрузить сохранение');
      this.showTooltip(this.localization.translations[this.localization.getCurrentLanguage()].tooltips.noSave);
      setTimeout(this.hideTooltip, 2000);
    }
  }

  /**
   * Показывает экран сохранения.
   */
  showSaveScreen() {
    const saveScreen = document.getElementById('saveScreen');
    if (saveScreen) saveScreen.style.display = "flex";
  }

  /**
   * Перезапускает игру.
   */
  restartGame() {
    this.startGame(true);
  }

  // --- Всплывающие подсказки ---
  /**
   * Показывает всплывающую подсказку.
   * @param {string} text - Текст подсказки.
   */
  showTooltip(text) {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
      tooltip.innerHTML = text;
      tooltip.style.opacity = "1";
    }
  }

  /**
   * Скрывает всплывающую подсказку.
   */
  hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) tooltip.style.opacity = "0";
  }

  // --- Обновление переводов ---
  /**
   * Обновляет все переводы в UI.
   */
  updateAllTranslations() {
    const gameTitle = document.getElementById('gameTitle');
    if (gameTitle) this.localization.applyTranslation(gameTitle, `gameTitle.${this.gameState.currentLocation}`);

    const welcomeTexts = document.querySelectorAll('#welcomeScreen p');
    if (welcomeTexts.length >= 7) {
      this.localization.applyTranslation(document.querySelector('#welcomeScreen h2'), 'welcome.title');
      this.localization.applyTranslation(welcomeTexts[0], 'welcome.text1');
      this.localization.applyTranslation(welcomeTexts[1], 'welcome.text2');
      this.localization.applyTranslation(welcomeTexts[2], 'welcome.text3');
      this.localization.applyTranslation(welcomeTexts[3], 'welcome.text4');
      this.localization.applyTranslation(welcomeTexts[4], 'welcome.text5');
      this.localization.applyTranslation(welcomeTexts[5], 'welcome.text6');
      this.localization.applyTranslation(welcomeTexts[6], 'welcome.text7');
    }

    const continueBtn = document.getElementById('continueBtn');
    const startBtn = document.getElementById('startBtn');
    if (continueBtn) this.localization.applyTranslation(continueBtn, 'buttons.continue');
    if (startBtn) this.localization.applyTranslation(startBtn, 'buttons.start');

    const saveScreenTitle = document.querySelector('#saveScreen h2');
    const saveScreenText = document.querySelector('#saveScreen p');
    if (saveScreenTitle) this.localization.applyTranslation(saveScreenTitle, 'saveScreen.title');
    if (saveScreenText) this.localization.applyTranslation(saveScreenText, 'saveScreen.text');

    const loadSaveBtn = document.getElementById('loadSaveBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    const cancelSaveBtn = document.getElementById('cancelSaveBtn');
    if (loadSaveBtn) this.localization.applyTranslation(loadSaveBtn, 'buttons.loadSave');
    if (newGameBtn) this.localization.applyTranslation(newGameBtn, 'buttons.newGame');
    if (cancelSaveBtn) this.localization.applyTranslation(cancelSaveBtn, 'buttons.cancel');

    const gameOverTitle = document.querySelector('#gameOverScreen h2');
    const restartBtn = document.getElementById('restartBtn');
    const shareBtn = document.getElementById('shareBtn');
    if (gameOverTitle) this.localization.applyTranslation(gameOverTitle, 'gameOver.title');
    if (restartBtn) this.localization.applyTranslation(restartBtn, 'buttons.restart');
    if (shareBtn) this.localization.applyTranslation(shareBtn, 'buttons.share');

    this.updateProgressBar();
  }

  /**
   * Обновляет кнопку "Продолжить".
   * (Может быть вызвана из SaveLoadManager или глобально)
   */
  updateContinueButton() {
    const continueBtn = document.getElementById('continueBtn');
    if (!continueBtn) return;
    const hasSave = this.saveLoadManager.hasSave(); // Предполагаем метод в SaveLoadManager

    if (hasSave) {
      continueBtn.className = 'btn save-available';
      continueBtn.title = this.localization.translations[this.localization.getCurrentLanguage()].buttons.loadSave;
      try {
        const saved = localStorage.getItem('cosmicBlocksSave');
        if (saved) {
          const data = JSON.parse(saved);
          const saveTime = new Date(data.timestamp);
          const timeAgo = Math.floor((Date.now() - data.timestamp) / (1000 * 60));
          let timeText;
          if (timeAgo < 1) timeText = 'только что';
          else if (timeAgo < 60) timeText = `${timeAgo} мин назад`;
          else if (timeAgo < 1440) timeText = `${Math.floor(timeAgo / 60)} ч назад`;
          else timeText = `${Math.floor(timeAgo / 1440)} д назад`;
          continueBtn.title = this.localization.formatString(
            this.localization.translations[this.localization.getCurrentLanguage()].buttons.loadSave,
            { time: timeText }
          );
        }
      } catch (e) { /* ignore */ }
    } else {
      continueBtn.className = 'btn no-save';
      continueBtn.title = this.localization.translations[this.localization.getCurrentLanguage()].tooltips.noSave;
    }
  }
}

// --- Экспорт для использования в других модулях ---
// export default GameLogic; // Можно использовать как default export