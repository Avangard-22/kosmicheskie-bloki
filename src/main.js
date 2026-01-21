/**
 * @fileoverview Главный файл приложения. Создает и инициализирует все игровые менеджеры.
 */

// Импортируем все отрефакторенные классы
import { SaveLoadManager } from './core/SaveLoadManager.js';
import { Localization } from './core/Localization.js';
import { GameLogic } from './core/GameLogic.js';
import { AchievementManager } from './managers/AchievementManager.js';
import { ShopManager } from './managers/ShopManager.js';
import { PlanetBackgroundManager } from './managers/PlanetBackgroundManager.js';

// --- Глобальные объекты для состояния игры ---
// Эти объекты будут использоваться всеми менеджерами
window.gameState = {};
window.gameMetrics = {};

// --- Инициализация при загрузке DOM ---
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Инициализация игры через main.js...');

  try {
    // 1. Создаем менеджер сохранений и инициализируем gameState и gameMetrics
    const saveLoadManager = new SaveLoadManager(window.gameState, window.gameMetrics);

    // 2. Создаем менеджер локализации
    const localization = new Localization();

    // 3. Создаем менеджер планетарного фона
    const planetBackgroundManager = new PlanetBackgroundManager('planetBackgroundCanvas');
    planetBackgroundManager.init(); // Инициализируем фон

    // 4. Создаем менеджер достижений
    const achievementManager = new AchievementManager(
      window.gameState,
      window.gameMetrics,
      localization,
      () => saveLoadManager.saveGame(),
      () => gameLogic.updateHUD(), // Предполагаем, что gameLogic будет ниже
      () => gameLogic.updateUpgradeButtons(),
      (soundId) => gameLogic.playSound(soundId) // Предполагаем, что gameLogic будет ниже
    );

    // 5. Создаем менеджер магазина
    const shopManager = new ShopManager(
      window.gameState,
      window.gameMetrics,
      localization,
      () => saveLoadManager.saveGame(),
      () => gameLogic.updateHUD(),
      () => gameLogic.updateUpgradeButtons(),
      (soundId) => gameLogic.playSound(soundId),
      (text) => gameLogic.showTooltip(text), // Предполагаем, что gameLogic будет ниже
      achievementManager
    );

    // 6. Создаем основной менеджер логики игры
    const gameLogic = new GameLogic(
      window.gameState,
      window.gameMetrics,
      localization,
      saveLoadManager,
      achievementManager,
      shopManager,
      planetBackgroundManager
    );

    // --- Устанавливаем связи между менеджерами после их создания ---
    // Это нужно, потому что при создании одного менеджера другой ещё не готов
    achievementManager.setShopSystemReference(shopManager);
    shopManager.setAchievementManagerReference(achievementManager);

    // --- Инициализируем основную логику ---
    // Это вызовет initEventHandlers и другие начальные установки
    gameLogic.init();

    // --- Инициализируем другие менеджеры ---
    achievementManager.init();
    shopManager.init();

    // --- Обеспечение обратной совместимости (опционально) ---
    // Если другие скрипты или index.html всё ещё ожидают объекты на window,
    // можно их там оставить. Но предпочтительно использовать модульные зависимости.
    // window.gameState и window.gameMetrics уже созданы выше.
    window.gameFunctions = gameLogic; // API GameLogic
    window.achievementsSystem = achievementManager; // API AchievementManager
    window.shopSystem = shopManager; // API ShopManager
    window.planetBackground = planetBackgroundManager; // API PlanetBackgroundManager
    window.saveGame = () => saveLoadManager.saveGame();
    window.loadGame = () => saveLoadManager.loadGame(); // Хотя загрузка теперь внутри GameLogic
    window.resetGame = () => saveLoadManager.resetGame();
    window.updateContinueButton = () => gameLogic.updateContinueButton(); // или saveLoadManager.updateContinueButton();
    window.updateAllTranslations = () => gameLogic.updateAllTranslations();
    window.showTooltip = (text) => gameLogic.showTooltip(text);
    window.hideTooltip = () => gameLogic.hideTooltip();
    window.playSound = (soundId) => gameLogic.playSound(soundId); // или отдельная система звука

    // --- Блокировка жестов (перенесено из index.html) ---
    document.addEventListener('touchstart', function(e) {
      if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });

    document.addEventListener('gesturestart', function(e) {
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('gesturechange', function(e) {
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('gestureend', function(e) {
      e.preventDefault();
    }, { passive: false });

    console.log('✅ Игра инициализирована через main.js');
  } catch (error) {
    console.error('❌ Ошибка при инициализации игры через main.js:', error);
  }
});
