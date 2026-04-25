/**
 * ScrollColorUtils - Утилиты для работы с цветовой схемой свитков
 * 
 * Распределение месяцев по цветовым темам:
 * - Январь (0), Февраль (1): blue
 * - Март (2), Апрель (3), Май (4): green
 * - Июнь (5), Июль (6), Август (7): red
 * - Сентябрь (8), Октябрь (9), Ноябрь (10): orange
 * - Декабрь (11): purple
 */

/**
 * Получить цветовую тему для месяца
 * @param {number} month - Номер месяца (0-11, где 0 = Январь)
 * @returns {string} Название темы ('blue', 'green', 'red', 'orange', 'purple')
 */
export function getMonthTheme(month) {
  if (month === undefined || month === null) {
    return 'blue'; // тема по умолчанию
  }
  
  const normalizedMonth = ((month % 12) + 12) % 12; // нормализация к диапазону 0-11
  
  if (normalizedMonth === 0 || normalizedMonth === 1) {
    return 'blue';      // Январь, Февраль
  } else if (normalizedMonth >= 2 && normalizedMonth <= 4) {
    return 'green';     // Март, Апрель, Май
  } else if (normalizedMonth >= 5 && normalizedMonth <= 7) {
    return 'red';       // Июнь, Июль, Август
  } else if (normalizedMonth >= 8 && normalizedMonth <= 10) {
    return 'orange';    // Сентябрь, Октябрь, Ноябрь
  } else {
    return 'purple';    // Декабрь
  }
}

/**
 * Получить CSS класс темы для месяца
 * @param {number} month - Номер месяца (0-11)
 * @returns {string} CSS класс темы (например, 'scroll-theme-blue')
 */
export function getMonthThemeClass(month) {
  const theme = getMonthTheme(month);
  return `scroll-theme-${theme}`;
}

/**
 * Получить CSS класс для недели внутри месяца
 * @param {number} weekNumber - Номер недели (1-5)
 * @returns {string} CSS класс недели (например, 'scroll-week-1')
 */
export function getWeekClass(weekNumber) {
  const normalizedWeek = Math.max(1, Math.min(5, weekNumber || 1));
  return `scroll-week-${normalizedWeek}`;
}

/**
 * Получить полное название месяца на русском
 * @param {number} month - Номер месяца (0-11)
 * @returns {string} Название месяца
 */
export function getMonthName(month) {
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  if (month === undefined || month === null) {
    return '';
  }
  
  const normalizedMonth = ((month % 12) + 12) % 12;
  return monthNames[normalizedMonth];
}

/**
 * Получить информацию о месяце (тема, название, классы)
 * @param {number} month - Номер месяца (0-11)
 * @returns {Object} Объект с информацией о месяце
 */
export function getMonthInfo(month) {
  const theme = getMonthTheme(month);
  const name = getMonthName(month);
  
  return {
    month,
    name,
    theme,
    themeClass: `scroll-theme-${theme}`,
    containerClass: `scroll-container scroll-theme-${theme}`
  };
}

/**
 * Сгенерировать массив недель для месяца с соответствующими классами
 * @param {number} month - Номер месяца (0-11)
 * @param {number} weeksCount - Количество недель в месяце (1-5)
 * @param {Array<Object>} weekData - Данные для каждой недели (опционально)
 * @returns {Array<Object>} Массив объектов недель с классами
 */
export function generateWeeksForMonth(month, weeksCount = 4, weekData = []) {
  const theme = getMonthTheme(month);
  const weeks = [];
  
  for (let i = 0; i < weeksCount; i++) {
    const weekNumber = i + 1;
    const data = weekData[i] || {};
    
    weeks.push({
      ...data,
      weekNumber,
      weekClass: `scroll-week-${weekNumber}`,
      theme,
      fullClass: `scroll-week scroll-week-${weekNumber}`
    });
  }
  
  return weeks;
}

/**
 * Хук React для получения информации о месяце
 * Использование: const { theme, name, classes } = useScrollMonthTheme(month);
 */
export function useScrollMonthTheme(month) {
  const info = getMonthInfo(month);
  
  return {
    theme: info.theme,
    name: info.name,
    themeClass: info.themeClass,
    containerClass: info.containerClass,
    weeks: generateWeeksForMonth(month)
  };
}

export default {
  getMonthTheme,
  getMonthThemeClass,
  getWeekClass,
  getMonthName,
  getMonthInfo,
  generateWeeksForMonth,
  useScrollMonthTheme
};
