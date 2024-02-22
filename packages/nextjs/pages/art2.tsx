import React, { ReactElement } from "react";
import type { NextPageWithLayout } from "~~/pages/_app";

const Art: NextPageWithLayout = () => {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden" }}>
        <img src="/assets/art2.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "white",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      ></div>
    </div>
  );
};

Art.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default Art;
