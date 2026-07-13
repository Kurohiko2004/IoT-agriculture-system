import { create } from 'zustand'

export const useDeviceStore = create((set) => ({
  devices: {},

  initDevices: (deviceList) => {
    set((state) => {
      const result = { ...state.devices };

      // chuyển array thành object. Sau đó gán thêm giá trị cho từng thiết bị 
      // Nhưng giữ nguyên các thiết bị đang PENDING để tránh mất actionId
      deviceList.forEach((d) => {
        const current = state.devices[d.id];

        if (current && current.status === 'PENDING') {
          result[d.id] = current;
        } else {
          result[d.id] = {
            status: d.status,
            actionId: null,
            prevStatus: d.status
          };
        }
      });

      return { devices: result };
    });
  },

  // TODO: DRY violation 

  setDevicePending: (deviceId, actionId) =>
    set((state) => {
      // tạm thời lưu dữ liệu của thiết bị cần update status
      const current = state.devices[deviceId]
      return {
        devices: {
          // giữ nguyên tất cả các devices còn lại trong state.devices
          ...state.devices,

          // chỉ update đè lên deviceId được truyền vào
          [deviceId]: {
            // ...current,
            prevStatus: current?.status ?? 'OFF', // lưu trạng thái trước khi PENDING
            status: 'PENDING',
            actionId,
          },
        },
      }
    }),


  resolveDevice: (deviceId, actionId, deviceStatus) =>
    set((state) => {
      const current = state.devices[deviceId]
      if (!current || current.actionId !== actionId) return state // Không cập nhật nếu không khớp

      return {
        devices: {
          ...state.devices,
          [deviceId]: {
            // ...current,
            status: deviceStatus,
            actionId: null,
            prevStatus: deviceStatus,
          }
        }
      }
    }),

  failDevice: (deviceId, actionId) =>
    set((state) => {
      const current = state.devices[deviceId]
      if (!current || current.actionId !== actionId) return state

      return {
        devices: {
          ...state.devices,
          [deviceId]: {
            // ...current,
            status: current.prevStatus ?? 'OFF', // rollback về trạng thái CŨ
            actionId: null,
            prevStatus: current.prevStatus ?? 'OFF',
          }
        }
      }
    }),
}))