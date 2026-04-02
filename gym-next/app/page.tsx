import fs from "node:fs";
import path from "node:path";
import { AccueilLegacyPage } from "@/components/home-legacy/AccueilLegacyPage";

export default function HomePage() {
  const stylesheetPath = path.join(process.cwd(), "..", "prototype-site", "styles.css");
  const legacyStyles = fs
    .readFileSync(stylesheetPath, "utf8")
    .replaceAll("../design_assets/", "/design_assets/");

  return <AccueilLegacyPage legacyStyles={legacyStyles} />;
}
