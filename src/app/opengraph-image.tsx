import { ImageResponse } from "next/og";

// Route-level Open Graph image, generated at build time and inherited by every
// page. Next auto-injects og:image and twitter:image pointing here.
export const alt = "Wheeloh — the car-spotting app for enthusiasts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1c1c22 100%)",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 130,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-4px",
          }}
        >
          Wheeloh
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 44,
            color: "#b8b8c0",
            maxWidth: 900,
          }}
        >
          Spot, identify and collect the rarest cars around you.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 30,
            color: "#6ee7b7",
            fontWeight: 600,
          }}
        >
          The car-spotting app · iOS &amp; Android
        </div>
      </div>
    ),
    { ...size },
  );
}
