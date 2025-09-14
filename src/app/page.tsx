import { JigsawBoard } from "~/components/JigsawBoard";
import { JigsawPiece } from "~/components/JigsawPiece";

import hsr from '~/assets/images/hsr.png'
import { SmartJigsawPiece } from "~/components/SmartJigsawPiece";

export default function Home() {
  return (
    <>
      <div style={{ padding: '30px', width: 480 }}>
        <JigsawBoard
          difficulty="easy"
          pieces={[
            <SmartJigsawPiece key="img-1" initialSides={[0, -1, -1, 0]}>
              <JigsawPiece image={hsr} sides={[0, -1, -1, 0]} />
            </SmartJigsawPiece>,
            <SmartJigsawPiece key="img-2" initialSides={[0, 1, 1, 1]}>
              <JigsawPiece image={hsr} sides={[0, 1, 1, 1]} />
            </SmartJigsawPiece>,
            null,
            <SmartJigsawPiece key="img-4" initialSides={[1, -1, 1, 0]}>
              <JigsawPiece image={hsr} sides={[1, -1, 1, 0]} />
            </SmartJigsawPiece>,
            <SmartJigsawPiece key="img-5" initialSides={[-1, 1, -1, 1]}>
              <JigsawPiece image={hsr} sides={[-1, 1, -1, 1]} />
            </SmartJigsawPiece>,
            <SmartJigsawPiece key="img-6" initialSides={[-1, 0, -1, -1]}>
              <JigsawPiece image={hsr} sides={[-1, 0, -1, -1]} />
            </SmartJigsawPiece>,
            <SmartJigsawPiece key="img-7" initialSides={[-1, 1, 0, 0]}>
              <JigsawPiece image={hsr} sides={[-1, 1, 0, 0]} />
            </SmartJigsawPiece>,
            null,
            <SmartJigsawPiece key="img-9" initialSides={[1, 0, 0, 1]}>
              <JigsawPiece image={hsr} sides={[1, 0, 0, 1]} />
            </SmartJigsawPiece>,
          ]}
        />   
      </div>
      <div style={{ padding: '30px', width: 720 }}>
        <JigsawBoard
          difficulty="easy"
          pieces={[
            <SmartJigsawPiece key="img-1" initialSides={[0, -1, -1, 0]}>
              <JigsawPiece image={hsr} sides={[0, -1, -1, 0]} />
            </SmartJigsawPiece>,
            <SmartJigsawPiece key="img-2" initialSides={[0, 1, 1, 1]}>
              <JigsawPiece image={hsr} sides={[0, 1, 1, 1]} />
            </SmartJigsawPiece>,
            null,
            <SmartJigsawPiece key="img-4" initialSides={[1, -1, 1, 0]}>
              <JigsawPiece image={hsr} sides={[1, -1, 1, 0]} />
            </SmartJigsawPiece>,
            <SmartJigsawPiece key="img-5" initialSides={[-1, 1, -1, 1]}>
              <JigsawPiece image={hsr} sides={[-1, 1, -1, 1]} />
            </SmartJigsawPiece>,
            <SmartJigsawPiece key="img-6" initialSides={[-1, 0, -1, -1]}>
              <JigsawPiece image={hsr} sides={[-1, 0, -1, -1]} />
            </SmartJigsawPiece>,
            <SmartJigsawPiece key="img-7" initialSides={[-1, 1, 0, 0]}>
              <JigsawPiece image={hsr} sides={[-1, 1, 0, 0]} />
            </SmartJigsawPiece>,
            null,
            <SmartJigsawPiece key="img-9" initialSides={[1, 0, 0, 1]}>
              <JigsawPiece image={hsr} sides={[1, 0, 0, 1]} />
            </SmartJigsawPiece>,
          ]}
        />   
      </div>
      <div style={{ padding: '30px', width: 1200 }}>
        <JigsawBoard
          difficulty="easy"
          pieces={[
            <SmartJigsawPiece key="img-1" initialSides={[0, -1, -1, 0]}>
              <JigsawPiece image={hsr} sides={[0, -1, -1, 0]} />
            </SmartJigsawPiece>,
            <SmartJigsawPiece key="img-2" initialSides={[0, 1, 1, 1]}>
              <JigsawPiece image={hsr} sides={[0, 1, 1, 1]} />
            </SmartJigsawPiece>,
            null,
            <SmartJigsawPiece key="img-4" initialSides={[1, -1, 1, 0]}>
              <JigsawPiece image={hsr} sides={[1, -1, 1, 0]} />
            </SmartJigsawPiece>,
            <SmartJigsawPiece key="img-5" initialSides={[-1, 1, -1, 1]}>
              <JigsawPiece image={hsr} sides={[-1, 1, -1, 1]} />
            </SmartJigsawPiece>,
            <SmartJigsawPiece key="img-6" initialSides={[-1, 0, -1, -1]}>
              <JigsawPiece image={hsr} sides={[-1, 0, -1, -1]} />
            </SmartJigsawPiece>,
            <SmartJigsawPiece key="img-7" initialSides={[-1, 1, 0, 0]}>
              <JigsawPiece image={hsr} sides={[-1, 1, 0, 0]} />
            </SmartJigsawPiece>,
            null,
            <SmartJigsawPiece key="img-9" initialSides={[1, 0, 0, 1]}>
              <JigsawPiece image={hsr} sides={[1, 0, 0, 1]} />
            </SmartJigsawPiece>,
          ]}
        />   
      </div>
    </>
  );
}
