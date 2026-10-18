import { CarsHubRoute, carsHubMetadata } from "@/components/redesign/shared/pages/CarsRoute";

export const metadata = carsHubMetadata("en");

export default function Page() {
  return <CarsHubRoute locale="en" />;
}
