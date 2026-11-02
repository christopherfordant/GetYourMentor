export function playEquipmentEntrance(root: HTMLElement, options?: { force?: boolean; onStart?: () => void }): {
  finished: Promise<string>;
  cancel: () => void;
};
