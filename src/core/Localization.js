/**
 * @fileoverview Модуль управления локализацией (переводами).
 * Позволяет переключать языки и применять переводы к элементам.
 */

// --- Структура переводов ---
const TRANSLATIONS = {
  ru: {
    gameTitle: {
      mercury: "☿ Меркурий",
      venus: "♀ Венера",
      earth: "♁ Земля",
      mars: "♂ Марс",
      jupiter: "♃ Юпитер",
      saturn: "♄ Сатурн",
      uranus: "♅ Уран",
      neptune: "♆ Нептун",
      pluto: "♇ Плутон"
    },
    hud: {
      coins: "Кристаллы: ",
      clickPower: "Сила: ",
      critChance: "Крит: ",
      critMultiplier: "Множ: "
    },
    progressText: "Прогресс: {current} / {target} а.е. ({percent}%)",
    buttons: {
      save: "Сохранить игру",
      continue: "Продолжить",
      noSave: "Нет сохранения",
      start: "Новая игра",
      loadSave: "Продолжить сохраненную игру",
      newGame: "Начать новую игру",
      cancel: "Отмена",
      restart: "Новая добыча",
      share: "Поделиться",
      lang: "Сменить язык"
    },
    welcome: {
      title: "🚀 КОСМИЧЕСКИЙ КЛИКЕР",
      text1: "Разрушайте восходящие блоки и собирайте <strong>космические Кристаллы</strong>!",
      text2: "Каждый блок требует определённого количества ударов для разрушения.",
      text3: "<strong>Реалистичная система прогресса:</strong>",
      text4: "🌌 <strong>Астрономические единицы</strong> — перемещайтесь по Солнечной системе",
      text5: "🪐 <strong>9 реальных планет</strong> — от Меркурия до Плутона",
      text6: "🚀 <strong>Улучшения</strong> — увеличивайте силу, криты и активируйте помощника",
      text7: "✨ <strong>Редкие блоки</strong> — дают бонусы и огромные награды!"
    },
    saveScreen: {
      title: "СОХРАНЕНИЕ ИГРЫ",
      text: "Хотите продолжить с сохраненной игры или начать новую?"
    },
    gameOver: {
      title: "ДОБЫЧА ПРЕРВАНА!",
      score: "Всего урона: {damage}"
    },
    tooltips: {
      saveSuccess: "Игра сохранена!",
      upgradeClick: "Сила удара<br>Нелинейный рост урона",
      upgradeHelper: "Bobo<br>Авто-атака на 1 минуту<br>+30% урона<br>+20% к кристаллам",
      upgradeCritChance: "Шанс крита<br>+0.1% шанс крит. урона",
      upgradeCritMult: "Множитель крита<br>+0.2x крит. урона",
      upgradeHelperDmg: "Урон Bobo<br>+20% урона за апгрейд",
      combo: "Комбо x{count}! +{bonus}",
      reward: "+{reward} 💎",
      helperAvailable: "Bobo активирован на 1 минуту!<br>Бонус к кристаллам: +20%",
      helperEnd: "Bobo закончил работу!",
      critChanceUpgrade: "Шанс крита +0.1%!<br>Теперь: {chance}%",
      critMultUpgrade: "Множитель крита +0.2x!<br>Теперь: x{mult}",
      helperDmgUpgrade: "Урон Bobo +20%!<br>Уровень: {level}",
      clickPowerUpgrade: "Сила увеличена!<br>Теперь: {power}",
      noSave: "Нет сохраненной игры!",
      shareSuccess: "+50 Кристаллов за распространение!"
    },
    rareBlocks: {
      gold: "Золотой",
      rainbow: "Радужный",
      crystal: "Кристальный",
      mystery: "Загадочный"
    },
    locationProgress: {
      unlocked: "Открыта локация: {location}!"
    },
    shop: {
      title: "🛒 Магазин",
      timeWarp: "Искажение времени (30сек)",
      crystalBoost: "Усилитель кристаллов (1мин)",
      powerSurge: "Скачок силы (45сек)",
      active: "АКТИВНО",
      buy: "Купить"
    },
    achievements: {
      title: "🏆 Достижения",
      novice: "Новичок: Разрушь 10 блоков",
      rich: "Богач: Собери 1000 кристаллов",
      critMaster: "Мастер крита: 50 критических ударов",
      unlocked: "РАЗБЛОКИРОВАНО",
      progress: "Прогресс"
    }
  },
  en: {
    // ... (структура аналогична ru)
    gameTitle: {
      mercury: "☿ Mercury",
      venus: "♀ Venus",
      earth: "♁ Earth",
      mars: "♂ Mars",
      jupiter: "♃ Jupiter",
      saturn: "♄ Saturn",
      uranus: "♅ Uranus",
      neptune: "♆ Neptune",
      pluto: "♇ Pluto"
    },
    hud: {
      coins: "Crystals: ",
      clickPower: "Power: ",
      critChance: "Crit: ",
      critMultiplier: "Mult: "
    },
    progressText: "Progress: {current} / {target} a.u. ({percent}%)",
    buttons: {
      save: "Save game",
      continue: "Continue",
      noSave: "No save",
      start: "New game",
      loadSave: "Continue saved game",
      newGame: "Start new game",
      cancel: "Cancel",
      restart: "New game",
      share: "Share",
      lang: "Change language"
    },
    welcome: {
      title: "🚀 SPACE CLICKER",
      text1: "Destroy rising blocks and collect <strong>cosmic Crystals</strong>!",
      text2: "Each block requires a specific number of hits to destroy.",
      text3: "<strong>Realistic progress system:</strong>",
      text4: "🌌 <strong>Astronomical units</strong> - travel through the Solar System",
      text5: "🪐 <strong>9 real planets</strong> - from Mercury to Pluto",
      text6: "🚀 <strong>Upgrades</strong> - increase power, crits and activate assistant",
      text7: "✨ <strong>Rare blocks</strong> - provide bonuses and huge rewards!"
    },
    saveScreen: {
      title: "GAME SAVE",
      text: "Do you want to continue with the saved game or start a new one?"
    },
    gameOver: {
      title: "MINING INTERRUPTED!",
      score: "Total damage: {damage}"
    },
    tooltips: {
      saveSuccess: "Game saved!",
      upgradeClick: "Click power<br>Non-linear damage growth",
      upgradeHelper: "Bobo<br>Auto-attack for 1 minute<br>+30% damage<br>+20% to crystals",
      upgradeCritChance: "Crit chance<br>+0.1% crit hit chance",
      upgradeCritMult: "Crit multiplier<br>+0.2x crit damage",
      upgradeHelperDmg: "Bobo damage<br>+20% damage per upgrade",
      combo: "Combo x{count}! +{bonus}",
      reward: "+{reward} 💎",
      helperAvailable: "Bobo activated for 1 minute!<br>Crystals bonus: +20%",
      helperEnd: "Bobo has finished working!",
      critChanceUpgrade: "Crit chance +0.1%!<br>Now: {chance}%",
      critMultUpgrade: "Crit multiplier +0.2x!<br>Now: x{mult}",
      helperDmgUpgrade: "Bobo damage +20%!<br>Level: {level}",
      clickPowerUpgrade: "Power increased!<br>Now: {power}",
      noSave: "No saved game!",
      shareSuccess: "+50 Crystals for sharing!"
    },
    rareBlocks: {
      gold: "Gold",
      rainbow: "Rainbow",
      crystal: "Crystal",
      mystery: "Mystery"
    },
    locationProgress: {
      unlocked: "Unlocked location: {location}!"
    },
    shop: {
      title: "🛒 Shop",
      timeWarp: "Time Warp (30sec)",
      crystalBoost: "Crystal Boost (1min)",
      powerSurge: "Power Surge (45sec)",
      active: "ACTIVE",
      buy: "Buy"
    },
    achievements: {
      title: "🏆 Achievements",
      novice: "Novice: Destroy 10 blocks",
      rich: "Rich: Collect 1000 crystals",
      critMaster: "Crit Master: 50 critical hits",
      unlocked: "UNLOCKED",
      progress: "Progress"
    }
  },
  zh: {
    // ... (структура аналогична ru)
    gameTitle: {
      mercury: "☿ 水星",
      venus: "♀ 金星",
      earth: "♁ 地球",
      mars: "♂ 火星",
      jupiter: "♃ 木星",
      saturn: "♄ 土星",
      uranus: "♅ 天王星",
      neptune: "♆ 海王星",
      pluto: "♇ 冥王星"
    },
    hud: {
      coins: "水晶: ",
      clickPower: "力量: ",
      critChance: "暴击: ",
      critMultiplier: "倍数: "
    },
    progressText: "进度: {current} / {target} 天文单位 ({percent}%)",
    buttons: {
      save: "保存游戏",
      continue: "继续",
      noSave: "没有保存",
      start: "新游戏",
      loadSave: "继续保存的游戏",
      newGame: "开始新游戏",
      cancel: "取消",
      restart: "新游戏",
      share: "分享",
      lang: "更改语言"
    },
    welcome: {
      title: "🚀 太空点击器",
      text1: "摧毁上升的方块并收集<strong>宇宙水晶</strong>!",
      text2: "每个方块需要特定次数的点击才能摧毁。",
      text3: "<strong>真实的进度系统:</strong>",
      text4: "🌌 <strong>天文单位</strong> - 在太阳系中旅行",
      text5: "🪐 <strong>9颗真实行星</strong> - 从水星到冥王星",
      text6: "🚀 <strong>升级</strong> - 增加力量, 暴击和激活助手",
      text7: "✨ <strong>稀有方块</strong> - 提供奖励和巨大奖励!"
    },
    saveScreen: {
      title: "游戏保存",
      text: "您想继续保存的游戏还是开始新游戏？"
    },
    gameOver: {
      title: "开采中断!",
      score: "总伤害: {damage}"
    },
    tooltips: {
      saveSuccess: "游戏已保存!",
      upgradeClick: "点击力量<br>非线性伤害增长",
      upgradeHelper: "Bobo<br>自动攻击1分钟<br>+30%伤害<br>+20%水晶",
      upgradeCritChance: "暴击几率<br>+0.1%暴击命中几率",
      upgradeCritMult: "暴击倍数<br>+0.2x暴击伤害",
      upgradeHelperDmg: "Bobo伤害<br>+20%每次升级伤害",
      combo: "连击 x{count}! +{bonus}",
      reward: "+{reward} 💎",
      helperAvailable: "Bobo已激活1分钟!<br>水晶奖励: +20%",
      helperEnd: "Bobo已完成工作!",
      critChanceUpgrade: "暴击几率 +0.1%!<br>现在: {chance}%",
      critMultUpgrade: "暴击倍数 +0.2x!<br>现在: x{mult}",
      helperDmgUpgrade: "Bobo伤害 +20%!<br>等级: {level}",
      clickPowerUpgrade: "力量增加!<br>现在: {power}",
      noSave: "没有保存的游戏!",
      shareSuccess: "分享获得+50水晶!"
    },
    rareBlocks: {
      gold: "金色",
      rainbow: "彩虹",
      crystal: "水晶",
      mystery: "神秘"
    },
    locationProgress: {
      unlocked: "解锁位置: {location}!"
    },
    shop: {
      title: "🛒 商店",
      timeWarp: "时间扭曲 (30秒)",
      crystalBoost: "水晶增强 (1分钟)",
      powerSurge: "力量激增 (45秒)",
      active: "激活",
      buy: "购买"
    },
    achievements: {
      title: "🏆 成就",
      novice: "新手: 摧毁10个方块",
      rich: "富人: 收集1000个水晶",
      critMaster: "暴击大师: 50次暴击",
      unlocked: "已解锁",
      progress: "进度"
    }
  }
};

const LANGUAGES = ['ru', 'en', 'zh'];
const DEFAULT_LANGUAGE = 'ru';
const LANGUAGE_STORAGE_KEY = 'gameLanguage';

/**
 * Класс для управления локализацией.
 */
export class Localization {
  /**
   * Конструктор локализации.
   */
  constructor() {
    this.translations = TRANSLATIONS;
    this.availableLanguages = LANGUAGES;
    this.defaultLanguage = DEFAULT_LANGUAGE;
    this.storageKey = LANGUAGE_STORAGE_KEY;

    // Инициализация текущего языка
    this.currentLanguage = localStorage.getItem(this.storageKey) || this.defaultLanguage;
    console.log(`🌐 Язык установлен на: ${this.currentLanguage}`);

    // Привязка контекста для использования в event listeners
    this.switchLanguage = this.switchLanguage.bind(this);
  }

  /**
   * Форматирует строку, заменяя плейсхолдеры {key} значениями из params.
   * @param {string} template - Шаблон строки.
   * @param {Object} params - Объект с параметрами.
   * @returns {string} Отформатированная строка.
   */
  formatString(template, params) {
    if (!template || typeof template !== 'string') return template;
    if (!params) return template;

    return template.replace(/{(\w+)}/g, (match, key) => {
      return params.hasOwnProperty(key) ? params[key] : match;
    });
  }

  /**
   * Применяет перевод к HTML-элементу.
   * @param {HTMLElement} element - Элемент для обновления.
   * @param {string} keyPath - Путь к переводу, например 'buttons.start'.
   * @param {Object} params - Параметры для форматирования строки.
   * @returns {boolean} true, если перевод был найден и применен.
   */
  applyTranslation(element, keyPath, params = {}) {
    if (!element || !keyPath) return false;

    const keys = keyPath.split('.');
    let translation = this.translations[this.currentLanguage];
    for (const key of keys) {
      if (translation && translation[key] !== undefined) {
        translation = translation[key];
      } else {
        console.warn(`⚠️ Translation not found for key path '${keyPath}' in language '${this.currentLanguage}'`);
        return false;
      }
    }

    if (typeof translation === 'string') {
      element.innerHTML = this.formatString(translation, params);
      return true;
    } else {
      console.warn(`⚠️ Translation for key path '${keyPath}' is not a string.`);
      return false;
    }
  }

  /**
   * Обновляет отображение флага языка в UI.
   * Предполагается, что элемент с id 'currentLangFlag' существует.
   */
  updateLanguageFlag() {
    const flagElement = document.getElementById('currentLangFlag');
    if (!flagElement) {
      console.warn("⚠️ Flag element with ID 'currentLangFlag' not found.");
      return;
    }

    switch (this.currentLanguage) {
      case 'ru':
        flagElement.textContent = '🇷🇺';
        break;
      case 'en':
        flagElement.textContent = '🇬🇧';
        break;
      case 'zh':
        flagElement.textContent = '🇨🇳';
        break;
      default:
        console.warn(`⚠️ No flag defined for language code '${this.currentLanguage}'.`);
        flagElement.textContent = '?';
    }
  }

  /**
   * Переключает язык на следующий в списке доступных.
   */
  switchLanguage() {
    const currentIndex = this.availableLanguages.indexOf(this.currentLanguage);
    if (currentIndex === -1) {
       console.error("❌ Current language not found in available languages list. Resetting to default.");
       this.currentLanguage = this.defaultLanguage;
    } else {
       const nextIndex = (currentIndex + 1) % this.availableLanguages.length;
       this.currentLanguage = this.availableLanguages[nextIndex];
    }

    localStorage.setItem(this.storageKey, this.currentLanguage);
    console.log(`🌐 Язык переключен на: ${this.currentLanguage}`);

    this.updateLanguageFlag();
    // Оповещаем другие системы об изменении языка
    this.onLanguageChanged();
  }

  /**
   * Внутренний метод, вызываемый при изменении языка.
   * Может быть переопределён или использован для вызова callback'ов.
   * @private
   */
  onLanguageChanged() {
    // Этот метод может быть расширен для оповещения других систем
    // Например, через dispatchEvent или вызов функции, переданной в конструктор.
    console.log(`📢 Событие изменения языка: ${this.currentLanguage}`);
  }

  /**
   * Возвращает список доступных языков.
   * @returns {string[]}
   */
  getAvailableLanguages() {
    return [...this.availableLanguages]; // Возвращаем копию массива
  }

  /**
   * Возвращает текущий код языка.
   * @returns {string}
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Проверяет, доступен ли указанный язык.
   * @param {string} langCode - Код языка (например, 'en').
   * @returns {boolean}
   */
  isLanguageAvailable(langCode) {
    return this.availableLanguages.includes(langCode);
  }
}

// --- Экспорт для использования в других модулях ---
// export default Localization; // Можно использовать как default export