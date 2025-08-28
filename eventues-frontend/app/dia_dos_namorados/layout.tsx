import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dia dos Namorados | Eventues",
  description: "Uma aventura temática de World of Warcraft para o Dia dos Namorados",
};

export default function ValentinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
