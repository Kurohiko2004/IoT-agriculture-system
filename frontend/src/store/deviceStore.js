import { create } from 'zustand'

export const useDeviceStore = create((set) => ({
  devices: {},
  setDeviceStatus: (deviceId, status) =>
    set((state) => ({
      devices: { ...state.devices, [deviceId]: status },
    })),
}))