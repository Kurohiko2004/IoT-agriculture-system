import { create } from 'zustand'

export const useDeviceStore = create((set) => ({
  devices: {},

  initDevices: (deviceList) =>
    set(() => ({
      devices: Object.fromEntries(
        deviceList.map(d => [
          d.id,
          { status: d.status, actionId: null, prevStatus: d.status }
        ])
      ),
    })),

  // initDevices: function (deviceList) {
  //   set(function () {
  //     const devicesObj = {}

  //     for (const d of deviceList) {
  //       devicesObj[d.id] = {
  //         status: d.status,
  //         actionId: null,
  //         prevStatus: d.status
  //       }
  //     }

  //     return {
  //       devices: devicesObj
  //     }
  //   })
  // }

  setDevicePending: (deviceId, actionId) =>
    set((state) => {
      const current = state.devices[deviceId]
      return {
        devices: {
          ...state.devices,
          [deviceId]: {
            ...current,
            prevStatus: current?.status ?? 'OFF', // lưu trạng thái CŨ trước khi PENDING
            status: 'PENDING',
            actionId,
          },
        },
      }
    }),

  resolveDevice: (actionId, deviceStatus) =>
    set((state) => {
      const updated = { ...state.devices }
      for (const deviceId in updated) {
        if (updated[deviceId].actionId === actionId) {
          updated[deviceId] = {
            status: deviceStatus,
            actionId: null,
            prevStatus: deviceStatus,
          }
        }
      }
      return { devices: updated }
    }),

  failDevice: (actionId) =>
    set((state) => {
      const updated = { ...state.devices }
      for (const deviceId in updated) {
        if (updated[deviceId].actionId === actionId) {
          updated[deviceId] = {
            status: updated[deviceId].prevStatus ?? 'OFF', // rollback về trạng thái CŨ
            actionId: null,
            prevStatus: updated[deviceId].prevStatus ?? 'OFF',
          }
        }
      }
      return { devices: updated }
    }),
}))