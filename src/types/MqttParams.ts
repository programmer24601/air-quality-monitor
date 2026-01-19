export type MqttParams = {
  brokerUrl: string;
  username?: string;
  password?: string;
  clientId?: string;
  topicPrefix: string;
  deviceName: string;
  deviceId: string;
  enableHomeAssistantDiscovery: boolean;
};