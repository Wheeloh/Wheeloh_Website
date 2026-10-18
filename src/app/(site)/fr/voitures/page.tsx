import { CarsHubRoute, carsHubMetadata } from "@/components/redesign/shared/pages/CarsRoute";

export const metadata = carsHubMetadata("fr");

export default function Page() {
  return <CarsHubRoute locale="fr" />;
}
