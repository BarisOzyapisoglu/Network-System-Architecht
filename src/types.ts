export interface NetworkAssets {
  pcs: number;
  ipPhones: number;
  wifiAPs: number;
  cameras: number;
  printers: number;
  plcs: number;
  cncs: number;
  modbusGateways: number;
  spines: number;
  leafs: number;
  firewalls: number;
  servers: number;
  sanStorages: number;
  smartPDUs: number;
  racks: number;
}

export interface RackItem {
  id: string;
  name: string;
  type: 'spine' | 'leaf' | 'firewall' | 'server' | 'san' | 'pdu' | 'blank';
  height: number; // in U
  uPosition: number; // 1 to 42
  weight: 'heavy' | 'medium' | 'light';
  powerFeeds: {
    pduA: boolean;
    pduB: boolean;
  };
  connectedInterfaces: {
    port: string;
    targetId: string;
    targetPort: string;
    cableType: 'Cat6' | 'DAC' | 'OM4';
    cableColor: string;
  }[];
}

export interface VlanMapping {
  id: number;
  name: string;
  subnet: string;
  gateway: string;
  purpose: string;
  color: string;
}

export interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface PacketWalkStep {
  device: string;
  layer: 'Fiziksel' | 'Veri İletim' | 'Ağ' | 'Güvenlik';
  desc: string;
  detail: string;
}
