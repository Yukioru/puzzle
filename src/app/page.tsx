import { JigsawBoard } from "~/components/JigsawBoard";
import { JigsawPiece } from "~/components/JigsawPiece";

import hsr from '~/assets/images/hsr.png'

export default function Home() {
  return (
    <div style={{ padding: '30px' }}>
      <JigsawBoard
        difficulty="easy"
        pieces={[
          <JigsawPiece key="img-1" image={hsr} sides={[0, -1, -1, 0]} />,
          <JigsawPiece key="img-2" image={hsr} sides={[0, 1, 1, 1]} />,
          <JigsawPiece key="img-3" image={hsr} sides={[0, 0, 1, -1]} />,
          <JigsawPiece key="img-4" image={hsr} sides={[1, -1, 1, 0]} />,
          <JigsawPiece key="img-5" image={hsr} sides={[-1, 1, -1, 1]} />,
          <JigsawPiece key="img-6" image={hsr} sides={[-1, 0, -1, -1]} />,
          <JigsawPiece key="img-7" image={hsr} sides={[-1, 1, 0, 0]} />,
          <JigsawPiece key="img-8" image={hsr} sides={[1, -1, 0, -1]} />,
          <JigsawPiece key="img-9" image={hsr} sides={[1, 0, 0, 1]} />,
        ]}
      />   
    </div>
  );
}
