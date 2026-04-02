import { create } from 'zustand'

export const useDeviceStore = create((set, get) => ({
  devices: {},

  // Called right after POST — saves actionId and sets loading
  setDevicePending: (deviceId, actionId) =>
    set((state) => ({
      devices: {
        ...state.devices,
        [deviceId]: {
          ...state.devices[deviceId],
          status:    'PENDING',
          actionId,
        },
      },
    })),

  // Called on SUCCESS socket event — resolves by actionId
  resolveDevice: (actionId, deviceStatus) =>
    set((state) => {
      const updated = { ...state.devices }
      for (const deviceId in updated) {
        if (updated[deviceId].actionId === actionId) {
          updated[deviceId] = { status: deviceStatus, actionId: null }
        }
      }
      return { devices: updated }
    }),

  // Called on FAILED/TIMEOUT socket event — rolls back by actionId
  failDevice: (actionId) =>
    set((state) => {
      const updated = { ...state.devices }
      for (const deviceId in updated) {
        if (updated[deviceId].actionId === actionId) {
          const prev = updated[deviceId].prevStatus ?? 'OFF'
          updated[deviceId] = { status: prev, actionId: null }
        }
      }
      return { devices: updated }
    }),

  // Seed initial device statuses from GET /devices/status
  initDevices: (deviceList) =>
    set(() => ({
      devices: Object.fromEntries(
        deviceList.map(d => [d.id, { status: d.status, actionId: null, prevStatus: d.status }])
      ),
    })),
}))