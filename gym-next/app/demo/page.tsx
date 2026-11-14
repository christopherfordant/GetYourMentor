import DemoBooking from "@/components/demo/DemoBooking";

export const dynamic = "force-dynamic";
export const metadata = { title: "Parcours sportif de démonstration | GetYourMentor", robots: { index: false, follow: false } };

export default function DemoPage() {
  return <DemoBooking />;
}
