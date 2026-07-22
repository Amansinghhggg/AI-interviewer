export const DeviceCapabilities = {
  cameraSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
  microphoneSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
  permissionsSupported: !!(navigator.permissions && navigator.permissions.query),
  // Some older browsers don't have ondevicechange
  deviceChangeSupported: typeof navigator.mediaDevices !== 'undefined' && 'ondevicechange' in navigator.mediaDevices
};
