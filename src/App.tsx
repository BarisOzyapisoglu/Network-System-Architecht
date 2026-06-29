import { useState, useEffect, useRef, useCallback } from "react";
import {
  Network, Server as ServerIcon, Shield, Database, Activity,
  Cpu, Zap, Play, RefreshCw, Terminal, Trash2,
  Layers, Settings, AlertTriangle, CheckCircle2,
  Send, Cable, Compass, ChevronRight, CheckSquare2,
  Sun, Moon
} from "lucide-react";
import { COMPANY_PRESETS, PHASE_GUIDES, VLAN_MATRIX_PRESET, PACKET_SCENARIOS, CompanyPreset } from "./data";
import { NetworkAssets, RackItem, VlanMapping, ChatMessage } from "./types";
import DesignerPortal from "./components/DesignerPortal";

// ─── One-time migration: reset assets to zero on schema version bump ─────────
const APP_VERSION = 'v3';
if (typeof localStorage !== 'undefined' && localStorage.getItem('ns-app-version') !== APP_VERSION) {
  localStorage.setItem('ns-app-version', APP_VERSION);
  localStorage.removeItem('ns-assets');
}

// ─── localStorage persistence hook ───────────────────────────────────────────
function useLocalStorage<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  const setStored = useCallback((value: T) => {
    setState(value);
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key]);
  return [state, setStored];
}

export default function App() {
  // ─── Persistent state (survives page refresh) ────────────────────────────
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('ns-dark', true);
  const [portalMode, setPortalMode] = useLocalStorage<'simulation' | 'designer'>('ns-mode', 'designer');
  const [currentPhase, setCurrentPhase] = useLocalStorage<number>('ns-phase', 1);
  const [numFloors, setNumFloors] = useLocalStorage<number>('ns-floors', 2);
  const [isRedundant, setIsRedundant] = useLocalStorage<boolean>('ns-redundant', true);
  const [budgetTier, setBudgetTier] = useLocalStorage<'economic' | 'medium' | 'premium'>('ns-tier', 'medium');
  const [visitedPhases, setVisitedPhases] = useLocalStorage<number[]>('ns-visited', [1]);

  // Preset state (index only persisted, object derived)
  const [selectedPresetIdx, setSelectedPresetIdx] = useLocalStorage<number>('ns-preset-idx', 1);
  const selectedPreset = COMPANY_PRESETS[selectedPresetIdx] ?? COMPANY_PRESETS[1];

  const defaultAssets: NetworkAssets = {
    pcs: 0, ipPhones: 0, wifiAPs: 0, cameras: 0, printers: 0,
    plcs: 0, cncs: 0, modbusGateways: 0, spines: 0, leafs: 0,
    firewalls: 0, servers: 0, sanStorages: 0, smartPDUs: 0, racks: 0,
  };
  const [assets, setAssets] = useLocalStorage<NetworkAssets>('ns-assets', defaultAssets);
  
  // Custom states for Phase 1: Rack Designer
  const [rackItems, setRackItems] = useState<RackItem[]>([]);
  const [selectedUSlot, setSelectedUSlot] = useState<number | null>(null);
  const [pduFeedA, setPduFeedA] = useState<boolean>(true);
  const [pduFeedB, setPduFeedB] = useState<boolean>(true);
  const [mountDeviceType, setMountDeviceType] = useState<RackItem['type']>('server');
  
  // Cable labeler simulator
  const [cableColor, setCableColor] = useState<string>("Blue (Veri/Ofis)");
  const [cableType, setCableType] = useState<'Cat6' | 'DAC' | 'OM4'>("Cat6");
  const [cableSrc, setCableSrc] = useState<string>("KABIN1-U24-PORT1");
  const [cableDst, setCableDst] = useState<string>("KABIN1-U40-PORT5");
  const [generatedLabels, setGeneratedLabels] = useState<{src: string, dst: string} | null>(null);

  // Custom states for Phase 2: Underlay CLI
  const [selectedCliDevice, setSelectedCliDevice] = useState<string>("SPINE-1");
  const [cliOutput, setCliOutput] = useState<string>("");
  const [copiedCli, setCopiedCli] = useState<boolean>(false);

  // Custom states for Phase 3: VLANs & vPC
  const [vlans, setVlans] = useState<VlanMapping[]>(VLAN_MATRIX_PRESET);
  const [newVlanId, setNewVlanId] = useState<number>(100);
  const [newVlanName, setNewVlanName] = useState<string>("GUEST");
  const [newVlanSubnet, setNewVlanSubnet] = useState<string>("10.100.0.0/24");
  const [newVlanGateway, setNewVlanGateway] = useState<string>("10.100.0.1");
  const [newVlanPurpose, setNewVlanPurpose] = useState<string>("Misafir Kablosuz Ağ Erişimi");
  
  // vPC simulator state
  const [vpcStatus, setVpcStatus] = useState<'IDLE' | 'CONFIGURING' | 'PEER_UP' | 'ACTIVE_ACTIVE'>('PEER_UP');
  const [vpcLogs, setVpcLogs] = useState<string[]>([
    "Leaf-1: vPC Peer-link initialize edilmeye başlandı.",
    "Leaf-2: vPC Peer-link initialize edilmeye başlandı.",
    "Leaf-1 <-> Leaf-2: Peer-keepalive mesajı gönderildi. Durum: Canlı.",
    "Leaf-1 & Leaf-2: vPC Peer-link durumu UP olarak güncellendi.",
    "LACP port-channel 10 (Server-1) oluşturuldu. LACP Mode: Active"
  ]);

  // Custom states for Phase 4: Edge & SAN
  const [pfcEnabled, setPfcEnabled] = useState<boolean>(true);
  const [ecnEnabled, setEcnEnabled] = useState<boolean>(true);
  const [sanIops, setSanIops] = useState<number>(95000);
  const [sanPacketLoss, setSanPacketLoss] = useState<number>(0);
  const [firewallWanStatus, setFirewallWanStatus] = useState<'ACTIVE_ACTIVE' | 'ACTIVE_PASSIVE'>('ACTIVE_PASSIVE');
  const [isp1Status, setIsp1Status] = useState<boolean>(true);
  const [isp2Status, setIsp2Status] = useState<boolean>(true);

  // Custom states for Phase 5: Failure Simulator & Packet Walking
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [currentWalkStepIdx, setCurrentWalkStepIdx] = useState<number>(-1);
  const [disasterLog, setDisasterLog] = useState<string[]>([]);
  const [spine1Power, setSpine1Power] = useState<boolean>(true);
  const [fiberCut, setFiberCut] = useState<boolean>(false);

  // AI API Key — client-side fallback (only used when server has no key in .env)
  const [geminiKey, setGeminiKey] = useLocalStorage<string>('ns-gemini-key', '');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [keyInputValue, setKeyInputValue] = useState<string>('');
  const [serverHasKey, setServerHasKey] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/ai-status').then(r => r.json()).then(d => setServerHasKey(d.serverKeySet)).catch(() => {});
  }, []);

  // AI Assistant Chat state
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: "Merhaba! Ben NetSim-Architect yapay zeka altyapı motoruyum. 'Screw-to-Code' (Vidadan Koda) metodolojisiyle veri merkezi ve kurumsal ağ kurulumunu her aşamada detaylandırmaya hazırım. Ofis ihtiyaçlarınızı girin, ardından rack somunlarından BGP/OSPF CLI komutlarına kadar her şeyi birlikte tasarlayalım. Sorularınızı Türkçe sorabilirsiniz!",
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isChatMounted = useRef<boolean>(false);

  const [selectedTopologyNode, setSelectedTopologyNode] = useState<string | null>(null);

  // Interactive Checklist steps ticked status
  const [checklistCompleted, setChecklistCompleted] = useLocalStorage<Record<string, boolean>>('ns-checklist', {
    step1: false, step2: false, step3: false, step4: false,
    step5: false, step6: false, step7: false, step8: false,
  });

  // ─── Scroll to top on first mount ───────────────────────────────────────
  useEffect(() => {
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // ─── Dark / Light mode class on <html> ──────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode);
  }, [darkMode]);

  // Handle Preset changes
  const applyPreset = (preset: CompanyPreset) => {
    const idx = COMPANY_PRESETS.findIndex(p => p.name === preset.name);
    setSelectedPresetIdx(idx >= 0 ? idx : 1);
    const newAssets: NetworkAssets = {
      pcs: preset.pcs, ipPhones: preset.ipPhones, wifiAPs: preset.wifiAPs,
      cameras: preset.cameras, printers: preset.printers, plcs: preset.plcs,
      cncs: preset.cncs, modbusGateways: preset.modbusGateways, spines: preset.spines,
      leafs: preset.leafs, firewalls: preset.firewalls, servers: preset.servers,
      sanStorages: preset.sanStorages, smartPDUs: preset.smartPDUs, racks: preset.racks,
    };
    setAssets(newAssets);
    setIsRedundant(preset.firewalls > 1);
    setNumFloors(preset.name.includes("Küçük") ? 1 : preset.name.includes("Orta") ? 2 : 3);
    setDisasterLog([]);
    setSpine1Power(true);
    setFiberCut(false);
    setCurrentWalkStepIdx(-1);
  };

  // Dynamic synchronization of Rack items based on Live choices
  useEffect(() => {
    const initialItems: RackItem[] = [];
    
    // Smart PDUs
    initialItems.push({
      id: "pdu-a",
      name: "Akıllı Smart PDU A (A-Feed UPS)",
      type: 'pdu',
      height: 1,
      uPosition: 1,
      weight: 'medium',
      powerFeeds: { pduA: true, pduB: false },
      connectedInterfaces: []
    });
    if (isRedundant) {
      initialItems.push({
        id: "pdu-b",
        name: "Akıllı Smart PDU B (B-Feed Jeneratör)",
        type: 'pdu',
        height: 1,
        uPosition: 2,
        weight: 'medium',
        powerFeeds: { pduA: false, pduB: true },
        connectedInterfaces: []
      });
    }

    // SAN Storage
    if (assets.sanStorages > 0) {
      initialItems.push({
        id: "san-1",
        name: "SAN Depolama Ünitesi (Dell ME5 iSCSI)",
        type: 'san',
        height: 2,
        uPosition: 4,
        weight: 'heavy',
        powerFeeds: { pduA: true, pduB: isRedundant },
        connectedInterfaces: []
      });
    }

    // Servers
    const numServers = Math.min(assets.servers, 4);
    for (let i = 0; i < numServers; i++) {
      initialItems.push({
        id: `server-${i+1}`,
        name: `Dell PowerEdge R750 Sunucu (VMS-${i+1})`,
        type: 'server',
        height: 2,
        uPosition: 8 + (i * 3),
        weight: 'heavy',
        powerFeeds: { pduA: true, pduB: isRedundant },
        connectedInterfaces: []
      });
    }

    // Leaf Switches (Access Switches)
    let currentUPos = 24;
    // leaf-1 (User Office Access)
    initialItems.push({
      id: "leaf-1",
      name: "Nexus 93180YC-FX Ofis Switch (Leaf-1)",
      type: 'leaf',
      height: 1,
      uPosition: currentUPos++,
      weight: 'light',
      powerFeeds: { pduA: true, pduB: isRedundant },
      connectedInterfaces: []
    });
    
    // leaf-2 (PoE Cameras/APs)
    initialItems.push({
      id: "leaf-2",
      name: "Nexus 93180YC-FX PoE+ AP/CCTV (Leaf-2)",
      type: 'leaf',
      height: 1,
      uPosition: currentUPos++,
      weight: 'light',
      powerFeeds: { pduA: true, pduB: isRedundant },
      connectedInterfaces: []
    });

    // leaf-3 (OT Industrial) - only if OT devices count is > 0
    const otCount = assets.plcs + assets.cncs + assets.modbusGateways;
    if (otCount > 0) {
      initialItems.push({
        id: "leaf-3",
        name: "Zırhlı Endüstriyel Saha Switch (Leaf-3)",
        type: 'leaf',
        height: 1,
        uPosition: currentUPos++,
        weight: 'light',
        powerFeeds: { pduA: true, pduB: isRedundant },
        connectedInterfaces: []
      });
    }

    // leaf-4 (ToR Server Switch)
    initialItems.push({
      id: "leaf-4",
      name: "Nexus 93180YC-FX ToR Sunucu Switch (Leaf-4)",
      type: 'leaf',
      height: 1,
      uPosition: currentUPos++,
      weight: 'light',
      powerFeeds: { pduA: true, pduB: isRedundant },
      connectedInterfaces: []
    });

    // Spine Switches (Core Omurga)
    initialItems.push({
      id: "spine-1",
      name: "Nexus 9336C-FX2 Spine Switch-1",
      type: 'spine',
      height: 1,
      uPosition: 35,
      weight: 'medium',
      powerFeeds: { pduA: true, pduB: isRedundant },
      connectedInterfaces: []
    });
    if (isRedundant) {
      initialItems.push({
        id: "spine-2",
        name: "Nexus 9336C-FX2 Spine Switch-2",
        type: 'spine',
        height: 1,
        uPosition: 36,
        weight: 'medium',
        powerFeeds: { pduA: true, pduB: true },
        connectedInterfaces: []
      });
    }

    // Firewalls
    initialItems.push({
      id: "firewall-1",
      name: "FortiGate 100F NGFW Güvenlik Duvarı",
      type: 'firewall',
      height: 1,
      uPosition: 40,
      weight: 'light',
      powerFeeds: { pduA: true, pduB: isRedundant },
      connectedInterfaces: []
    });
    if (isRedundant) {
      initialItems.push({
        id: "firewall-2",
        name: "FortiGate 100F HA Yedek Güvenlik Duvarı",
        type: 'firewall',
        height: 1,
        uPosition: 41,
        weight: 'light',
        powerFeeds: { pduA: true, pduB: true },
        connectedInterfaces: []
      });
    }

    setRackItems(initialItems);
  }, [assets, isRedundant]);

  // Sync scroll to chat messages (ilk yüklemede scroll yapma)
  useEffect(() => {
    if (!isChatMounted.current) {
      isChatMounted.current = true;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  // Phase guidance: AI message when entering a new phase for the first time
  const phaseGuidance: Record<number, string> = {
    1: `📐 Faz 1 — Fiziksel Altyapı: Rack kabinin montajını, UPS + PDU bağlantılarını ve Cat6/OM4 kablolama düzenini burada simüle ediyorsunuz.\n\n✅ Bu fazda yapmanız gerekenler:\n• Sol panelden ekipman envanteri girin\n• 42U rack kabinine donanımları yerleştirin\n• Kablo etiketleyici ile her bağlantıyı etiketleyin\n\n➡️ Tamamladığında Faz 2'ye geçin: Omurga CLI Yapılandırması.`,
    2: `🔗 Faz 2 — Omurga & Underlay CLI: OSPF/BGP ile Spine-Leaf arası L3 routing konfigürasyonunu burada uyguluyorsunuz.\n\n✅ Bu fazda yapmanız gerekenler:\n• SPINE-1, SPINE-2 ve LEAF CLI komutlarını inceleyin\n• OSPF Area 0 loopback adreslerini kontrol edin\n• 10G SFP+ uplink portlarını yapılandırın\n\n➡️ Tamamladığında Faz 3'e geçin: VLAN & vPC Mantıksal Segmentasyon.`,
    3: `🔀 Faz 3 — Mantıksal Segmentasyon (VLAN/vPC): Ofis, ses, kamera ve OT ağlarını ayrı VLAN'lara bölüyoruz.\n\n✅ Bu fazda yapmanız gerekenler:\n• Varsayılan VLAN matrisini inceleyin (10/20/30/50/90)\n• Projenize özel yeni VLAN ekleyin\n• vPC Peer-Link durumunu simüle edin\n\n➡️ Tamamladığında Faz 4'e geçin: Edge Güvenlik & SAN Depolama.`,
    4: `🛡️ Faz 4 — Güvenlik & SAN Depolama: NGFW HA cluster ve SAN storage bağlantılarını yapılandırıyoruz.\n\n✅ Bu fazda yapmanız gerekenler:\n• WAN ISP-1/ISP-2 yedekliliğini aktif edin\n• SAN IOPS ve PFC/ECN ayarlarını inceleyin\n• FortiGate Active-Passive HA durumunu kontrol edin\n\n➡️ Tamamladığında Faz 5'e geçin: Arıza Simülasyonu & Paket İzleme.`,
    5: `🔥 Faz 5 — Arıza Simülasyonu & Sorun Giderme: Üretim ortamındaki olası arızaları simüle edip ağın nasıl tepki verdiğini gözlemliyoruz.\n\n✅ Bu fazda yapmanız gerekenler:\n• Spine Switch güç kesintisi senaryosunu tetikleyin\n• Fiber hat kopması simülasyonunu çalıştırın\n• Paket izleme (Packet Walk) adımlarını takip edin\n\n🏆 Tüm fazları tamamladınız! Designer Portalında kendi altyapınızı tasarlayabilirsiniz.`,
  };

  const switchPhase = useCallback((newPhase: number) => {
    const isNew = !visitedPhases.includes(newPhase);
    setCurrentPhase(newPhase);
    if (isNew) {
      setVisitedPhases([...visitedPhases, newPhase]);
      const guidance = phaseGuidance[newPhase];
      if (guidance) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            sender: 'assistant',
            text: guidance,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          }]);
        }, 500);
      }
    }
  }, [visitedPhases, setVisitedPhases, setCurrentPhase]);

  // Setup dynamic Underlay Routing Command Output
  useEffect(() => {
    const guide = PHASE_GUIDES[1]; // Phase 2
    if (selectedCliDevice === "SPINE-1") {
      setCliOutput(guide.cli?.code || "");
    } else if (selectedCliDevice === "SPINE-2") {
      setCliOutput((guide.cli?.code || "").replace(/SPINE-1/g, "SPINE-2").replace(/10.0.0.1/g, "10.0.0.2").replace(/10.255.0.1/g, "10.255.0.5"));
    } else if (selectedCliDevice === "LEAF-1") {
      setCliOutput(`! LEAF-1 Underlay Yapılandırması
feature ospf
feature interface-vlan

interface loopback0
  ip address 10.0.1.1/32
  ip router ospf 1 area 0.0.0.0

interface Ethernet1/49
  description BAGLANTI_TO_SPINE-1
  no switchport
  ip address 10.255.0.2/30
  ip router ospf 1 area 0.0.0.0
  no shutdown

interface Ethernet1/50
  description BAGLANTI_TO_SPINE-2
  no switchport
  ip address 10.255.0.6/30
  ip router ospf 1 area 0.0.0.0
  no shutdown

router ospf 1
  router-id 10.0.1.1`);
    } else if (selectedCliDevice === "LEAF-2") {
      setCliOutput(`! LEAF-2 Underlay Yapılandırması
feature ospf
feature interface-vlan

interface loopback0
  ip address 10.0.1.2/32
  ip router ospf 1 area 0.0.0.0

interface Ethernet1/49
  description BAGLANTI_TO_SPINE-1
  no switchport
  ip address 10.255.0.10/30
  ip router ospf 1 area 0.0.0.0
  no shutdown

interface Ethernet1/50
  description BAGLANTI_TO_SPINE-2
  no switchport
  ip address 10.255.0.14/30
  ip router ospf 1 area 0.0.0.0
  no shutdown

router ospf 1
  router-id 10.0.1.2`);
    }
  }, [selectedCliDevice]);

  // Adjust SAN metrics based on PFC & ECN
  useEffect(() => {
    let iops = 95000;
    let loss = 0;
    if (!pfcEnabled) {
      iops -= 35000;
      loss += 1.8;
    }
    if (!ecnEnabled) {
      iops -= 15000;
      loss += 0.9;
    }
    setSanIops(iops);
    setSanPacketLoss(Number(loss.toFixed(1)));
  }, [pfcEnabled, ecnEnabled]);

  // Asset increment/decrement helper
  const updateAsset = (key: keyof NetworkAssets, delta: number) => {
    setAssets({ ...assets, [key]: Math.max(0, assets[key] + delta) });
  };

  // Add custom Rack Item
  const handleMountDevice = () => {
    if (selectedUSlot === null) return;
    
    // Check if slot overlaps
    const heightMap = new Map<number, string>();
    rackItems.forEach(item => {
      for (let u = item.uPosition; u < item.uPosition + item.height; u++) {
        heightMap.set(u, item.name);
      }
    });

    const conflicts: string[] = [];
    const deviceHeight = mountDeviceType === 'server' || mountDeviceType === 'san' ? 2 : 1;
    
    for (let u = selectedUSlot; u < selectedUSlot + deviceHeight; u++) {
      if (u > 42) {
        alert("Cihaz kabinetin dışına taşıyor!");
        return;
      }
      if (heightMap.has(u)) {
        conflicts.push(`U${u} slotunda '${heightMap.get(u)}' yüklü.`);
      }
    }

    if (conflicts.length > 0) {
      alert(`Çakışma var!\n${conflicts.join('\n')}`);
      return;
    }

    const deviceNames: Record<RackItem['type'], string> = {
      server: `Dell PowerEdge R750 Sunucu (Özel U${selectedUSlot})`,
      san: `Dell ME5 SAN Depolama (Özel U${selectedUSlot})`,
      leaf: `Nexus ToR Leaf Switch (Özel U${selectedUSlot})`,
      spine: `Nexus Spine Switch (Özel U${selectedUSlot})`,
      firewall: `NGFW Güvenlik Duvarı (Özel U${selectedUSlot})`,
      pdu: `Smart PDU (Özel U${selectedUSlot})`,
      blank: "Kapak / Boşluk"
    };

    const newItem: RackItem = {
      id: `custom-${Date.now()}`,
      name: deviceNames[mountDeviceType],
      type: mountDeviceType,
      height: deviceHeight,
      uPosition: selectedUSlot,
      weight: mountDeviceType === 'server' || mountDeviceType === 'san' ? 'heavy' : 'light',
      powerFeeds: { pduA: pduFeedA, pduB: pduFeedB },
      connectedInterfaces: []
    };

    setRackItems(prev => [...prev, newItem]);
    setSelectedUSlot(null);
  };

  // Remove Rack Item
  const handleRemoveDevice = (id: string) => {
    setRackItems(prev => prev.filter(item => item.id !== id));
  };

  // Cable generator
  const generateCableLabel = () => {
    if (!cableSrc || !cableDst) return;
    const labelA = `${cableSrc.toUpperCase()} -> ${cableDst.toUpperCase()}`;
    const labelB = `${cableDst.toUpperCase()} -> ${cableSrc.toUpperCase()}`;
    setGeneratedLabels({ src: labelA, dst: labelB });
  };

  // Add custom VLAN
  const handleAddVlan = () => {
    if (vlans.some(v => v.id === newVlanId)) {
      alert("Bu VLAN ID zaten mevcut!");
      return;
    }
    const colorClasses = [
      "border-orange-500 text-orange-400 bg-orange-500/10",
      "border-pink-500 text-pink-400 bg-pink-500/10",
      "border-teal-500 text-teal-400 bg-teal-500/10"
    ];
    const chosenColor = colorClasses[vlans.length % colorClasses.length];

    const newVlan: VlanMapping = {
      id: newVlanId,
      name: newVlanName,
      subnet: newVlanSubnet,
      gateway: newVlanGateway,
      purpose: newVlanPurpose,
      color: chosenColor
    };
    setVlans(prev => [...prev, newVlan]);
    setNewVlanId(prev => prev + 10);
  };

  // Simulate disaster
  const triggerDisaster = (type: 'spine_power' | 'fiber_cut') => {
    const timestamp = new Date().toLocaleTimeString('tr-TR');
    if (type === 'spine_power') {
      const nextPower = !spine1Power;
      setSpine1Power(nextPower);
      if (!nextPower) {
        setDisasterLog(prev => [
          `[${timestamp}] ⚠️ UYARI: Spine Switch 1 enerji beslemesi tamamen kesildi! (PDU-A ve PDU-B kapandı)`,
          `[${timestamp}] 🔄 ANALİZ: OSPF / BGP yönlendirmeleri koptu. BFD (Bidirectional Forwarding Detection) 30ms içinde kesintiyi algıladı.`,
          `[${timestamp}] 🚀 REAKSİYON: Leaf switchleri tüm Doğu-Batı trafiğini saniyeler içinde yedek Spine-2 switch'e yönlendirdi.`,
          `[${timestamp}] ✅ DURUM: Sistem aktif-aktif mimari sayesinde sıfır veri kaybı (0 packet drop) ile çalışmaya devam ediyor.`
        ]);
      } else {
        setDisasterLog(prev => [
          `[${timestamp}] ℹ️ BİLGİ: Spine Switch 1 güç kaynakları açıldı. Önyükleme tamamlandı.`,
          `[${timestamp}] 🔄 ANALİZ: L3 arayüzleri aktif oldu, OSPF komşulukları yeniden kuruluyor.`,
          `[${timestamp}] ✅ DURUM: Rotalar Spine-1 ve Spine-2 arasında ECMP (Equal-Cost Multi-Path) yük dengeli çalışacak şekilde stabilize edildi.`
        ]);
      }
    } else {
      const nextCut = !fiberCut;
      setFiberCut(nextCut);
      if (nextCut) {
        setDisasterLog(prev => [
          `[${timestamp}] 🚨 KRİTİK: Leaf-1 ile Spine-1 arasındaki OM4 Çok Modlu Fiber kablo fiziksel olarak koptu!`,
          `[${timestamp}] 🔄 ANALİZ: Rx/Tx SFP+ lazer sinyalleri kesildi. Port duruma geçti: DOWN.`,
          `[${timestamp}] 🚀 REAKSİYON: Nexus switch üzerindeki L3 yönlendirme protokolü rota maliyetini (metric) anında güncelledi.`,
          `[${timestamp}] ✅ DURUM: Trafik, Leaf-1 üzerindeki ikinci fiber hat (Spine-2 bağlantısı) üzerinden kesintisiz yönlendirildi.`
        ]);
      } else {
        setDisasterLog(prev => [
          `[${timestamp}] ℹ️ BİLGİ: Fiber kablo değişimi yapıldı ve temizlendi. SFP+ lazer sinyali aktif.`,
          `[${timestamp}] ✅ DURUM: Port UP konumuna geldi. ECMP yönlendirme fabric üzerinde tekrardan sağlandı.`
        ]);
      }
    }
  };

  // Chat with AI assistant
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    const promptToSend = chatInput;
    setChatInput("");
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          apiKey: geminiKey,
          context: {
            officeEndpoints: `PC: ${assets.pcs}, IP Tel: ${assets.ipPhones}, AP: ${assets.wifiAPs}, Yazıcı: ${assets.printers}`,
            otAssets: `PLC: ${assets.plcs}, CNC: ${assets.cncs}, Modbus Gateway: ${assets.modbusGateways}`,
            datacenterAssets: `Spine: ${assets.spines}, Leaf: ${assets.leafs}, Server: ${assets.servers}, SAN: ${assets.sanStorages}`,
            currentPhase: `Faz ${currentPhase}`
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'API_KEY_MISSING' || data.error === 'API_KEY_INVALID') {
          const isInvalid = data.error === 'API_KEY_INVALID';
          setGeminiKey('');
          setShowKeyModal(true);
          setKeyInputValue('');
          setChatMessages(prev => [...prev, {
            sender: 'assistant',
            text: isInvalid
              ? '🔑 Bu API key geçersiz veya kotası sıfır. aistudio.google.com/app/apikey adresinden YENİ bir key al — "Create API key" butonuna tıkla, ücretsizdir.'
              : '🔑 Gemini API key gerekli. Sağ üstteki "API Key Gir" butonuna tıklayarak key\'ini gir.',
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          }]);
          return;
        }
        if (data.error === 'RATE_LIMIT') {
          setChatMessages(prev => [...prev, {
            sender: 'assistant',
            text: '⏳ Kota aşıldı. Bu key\'in free tier limiti dolmuş. aistudio.google.com/app/apikey adresinden yeni bir Google hesabıyla taze key oluştur.',
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          }]);
          return;
        }
        throw new Error(data.error || "Sunucudan hata döndü.");
      }

      setChatMessages(prev => [...prev, {
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, {
        sender: 'assistant',
        text: `❌ Hata: ${err.message}`,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Estimated stats
  const totalRUsNeeded = rackItems.reduce((acc, item) => acc + item.height, 0);
  const totalPSUsConnected = rackItems.filter(item => item.type !== 'pdu').length * 2;
  const totalCablesEstimated = assets.pcs + assets.ipPhones + assets.cameras + assets.plcs + (assets.servers * 4) + (assets.leafs * 4);

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ color: 'var(--ns-text)' }}>
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 px-4 py-3 md:px-6 border-b" style={{ background: 'var(--ns-header-bg)', borderColor: 'var(--ns-border)' }}>
        <div className="max-w-full px-4 md:px-8 lg:px-12 w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Network topology logo */}
            <div className="w-9 h-9 rounded-lg flex items-center justify-center glow-cyan flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #1e3a5f 100%)', border: '1px solid rgba(6,182,212,0.3)' }}>
              <svg width="26" height="26" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ngl" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#06b6d4"/>
                    <stop offset="1" stopColor="#3b82f6"/>
                  </linearGradient>
                </defs>
                {/* Spine (core) */}
                <rect x="11" y="1" width="14" height="8" rx="2.5" fill="url(#ngl)"/>
                {/* Leaf switches */}
                <rect x="1" y="14" width="11" height="7" rx="2" fill="#3b82f6" opacity="0.9"/>
                <rect x="24" y="14" width="11" height="7" rx="2" fill="#3b82f6" opacity="0.9"/>
                {/* Servers */}
                <rect x="1" y="27" width="7" height="8" rx="1.5" fill="#8b5cf6" opacity="0.85"/>
                <rect x="14.5" y="27" width="7" height="8" rx="1.5" fill="#8b5cf6" opacity="0.85"/>
                <rect x="28" y="27" width="7" height="8" rx="1.5" fill="#8b5cf6" opacity="0.85"/>
                {/* Spine → Leaf uplinks */}
                <line x1="18" y1="9" x2="6.5" y2="14" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="18" y1="9" x2="29.5" y2="14" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round"/>
                {/* Leaf → Server downlinks */}
                <line x1="6.5" y1="21" x2="4.5" y2="27" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" opacity="0.85"/>
                <line x1="6.5" y1="21" x2="18" y2="27" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" opacity="0.85"/>
                <line x1="29.5" y1="21" x2="18" y2="27" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" opacity="0.85"/>
                <line x1="29.5" y1="21" x2="31.5" y2="27" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" opacity="0.85"/>
              </svg>
            </div>
            <div>
              <h1 className="text-base font-black tracking-widest" style={{ fontFamily: 'Orbitron, monospace', letterSpacing: '0.12em', color: 'var(--ns-text)' }}>
                NetSim<span style={{ color: 'var(--ns-accent)' }}>-Architect</span>
              </h1>
              <p className="text-[9px] tracking-[0.22em] uppercase" style={{ color: 'var(--ns-text-dim)' }}>Sistem Tasarım &amp; Altyapı Motoru</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-mono font-bold" style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e', background: 'rgba(34,197,94,0.07)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 neon-pulse inline-block" />
              SYSTEM ONLINE — SCREW-TO-CODE v2.0
            </div>

            {/* Dark / Light mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
              style={{ background: darkMode ? 'rgba(251,191,36,0.1)' : 'rgba(6,182,212,0.1)', border: darkMode ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(6,182,212,0.3)', color: darkMode ? '#fbbf24' : '#0891b2' }}
              title={darkMode ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* AI status */}
            {serverHasKey ? (
              <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                🟢 AI Aktif
              </div>
            ) : (
              <button
                onClick={() => { setShowKeyModal(true); setKeyInputValue(geminiKey); }}
                className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-full transition-all"
                style={geminiKey
                  ? { background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
                  : { background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }
                }
              >
                <span>{geminiKey ? '🟢' : '🔑'}</span>
                <span>{geminiKey ? 'AI Aktif' : 'API Key Gir'}</span>
              </button>
            )}
          </div>
        </div>
      </header>
      {/* CORE WORKSPACE & SIDEBAR AREA */}
      <main className="flex-1 max-w-full w-full px-4 md:px-8 lg:px-12 p-4 md:p-6 flex flex-col gap-6">
        
        {/* FULL WIDTH COLUMN: THE PHASE WORKSPACE AND DESIGNER PORTAL */}
        <div className="w-full flex flex-col gap-6">
          
          {/* PORTAL MODE TOGGLE */}
          <div className="p-1 rounded-xl flex gap-1" style={{ background: 'var(--ns-panel-bg)', border: '1px solid var(--ns-border-dim)' }}>
            <button
              id="mode-portal-designer"
              onClick={() => setPortalMode('designer')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={portalMode === 'designer'
                ? { background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)', color: '#fff', boxShadow: '0 0 14px rgba(6,182,212,0.35)' }
                : { color: '#4b7ab0' }}
            >
              <Compass className="h-4 w-4" />
              <span>🌐 İnteraktif Topoloji &amp; Canlı Kurulum Portalı</span>
            </button>
            <button
              id="mode-portal-simulation"
              onClick={() => setPortalMode('simulation')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={portalMode === 'simulation'
                ? { background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)', color: '#fff', boxShadow: '0 0 14px rgba(6,182,212,0.35)' }
                : { color: '#4b7ab0' }}
            >
              <Activity className="h-4 w-4" />
              <span>🎓 Eğitim &amp; Akademik Simülasyonlar (5 Faz)</span>
            </button>
          </div>

          {portalMode === 'simulation' ? (
            <>
              {/* PHASE PROGRESS STEPPER */}
              <div className="flex items-center gap-0 mb-1 px-1">
                {[1,2,3,4,5].map((phaseNum, idx) => {
                  const isVisited  = visitedPhases.includes(phaseNum);
                  const isActive   = currentPhase === phaseNum;
                  const phaseColor = isActive ? '#06b6d4' : isVisited ? '#34d399' : '#1e3a6e';
                  const stepLabels = ["Fiziksel Altyapı","Omurga CLI","VLAN/vPC","Güvenlik & SAN","Sorun Giderme"];
                  return (
                    <div key={phaseNum} className="flex items-center flex-1">
                      <button
                        onClick={() => switchPhase(phaseNum)}
                        className="flex flex-col items-center gap-0.5 w-8 shrink-0"
                        title={stepLabels[idx]}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                          style={{
                            background: isActive ? 'rgba(6,182,212,0.18)' : isVisited ? 'rgba(52,211,153,0.12)' : 'rgba(6,13,31,0.8)',
                            border: `2px solid ${phaseColor}`,
                            color: phaseColor,
                            boxShadow: isActive ? '0 0 10px rgba(6,182,212,0.4)' : 'none'
                          }}
                        >
                          {isVisited && !isActive ? '✓' : phaseNum}
                        </div>
                      </button>
                      {idx < 4 && (
                        <div className="flex-1 h-0.5 mx-0.5 transition-all" style={{
                          background: visitedPhases.includes(phaseNum+1) ? 'linear-gradient(90deg,#34d399,#06b6d4)' : 'rgba(30,58,110,0.6)'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* PHASE TABS */}
              <div className="p-1.5 rounded-xl grid grid-cols-5 gap-1" style={{ background: 'rgba(6,13,31,0.7)', border: '1px solid rgba(6,182,212,0.12)' }}>
            {[1, 2, 3, 4, 5].map((phaseNum) => {
              const icons = [Layers, Network, Cpu, Shield, Activity];
              const Icon = icons[phaseNum - 1];
              const titles = ["Fiziksel", "Omurga", "Mantıksal", "Güvenlik", "Sorun Giderme"];
              const isVisited = visitedPhases.includes(phaseNum);
              return (
                <button
                  key={phaseNum}
                  id={`phase-tab-${phaseNum}`}
                  onClick={() => switchPhase(phaseNum)}
                  className="flex flex-col items-center justify-center py-2.5 rounded-lg transition-all cursor-pointer relative"
                  style={currentPhase === phaseNum
                    ? { background: 'rgba(6,182,212,0.12)', color: '#06b6d4', fontWeight: '700', boxShadow: '0 0 10px rgba(6,182,212,0.2), inset 0 0 1px rgba(6,182,212,0.4)' }
                    : { color: isVisited ? '#34d399' : '#4b7ab0' }}
                >
                  {isVisited && currentPhase !== phaseNum && (
                    <span className="absolute top-1 right-1 text-[7px]" style={{ color: '#34d399' }}>✓</span>
                  )}
                  <Icon className="h-4 w-4 md:h-5 md:w-5 mb-1 text-blue-600" />
                  <span className="text-[9px] md:text-xs font-semibold">{titles[phaseNum - 1]}</span>
                  <span className="text-[8px] font-mono opacity-60">Faz {phaseNum}</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE WORKSPACE FRAME */}
          <div className="rounded-2xl overflow-hidden flex flex-col min-h-[580px]" style={{ background: 'var(--ns-card-bg)', border: '1px solid var(--ns-border-dim)', boxShadow: '0 0 30px rgba(6,182,212,0.05)' }}>
            {/* Workspace Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ background: 'var(--ns-ws-header-bg)', borderColor: 'var(--ns-border-subtle)' }}>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest block font-bold" style={{ color: '#06b6d4', fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '0.18em' }}>
                  {PHASE_GUIDES[currentPhase - 1].title}
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                  {PHASE_GUIDES[currentPhase - 1].desc}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded-full" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}>
                  Faz {currentPhase} / 5
                </span>
                {currentPhase < 5 && (
                  <button
                    onClick={() => switchPhase(currentPhase + 1)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all"
                    style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)', boxShadow: '0 0 8px rgba(6,182,212,0.15)' }}
                  >
                    Sonraki Adım <ChevronRight className="h-3 w-3" />
                  </button>
                )}
                {currentPhase === 5 && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                    ✓ Tüm Fazlar Tamamlandı
                  </span>
                )}
              </div>
            </div>

            {/* Workspace Content Router */}
            <div className="p-5 flex-1 flex flex-col gap-6">
              
              {/* PHASE 1: SITE SURVEY & PHYSICAL INFRASTRUCTURE */}
              {currentPhase === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  
                  {/* Left sub-column: Visual 42U Rack Cabinet */}
                  <div className="flex flex-col bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-mono font-bold text-blue-600 flex items-center gap-1.5">
                        <ServerIcon className="h-3.5 w-3.5" /> 42U STANDART NETWORK KABİNETİ
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">Toplam: {totalRUsNeeded}U / 42U Dolu</span>
                    </div>

                    {/* Interactive Rack Body */}
                    <div className="flex-1 border border-slate-200 rounded-lg p-2 max-h-[380px] overflow-y-auto bg-white flex gap-2 shadow-inner">
                      {/* Left Rail U Labels */}
                      <div className="w-6 flex flex-col text-[10px] font-mono text-slate-400 text-right pr-1 gap-[3px]">
                        {Array.from({ length: 42 }).map((_, i) => (
                          <div key={42 - i} className="h-6 flex items-center justify-end">U{42 - i}</div>
                        ))}
                      </div>

                      {/* Rack Slot items */}
                      <div className="flex-1 flex flex-col gap-[3px]">
                        {Array.from({ length: 42 }).map((_, i) => {
                          const uPosition = 42 - i;
                          // Find item installed at this position or covering it
                          const item = rackItems.find(item => uPosition >= item.uPosition && uPosition < item.uPosition + item.height);
                          const isStartOfItem = item && item.uPosition === uPosition;
                          const isSelected = selectedUSlot === uPosition;

                          if (item) {
                            if (isStartOfItem) {
                              const typeColors: Record<RackItem['type'], string> = {
                                spine: 'from-blue-50 to-blue-100/40 border-blue-200 text-blue-700',
                                leaf: 'from-cyan-50 to-cyan-100/40 border-cyan-200 text-cyan-700',
                                firewall: 'from-red-50 to-red-100/40 border-red-200 text-red-700',
                                server: 'from-purple-50 to-purple-100/40 border-purple-200 text-purple-700',
                                san: 'from-emerald-50 to-emerald-100/40 border-emerald-200 text-emerald-700',
                                pdu: 'from-yellow-50 to-yellow-100/40 border-yellow-200 text-yellow-700',
                                blank: 'from-slate-50 to-slate-100/50 border-slate-200 text-slate-500'
                              };
                              return (
                                <div
                                  key={item.id}
                                  style={{ height: `${item.height * 27 - 3}px` }}
                                  className={`rounded border bg-gradient-to-r ${typeColors[item.type]} p-1 px-2 text-[10px] font-mono flex items-center justify-between relative group cursor-pointer hover:brightness-105 shadow-sm`}
                                >
                                  <div className="truncate pr-4">
                                    <span className="font-bold opacity-80 mr-1.5">{item.type.toUpperCase()}</span>
                                    {item.name}
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveDevice(item.id); }}
                                    className="opacity-0 group-hover:opacity-100 absolute right-1 p-0.5 hover:text-red-600 bg-white border border-slate-200 rounded shadow-sm"
                                    title="Cihazı Sök"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              );
                            }
                            return null; // Don't render for remaining U heights of multi-U devices
                          }

                          return (
                            <div
                              key={uPosition}
                              onClick={() => setSelectedUSlot(uPosition)}
                              className={`h-6 rounded border border-dashed text-[10px] font-mono flex items-center justify-center cursor-pointer transition-all ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50 text-blue-600 font-semibold' 
                                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-400'
                              }`}
                            >
                              {isSelected ? `🔧 U${uPosition} Seçildi (Yerleştir)` : `[Boş] U${uPosition}`}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive device mounter panel when slot is selected */}
                    {selectedUSlot !== null && (
                      <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <span className="text-xs font-mono text-blue-600 block mb-2 font-bold">⚡ U{selectedUSlot} Üzerine Cihaz Montajı</span>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-1">Cihaz Türü:</label>
                            <select
                              value={mountDeviceType}
                              onChange={(e) => setMountDeviceType(e.target.value as RackItem['type'])}
                              className="w-full bg-white border border-slate-300 text-xs text-slate-700 rounded p-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="server">Dell Sunucu (2U)</option>
                              <option value="san">Dell SAN Storage (2U)</option>
                              <option value="leaf">ToR Leaf Switch (1U)</option>
                              <option value="spine">Spine Switch (1U)</option>
                              <option value="firewall">NGFW Güvenlik Duvarı (1U)</option>
                              <option value="pdu">Akıllı PDU (1U)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-1">PDU Yedekliliği:</label>
                            <div className="flex gap-2 py-1">
                              <label className="flex items-center gap-1 text-[10px] text-slate-700">
                                <input type="checkbox" checked={pduFeedA} onChange={() => setPduFeedA(!pduFeedA)} /> Feed A
                              </label>
                              <label className="flex items-center gap-1 text-[10px] text-slate-700">
                                <input type="checkbox" checked={pduFeedB} onChange={() => setPduFeedB(!pduFeedB)} /> Feed B
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setSelectedUSlot(null)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs rounded text-slate-600">İptal</button>
                          <button onClick={handleMountDevice} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded shadow-sm">Kafes Somunu Sık & Monte Et</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right sub-column: Cabling & Guidelines */}
                  <div className="flex flex-col gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-mono font-bold text-amber-600 flex items-center gap-1.5 mb-2.5">
                        <Cable className="h-3.5 w-3.5" /> FİZİKSEL KABLO ETİKETLEME SİMÜLATÖRÜ
                      </h4>
                      <p className="text-xs text-slate-500 mb-3">
                        ANSI/TIA-606-B etiketleme standardı uyarınca her kablo iki ucundan da "Kaynak" ve "Hedef" port tanımları ile kodlanır.
                      </p>

                      <div className="space-y-2 mb-3">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Kablo Tipi & Rengi:</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={cableType}
                              onChange={(e) => setCableType(e.target.value as any)}
                              className="bg-white border border-slate-300 text-xs text-slate-700 rounded p-1.5 focus:border-blue-500"
                            >
                              <option value="Cat6">Cat6 Bakır RJ45 (Ofis/OT)</option>
                              <option value="DAC">DAC Twinax SFP+ (DC Sunucu)</option>
                              <option value="OM4">OM4 LC-LC Fiber (Leaf-Spine)</option>
                            </select>
                            <select
                              value={cableColor}
                              onChange={(e) => setCableColor(e.target.value)}
                              className="bg-white border border-slate-300 text-xs text-slate-700 rounded p-1.5 focus:border-blue-500"
                            >
                              <option value="Mavi (Veri/Ofis)">Mavi (Veri/Ofis)</option>
                              <option value="Sarı (Yönetim/OOB)">Sarı (Yönetim/OOB)</option>
                              <option value="Yeşil (Endüstriyel OT)">Yeşil (Endüstriyel OT)</option>
                              <option value="Turkuaz (OM4 Fiber)">Turkuaz (OM4 Fiber)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">Kaynak Port:</label>
                            <input
                              type="text"
                              value={cableSrc}
                              onChange={(e) => setCableSrc(e.target.value)}
                              className="w-full bg-white border border-slate-300 text-xs font-mono text-slate-700 rounded p-1.5 focus:border-blue-500"
                              placeholder="Örn: KABIN1-U24-P1"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">Hedef Port:</label>
                            <input
                              type="text"
                              value={cableDst}
                              onChange={(e) => setCableDst(e.target.value)}
                              className="w-full bg-white border border-slate-300 text-xs font-mono text-slate-700 rounded p-1.5 focus:border-blue-500"
                              placeholder="Örn: KABIN1-U40-P5"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={generateCableLabel}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded shadow-sm transition-all flex items-center justify-center gap-1"
                      >
                        <Settings className="h-3 w-3" /> Endüstriyel Etiket Şeritlerini Yazdır
                      </button>

                      {generatedLabels && (
                        <div className="mt-3 p-2.5 bg-white border border-blue-200 rounded flex flex-col gap-1.5 font-mono text-[10px] shadow-inner">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                            <span className="text-blue-600 font-bold">YAZICI ÇIKTISI (Etiket-A):</span>
                            <span className="bg-slate-100 px-1.5 rounded text-[8px] text-slate-500">KABLO BAŞI</span>
                          </div>
                          <div className="bg-slate-50 p-1.5 rounded text-center border border-slate-200 font-bold tracking-widest text-slate-800">
                            {generatedLabels.src}
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-100 pt-1 pb-1">
                            <span className="text-blue-600 font-bold">YAZICI ÇIKTISI (Etiket-B):</span>
                            <span className="bg-slate-100 px-1.5 rounded text-[8px] text-slate-500">KABLO SONU</span>
                          </div>
                          <div className="bg-slate-50 p-1.5 rounded text-center border border-slate-200 font-bold tracking-widest text-slate-800">
                            {generatedLabels.dst}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phase Instructions info-list */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex-1 shadow-sm">
                      <h4 className="text-xs font-mono font-bold text-slate-700 block mb-2">RACK KURULUM TALİMATLARI</h4>
                      <ul className="space-y-2 text-xs text-slate-600 font-sans">
                        {PHASE_GUIDES[0].screws.map((item, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-blue-600 font-mono font-bold">1.{idx + 1}</span>
                            <div>
                              <strong className="text-slate-800 font-semibold">{item.title}:</strong> {item.detail}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* PHASE 2: SPINE-LEAF FABRIC DESIGN */}
              {currentPhase === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  
                  {/* Left sub-column: Dynamic Fabric Diagram */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-blue-600 mb-3 flex items-center gap-1.5">
                        <Network className="h-3.5 w-3.5" /> OMURGA (SPINE-LEAF) TOPOLOJİSİ
                      </h4>
                      <p className="text-xs text-slate-500 mb-4 font-sans">
                        Doğu-Batı (sunucular arası) gecikmeyi en aza indirmek için her erişim anahtarı (Leaf), her omurga anahtarına (Spine) doğrudan bağlanmıştır.
                      </p>
                    </div>

                    {/* Network visual box */}
                    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col items-center justify-around h-[260px] relative shadow-inner">
                      
                      {/* Spine switches layer */}
                      <div className="flex gap-16 z-10">
                        {["SPINE-1", "SPINE-2"].map((name) => {
                          const isActive = selectedCliDevice === name;
                          return (
                            <div
                              key={name}
                              onClick={() => setSelectedCliDevice(name)}
                              className={`p-2.5 rounded-lg border font-mono text-xs cursor-pointer transition-all ${
                                isActive
                                  ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm scale-105'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                              }`}
                            >
                              <Cpu className={`h-5 w-5 mx-auto mb-1 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                              {name}
                            </div>
                          );
                        })}
                      </div>

                      {/* Cable connection lines (SVG) */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                        {/* Lines from Spine 1 to Leaf 1, 2 */}
                        <line x1="33%" y1="25%" x2="25%" y2="75%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
                        <line x1="33%" y1="25%" x2="75%" y2="75%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
                        {/* Lines from Spine 2 to Leaf 1, 2 */}
                        <line x1="66%" y1="25%" x2="25%" y2="75%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
                        <line x1="66%" y1="25%" x2="75%" y2="75%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
                      </svg>

                      {/* Leaf switches layer */}
                      <div className="flex gap-16 z-10">
                        {["LEAF-1", "LEAF-2"].map((name) => {
                          const isActive = selectedCliDevice === name;
                          return (
                            <div
                              key={name}
                              onClick={() => setSelectedCliDevice(name)}
                              className={`p-2.5 rounded-lg border font-mono text-xs cursor-pointer transition-all ${
                                isActive
                                  ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm scale-105'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                              }`}
                            >
                              <Cpu className={`h-5 w-5 mx-auto mb-1 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                              {name}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3 bg-white p-2.5 rounded border border-slate-200 text-[11px] font-mono text-slate-500 shadow-sm">
                      💡 <span className="font-bold text-slate-800">Tıklama Etkileşimi:</span> Switchlerden birini seçerek sağdaki terminal ekranında ilgili L3 underlay OSPF yapılandırma CLI komutlarını inceleyebilirsiniz.
                    </div>
                  </div>

                  {/* Right sub-column: Switch Terminal and CLI Configurations */}
                  <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1">
                      <div className="px-4 py-2 bg-slate-800 border-b border-slate-900 flex items-center justify-between rounded-t-xl">
                        <span className="text-xs font-mono text-slate-200 flex items-center gap-1.5 font-bold">
                          <Terminal className="h-3.5 w-3.5 text-blue-400 animate-pulse" /> {selectedCliDevice} CLI YAPILANDIRMASI
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">CISCO NX-OS CLI</span>
                      </div>

                      <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre flex-1 max-h-[300px]">
                        {cliOutput}
                      </pre>

                      <div className="p-2 border-t border-slate-900 bg-slate-800 flex justify-end rounded-b-xl">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(cliOutput);
                            setCopiedCli(true);
                            setTimeout(() => setCopiedCli(false), 2000);
                          }}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono rounded shadow-sm transition-all"
                        >
                          {copiedCli ? "Kopyalandı!" : "Kopyala"}
                        </button>
                      </div>
                    </div>

                    {/* Underlay Guidelines info */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600">
                      <h4 className="text-xs font-mono font-bold text-slate-700 block mb-2">SPINE-LEAF YAPILANDIRMA NOTLARI</h4>
                      <ul className="space-y-1.5 text-slate-600 font-sans">
                        {PHASE_GUIDES[1].screws.map((item, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-blue-600 font-mono font-bold">2.{idx + 1}</span>
                            <div>
                              <strong className="text-slate-800 font-semibold">{item.title}:</strong> {item.detail}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* PHASE 3: LOGICAL SEGMENTATION & OVERLAY */}
              {currentPhase === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                  
                  {/* Left Column: VLAN matrix generator (7 cols) */}
                  <div className="lg:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-blue-600 mb-2 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" /> DİNAMİK VLAN & ALT AĞ (SUBNET) MATRİSİ
                      </h4>
                      <p className="text-xs text-slate-500 mb-3 font-sans">
                        Aşağıdaki matris, seçilen ağ ölçeğinize göre cihazların güvenlik segmentasyonunu sağlar.
                      </p>
                    </div>

                    {/* VLAN Table */}
                    <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 font-mono text-[10px] text-slate-600">
                            <th className="p-2.5">VLAN ID</th>
                            <th className="p-2.5">İsim</th>
                            <th className="p-2.5">Subnet Mask</th>
                            <th className="p-2.5">Gateway</th>
                            <th className="p-2.5">Kullanım Amacı</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vlans.map((v) => (
                            <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 text-slate-700">
                              <td className="p-2.5 font-mono">
                                <span className={`px-2 py-0.5 border rounded-full font-bold text-[11px] ${v.color}`}>
                                  {v.id}
                                </span>
                              </td>
                              <td className="p-2.5 font-bold font-mono text-slate-800">{v.name}</td>
                              <td className="p-2.5 font-mono text-slate-600">{v.subnet}</td>
                              <td className="p-2.5 font-mono text-slate-600">{v.gateway}</td>
                              <td className="p-2.5 text-slate-500 text-[11px]">{v.purpose}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Add Custom VLAN interface */}
                    <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <span className="text-xs font-mono text-blue-600 block mb-2 font-bold">➕ Yeni İzole VLAN Segmenti Ekle</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">VLAN ID:</label>
                          <input
                            type="number"
                            value={newVlanId}
                            onChange={(e) => setNewVlanId(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 text-xs font-mono text-slate-700 p-1.5 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">VLAN İsim:</label>
                          <input
                            type="text"
                            value={newVlanName}
                            onChange={(e) => setNewVlanName(e.target.value)}
                            className="w-full bg-white border border-slate-300 text-xs font-mono text-slate-700 p-1.5 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">Alt Ağ (Subnet):</label>
                          <input
                            type="text"
                            value={newVlanSubnet}
                            onChange={(e) => setNewVlanSubnet(e.target.value)}
                            className="w-full bg-white border border-slate-300 text-xs font-mono text-slate-700 p-1.5 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">Gateway IP:</label>
                          <input
                            type="text"
                            value={newVlanGateway}
                            onChange={(e) => setNewVlanGateway(e.target.value)}
                            className="w-full bg-white border border-slate-300 text-xs font-mono text-slate-700 p-1.5 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newVlanPurpose}
                          onChange={(e) => setNewVlanPurpose(e.target.value)}
                          className="flex-1 bg-white border border-slate-300 text-xs text-slate-700 p-1.5 rounded focus:border-blue-500"
                          placeholder="VLAN Kullanım Amacı / Açıklaması"
                        />
                        <button
                          onClick={handleAddVlan}
                          className="px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded shadow-sm transition-all"
                        >
                          Oluştur
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: vPC / LACP Simulator (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between flex-1">
                      <div>
                        <h4 className="text-xs font-mono font-bold text-blue-600 mb-2 flex items-center gap-1.5">
                          <Cpu className="h-3.5 w-3.5" /> LACP (802.3AD) & vPC SİMÜLATÖRÜ
                        </h4>
                        <p className="text-xs text-slate-500 mb-3 font-sans">
                          Sunucularımızın çift portunu L3 Leaf switch çiftine bağlayarak yedeklilik ve saniyede 20G/50G hıza ulaştırıyoruz.
                        </p>
                      </div>

                      {/* Visual representation of dual link */}
                      <div className="bg-white border border-slate-200 rounded p-3 text-center my-2 font-mono text-[11px] shadow-sm">
                        <div className="flex justify-around items-center gap-2 mb-3">
                          <span className="p-1.5 border border-blue-200 rounded bg-blue-50 text-blue-700 font-bold">Leaf-1</span>
                          <span className="text-slate-400 font-bold animate-pulse text-xs">&lt;-- vPC Peer-link (ae0) --&gt;</span>
                          <span className="p-1.5 border border-blue-200 rounded bg-blue-50 text-blue-700 font-bold">Leaf-2</span>
                        </div>

                        <div className="h-10 relative flex justify-center items-center">
                          {/* Active bundle channels */}
                          <div className="absolute w-[60%] h-3 border-x border-dashed border-emerald-400 flex justify-between px-3">
                            <span className="text-[8px] bg-slate-50 px-1.5 py-0.5 border border-blue-200 text-blue-700 rounded text-[9px] font-semibold">Port 1 (LACP)</span>
                            <span className="text-[8px] bg-slate-50 px-1.5 py-0.5 border border-blue-200 text-blue-700 rounded text-[9px] font-semibold">Port 2 (LACP)</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans font-semibold">Aktif LACP Grup (LACP Mode Active)</div>
                        </div>

                        <div className="mt-3 p-1.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-bold text-xs flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Durum: {vpcStatus === 'PEER_UP' ? 'MC-LAG PEER AKTİF (Active-Active)' : 'Hata'}
                        </div>
                      </div>

                      {/* Config Logs */}
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-900 text-[10px] font-mono text-emerald-400 max-h-[110px] overflow-y-auto shadow-inner">
                        <span className="text-yellow-400 font-bold block mb-1">LACP / vPC Protokol Günlükleri:</span>
                        {vpcLogs.map((log, idx) => (
                          <div key={idx} className="truncate text-slate-300">&gt; {log}</div>
                        ))}
                      </div>
                    </div>

                    {/* Logical Guideline */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600">
                      <h4 className="text-xs font-mono font-bold text-slate-700 block mb-2">LACP / vPC KURULUM ADIMLARI</h4>
                      <p className="text-slate-500 leading-relaxed font-sans">
                        Cisco NX-OS ve Juniper Junos tarafında öncelikle 'vpc' ve 'lacp' özellikleri lisanslanıp aktifleştirilir. Ardından iki ToR switch arasında "vPC Peer-link" OM4 fiberler yardımıyla oluşturulur. Sunucu tarafında ise "Teaming Mode: 802.3ad" kurularak kayıpsız yük dağılımı sağlanır.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PHASE 4: EDGE SECURITY & STORAGE ARCHITECTURE */}
              {currentPhase === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  
                  {/* Left Column: Firewall WAN configuration */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-blue-600 mb-2 flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5" /> NGFW EDGE FIREWALL & WAN YEDEKLİLİĞİ
                      </h4>
                      <p className="text-xs text-slate-500 mb-3 font-sans">
                        Veri merkezi sınırında yer alan NGFW, çift internet servis sağlayıcı (ISP) ile yedekli çalışmaktadır.
                      </p>
                    </div>

                    {/* Interactive WAN Failover simulator */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4 font-mono text-xs shadow-inner">
                      <span className="text-slate-800 font-bold block mb-2">WAN Hat Durumları:</span>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${isp1Status ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                            <span className="font-bold text-slate-800">ISP-1 (Ana Hat - Fiber):</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500">198.51.100.2</span>
                            <button
                              onClick={() => setIsp1Status(!isp1Status)}
                              className={`px-2 py-1 text-[10px] rounded font-bold transition-all ${
                                isp1Status ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                                {isp1Status ? "Hattı Kopar" : "Geri Bağla"}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${isp2Status ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                            <span className="font-bold text-slate-800">ISP-2 (Yedek - LTE/Metro):</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500">203.0.113.2</span>
                            <button
                              onClick={() => setIsp2Status(!isp2Status)}
                              className={`px-2 py-1 text-[10px] rounded font-bold transition-all ${
                                isp2Status ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                                {isp2Status ? "Hattı Kopar" : "Geri Bağla"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Active Status Display */}
                      <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded">
                        <span className="text-slate-500 block mb-1">Firewall Durumu:</span>
                        {!isp1Status && !isp2Status ? (
                          <span className="text-red-600 font-bold block animate-pulse">🚨 WAN ARABİRİMLERİ KAPANDI! INTERNET YOK</span>
                        ) : !isp1Status ? (
                          <span className="text-amber-600 font-bold block animate-bounce">⚠️ ISP-1 Kesildi. FortiGate WAN-FAILOVER aktif: ISP-2 Üzerinden Devam Ediyor</span>
                        ) : (
                          <span className="text-emerald-600 font-bold block">✅ ISP-1 AKTİF. Sağlık Taraması Başarılı (Ping 8.8.8.8 Ok)</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-500 font-sans leading-relaxed">
                      <strong>Zone Tanımları:</strong> Firewall üzerinde <span className="text-red-600 font-semibold">Outside-Zone</span> (Dış Dünya), <span className="text-emerald-600 font-semibold">Inside-Zone</span> (Veri Merkezi ve Ofis) ve <span className="text-purple-600 font-semibold">DMZ-Zone</span> (Dışarıya açık sunucular) izole edilerek ACL (Erişim Kontrol Listeleri) tanımlanmıştır.
                    </div>
                  </div>

                  {/* Right Column: SAN storage Lossless Ethernet */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-blue-600 mb-2 flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5" /> SAN DEPOLAMA & KAYIPSIZ ETHERNET (iSCSI)
                      </h4>
                      <p className="text-xs text-slate-500 mb-3 font-sans">
                        iSCSI/NVMe depolama trafiğinde paket kayıpları disk performansını kilitler. PFC ve ECN özelliklerini açarak kayıpsız trafiği garanti edin.
                      </p>
                    </div>

                    {/* Toggle Switch metrics for Lossless Ethernet */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col gap-3 font-mono text-xs shadow-inner">
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200">
                        <span className="font-semibold text-slate-700">PFC (Priority Flow Control):</span>
                        <button
                          onClick={() => setPfcEnabled(!pfcEnabled)}
                          className={`px-3 py-1.5 text-xs rounded font-bold transition-all shadow-sm ${
                            pfcEnabled ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {pfcEnabled ? "AKTİF (802.1Qbb)" : "KAPALI"}
                        </button>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200">
                        <span className="font-semibold text-slate-700">ECN (Tıkanıklık Bildirimi):</span>
                        <button
                          onClick={() => setEcnEnabled(!ecnEnabled)}
                          className={`px-3 py-1.5 text-xs rounded font-bold transition-all shadow-sm ${
                            ecnEnabled ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {ecnEnabled ? "AKTİF" : "KAPALI"}
                        </button>
                      </div>

                      {/* Display live IOPS & loss metrics */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center shadow-sm">
                          <span className="text-[10px] text-slate-500 block font-semibold mb-0.5">SAN IOPS Performansı:</span>
                          <span className={`text-sm font-bold font-mono ${pfcEnabled && ecnEnabled ? 'text-blue-600' : 'text-amber-600'}`}>
                            {sanIops.toLocaleString()} IOPS
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center shadow-sm">
                          <span className="text-[10px] text-slate-500 block font-semibold mb-0.5">Kayıp Paket Oranı:</span>
                          <span className={`text-sm font-bold font-mono ${sanPacketLoss === 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            %{sanPacketLoss}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-500 font-sans leading-relaxed">
                      <strong>Out-of-Band (OOB) Yönetim:</strong> Sunucularımızın iDRAC/iLO bağlantıları ile anahtar konsol arayüzleri, ana ağdan tamamen fiziksel olarak ayrılmış, OOB adını verdiğimiz bağımsız bir Ethernet ağı üzerinden yönetilmektedir.
                    </div>
                  </div>
                </div>
              )}

              {/* PHASE 5: VALIDATION, TROUBLESHOOTING & FAILURE SIMULATION */}
              {currentPhase === 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  
                  {/* Left Column: Disaster triggers & logs */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-red-600 mb-2.5 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-red-500" /> FELAKET VE HATA SİMÜLASYONU
                      </h4>
                      <p className="text-xs text-slate-500 mb-3 font-sans">
                        Uyguladığınız mimarinin dayanıklılığını test etmek amacıyla gerçek zamanlı kesintiler uygulayın.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 font-mono">
                      <button
                        onClick={() => triggerDisaster('spine_power')}
                        className={`py-2 px-3 rounded text-xs font-bold transition-all border cursor-pointer ${
                          spine1Power 
                            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                            : 'bg-red-600 border-red-500 text-white hover:bg-red-500'
                        }`}
                      >
                        {spine1Power ? "Spine-1 Gücünü Kes" : "Spine-1 Gücünü Ver"}
                      </button>

                      <button
                        onClick={() => triggerDisaster('fiber_cut')}
                        className={`py-2 px-3 rounded text-xs font-bold transition-all border cursor-pointer ${
                          !fiberCut 
                            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                            : 'bg-amber-600 border-amber-500 text-white hover:bg-amber-500'
                        }`}
                      >
                        {!fiberCut ? "OM4 Fiber Kabloyu Kopar" : "OM4 Fiberi Tamir Et"}
                      </button>
                    </div>

                    {/* Live Disaster logs */}
                    <div className="flex-1 bg-slate-900 border border-slate-950 p-3 rounded-lg overflow-y-auto max-h-[220px] font-mono text-[10px] text-slate-300 shadow-inner">
                      <span className="text-cyan-400 block mb-1">Ağ Protokol Geçişleri (Milisaniyelik Analiz):</span>
                      {disasterLog.length === 0 ? (
                        <div className="text-slate-500 italic">&gt; Herhangi bir kesinti uygulanmadı. Sistem yedekli çalışıyor (OSPF / ECMP aktif).</div>
                      ) : (
                        disasterLog.map((log, idx) => (
                          <div key={idx} className="mb-1">{log}</div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Packet Walking Walkthrough */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-blue-600 mb-2 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5" /> ETKİLEŞİMLİ PAKET YOLCULUĞU (Packet Walk)
                      </h4>
                      <p className="text-xs text-slate-500 mb-3 font-sans">
                        Bir veri paketinin fiziksel kablolardan mantıksal yönlendiricilere ve güvenlik kurallarına kadar izlediği adımları adım adım gözlemleyin.
                      </p>
                    </div>

                    {/* Scenario selector */}
                    <div className="mb-2">
                      <label className="text-[10px] text-slate-500 block mb-1">Paket Senaryosu:</label>
                      <select
                        value={activeScenarioIdx}
                        onChange={(e) => {
                          setActiveScenarioIdx(Number(e.target.value));
                          setCurrentWalkStepIdx(-1);
                        }}
                        className="w-full bg-white border border-slate-300 text-xs text-slate-700 p-1.5 rounded focus:border-blue-500"
                      >
                        {PACKET_SCENARIOS.map((scen, idx) => (
                          <option key={idx} value={idx}>{scen.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Packet Steps visualizer */}
                    <div className="bg-white border border-slate-200 rounded p-4 min-h-[160px] flex flex-col justify-between shadow-inner">
                      {currentWalkStepIdx === -1 ? (
                        <div className="text-center text-slate-400 py-6 text-xs font-sans">
                          Paketin yolculuğuna başlamak için alttaki "Paketi Gönder" düğmesine tıklayın.
                        </div>
                      ) : (
                        <div className="font-mono text-xs space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                            <span className="text-blue-600 font-bold">Cihaz: {PACKET_SCENARIOS[activeScenarioIdx].steps[currentWalkStepIdx].device}</span>
                            <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded text-[9px] font-bold">
                              {PACKET_SCENARIOS[activeScenarioIdx].steps[currentWalkStepIdx].layer} Katmanı
                            </span>
                          </div>
                          <div>
                            <strong className="text-slate-800">{PACKET_SCENARIOS[activeScenarioIdx].steps[currentWalkStepIdx].desc}:</strong>
                            <p className="text-slate-600 text-[11px] mt-1 leading-relaxed font-sans">
                              {PACKET_SCENARIOS[activeScenarioIdx].steps[currentWalkStepIdx].detail}
                            </p>
                          </div>
                          
                          {/* Step Indicator */}
                          <div className="text-[10px] text-slate-400 text-right">
                            Adım {currentWalkStepIdx + 1} / {PACKET_SCENARIOS[activeScenarioIdx].steps.length}
                          </div>
                        </div>
                      )}

                      {/* Controls for stepper */}
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                          {PACKET_SCENARIOS[activeScenarioIdx].source}
                        </span>
                        <div className="flex gap-2">
                          {currentWalkStepIdx > -1 && (
                            <button
                              onClick={() => setCurrentWalkStepIdx(prev => prev - 1)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] rounded"
                            >
                              Geri
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (currentWalkStepIdx < PACKET_SCENARIOS[activeScenarioIdx].steps.length - 1) {
                                setCurrentWalkStepIdx(prev => prev + 1);
                              } else {
                                setCurrentWalkStepIdx(-1); // Reset
                              }
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Play className="h-2.5 w-2.5 fill-white" />
                            {currentWalkStepIdx === -1 
                              ? "Paketi Gönder" 
                              : currentWalkStepIdx === PACKET_SCENARIOS[activeScenarioIdx].steps.length - 1 
                                ? "Sıfırla" 
                                : "Sonraki Adım"}
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px] text-right">
                          {PACKET_SCENARIOS[activeScenarioIdx].target}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Workspace Footer stats */}
            <div className="px-5 py-3 border-t grid grid-cols-3 gap-2 font-mono text-[10px]" style={{ background: 'rgba(6,13,31,0.7)', borderColor: 'rgba(6,182,212,0.1)', color: '#4b7ab0' }}>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-amber-500" />
                <span>Toplam Tahmini Güç: <strong className="text-slate-700">{(totalRUsNeeded * 140) + 300} Watt</strong></span>
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                <Cable className="h-3 w-3 text-blue-600" />
                <span>Tahmini Kablo Metrajı: <strong className="text-slate-700">{totalCablesEstimated * 15} Metre</strong></span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Layers className="h-3 w-3 text-blue-600" />
                <span>Maksimum Port Kapasitesi: <strong className="text-slate-700">{assets.leafs * 48} Port 10G/25G</strong></span>
              </div>
            </div>

          </div>
          </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[580px]">
              <DesignerPortal
                assets={assets}
                updateAsset={updateAsset}
                totalRUsNeeded={totalRUsNeeded}
                budgetTier={budgetTier}
                setBudgetTier={setBudgetTier}
                selectedTopologyNode={selectedTopologyNode}
                setSelectedTopologyNode={setSelectedTopologyNode}
                checklistCompleted={checklistCompleted}
                setChecklistCompleted={setChecklistCompleted}
                numFloors={numFloors}
                setNumFloors={setNumFloors}
                isRedundant={isRedundant}
                setIsRedundant={setIsRedundant}
              />
            </div>
          )}
        </div>

        {/* BOTTOM PORTION: YAPAY ZEKA AĞ DANIŞMANI (FULL WIDTH) */}
        <div className="w-full flex flex-col rounded-2xl overflow-hidden max-h-[500px] mt-4" style={{ background: 'var(--ns-card-bg)', border: '1px solid var(--ns-border-dim)' }}>

          {/* Chat Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ background: 'var(--ns-chat-header-bg)', borderColor: 'var(--ns-border-dim)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 neon-pulse" />
              <h3 className="text-xs font-bold uppercase font-mono" style={{ color: '#06b6d4', letterSpacing: '0.14em', fontFamily: 'Orbitron, monospace', fontSize: '9px' }}>
                ◈ NetSim-Architect — AI Ağ Altyapı Asistanı
              </h3>
            </div>
            <span className="text-[8px] font-mono px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
              ● AKTİF ÇEKİRDEK
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white min-h-[300px]">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] rounded-xl p-3 text-xs leading-relaxed font-sans shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-50 border border-blue-100 text-blue-900 self-end ml-auto rounded-tr-none'
                    : 'bg-slate-50 border border-slate-100 text-slate-700 self-start rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                <span className="text-[9px] font-mono text-slate-400 mt-1.5 block text-right">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isAiLoading && (
              <div className="bg-slate-50 border border-slate-100 self-start rounded-xl rounded-tl-none p-3 max-w-[85%] flex items-center gap-2 text-xs text-slate-500 shadow-sm">
                <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
                <span className="font-sans">Yapay zeka ağ mimarisi çiziyor...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Prompts */}
          <div className="px-3 py-2 border-t flex gap-1.5 overflow-x-auto whitespace-nowrap text-[9px] font-mono scrollbar-none" style={{ background: 'rgba(6,13,31,0.6)', borderColor: 'rgba(6,182,212,0.1)', color: '#4b7ab0' }}>
            <button 
              onClick={() => setChatInput("LACP ve vPC komutlarını yazar mısın?")}
              className="bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 px-2.5 py-1 rounded shadow-sm text-slate-600 transition-all cursor-pointer"
            >
              ⌨️ vPC Komutları
            </button>
            <button 
              onClick={() => setChatInput("Spine Leaf fiber kablolaması nasıl yapılır?")}
              className="bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 px-2.5 py-1 rounded shadow-sm text-slate-600 transition-all cursor-pointer"
            >
              🪛 Fiber Kablolama
            </button>
            <button 
              onClick={() => setChatInput("BGP routing CLI komutlarını göster.")}
              className="bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 px-2.5 py-1 rounded shadow-sm text-slate-600 transition-all cursor-pointer"
            >
              🌐 BGP Rotaları
            </button>
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-slate-100 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Mimara bir soru sorun (Örn: OSPF rotaları)..."
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
            <button
              onClick={handleSendChat}
              disabled={isAiLoading || !chatInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-lg font-bold transition-all flex items-center justify-center shadow-sm cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

        </div>

      </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-slate-200 bg-slate-50 text-slate-500 text-center py-5 px-4 text-xs font-mono shadow-inner">
        <div className="max-w-full px-4 md:px-8 lg:px-12 w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <span>NetSim-Architect — Vidadan Koda (Screw-to-Code) Ağ Tasarım ve Simülatör Laboratuvarı.</span>
          <span className="text-[10px] text-slate-400">Geliştirici Barış Özyapışoğlu © 2026</span>
        </div>
      </footer>

      {/* GEMINI API KEY MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(4,12,26,0.88)', backdropFilter: 'blur(10px)' }} onClick={() => setShowKeyModal(false)}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#0a1530', border: '1px solid rgba(6,182,212,0.35)', boxShadow: '0 0 80px rgba(6,182,212,0.2)' }} onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4" style={{ background: 'rgba(6,13,31,0.9)', borderBottom: '1px solid rgba(6,182,212,0.15)' }}>
              <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: '#06b6d4' }}>Yapay Zeka Motoru</p>
              <h3 className="text-sm font-bold" style={{ color: '#e2e8f0', fontFamily: 'Orbitron, monospace' }}>Gemini API Key</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
                Google AI Studio'dan ücretsiz API key alabilirsin:{' '}
                <span className="font-mono" style={{ color: '#06b6d4' }}>aistudio.google.com/app/apikey</span>
              </p>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider block mb-1.5" style={{ color: '#4b7ab0' }}>API Key</label>
                <input
                  type="password"
                  autoFocus
                  value={keyInputValue}
                  onChange={e => setKeyInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && keyInputValue.trim()) { setGeminiKey(keyInputValue.trim()); setShowKeyModal(false); } }}
                  placeholder="AIzaSy..."
                  className="w-full text-sm px-4 py-2.5 rounded-xl outline-none font-mono"
                  style={{ background: 'rgba(6,13,31,0.8)', border: '1px solid rgba(6,182,212,0.3)', color: '#e2e8f0' }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { if (keyInputValue.trim()) { setGeminiKey(keyInputValue.trim()); setShowKeyModal(false); } }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg, #0891b2, #2563eb)', color: '#fff', boxShadow: '0 0 14px rgba(6,182,212,0.3)' }}
                >
                  Kaydet & Aktifleştir
                </button>
                {geminiKey && (
                  <button
                    onClick={() => { setGeminiKey(''); setShowKeyModal(false); }}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    Sil
                  </button>
                )}
              </div>
              {geminiKey && (
                <p className="text-[10px] font-mono text-center" style={{ color: '#22c55e' }}>
                  ✓ Key kayıtlı — AI aktif olarak çalışıyor
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
