import { Metadata } from "next";
import WowPage from "./components/WowPage";

export const metadata: Metadata = {
  title: "Uma Aventura Especial | Dia dos Namorados",
  description: "Uma jornada especial pelos nossos momentos juntos",
  openGraph: {
    title: "Uma Aventura Especial | Dia dos Namorados",
    description: "Uma jornada especial pelos nossos momentos juntos",
    type: "website",
  },
};

export default function ValentinesPage() {
  return <WowPage />;
}
