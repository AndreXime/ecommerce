import { atom } from "nanostores";
import type { Tab } from "../types";

export const activeTabStore = atom<Tab>("users");

export function setActiveTab(tab: Tab) {
	activeTabStore.set(tab);
}

