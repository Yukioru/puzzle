/**
 * Надёжный генератор пазловых деталей под CSS `clip-path: polygon(...)`.
 * - sides: [top, right, bottom, left]  (0 — ровно, 1 — наружу, -1 — внутрь)
 * - натуральная форма выступа: шейка -> полуокружность -> шейка (семплирование)
 * - порядок обхода: по часовой стрелке от левого верхнего угла
 * - никаких дубликатов/самопересечений; углы корректны
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
  
  // Функция для создания плавного перехода между шейкой и головкой с кривыми Безье
  const createSmoothTransition = (startW: number, endW: number, startY: number, endY: number, side: 'left' | 'right', steps = 16) => {
    for (let i = 1; i <= steps; i++) {
      const t = i / (steps + 1);
      
      // Более гладкая S-образная кривая для предотвращения резких переходов
      const smoothT = t * t * t * (t * (t * 6 - 15) + 10); // 6t^5 - 15t^4 + 10t^3
      
      // Плавное изменение ширины с более сильной коррекцией
      const w = startW + (endW - startW) * smoothT;
      
      // Плавное изменение высоты с улучшенной коррекцией
      const y = startY + (endY - startY) * smoothT;
      
      // Увеличенная коррекция по X для более плавного следования касательной к окружности
      const tangentFactor = Math.sin(Math.PI * t * 0.5) * (endW - startW) * 0.15;
      const baseX = side === 'left' ? CX - w : CX + w;
      const x = side === 'left' ? baseX - tangentFactor : baseX + tangentFactor;
      
      pts.push(P(x, y));
    }
  };
  
  // Функция для создания плавного перехода между шейкой и головкой (вертикально)
  const createSmoothTransitionV = (startW: number, endW: number, startX: number, endX: number, side: 'top' | 'bottom', steps = 16) => {
    for (let i = 1; i <= steps; i++) {
      const t = i / (steps + 1);
      
      // Более гладкая S-образная кривая
      const smoothT = t * t * t * (t * (t * 6 - 15) + 10);
      
      // Плавное изменение ширины
      const w = startW + (endW - startW) * smoothT;
      
      // Плавное изменение позиции по X
      const x = startX + (endX - startX) * smoothT;
      
      // Увеличенная коррекция по Y для следования касательной к окружности
      const tangentFactor = Math.sin(Math.PI * t * 0.5) * (endW - startW) * 0.15;
      const baseY = side === 'top' ? CY - w : CY + w;
      const y = side === 'top' ? baseY - tangentFactor : baseY + tangentFactor;
      
      pts.push(P(x, y));
    }
  };

  // вспомогательные дуги "ровных" участков (без самопересечений)
  const edgeH = (x0:number,x1:number,y:number,sign:number, forward=true) => {
    const from = forward ? 0 : S_EDGE;
    const to   = forward ? S_EDGE : 0;
    const step = forward ? +1 : -1;
    for (let i=from; forward ? i<=to : i>=to; i+=step){
      const u=i/S_EDGE, x=x0+(x1-x0)*u;
      const yy = y + sign*bow*Math.sin(Math.PI*((x-L)/(R-L)));
      pts.push(P(x,yy));
    }
  };
  const edgeV = (y0:number,y1:number,x:number,sign:number, forward=true, includeEnd=true) => {
    const from = forward ? 0 : S_EDGE;
    const to   = forward ? S_EDGE : 0;
    const step = forward ? +1 : -1;
    const limit = includeEnd ? to : (forward ? to-1 : to+1);
    for (let i=from; forward ? i<=limit : i>=limit; i+=step){
      const u=i/S_EDGE, y=y0+(y1-y0)*u;
      const xx = x + sign*bow*Math.sin(Math.PI*((y-T)/(B-T)));
      pts.push(P(xx,y));
    }
  };

  // горизонтальная "кнопка": шейка -> полуокружность -> шейка
  // dir: +1 наружу (от базовой области), -1 внутрь
  // reverse: true для обхода справа -> влево (для нижней стороны)
  const knobH = (yBase:number, dir:1|-1, reverse = false) => {
    const cy = yBase - dir*cOff;

    if (!reverse) {
      // Обычный обход (слева -> вправо) для верхней стороны
      // лeвая шейка: от (CX-rNeck, yBase) до точки соединения с головкой
      for (let i=0;i<S_NECK;i++){ 
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck) * ease(t);
        const y = yBase - dir*(neckDepth * t);
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
        const y = yBase - dir*(neckDepth * t);
        pts.push(P(CX + w, y));
      }
    } else {
      // Обратный обход (справа -> влево) для нижней стороны
      // правая шейка: от (CX+rNeck, yBase) до головки
      for (let i=0;i<S_NECK;i++){
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck) * ease(t);
        const y = yBase - dir*(neckDepth * t);
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
        const y = yBase - dir*(neckDepth * t);
        pts.push(P(CX - w, y));
      }
    }
  };

  // вертикальная "кнопка"
  // dir: +1 наружу (от базовой области), -1 внутрь  
  // reverse: true для обхода снизу -> вверх (для левой стороны)
  const knobV = (xBase:number, dir:1|-1, reverse = false) => {
    const cx = xBase + dir*cOff;

    if (!reverse) {
      // Обычный обход (сверху -> вниз) для правой стороны
      // верхняя шейка: от (xBase, CY-rNeck) до головки
      for (let i=0;i<S_NECK;i++){
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck)*ease(t);
        const x = xBase + dir*(neckDepth * t);
        pts.push(P(x, CY - w));
      }
      
      // Промежуточные точки для плавного перехода к головке
      const neckEndX = xBase + dir*neckDepth;
      const headStartX = cx + dir*rHead; // X координата верхней точки головки
      const transitionSteps = 3;
      
      for (let i = 1; i <= transitionSteps; i++) {
        const t = i / (transitionSteps + 1);
        const smoothT = ease(t);
        const x = neckEndX + (headStartX - neckEndX) * smoothT;
        const y = CY - rHead; // Y остаётся постоянным для верхней стороны
        pts.push(P(x, y));
      }
      
      // φ: -π/2..π/2 (сверху -> вниз), без крайних точек
      for (let i=1;i<S_CAP;i++){
        const ph = -Math.PI/2 + (Math.PI*i)/S_CAP;
        const x  = cx + dir*rHead*Math.cos(ph);
        const y  = CY + rHead*Math.sin(ph);
        pts.push(P(x,y));
      }
      
      // Промежуточные точки для перехода от головки к нижней шейке
      const headEndX = cx + dir*rHead; // X координата нижней точки головки
      const bottomNeckStartX = xBase + dir*neckDepth;
      
      for (let i = 1; i <= transitionSteps; i++) {
        const t = i / (transitionSteps + 1);
        const smoothT = ease(t);
        const x = headEndX + (bottomNeckStartX - headEndX) * smoothT;
        const y = CY + rHead; // Y остаётся постоянным для нижней стороны
        pts.push(P(x, y));
      }
      
      // нижняя шейка назад к кромке
      for (let i=S_NECK-1;i>=0;i--){
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck)*ease(t);
        const x = xBase + dir*(neckDepth * t);
        pts.push(P(x, CY + w));
      }
    } else {
      // Обратный обход (снизу -> вверх) для левой стороны
      // нижняя шейка: от (xBase, CY+rNeck) до головки
      for (let i=0;i<S_NECK;i++){
        const t = i/(S_NECK-1); // нормализуем до 1
        const w = rNeck + (rHead - rNeck)*ease(t);
        const x = xBase + dir*(neckDepth * t);
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
        const x = xBase + dir*(neckDepth * t);
        pts.push(P(x, CY - w));
      }
    }
  };

  // знак прогиба для "ровных" частей (правило: наружу — вогнуто, внутрь — выгнуто)
  const sTop    = TOP    === 0 ? 0 : (TOP    === 1 ? +1 : -1);
  const sRight  = RIGHT  === 0 ? 0 : (RIGHT  === 1 ? +1 : -1);
  const sBottom = BOTTOM === 0 ? 0 : (BOTTOM === 1 ? -1 : +1);
  const sLeft   = LEFT   === 0 ? 0 : (LEFT   === 1 ? -1 : +1);

  // === обходим строго по часовой стрелке, исключая дубликаты углов ===
  pts.push(P(L, T)); // старт: левый верхний угол

  // ВЕРХ (идём слева -> вправо)
  if (TOP === 0) {
    if (S_EDGE > 0) edgeH(L, R, T, 0, true);
  } else {
    if (S_EDGE > 0) {
      // Только первый сегмент включает начальную точку
      edgeH(L, CX - rNeck, T, sTop, true);
    }
    knobH(T, TOP === 1 ? +1 : -1);
    if (S_EDGE > 0) {
      // Второй сегмент пропускает начальную точку (уже есть в knobH)
      for (let i=1; i<=S_EDGE; i++){
        const u=i/S_EDGE, x=(CX + rNeck)+(R-(CX + rNeck))*u;
        const yy = T + sTop*bow*Math.sin(Math.PI*((x-L)/(R-L)));
        pts.push(P(x,yy));
      }
    }
  }
  
  // Добавляем правый верхний угол только если он не был добавлен краем
  if (pts[pts.length - 1] !== P(R, T)) {
    pts.push(P(R, T));
  }

  // ПРАВО (сверху -> вниз)
  if (RIGHT === 0) {
    if (S_EDGE > 0) edgeV(T, B, R, 0, true);
  } else {
    if (S_EDGE > 0) {
      // Только первый сегмент включает начальную точку
      edgeV(T, CY - rNeck, R, sRight, true);
    }
    knobV(R, RIGHT === 1 ? +1 : -1);
    if (S_EDGE > 0) {
      // Второй сегмент пропускает начальную точку
      for (let i=1; i<=S_EDGE; i++){
        const u=i/S_EDGE, y=(CY + rNeck)+(B-(CY + rNeck))*u;
        const xx = R + sRight*bow*Math.sin(Math.PI*((y-T)/(B-T)));
        pts.push(P(xx,y));
      }
    }
  }
  
  // Добавляем правый нижний угол
  if (pts[pts.length - 1] !== P(R, B)) {
    pts.push(P(R, B));
  }

  // НИЗ (идём справа -> влево)
  if (BOTTOM === 0) {
    if (S_EDGE > 0) edgeH(R, L, B, 0, false);
  } else {
    if (S_EDGE > 0) {
      // Первый сегмент включает начальную точку
      edgeH(R, CX + rNeck, B, sBottom, false);
    }
    knobH(B, BOTTOM === 1 ? -1 : +1, true); // reverse=true для обхода справа->влево
    if (S_EDGE > 0) {
      // Второй сегмент пропускает начальную точку
      for (let i=1; i<=S_EDGE; i++){
        const u=i/S_EDGE, x=(CX - rNeck)+(L-(CX - rNeck))*u;
        const yy = B + sBottom*bow*Math.sin(Math.PI*((x-L)/(R-L)));
        pts.push(P(x,yy));
      }
    }
  }
  
  // Добавляем левый нижний угол
  if (pts[pts.length - 1] !== P(L, B)) {
    pts.push(P(L, B));
  }

  // ЛЕВО (снизу -> вверх)
  if (LEFT === 0) {
    if (S_EDGE > 0) edgeV(B, T, L, 0, false);
  } else {
    if (S_EDGE > 0) {
      // Первый сегмент: от B до CY + rNeck (НЕ включая конечную точку)
      edgeV(B, CY + rNeck, L, sLeft, false, false);
    }
    knobV(L, LEFT === 1 ? -1 : +1, true); // reverse=true для обхода снизу->вверх
    if (S_EDGE > 0) {
      // Второй сегмент: от CY - rNeck до T (пропускаем начальную точку)
      for (let i=1; i<=S_EDGE; i++){
        const u=i/S_EDGE, y=(CY - rNeck)+(T-(CY - rNeck))*u;
        const xx = L + sLeft*bow*Math.sin(Math.PI*((y-T)/(B-T)));
        pts.push(P(xx,y));
      }
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