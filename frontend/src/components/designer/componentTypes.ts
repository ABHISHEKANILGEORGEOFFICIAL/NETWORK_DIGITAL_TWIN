import {
  Router, Network, Shield, Server, Wifi, Cpu,
  Cloud, Laptop, Globe, ArrowUpDown
} from 'lucide-react';
import { DesignerComponentType, DesignerComponentConfig } from '../../types';

export interface ComponentDefinition {
  type: DesignerComponentType;
  label: string;
  category: 'networking' | 'security' | 'compute' | 'cloud' | 'endpoint';
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  defaultConfig: DesignerComponentConfig;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    type: 'router',
    label: 'Router',
    category: 'networking',
    icon: Router,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: 'Layer 3 routing device',
    defaultConfig: {
      name: 'Router',
      ip_address: '10.0.0.1',
      description: 'Core router',
      speed_mbps: 10000,
      ports: 4,
    },
  },
  {
    type: 'switch_l2',
    label: 'L2 Switch',
    category: 'networking',
    icon: Network,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Layer 2 Ethernet switch',
    defaultConfig: {
      name: 'Switch',
      ip_address: '10.0.1.1',
      description: 'Access layer switch',
      speed_mbps: 1000,
      ports: 24,
      vlan: 10,
    },
  },
  {
    type: 'switch_l3',
    label: 'L3 Switch',
    category: 'networking',
    icon: ArrowUpDown,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    description: 'Layer 3 multilayer switch',
    defaultConfig: {
      name: 'L3 Switch',
      ip_address: '10.0.2.1',
      description: 'Distribution layer switch',
      speed_mbps: 10000,
      ports: 48,
    },
  },
  {
    type: 'firewall',
    label: 'Firewall',
    category: 'security',
    icon: Shield,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Network security appliance',
    defaultConfig: {
      name: 'Firewall',
      ip_address: '10.0.0.254',
      description: 'Perimeter firewall',
      speed_mbps: 10000,
      ports: 8,
    },
  },
  {
    type: 'server',
    label: 'Server',
    category: 'compute',
    icon: Server,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Application or database server',
    defaultConfig: {
      name: 'Server',
      ip_address: '10.0.10.1',
      description: 'Application server',
      speed_mbps: 10000,
      os: 'Linux',
      role: 'web',
    },
  },
  {
    type: 'access_point',
    label: 'Access Point',
    category: 'networking',
    icon: Wifi,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    description: 'Wireless access point',
    defaultConfig: {
      name: 'AP',
      ip_address: '10.0.5.1',
      description: 'Wireless AP',
      speed_mbps: 1200,
      ssid: 'Corporate-WiFi',
    },
  },
  {
    type: 'load_balancer',
    label: 'Load Balancer',
    category: 'networking',
    icon: Cpu,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    description: 'Traffic load balancer',
    defaultConfig: {
      name: 'Load Balancer',
      ip_address: '10.0.0.250',
      description: 'L4/L7 load balancer',
      speed_mbps: 10000,
    },
  },
  {
    type: 'cloud',
    label: 'Cloud / VPC',
    category: 'cloud',
    icon: Cloud,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    description: 'Cloud or VPC endpoint',
    defaultConfig: {
      name: 'Cloud',
      ip_address: '172.16.0.1',
      description: 'Cloud VPC',
      speed_mbps: 10000,
      subnet: '172.16.0.0/16',
    },
  },
  {
    type: 'workstation',
    label: 'Workstation',
    category: 'endpoint',
    icon: Laptop,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    description: 'End-user workstation',
    defaultConfig: {
      name: 'PC',
      ip_address: '10.0.100.1',
      description: 'User workstation',
      speed_mbps: 1000,
      os: 'Windows',
    },
  },
  {
    type: 'internet',
    label: 'Internet / WAN',
    category: 'cloud',
    icon: Globe,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: 'Internet or WAN uplink',
    defaultConfig: {
      name: 'Internet',
      ip_address: '0.0.0.0',
      description: 'WAN uplink',
      speed_mbps: 1000,
    },
  },
];

export const COMPONENT_CATEGORIES = [
  { key: 'networking', label: 'Networking' },
  { key: 'security', label: 'Security' },
  { key: 'compute', label: 'Compute' },
  { key: 'cloud', label: 'Cloud' },
  { key: 'endpoint', label: 'Endpoints' },
] as const;

export function getComponentDef(type: DesignerComponentType): ComponentDefinition {
  return COMPONENT_DEFINITIONS.find((d) => d.type === type) || COMPONENT_DEFINITIONS[0];
}

export function createDefaultConfig(type: DesignerComponentType, index: number): DesignerComponentConfig {
  const def = getComponentDef(type);
  return {
    ...def.defaultConfig,
    name: `${def.label}-${String(index).padStart(2, '0')}`,
  };
}
