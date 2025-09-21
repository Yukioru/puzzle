"use client";

// import { AspectRatio } from "~/components/AspectRatio";
// import { JigsawBoard } from "~/components/JigsawBoard";
import { JigsawPiece } from "~/components/JigsawPiece";
import hsr from '~/assets/images/hsr.png'
import { SmartJigsawPiece } from "~/components/SmartJigsawPiece";

export default function Demo() {

  const size = '100px';
  return (
    <div style={{ padding: '30px' }}>
      <h1>Примеры элементов паззла</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Угловые элементы (2 плоские стороны)</h2>
        <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {/* Левый верхний угол */}
          <div style={{ textAlign: 'center', width: size }}>
            <p>Левый верхний угол</p>
            <JigsawPiece image={hsr} sides={[0, 1, -1, 0]} onClick={(event) => console.log('Piece clicked', event)} />
            <p style={{ fontSize: '12px', color: '#666' }}>[0, 1, -1, 0]</p>
          </div>
          
          {/* Правый верхний угол */}
          <div style={{ textAlign: 'center', width: size }}>
            <p>Правый верхний угол</p>
            <JigsawPiece image={hsr} sides={[0, 0, -1, 1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>[0, 0, -1, 1]</p>
          </div>
          
          {/* Правый нижний угол */}
          <div style={{ textAlign: 'center', width: size }}>
            <p>Правый нижний угол</p>
            <JigsawPiece image={hsr} sides={[1, 0, 0, -1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>[1, 0, 0, -1]</p>
          </div>
          
          {/* Левый нижний угол */}
          <div style={{ textAlign: 'center', width: size }}>
            <p>Левый нижний угол</p>
            <JigsawPiece image={hsr} sides={[-1, 1, 0, 0]} />
            <p style={{ fontSize: '12px', color: '#666' }}>{`[-1, 1, 0, 0]`}</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Крайние элементы (1 плоская сторона)</h2>
        <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {/* Верхний край */}
          <div style={{ textAlign: 'center', width: size }}>
            <p>Верхний край</p>
            <JigsawPiece image={hsr} sides={[0, -1, 1, -1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>[0, -1, 1, -1]</p>
          </div>
          
          {/* Правый край */}
          <div style={{ textAlign: 'center', width: size }}>
            <p>Правый край</p>
            <JigsawPiece image={hsr} sides={[1, 0, -1, 1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>[1, 0, -1, 1]</p>
          </div>
          
          {/* Нижний край */}
          <div style={{ textAlign: 'center', width: size }}>
            <p>Нижний край</p>
            <JigsawPiece image={hsr} sides={[-1, 1, 0, 1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>{`[-1, 1, 0, 1]`}</p>
          </div>
          
          {/* Левый край */}
          <div style={{ textAlign: 'center', width: size }}>
            <p>Левый край</p>
            <JigsawPiece image={hsr} sides={[1, -1, 1, 0]} />
            <p style={{ fontSize: '12px', color: '#666' }}>[1, -1, 1, 0]</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Внутренние элементы (все стороны с выступами)</h2>
        <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {/* Различные комбинации внутренних элементов */}
          <div style={{ textAlign: 'center', width: size }}>
            <p>Все выступы наружу</p>
            <JigsawPiece image={hsr} sides={[1, 1, 1, 1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>[1, 1, 1, 1]</p>
          </div>
          
          <div style={{ textAlign: 'center', width: size }}>
            <p>Все выступы внутрь</p>
            <JigsawPiece image={hsr} sides={[-1, -1, -1, -1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>{`[-1, -1, -1, -1]`}</p>
          </div>
          
          <div style={{ textAlign: 'center', width: size }}>
            <p>Чередование 1</p>
            <JigsawPiece image={hsr} sides={[1, -1, 1, -1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>[1, -1, 1, -1]</p>
          </div>
          
          <div style={{ textAlign: 'center', width: size }}>
            <p>Чередование 2</p>
            <JigsawPiece image={hsr} sides={[-1, 1, -1, 1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>{`[-1, 1, -1, 1]`}</p>
          </div>
          
          <div style={{ textAlign: 'center', width: size }}>
            <p>Смешанный 1</p>
            <JigsawPiece image={hsr} sides={[1, 1, -1, -1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>[1, 1, -1, -1]</p>
          </div>
          
          <div style={{ textAlign: 'center', width: size }}>
            <p>Смешанный 2</p>
            <JigsawPiece image={hsr} sides={[-1, -1, 1, 1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>{`[-1, -1, 1, 1]`}</p>
          </div>
          
          <div style={{ textAlign: 'center', width: size }}>
            <p>Смешанный 3</p>
            <JigsawPiece image={hsr} sides={[1, -1, -1, 1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>[1, -1, -1, 1]</p>
          </div>
          
          <div style={{ textAlign: 'center', width: size }}>
            <p>Смешанный 4</p>
            <JigsawPiece image={hsr} sides={[-1, 1, 1, -1]} />
            <p style={{ fontSize: '12px', color: '#666' }}>{`[-1, 1, 1, -1]`}</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Пример сетки паззла</h2>
        <div style={{
          marginTop: '30px',
          display: 'grid', 
          gridTemplateColumns: `repeat(3, ${size})`, 
          gap: '30px',
          justifyContent: 'start'
        }}>
          {/* Первая строка */}
          <JigsawPiece image={hsr} sides={[0, -1, -1, 0]} />
          <JigsawPiece image={hsr} sides={[0, 1, 1, 1]} />
          <JigsawPiece image={hsr} sides={[0, 0, 1, -1]} />
          
          {/* Вторая строка */}
          <JigsawPiece image={hsr} sides={[1, -1, 1, 0]} />
          <JigsawPiece image={hsr} sides={[-1, 1, -1, 1]} />
          <JigsawPiece image={hsr} sides={[-1, 0, -1, -1]} />
          
          {/* Третья строка */}
          <JigsawPiece image={hsr} sides={[-1, 1, 0, 0]} />
          <JigsawPiece image={hsr} sides={[1, -1, 0, -1]} />
          <JigsawPiece image={hsr} sides={[1, 0, 0, 1]} />
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Пример поворота</h2>
        <div style={{
          marginTop: '30px',
          display: 'grid', 
          gridTemplateColumns: `repeat(3, ${size})`, 
          gap: '30px',
          justifyContent: 'start'
        }}>
          <SmartJigsawPiece
            id="smart-piece-1"
            initialSides={[0, -1, -1, 0]}
            onClick={(event) => console.log('Smart Piece clicked', event)}
          >
            <JigsawPiece image={hsr} sides={[0, -1, -1, 0]} />
          </SmartJigsawPiece>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
        <h3>Объяснение системы координат:</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Массив sides:</strong> [верх, право, низ, лево]</li>
          <li><strong>0:</strong> плоская сторона (для крайних элементов)</li>
          <li><strong>1:</strong> выступ наружу (создает вогнутую сторону для соединения)</li>
          <li><strong>-1:</strong> выступ внутрь (создает выпуклую сторону для соединения)</li>
        </ul>
        <p style={{ marginTop: '15px', fontStyle: 'italic', color: '#666' }}>
          Элементы с выступами наружу (1) создают вогнутые стороны, а элементы с выступами внутрь (-1) создают выпуклые стороны, 
          что позволяет им правильно соединяться друг с другом, как в настоящих паззлах.
        </p>
      </div>
    </div>
  );
}
