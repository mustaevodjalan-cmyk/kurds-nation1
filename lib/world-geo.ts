import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesData from "world-atlas/countries-110m.json";

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 500;

const ANTARCTICA_ID = "010";

type CountryTopology = Topology<{ countries: GeometryCollection }>;

export function projectPoint(lat: number, lon: number): [number, number] {
  return [((lon + 180) / 360) * MAP_WIDTH, ((90 - lat) / 180) * MAP_HEIGHT];
}

function ringsToPath(rings: number[][][]): string {
  return rings
    .map((ring) =>
      ring
        .map(([lon, lat], index) => {
          const [x, y] = projectPoint(lat, lon);
          return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ")
        .concat(" Z"),
    )
    .join(" ");
}

const topology = countriesData as unknown as CountryTopology;

const countries = feature(topology, topology.objects.countries);

export const WORLD_LAND_PATH = countries.features
  .filter((country) => String(country.id) !== ANTARCTICA_ID)
  .map((country) => {
    const geometry = country.geometry;
    if (geometry.type === "Polygon") return ringsToPath(geometry.coordinates);
    if (geometry.type === "MultiPolygon") return geometry.coordinates.map(ringsToPath).join(" ");
    return "";
  })
  .join(" ");

const borders = mesh(topology, topology.objects.countries, (a, b) => a !== b);

export const WORLD_BORDER_PATH =
  borders.type === "MultiLineString" ? ringsToPath(borders.coordinates) : "";
