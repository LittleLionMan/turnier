import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Ehemaligenturnier der Handballabteilung des SC Münster 08";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [logo, font] = await Promise.all([
    readFile(path.join(process.cwd(), "public/logo.png")),
    readFile(path.join(process.cwd(), "src/assets/BebasNeue.woff")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", fontFamily: "Bebas" }}>
        <div
          style={{
            flex: 1,
            background: "#ffd400",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 80px",
          }}
        >
          <div style={{ fontSize: 64, color: "#271f24" }}>SC Münster 08 Handball</div>
          <img src={logoSrc} width={170} height={230} alt="" />
        </div>
        <div
          style={{
            height: 260,
            background: "#ed1d26",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            padding: "0 80px",
            fontSize: 160,
          }}
        >
          Ehemaligenturnier
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Bebas", data: font, weight: 400, style: "normal" }] },
  );
}
