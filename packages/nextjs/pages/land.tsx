import React, { ReactElement, useEffect, useState } from "react";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import type { NextPageWithLayout } from "~~/pages/_app";

const tiles = [
  "tile0.png",
  "tile1.png",
  "tile2.png",
  "tile3.png",
  "tile4.png",
  "market.png",
  "grass.png",
  "house.png",
  "strawfarm.png",
];

const Land: NextPageWithLayout = () => {
  const { data: contractMapData } = useScaffoldContractRead({
    contractName: "Land",
    functionName: "getMap",
  });

  const [mapData, setMapData] = useState<number[][]>([]);

  useEffect(() => {
    const getRandomTileIndex = () => {
      const randomNum = Math.random();
      if (randomNum < 0.4) {
        return 4; // 40% chance for grass tile, assuming it's at index 5
      } else {
        return Math.floor(Math.random() * 5); // 60% chance for tiles 0 to 4
      }
    };

    const generateRandomMapData = () => {
      const data = [];
      for (let i = 0; i < 25; i++) {
        const row = [];
        for (let j = 0; j < 25; j++) {
          row.push(getRandomTileIndex());
        }
        data.push(row);
      }

      // load tiles from the contract
      for (let i = 9; i >= 0; i--) {
        data[i + 3][7] = contractMapData
          ? Number((contractMapData[i as keyof typeof contractMapData] as any).sprite) + 6
          : 0;
      }

      // hard code a tile
      data[8][5] = 5;

      return data;
    };

    setMapData(generateRandomMapData());
  }, [contractMapData]);

  const renderedTiles = [];

  if (mapData.length > 0) {
    for (let rowIndex = 0; rowIndex < 25; rowIndex++) {
      for (let colIndex = 24; colIndex >= 0; colIndex--) {
        const leftOffset = colIndex * 80 + rowIndex * 80 + "px";
        const topOffset = rowIndex * 50 - colIndex * 50 + "px"; // Updated to 51
        const tileElement = (
          <img
            key={`${rowIndex}-${colIndex}`}
            src={`/assets/land/${tiles[mapData[rowIndex][colIndex]]}`}
            alt={`Tile at position ${rowIndex}, ${colIndex}`}
            style={{
              position: "absolute",
              width: "160px",
              height: "160px",
              left: leftOffset,
              top: topOffset,
            }}
          />
        );
        renderedTiles.push(tileElement);
      }
    }
  }

  return (
    <div style={{ position: "relative", top: "300px", left: "-500px", width: "2000px", height: "2000px" }}>
      {renderedTiles}
    </div>
  );
};

Land.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default Land;
