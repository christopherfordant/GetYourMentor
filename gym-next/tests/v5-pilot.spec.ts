import { expect, test } from "@playwright/test";
import { assertV5Status, validateV5Episode } from "../lib/v5/contracts";
import { beginV5Cycle, endV5Cycle, getV5GuardState, isV5Enabled, proposeV5Rule, recordV5Episode, resetV5PilotForTests, searchV5Episodes } from "../lib/v5/pilot";
test.describe("pilote V5 désactivé par défaut", () => {
  test.beforeEach(() => { delete process.env.V5_ENABLED; resetV5PilotForTests(); });
  test("refuse toute écriture lorsque le feature flag est désactivé", () => {
    expect(isV5Enabled()).toBeFalsy();
    expect(() => recordV5Episode({ id: "episode-test", project: "gym", context: "test", task: "test", hypotheses: [], observations: [], alternativesRejected: [], evidenceIds: [], status: "ILLUSTRATIF", confidence: 0.2, createdAt: new Date().toISOString() })).toThrow("V5_DISABLED");
  });
  test("refuse une règle illustrative même lorsque la V5 est activée", () => {
    process.env.V5_ENABLED = "true";
    expect(() => proposeV5Rule({ id: "rule-test", originEpisode: "episode-test", trigger: "test", proposedChange: "test", scope: "test", risk: "test", testsRequired: ["test"], approvalRequired: true, status: "ILLUSTRATIF" })).toThrow("V5_RULE_REQUIRES_HUMAN_APPROVAL");
  });
  test("valide les statuts et la recherche contextuelle", () => {
    expect(() => assertV5Status("DOCUMENTÉ")).not.toThrow();
    expect(() => assertV5Status("inconnu")).toThrow("Statut V5 invalide");
    process.env.V5_ENABLED = "true";
    recordV5Episode({ id: "episode-search", project: "gym", context: "audit Playwright mobile", task: "audit", hypotheses: [], observations: [], alternativesRejected: [], evidenceIds: [], status: "DOCUMENTÉ", confidence: 0.9, createdAt: new Date().toISOString() });
    expect(searchV5Episodes("mobile")).toHaveLength(1);
  });
  test("refuse les épisodes invalides et protège les cycles", () => {
    expect(() => validateV5Episode({ id: "", project: "gym", context: "x", task: "x", hypotheses: [], observations: [], alternativesRejected: [], evidenceIds: [], status: "DOCUMENTÉ", confidence: 1.2, createdAt: new Date().toISOString() })).toThrow("V5_EPISODE_REQUIRED_FIELDS");
    process.env.V5_ENABLED = "true";
    beginV5Cycle("audit-home");
    expect(() => beginV5Cycle("audit-home")).toThrow("V5_REENTRY_OR_REPEAT");
    endV5Cycle("audit-home");
    expect(getV5GuardState().active).toBe(0);
  });
});
