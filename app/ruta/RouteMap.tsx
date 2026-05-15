import dynamic from "next/dynamic";

// Leaflet doesn't support SSR — load only on the client
const RouteMapInner = dynamic(() => import("./RouteMapInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: "320px", borderRadius: "16px" }}
      className="bg-gray-100 animate-pulse flex items-center justify-center"
    >
      <span className="text-gray-400 text-sm">Cargando mapa...</span>
    </div>
  ),
});

export default RouteMapInner;
