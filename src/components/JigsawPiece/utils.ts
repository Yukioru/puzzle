/**
 * Надёжный генератор пазловых деталей под CSS `clip-path: polygon(...)`.
 * - sides: [top, right, bottom, left]  (0 — ровно, 1 — наружу, -1 — внутрь)
 * - натуральная форма выступа: шейка -> полуокружность -> шейка (семплирование)
 * - порядок обхода: по часовой стрелке от левого верхнего угла
 * - никаких дубликатов/самопересечен  // ПРАВО (идём сверху -> вниз)
  if (RIG  // НИЗ (идём справа -> влево)
  if (BOTT  // ЛЕВО (идём снизу -> вверх)
  if (LEFT === 0) {
    // Прямой край без выноса
    for (let i=1; i<=S_EDGE; i++){
      const u = i / S_EDGE;
      const y = B - (B - T) * u; // движемся снизу вверх
      const x = getCurvedX(y, L, false, false, true); // плоский край без кривизны
      pts.push(P(x, y));
    } {
    // Прямой край без выноса
    for (let i=1; i<=S_EDGE; i++){
      const u = i / S_EDGE;
      const x = R - (R - L) * u; // движемся справа влево
      const y = getCurvedY(x, B, false, false, true); // плоский край без кривизны
      pts.push(P(x, y));
    } {
    // Прямой край без выноса
    for (let i=1; i<=S_EDGE; i++){
      const u = i / S_EDGE;
      const y = T + (B - T) * u;
      const x = getCurvedX(y, R, false, true, true); // плоский край без кривизны
      pts.push(P(x, y));
    }корректны
 */
export function puzzlePolygon(
  sides: [number, number, number, number],
  opts?: {
    headWidth?: number;   // диаметр головки, % от базовой области (28..36)
    neckWidth?: number;   // ширина шейки у кромки, % (10..16)
    neckLength?: number;  // длина шейки, % от depth (30..80) - какая часть глубины занимает шейка
    depth?: number;       // глубина до вершины головки, % (18..24)
    edgeCurve?: number;   // прогиб "ровных" участков, % (0..6) — можно оставить 0 для стабильности
    samplesNeck?: number; // дискретизация шейки (12..24)
    samplesCap?: number;  // дискретизация полуокружности (20..36)
    samplesEdge?: number; // дискретизация ровного участка (4..10)
  }
): string {
  const [TOP, RIGHT, BOTTOM, LEFT] = sides;

  // --- параметры по умолчанию
  const headW      = clamp(opts?.headWidth, 28, 40) ?? 32;
  const neckW      = clamp(opts?.neckWidth, 8, 22) ?? 12;
  const neckLength = clamp(opts?.neckLength, 30, 80) ?? 60; // 60% от depth занимает шейка
  const depth      = clamp(opts?.depth, 10, 35) ?? 20;
  const edgeCurve  = clamp(opts?.edgeCurve, 0, 8) ?? 0; // убираем волны по умолчанию
  const S_NECK     = Math.round(clamp(opts?.samplesNeck, 8, 40) ?? 18);
  const S_CAP      = Math.round(clamp(opts?.samplesCap , 14, 60) ?? 30);
  const S_EDGE     = Math.round(clamp(opts?.samplesEdge, 3, 16) ?? 8);

  // --- расширенная коробка (как у тебя): +depth * 2
  const scale  = 100 / (100 + depth * 2);
  const offset = (depth / (100 + depth * 2)) * 100;

  const L = offset, R = offset + 100 * scale;
  const T = offset, B = offset + 100 * scale;
  const CX = offset + 50 * scale, CY = offset + 50 * scale;

  const rHead = (headW * scale) / 2;        // радиус головки в %
  const rNeck = (neckW * scale) / 2;        // полу-шейка
  const tip   = depth * scale;              // глубина до ВЕРШИНЫ
  const neckDepth = tip * (neckLength / 100); // глубина шейки (полная)
  const cOff  = Math.max(0, tip - rHead);   // отступ центра круга от кромки
  const bow   = edgeCurve * scale;          // прогиб "ровной" дуги

  const pts: string[] = [];
  const P = (x:number,y:number)=>`${round2(x)}% ${round2(y)}%`;
  
  // Улучшенная функция сглаживания для более плавного перехода шейка->головка
  const ease = (t:number) => {
    // Кубическая интерполяция для более гладкого перехода
    return t * t * (3 - 2 * t);
  };

  // Функция для получения Y-координаты на кривом горизонтальном крае
  const getCurvedY = (x: number, baseY: number, isOutward: boolean, isTopEdge: boolean, isFlat: boolean = false) => {
    if (bow === 0 || isFlat) return baseY; // нет кривизны или плоский край
    const u = (x - L) / (R - L); // нормализованная позиция от 0 до 1
    
    // Определяем направление кривизны в зависимости от стороны и типа выноса
    let curveSign: number;
    if (isTopEdge) {
      // Верхний край: внешние → вверх (+) = выгнутая, внутренние → вниз (-) = вогнутая
      curveSign = isOutward ? +1 : -1;
    } else {
      // Нижний край: внешние → вниз (-) = выгнутая, внутренние → вверх (+) = вогнутая
      curveSign = isOutward ? -1 : +1;
    }
    
    return baseY + curveSign * bow * Math.sin(Math.PI * u);
  };

  // Функция для получения X-координаты на кривом вертикальном крае  
  const getCurvedX = (y: number, baseX: number, isOutward: boolean, isRightEdge: boolean, isFlat: boolean = false) => {
    if (bow === 0 || isFlat) return baseX; // нет кривизны или плоский край
    const u = (y - T) / (B - T); // нормализованная позиция от 0 до 1
    
    // Определяем направление кривизны в зависимости от стороны и типа выноса
    let curveSign: number;
    if (isRightEdge) {
      // Правый край: внешние → влево (-), внутренние → вправо (+)
      curveSign = isOutward ? -1 : +1;
    } else {
      // Левый край: внешние → вправо (+), внутренние → влево (-)
      curveSign = isOutward ? +1 : -1;
    }
    
    return baseX + curveSign * bow * Math.sin(Math.PI * u);
  };

  // горизонтальная "кнопка" с учетом кривизны края
  // leftY, rightY - Y-координаты точек соединения с кривым краем
  const knobHCurved = (yBase:number, dir:1|-1, reverse:boolean, leftY:number, rightY:number) => {
    const cy = yBase - dir*cOff;

    if (!reverse) {
      // Обычный обход (слева -> вправо) для верхней стороны
      // лeвая шейка: от точки на кривой до точки соединения с головкой
      for (let i=0;i<S_NECK;i++){ 
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck) * ease(t);
        // Интерполируем между leftY (базовая кривая) и yBase (прямая линия)
        const baseY = leftY + (yBase - leftY) * t;
        const y = baseY - dir*(neckDepth * t);
        pts.push(P(CX - w, y));
      }
      
      // полуокружность головки (слева -> вправо)
      for (let i=S_CAP-1;i>=1;i--){
        const t = i/(S_CAP-1); // нормализованный параметр от 1 до 0
        const th = Math.PI * t; // от π до 0
        const x  = CX + rHead*Math.cos(th);
        const y  = cy - dir*rHead*Math.sin(th);
        pts.push(P(x,y));
      }
      
      // правая шейка назад к кромке
      for (let i=S_NECK-1;i>=0;i--){
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck) * ease(t);
        // Интерполируем между rightY (базовая кривая) и yBase (прямая линия)
        const baseY = rightY + (yBase - rightY) * t;
        const y = baseY - dir*(neckDepth * t);
        pts.push(P(CX + w, y));
      }
    } else {
      // Обратный обход (справа -> влево) для нижней стороны
      // правая шейка: от точки на кривой до головки
      for (let i=0;i<S_NECK;i++){
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck) * ease(t);
        // Интерполируем между rightY (базовая кривая) и yBase (прямая линия)
        const baseY = rightY + (yBase - rightY) * t;
        const y = baseY - dir*(neckDepth * t);
        pts.push(P(CX + w, y));
      }
      
      // полуокружность головки (справа -> влево)
      for (let i=1;i<S_CAP;i++){
        const t = i/(S_CAP-1); // нормализованный параметр от 0 до 1
        const th = Math.PI * t; // от 0 до π
        const x  = CX + rHead*Math.cos(th);
        const y  = cy - dir*rHead*Math.sin(th);
        pts.push(P(x,y));
      }
      
      // левая шейка назад к кромке
      for (let i=S_NECK-1;i>=0;i--){
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck) * ease(t);
        // Интерполируем между leftY (базовая кривая) и yBase (прямая линия)
        const baseY = leftY + (yBase - leftY) * t;
        const y = baseY - dir*(neckDepth * t);
        pts.push(P(CX - w, y));
      }
    }
  };



  // вертикальная "кнопка" с учетом кривизны края
  // topX, bottomX - X-координаты точек соединения с кривым краем
  const knobVCurved = (xBase:number, dir:1|-1, reverse:boolean, topX:number, bottomX:number) => {
    const cx = xBase + dir*cOff;

    if (!reverse) {
      // Обычный обход (сверху -> вниз) для правой стороны
      // верхняя шейка: от точки на кривой до головки
      for (let i=0;i<S_NECK;i++){
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck)*ease(t);
        // Интерполируем между topX (базовая кривая) и xBase (прямая линия)
        const baseX = topX + (xBase - topX) * t;
        const x = baseX + dir*(neckDepth * t);
        pts.push(P(x, CY - w));
      }
      
      // φ: -π/2..π/2 (сверху -> вниз), без крайних точек
      for (let i=1;i<S_CAP;i++){
        const ph = -Math.PI/2 + (Math.PI*i)/S_CAP;
        const x  = cx + dir*rHead*Math.cos(ph);
        const y  = CY + rHead*Math.sin(ph);
        pts.push(P(x,y));
      }
      
      // нижняя шейка назад к кромке
      for (let i=S_NECK-1;i>=0;i--){
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck)*ease(t);
        // Интерполируем между bottomX (базовая кривая) и xBase (прямая линия)
        const baseX = bottomX + (xBase - bottomX) * t;
        const x = baseX + dir*(neckDepth * t);
        pts.push(P(x, CY + w));
      }
    } else {
      // Обратный обход (снизу -> вверх) для левой стороны
      // нижняя шейка: от точки на кривой до головки
      for (let i=0;i<S_NECK;i++){
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck)*ease(t);
        // Интерполируем между bottomX (базовая кривая) и xBase (прямая линия)
        const baseX = bottomX + (xBase - bottomX) * t;
        const x = baseX + dir*(neckDepth * t);
        pts.push(P(x, CY + w));
      }
      
      // φ: π/2..-π/2 (снизу -> вверх), без крайних точек
      for (let i=1;i<S_CAP;i++){
        const ph = Math.PI/2 - (Math.PI*i)/S_CAP;
        const x  = cx + dir*rHead*Math.cos(ph);
        const y  = CY + rHead*Math.sin(ph);
        pts.push(P(x,y));
      }
      
      // верхняя шейка назад к кромке (НЕ включаем финальную точку)
      for (let i=S_NECK-1;i>=1;i--){
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck)*ease(t);
        // Интерполируем между topX (базовая кривая) и xBase (прямая линия)
        const baseX = topX + (xBase - topX) * t;
        const x = baseX + dir*(neckDepth * t);
        pts.push(P(x, CY - w));
      }
    }
  };

  // === обходим строго по часовой стрелке, исключая дубликаты углов ===
  pts.push(P(L, T)); // старт: левый верхний угол

  // ВЕРХ (идём слева -> вправо)
  if (TOP === 0) {
    // Прямой край без выноса - строим кривую от угла до угла
    for (let i=1; i<=S_EDGE; i++){
      const u = i / S_EDGE;
      const x = L + (R - L) * u;
      const y = getCurvedY(x, T, false, true, true); // плоский край без кривизны
      pts.push(P(x, y));
    }
  } else {
    // Край с выносом - строим первую часть кривой до точки соединения с выносом
    for (let i=1; i<S_EDGE; i++){
      const u = i / S_EDGE;
      const x = L + (CX - rNeck - L) * u;
      const y = getCurvedY(x, T, TOP === 1, true); // внешний/внутренний вынос, верхний край
      pts.push(P(x, y));
    }
    
    // Получаем Y-координату левой точки соединения с кривой
    const leftConnectionY = getCurvedY(CX - rNeck, T, TOP === 1, true);
    // Получаем Y-координату правой точки соединения с кривой  
    const rightConnectionY = getCurvedY(CX + rNeck, T, TOP === 1, true);
    
    // Добавляем вынос, начинающийся и заканчивающийся на кривой
    knobHCurved(T, TOP === 1 ? +1 : -1, false, leftConnectionY, rightConnectionY);
    
    // Строим вторую часть кривой от точки соединения до правого края
    for (let i=1; i<=S_EDGE; i++){
      const u = i / S_EDGE;
      const x = (CX + rNeck) + (R - (CX + rNeck)) * u;
      const y = getCurvedY(x, T, TOP === 1, true); // внешний/внутренний вынос, верхний край
      pts.push(P(x, y));
    }
  }

  // ПРАВО (сверху -> вниз)
  if (RIGHT === 0) {
    // Прямой край без выноса
    for (let i=1; i<=S_EDGE; i++){
      const u = i / S_EDGE;
      const y = T + (B - T) * u;
      const x = getCurvedX(y, R, false, true, true); // плоский край без кривизны
      pts.push(P(x, y));
    }
  } else {
    // Край с выносом - строим первую часть кривой до точки соединения с выносом
    for (let i=1; i<S_EDGE; i++){
      const u = i / S_EDGE;
      const y = T + (CY - rNeck - T) * u;
      const x = getCurvedX(y, R, RIGHT === 1, true); // внешний/внутренний вынос, правый край
      pts.push(P(x, y));
    }
    
    // Получаем X-координаты точек соединения с кривой
    const topConnectionX = getCurvedX(CY - rNeck, R, RIGHT === 1, true);
    const bottomConnectionX = getCurvedX(CY + rNeck, R, RIGHT === 1, true);
    
    // Добавляем вынос, начинающийся и заканчивающийся на кривой
    knobVCurved(R, RIGHT === 1 ? +1 : -1, false, topConnectionX, bottomConnectionX);
    
    // Строим вторую часть кривой от точки соединения до нижнего края
    for (let i=1; i<=S_EDGE; i++){
      const u = i / S_EDGE;
      const y = (CY + rNeck) + (B - (CY + rNeck)) * u;
      const x = getCurvedX(y, R, RIGHT === 1, true); // внешний/внутренний вынос, правый край
      pts.push(P(x, y));
    }
  }

  // НИЗ (идём справа -> влево)
  if (BOTTOM === 0) {
    // Прямой край без выноса
    for (let i=1; i<=S_EDGE; i++){
      const u = i / S_EDGE;
      const x = R - (R - L) * u; // идем справа -> влево
      const y = getCurvedY(x, B, false, false, true); // плоский край без кривизны
      pts.push(P(x, y));
    }
  } else {
    // Край с выносом - строим первую часть кривой до точки соединения с выносом
    for (let i=1; i<S_EDGE; i++){
      const u = i / S_EDGE;
      const x = R - (R - (CX + rNeck)) * u; // идем справа до выноса
      const y = getCurvedY(x, B, BOTTOM === 1, false); // внешний/внутренний вынос, нижний край
      pts.push(P(x, y));
    }
    
    // Получаем Y-координаты точек соединения с кривой
    const rightConnectionY = getCurvedY(CX + rNeck, B, BOTTOM === 1, false);
    const leftConnectionY = getCurvedY(CX - rNeck, B, BOTTOM === 1, false);
    
    // Добавляем вынос, начинающийся и заканчивающийся на кривой
    knobHCurved(B, BOTTOM === 1 ? -1 : +1, true, leftConnectionY, rightConnectionY); // reverse=true для обхода справа->влево
    
    // Строим вторую часть кривой от точки соединения до левого края
    for (let i=1; i<=S_EDGE; i++){
      const u = i / S_EDGE;
      const x = (CX - rNeck) - ((CX - rNeck) - L) * u; // от выноса до левого края
      const y = getCurvedY(x, B, BOTTOM === 1, false); // внешний/внутренний вынос, нижний край
      pts.push(P(x, y));
    }
  }

  // ЛЕВО (снизу -> вверх)
  if (LEFT === 0) {
    // Прямой край без выноса
    for (let i=1; i<=S_EDGE; i++){
      const u = i / S_EDGE;
      const y = B - (B - T) * u; // идем снизу -> вверх
      const x = getCurvedX(y, L, false, false, true); // плоский край без кривизны
      pts.push(P(x, y));
    }
  } else {
    // Край с выносом - строим первую часть кривой до точки соединения с выносом
    for (let i=1; i<S_EDGE; i++){
      const u = i / S_EDGE;
      const y = B - (B - (CY + rNeck)) * u; // снизу до выноса
      const x = getCurvedX(y, L, LEFT === 1, false); // внешний/внутренний вынос, левый край
      pts.push(P(x, y));
    }
    
    // Получаем X-координаты точек соединения с кривой
    const bottomConnectionX = getCurvedX(CY + rNeck, L, LEFT === 1, false);
    const topConnectionX = getCurvedX(CY - rNeck, L, LEFT === 1, false);
    
    // Добавляем вынос, начинающийся и заканчивающийся на кривой
    knobVCurved(L, LEFT === 1 ? -1 : +1, true, topConnectionX, bottomConnectionX); // reverse=true для обхода снизу->вверх
    
    // Строим вторую часть кривой от точки соединения до верхнего края
    for (let i=1; i<=S_EDGE; i++){
      const u = i / S_EDGE;
      const y = (CY - rNeck) - ((CY - rNeck) - T) * u; // от выноса до верхнего края
      const x = getCurvedX(y, L, LEFT === 1, false); // внешний/внутренний вынос, левый край
      pts.push(P(x, y));
    }
  }
  
  // Не добавляем начальную точку в конце - полигон замкнется автоматически

  return `polygon(${pts.join(', ')})`;

  // --- helpers
  function clamp(v:number|undefined, a:number, b:number){
    if (v==null || Number.isNaN(v)) return undefined;
    return Math.max(a, Math.min(b, v));
  }
  function round2(n:number){ return Math.round(n*10000)/10000; }
}

/**
 * Утилита для сборки сетки: у соседей стороны комплементарны.
 *   out =  1  (наружу)  ↔ in = -1 (внутрь)
 *   flat = 0 ↔ flat = 0   на границах сетки
 */
export function mate(a: 1 | -1 | 0): 1 | -1 | 0 {
  return a === 1 ? -1 : a === -1 ? 1 : 0;
}