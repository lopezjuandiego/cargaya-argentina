"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Station = {
  id: number;
  name: string;
  operator: string;
  city: string;
  lat: number;
  lng: number;
  lastStatus: "working" | "not_working" | null;
};

function makeIcon(color: string, label?: string) {
  return L.divIcon({
    html: label
      ? `<div style="background:${color};color:white;width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;font-family:sans-serif">${label}</div>`
      : `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
    iconSize: label ? [24, 24] : [14, 14],
    iconAnchor: label ? [12, 12] : [7, 7],
    className: "",
  });
}

const iconA = makeIcon("#16a34a", "A");
const iconB = makeIcon("#dc2626", "B");
const iconWorking = makeIcon("#16a34a");
const iconBroken = makeIcon("#dc2626");
const iconUnknown = makeIcon("#9ca3af");

function AutoFit({ geometry }: { geometry: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (geometry.length > 0) {
      map.fitBounds(L.latLngBounds(geometry), { padding: [30, 30] });
    }
  }, [map, geometry]);
  return null;
}

export default function RouteMapInner({
  geometry,
  stations,
  fromLatLng,
  toLatLng,
}: {
  geometry: [number, number][];
  stations: Station[];
  fromLatLng: [number, number];
  toLatLng: [number, number];
}) {
  const center: [number, number] = geometry.length
    ? geometry[Math.floor(geometry.length / 2)]
    : fromLatLng;

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ height: "320px", width: "100%", borderRadius: "16px" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      <AutoFit geometry={geometry} />

      {/* Ruta */}
      <Polyline positions={geometry} color="#16a34a" weight={4} opacity={0.8} />

      {/* Origen A */}
      <Marker position={fromLatLng} icon={iconA} />

      {/* Destino B */}
      <Marker position={toLatLng} icon={iconB} />

      {/* Estaciones */}
      {stations.map((s) => {
        const icon =
          s.lastStatus === "working"
            ? iconWorking
            : s.lastStatus === "not_working"
            ? iconBroken
            : iconUnknown;
        return (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={icon}>
            <Popup>
              <div style={{ fontSize: "13px", lineHeight: "1.4" }}>
                <strong>{s.name}</strong>
                <br />
                <span style={{ color: "#6b7280" }}>{s.operator} · {s.city}</span>
                <br />
                <a
                  href={`/estacion/${s.id}`}
                  style={{ color: "#16a34a" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver detalle →
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
