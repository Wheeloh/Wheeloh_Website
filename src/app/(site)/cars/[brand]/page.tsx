import { BrandRoute, brandMetadata, brandStaticParams } from "@/components/redesign/shared/pages/CarsRoute";

export const dynamicParams = false;
export const generateStaticParams = brandStaticParams;

export function generateMetadata({ params }: { params: { brand: string } }) {
  return brandMetadata(params.brand, "en");
}

export default function Page({ params }: { params: { brand: string } }) {
  return <BrandRoute id={params.brand} locale="en" />;
}
