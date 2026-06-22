import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QuickMart SL",
    short_name: "QuickMart",
    description: "Sierra Leone's multi-vendor grocery marketplace.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfcf8",
    theme_color: "#157347",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
