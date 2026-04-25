/**
 * ScrollMonth - Компонент для отображения свитка месяца с неделями
 * 
 * @param {number} month - Номер месяца (0-11, где 0 = Январь)
 * @param {Array<Object>} weeks - Массив данных для недель (опционально)
 * @param {string} className - Дополнительные CSS классы
 * @param {Function} onWeekClick - Обработчик клика на неделю
 */

import React from 'react';
import { 
  getMonthTheme, 
  getMonthName, 
  getMonthThemeClass,
  generateWeeksForMonth 
} from '../utils/scrollColors.js';

export function ScrollMonth({ 
  month = 0, 
  weeks = [], 
  className = '', 
  onWeekClick,
  children 
}) {
  const theme = getMonthTheme(month);
  const monthName = getMonthName(month);
  const themeClass = getMonthThemeClass(month);
  
  // Генерируем недели если не переданы
  const weekItems = weeks.length > 0 ? weeks : generateWeeksForMonth(month, 4);
  
  const handleWeekClick = (weekData) => {
    if (onWeekClick) {
      onWeekClick({ month, monthName, theme, ...weekData });
    }
  };
  
  return (
    <div className={`scroll-container ${themeClass} ${className}`.trim()}>
      <div className="scroll-month-header">
        {monthName}
      </div>
      
      <div className="scroll-weeks-container">
        {weekItems.map((week, index) => (
          <div
            key={week.id || `week-${month}-${index}`}
            className={`scroll-week scroll-week-${week.weekNumber || (index + 1)}`}
            onClick={() => handleWeekClick(week)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleWeekClick(week);
              }
            }}
          >
            {children ? children(week) : (week.title || `Неделя ${week.weekNumber || (index + 1)}`)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ScrollYear - Компонент для отображения свитков всего года
 * 
 * @param {number} year - Год
 * @param {Object} monthsData - Данные для месяцев { monthIndex: { weeks: [...] } }
 * @param {Function} onMonthChange - Обработчик изменения месяца
 * @param {Function} onWeekClick - Обработчик клика на неделю
 */
export function ScrollYear({ 
  year = new Date().getFullYear(),
  monthsData = {},
  onMonthChange,
  onWeekClick 
}) {
  const months = Array.from({ length: 12 }, (_, i) => i);
  
  return (
    <div className="scroll-year-container">
      {months.map((monthIndex) => {
        const monthData = monthsData[monthIndex] || {};
        const weeks = monthData.weeks || [];
        
        return (
          <ScrollMonth
            key={monthIndex}
            month={monthIndex}
            weeks={weeks}
            onWeekClick={onWeekClick}
          />
        );
      })}
    </div>
  );
}

export default ScrollMonth;
