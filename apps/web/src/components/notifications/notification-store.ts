"use client";

import { useSyncExternalStore } from "react";

let isOpen = false;
const listeners = new Set<() => void>();

export const notificationStore = {
    getSnapshot: () => isOpen,
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    setIsOpen: (value: boolean) => {
        isOpen = value;
        listeners.forEach((l) => l());
    },
    toggle: () => {
        isOpen = !isOpen;
        listeners.forEach((l) => l());
    },
};

export function useNotificationStore() {
    const isDrawerOpen = useSyncExternalStore(
        notificationStore.subscribe,
        notificationStore.getSnapshot
    );

    return {
        isOpen: isDrawerOpen,
        setIsOpen: notificationStore.setIsOpen,
        toggle: notificationStore.toggle,
    };
}

