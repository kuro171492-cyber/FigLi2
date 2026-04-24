// Renders a line shape with division marks
import { SHAPE_TYPES } from '../utils/constants.js';

export const renderLineWithDivisions = (shape, shapeStyle) => {
  const x1 = shape.x - shapeStyle.left;
  const y1 = shape.y - shapeStyle.top;
  const x2 = shape.x2 - shapeStyle.left;
  const y2 = shape.y2 - shapeStyle.top;
  const divisions = shape.divisions || 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  const markLength = 10;
  const longMarkLength = 20;

  const getMarkCoords = (x, y, len) => {
    const perpA = angle + Math.PI / 2;
    return {
      x1: x + Math.cos(perpA) * (len / 2),
      y1: y + Math.sin(perpA) * (len / 2),
      x2: x - Math.cos(perpA) * (len / 2),
      y2: y - Math.sin(perpA) * (len / 2)
    };
  };

  const mainMarks = [
    getMarkCoords(x1, y1, longMarkLength),
    getMarkCoords(x1 + dx * 0.5, y1 + dy * 0.5, longMarkLength),
    getMarkCoords(x2, y2, longMarkLength)
  ];

  const divisionLines = [];
  if (divisions > 1) {
    const stepSize = 1 / (divisions + 1);
    for (let j = 1; j <= divisions; j++) {
      const t = j * stepSize;
      if (Math.abs(t - 0.5) < 0.01) continue;
      const mx = x1 + dx * t;
      const my = y1 + dy * t;
      divisionLines.push(getMarkCoords(mx, my, markLength));
    }
  }

  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={shape.stroke} strokeWidth={shape.strokeWidth} strokeLinecap="round" />
      {mainMarks.map((m, idx) => (
        <line key={`main-${idx}`} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />
      ))}
      {divisionLines.map((l, idx) => (
        <line key={`div-${idx}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />
      ))}
    </>
  );
};
