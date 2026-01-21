/**
 * @fileoverview Модуль управления планетарным фоном с эффектом параллакса.
 */

// --- Данные о планетах ---
const PLANET_DATA = {
  mercury: {
    name: 'Меркурий',
    colors: ['#8c7b6b', '#a69b8f', '#5a524c', '#ffaa33', '#ffcc66', '#d9b382', '#bf9e75'],
    background: ['#1a0f0a', '#2c1d14', '#4a3527'],
    type: 'rocky'
  },
  venus: {
    name: 'Венера',
    colors: ['#e6b87e', '#d4a574', '#ff8844', '#b35900', '#ff9966', '#e68a53', '#cc7a3d'],
    background: ['#2a1a0f', '#4a2c1a', '#6b3f20'],
    type: 'cloudy'
  },
  earth: {
    name: 'Земля',
    colors: ['#4a7b9d', '#5d8aa8', '#2e5a78', '#87ceeb', '#a8d5e5', '#6baed6', '#3c8dbc'],
    background: ['#0a1a2a', '#1a2a3a', '#2a3a4a'],
    type: 'oceanic'
  },
  mars: {
    name: 'Марс',
    colors: ['#cd5c5c', '#a52a2a', '#8b4513', '#ff6347', '#e2583e', '#c14533', '#a33226'],
    background: ['#2a0f0a', '#4a1a14', '#6b251e'],
    type: 'dusty'
  },
  jupiter: {
    name: 'Юпитер',
    colors: ['#d2b48c', '#bc8f8f', '#a0522d', '#ff7f50', '#e67347', '#cc663d', '#b35933'],
    background: ['#2a1f14', '#4a3728', '#6b4f3c'],
    type: 'stormy'
  },
  saturn: {
    name: 'Сатурн',
    colors: ['#f0e68c', '#daa520', '#b8860b', '#ffd700', '#e6c347', '#ccaa3d', '#b39233'],
    background: ['#2a2414', '#4a3c28', '#6b543c'],
    type: 'ringed'
  },
  uranus: {
    name: 'Уран',
    colors: ['#afeeee', '#7fffd4', '#40e0d0', '#48d1cc', '#3dc4bf', '#32b7b2', '#27aaa5'],
    background: ['#0a1a2a', '#1a2a3a', '#2a3a4a'],
    type: 'icy'
  },
  neptune: {
    name: 'Нептун',
    colors: ['#4169e1', '#0000cd', '#191970', '#1e90ff', '#1a7feb', '#166fd7', '#125fc3'],
    background: ['#0a0a2a', '#1a1a3a', '#2a2a4a'],
    type: 'windy'
  },
  pluto: {
    name: 'Плутон',
    colors: ['#a9a9a9', '#696969', '#808080', '#d3d3d3', '#c0c0c0', '#b0b0b0', '#9e9e9e'],
    background: ['#1a1a2a', '#2a2a3a', '#3a3a4a'],
    type: 'dwarf'
  }
};

// --- Конфигурация ---
const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const PARALLAX_SETTINGS = {
  baseSpeed: 0.2,
  directionX: -1,
  directionY: 1,
  layers: {
    stars: 0.3,
    nebulae: 0.5,
    particles: 0.8,
    special: 1.0
  }
};
const FIXED_SETTINGS = {
  speed: 5,
  density: 5,
  size: 5,
  smoothness: 5,
  nebulaIntensity: 3,
  starDensity: 2
};

// --- Класс частицы ---
class Particle {
  constructor(x, y, radius, color, velocity, type, parallaxFactor = 1) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
    this.type = type;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.pulse = Math.random() * Math.PI * 2;
    this.twinkle = Math.random() * Math.PI * 2;
    this.twinkleSpeed = 0.05 + Math.random() * 0.05;
    this.lifetime = 1;
    this.maxLifetime = 1;
    this.parallaxFactor = parallaxFactor;
  }

  draw(ctx) {
    ctx.save();
    if (this.type === 'star') {
      const twinkleFactor = 0.7 + 0.3 * Math.sin(this.twinkle);
      ctx.globalAlpha = this.alpha * twinkleFactor * this.lifetime;
    } else if (this.type === 'ice') {
      ctx.globalAlpha = this.alpha * this.lifetime;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * this.radius;
        const y = Math.sin(angle) * this.radius;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
      return;
    } else {
      ctx.globalAlpha = this.alpha * this.lifetime;
    }
    ctx.translate(this.x, this.y);
    if (this.type === 'ring') {
      ctx.rotate(this.rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius, this.radius / 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    } else if (this.type === 'nebula') {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
      gradient.addColorStop(0, this.color + 'aa');
      gradient.addColorStop(1, this.color + '00');
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    } else if (this.type === 'crystal') {
      ctx.rotate(this.rotation);
      ctx.beginPath();
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(this.radius / 2, 0);
      ctx.lineTo(0, this.radius);
      ctx.lineTo(-this->radius / 2, 0);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
    } else {
      const pulseFactor = 0.8 + 0.2 * Math.sin(this.pulse);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * pulseFactor, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    ctx.restore();
  }

  update(ctx, canvas, time) { // time передаётся из анимационного цикла
    this.draw(ctx);
    const parallaxSpeed = PARALLAX_SETTINGS.baseSpeed * this.parallaxFactor;
    this.x += PARALLAX_SETTINGS.directionX * parallaxSpeed;
    this.y += PARALLAX_SETTINGS.directionY * parallaxSpeed;

    const smoothFactor = FIXED_SETTINGS.smoothness / 10;
    this.velocity.x *= (1 - smoothFactor * 0.05);
    this.velocity.y *= (1 - smoothFactor * 0.05);

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    this.rotation += this.rotationSpeed;
    this.pulse += 0.05;
    this.twinkle += this.twinkleSpeed;

    if (this.x < -this.radius * 2) this.x = canvas.width + this.radius;
    else if (this.x > canvas.width + this.radius * 2) this.x = -this.radius;
    if (this.y < -this.radius * 2) this.y = canvas.height + this.radius;
    else if (this.y > canvas.height + this.radius * 2) this.y = -this.radius;
  }
}


/**
 * Класс для управления планетарным фоном.
 */
export class PlanetBackgroundManager {
  /**
   * Конструктор менеджера фона.
   * @param {string} canvasId - ID HTML-элемента canvas.
   */
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas с ID '${canvasId}' не найден.`);
    }
    this.ctx = this.canvas.getContext('2d');
    this.isMobile = IS_MOBILE;
    this.parallaxSettings = PARALLAX_SETTINGS;
    this.fixedSettings = FIXED_SETTINGS;
    this.planetData = PLANET_DATA;

    this.currentPlanet = 'mercury';
    this.time = 0;
    this.particles = [];
    this.specialElements = [];
    this.nebulae = [];
    this.stars = [];
    this.animationId = null;

    // Привязка контекста для анимационного цикла
    this.animate = this.animate.bind(this);
  }

  /**
   * Инициализирует фон.
   */
  init() {
    console.log('--- Инициализация PlanetBackgroundManager ---');
    this.setCanvasSize();
    this.generatePlanetBackground();
    window.addEventListener('resize', this.setCanvasSize.bind(this));
    console.log('--- Инициализация PlanetBackgroundManager завершена ---');
  }

  /**
   * Устанавливает размер canvas.
   */
  setCanvasSize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    if (this.isMobile) {
      const pixelRatio = window.devicePixelRatio || 1;
      this.canvas.width = this.canvas.offsetWidth * pixelRatio;
      this.canvas.height = this.canvas.offsetHeight * pixelRatio;
      this.ctx.scale(pixelRatio, pixelRatio);
    }
  }

  /**
   * Очищает и генерирует фон для текущей планеты.
   */
  generatePlanetBackground() {
    console.log(`🎨 Генерация фона для планеты: ${this.currentPlanet}`);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.particles = [];
    this.specialElements = [];
    this.nebulae = [];
    this.stars = [];

    this.generateStars();
    this.generateNebulae();

    const generatorMap = {
      mercury: this.generateMercury.bind(this),
      venus: this.generateVenus.bind(this),
      earth: this.generateEarth.bind(this),
      mars: this.generateMars.bind(this),
      jupiter: this.generateJupiter.bind(this),
      saturn: this.generateSaturn.bind(this),
      uranus: this.generateUranus.bind(this),
      neptune: this.generateNeptune.bind(this),
      pluto: this.generatePluto.bind(this)
    };

    const generator = generatorMap[this.currentPlanet];
    if (generator) {
      generator();
    }

    this.animate(); // Запуск анимации
  }

  /**
   * Рисует фон (градиент).
   * @private
   */
  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    const bgColors = this.planetData[this.currentPlanet].background;
    gradient.addColorStop(0, bgColors[0]);
    gradient.addColorStop(0.5, bgColors[1]);
    gradient.addColorStop(1, bgColors[2]);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Генерирует звёзды.
   * @private
   */
  generateStars() {
    const starCount = this.fixedSettings.starDensity * 50;
    this.stars = [];
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * 1.5 + 0.5;
      const starColors = ['#ffffff', '#f8f8ff', '#e6e6fa', '#fffacd', '#f0f8ff'];
      const color = starColors[Math.floor(Math.random() * starColors.length)];
      const velocity = { x: 0, y: 0 };
      this.stars.push(new Particle(x, y, radius, color, velocity, 'star', this.parallaxSettings.layers.stars));
    }
  }

  /**
   * Генерирует туманности.
   * @private
   */
  generateNebulae() {
    const nebulaCount = this.fixedSettings.nebulaIntensity;
    this.nebulae = [];
    for (let i = 0; i < nebulaCount; i++) {
      const aspectRatio = this.canvas.width / this.canvas.height;
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * 200 + (aspectRatio > 1 ? 80 : 120);
      const planetColors = this.planetData[this.currentPlanet].colors;
      const color = planetColors[Math.floor(Math.random() * planetColors.length)];
      const velocity = { x: (Math.random() - 0.5) * 0.05, y: (Math.random() - 0.5) * 0.05 };
      this.nebulae.push(new Particle(x, y, radius, color, velocity, 'nebula', this.parallaxSettings.layers.nebulae));
    }
  }

  // --- Генераторы для конкретных планет ---
  // (Код для каждой планеты аналогичен оригинальному, но использует `this.canvas`, `this.ctx`, `this.planetData`, `this.fixedSettings`, `this.parallaxSettings`)
  generateMercury() {
    const particleCount = this.fixedSettings.density * 15;
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * this.fixedSettings.size * 2 + 1;
      const color = this.planetData.mercury.colors[Math.floor(Math.random() * this.planetData.mercury.colors.length)];
      const speedValue = (Math.random() * 0.5 + 0.1) * this.fixedSettings.speed / 5;
      const angle = Math.random() * Math.PI * 2;
      const velocity = { x: Math.cos(angle) * speedValue, y: Math.sin(angle) * speedValue };
      this.particles.push(new Particle(x, y, radius, color, velocity, 'rock', this.parallaxSettings.layers.particles));
    }
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * 20 + 10;
      const color = this.planetData.mercury.colors[3];
      const velocity = { x: 0, y: 0 };
      this.specialElements.push(new Particle(x, y, radius, color, velocity, 'sun', this.parallaxSettings.layers.special));
    }
  }

  generateVenus() {
    const particleCount = this.fixedSettings.density * 20;
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * this.fixedSettings.size * 3 + 5;
      const color = this.planetData.venus.colors[Math.floor(Math.random() * this.planetData.venus.colors.length)];
      const speedValue = (Math.random() * 0.3 + 0.1) * this.fixedSettings.speed / 5;
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      const velocity = {
        x: Math.cos(angle) * speedValue * (distance / 100),
        y: Math.sin(angle) * speedValue * (distance / 100)
      };
      this.particles.push(new Particle(x, y, radius, color, velocity, 'cloud', this.parallaxSettings.layers.particles));
    }
  }

  generateEarth() {
    const particleCount = this.fixedSettings.density * 25;
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * this.fixedSettings.size * 2 + 2;
      const color = this.planetData.earth.colors[Math.floor(Math.random() * this.planetData.earth.colors.length)];
      const speedValue = (Math.random() * 0.5 + 0.2) * this.fixedSettings.speed / 5;
      const angle = (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2) + (Math.random() - 0.5) * 0.5;
      const velocity = { x: Math.cos(angle) * speedValue, y: Math.sin(angle) * speedValue };
      this.particles.push(new Particle(x, y, radius, color, velocity, 'water', this.parallaxSettings.layers.particles));
    }
  }

  generateMars() {
    const particleCount = this.fixedSettings.density * 30;
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * this.fixedSettings.size + 1;
      const color = this.planetData.mars.colors[Math.floor(Math.random() * this.planetData.mars.colors.length)];
      const speedValue = (Math.random() * 1 + 0.5) * this.fixedSettings.speed / 5;
      const angle = Math.random() * Math.PI * 2;
      const velocity = { x: Math.cos(angle) * speedValue, y: Math.sin(angle) * speedValue };
      this.particles.push(new Particle(x, y, radius, color, velocity, 'dust', this.parallaxSettings.layers.particles));
    }
  }

  generateJupiter() {
    const particleCount = this.fixedSettings.density * 15;
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * this.fixedSettings.size * 4 + 10;
      const color = this.planetData.jupiter.colors[Math.floor(Math.random() * this.planetData.jupiter.colors.length)];
      const speedValue = (Math.random() * 0.2 + 0.1) * this.fixedSettings.speed / 5;
      const direction = Math.random() > 0.5 ? 1 : -1;
      const velocity = { x: speedValue * direction, y: 0 };
      this.particles.push(new Particle(x, y, radius, color, velocity, 'storm', this.parallaxSettings.layers.particles));
    }
    const x = this.canvas.width * 0.7;
    const y = this.canvas.height * 0.5;
    const radius = 50;
    const color = this.planetData.jupiter.colors[3];
    const velocity = { x: -0.1 * this.fixedSettings.speed / 5, y: 0 };
    this.specialElements.push(new Particle(x, y, radius, color, velocity, 'spot', this.parallaxSettings.layers.special));
  }

  generateSaturn() {
    const particleCount = this.fixedSettings.density * 10;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 150;
      const x = this.canvas.width / 2 + Math.cos(angle) * distance;
      const y = this.canvas.height / 2 + Math.sin(angle) * distance;
      const radius = Math.random() * this.fixedSettings.size * 2 + 5;
      const color = this.planetData.saturn.colors[Math.floor(Math.random() * this.planetData.saturn.colors.length)];
      const speedValue = (Math.random() * 0.3 + 0.1) * this.fixedSettings.speed / 5;
      const orbitalAngle = angle + Math.PI / 2;
      const velocity = { x: Math.cos(orbitalAngle) * speedValue, y: Math.sin(orbitalAngle) * speedValue };
      this.particles.push(new Particle(x, y, radius, color, velocity, 'ring', this.parallaxSettings.layers.particles));
    }
    for (let i = 0; i < this.fixedSettings.density * 5; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * this.fixedSettings.size * 3 + 5;
      const color = this.planetData.saturn.colors[Math.floor(Math.random() * this.planetData.saturn.colors.length)];
      const speedValue = (Math.random() * 0.2 + 0.1) * this.fixedSettings.speed / 5;
      const angle = Math.random() * Math.PI * 2;
      const velocity = { x: Math.cos(angle) * speedValue, y: Math.sin(angle) * speedValue };
      this.particles.push(new Particle(x, y, radius, color, velocity, 'cloud', this.parallaxSettings.layers.particles));
    }
  }

  generateUranus() {
    const particleCount = this.fixedSettings.density * 20;
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * this.fixedSettings.size * 2 + 3;
      const color = this.planetData.uranus.colors[Math.floor(Math.random() * this.planetData.uranus.colors.length)];
      const speedValue = (Math.random() * 0.2 + 0.05) * this.fixedSettings.speed / 5;
      const angle = Math.random() * Math.PI * 2;
      const velocity = { x: Math.cos(angle) * speedValue, y: Math.sin(angle) * speedValue };
      this.particles.push(new Particle(x, y, radius, color, velocity, 'ice', this.parallaxSettings.layers.particles));
    }
  }

  generateNeptune() {
    const particleCount = this.fixedSettings.density * 25;
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * this.fixedSettings.size + 2;
      const color = this.planetData.neptune.colors[Math.floor(Math.random() * this.planetData.neptune.colors.length)];
      const speedValue = (Math.random() * 0.8 + 0.3) * this.fixedSettings.speed / 5;
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      const velocity = {
        x: Math.cos(angle) * speedValue * (1 + distance / 200),
        y: Math.sin(angle) * speedValue * (1 + distance / 200)
      };
      this.particles.push(new Particle(x, y, radius, color, velocity, 'wind', this.parallaxSettings.layers.particles));
    }
    for (let i = 0; i < 3; i++) {
      const x = this.canvas.width * (0.2 + i * 0.3);
      const y = this.canvas.height * 0.5;
      const radius = 30 + Math.random() * 20;
      const color = this.planetData.neptune.colors[2];
      const velocity = { x: 0.2 * this.fixedSettings.speed / 5, y: 0 };
      this.specialElements.push(new Particle(x, y, radius, color, velocity, 'spot', this.parallaxSettings.layers.special));
    }
  }

  generatePluto() {
    const particleCount = this.fixedSettings.density * 20;
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * this.fixedSettings.size * 1.5 + 2;
      const color = this.planetData.pluto.colors[Math.floor(Math.random() * this.planetData.pluto.colors.length)];
      const speedValue = (Math.random() * 0.3 + 0.1) * this.fixedSettings.speed / 5;
      const angle = Math.random() * Math.PI * 2;
      const velocity = { x: Math.cos(angle) * speedValue, y: Math.sin(angle) * speedValue };
      if (i % 3 === 0) {
        this.particles.push(new Particle(x, y, radius, color, velocity, 'ice', this.parallaxSettings.layers.particles));
      } else if (i % 3 === 1) {
        this.particles.push(new Particle(x, y, radius, color, velocity, 'crystal', this.parallaxSettings.layers.particles));
      } else {
        this.particles.push(new Particle(x, y, radius, color, velocity, 'rock', this.parallaxSettings.layers.particles));
      }
    }
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * 30 + 20;
      const color = this.planetData.pluto.colors[3];
      const velocity = { x: (Math.random() - 0.5) * 0.1, y: (Math.random() - 0.5) * 0.1 };
      this.specialElements.push(new Particle(x, y, radius, color, velocity, 'ice', this.parallaxSettings.layers.special));
    }
  }

  /**
   * Анимационный цикл.
   * @private
   */
  animate() {
    this.time += 0.01;

    this.drawBackground();
    this.nebulae.forEach(nebula => nebula.update(this.ctx, this.canvas, this.time));
    this.stars.forEach(star => star.update(this.ctx, this.canvas, this.time));
    this.particles.forEach(particle => particle.update(this.ctx, this.canvas, this.time));
    this.specialElements.forEach(element => element.update(this.ctx, this.canvas, this.time));

    this.animationId = requestAnimationFrame(this.animate);
  }

  /**
   * Изменяет текущую планету и генерирует новый фон.
   * @param {string} planet - Код планеты (например, 'earth').
   */
  setPlanet(planet) {
    if (this.planetData[planet]) {
      this.currentPlanet = planet;
      this.generatePlanetBackground();
      console.log(`🪐 Фон изменён на: ${planet}`);
    } else {
      console.warn(`⚠️ Планета ${planet} не найдена в данных.`);
    }
  }

  // --- API методы для вызова из других модулей ---
  /**
   * Возвращает текущую планету.
   * @returns {string}
   */
  getCurrentPlanet() {
    return this.currentPlanet;
  }
}

// --- Экспорт для использования в других модулях ---
// export default PlanetBackgroundManager; // Можно использовать как default export