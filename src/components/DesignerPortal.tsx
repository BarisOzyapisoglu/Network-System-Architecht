import React, { useState, useEffect } from "react";
import { 
  Network, Server as ServerIcon, Shield, Database, Activity, 
  Cpu, Zap, Info, Plus, Minus, Layers, Settings, 
  AlertTriangle, CheckCircle2, ArrowRight, Cable, Compass, LogIn,
  Building2, HelpCircle, Eye, EyeOff, LayoutGrid, CheckSquare
} from "lucide-react";
import { NetworkAssets } from "../types";

interface DesignerPortalProps {
  assets: NetworkAssets;
  updateAsset: (key: keyof NetworkAssets, amount: number) => void;
  totalRUsNeeded: number;
  budgetLimit: number;
  setBudgetLimit: (val: number) => void;
  budgetTier: 'economic' | 'medium' | 'premium';
  setBudgetTier: (val: 'economic' | 'medium' | 'premium') => void;
  selectedTopologyNode: string | null;
  setSelectedTopologyNode: (val: string | null) => void;
  checklistCompleted: Record<string, boolean>;
  setChecklistCompleted: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  numFloors: number;
  setNumFloors: (val: number) => void;
  isRedundant: boolean;
  setIsRedundant: (val: boolean) => void;
}

export default function DesignerPortal({
  assets: initialAssets,
  updateAsset: parentUpdateAsset,
  totalRUsNeeded: parentRUsNeeded,
  budgetLimit: parentBudgetLimit,
  setBudgetLimit: parentSetBudgetLimit,
  budgetTier: parentBudgetTier,
  setBudgetTier: parentSetBudgetTier,
  selectedTopologyNode: parentSelectedNode,
  setSelectedTopologyNode: parentSetSelectedNode,
  checklistCompleted: parentChecklistCompleted,
  setChecklistCompleted: parentSetChecklistCompleted,
  numFloors,
  setNumFloors,
  isRedundant,
  setIsRedundant,
}: DesignerPortalProps) {
  
  // Localized rich states to make the topology 100% self-configured and precise
  const [designerSubTab, setDesignerSubTab] = useState<'topology' | 'budget' | 'components' | 'checklist'>('topology');
  const [localAssets, setLocalAssets] = useState<NetworkAssets>(initialAssets);

  // Sync with initialAssets whenever they change in Parent!
  useEffect(() => {
    setLocalAssets(initialAssets);
  }, [initialAssets]);

  // Keep in sync with parent update if needed, but run locally for lightning speed and customization!
  const updateLocalAsset = (key: keyof NetworkAssets, delta: number) => {
    const prevVal = localAssets[key];
    const newVal = Math.max(0, prevVal + delta);
    const actualDelta = newVal - prevVal;
    if (actualDelta !== 0) {
      setLocalAssets(prev => ({ ...prev, [key]: newVal }));
      try {
        parentUpdateAsset(key, actualDelta);
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const [localBudgetLimit, setLocalBudgetLimit] = useState<number>(parentBudgetLimit);
  const [localBudgetTier, setLocalBudgetTier] = useState<'economic' | 'medium' | 'premium'>(parentBudgetTier);

  useEffect(() => {
    setLocalBudgetLimit(parentBudgetLimit);
  }, [parentBudgetLimit]);

  useEffect(() => {
    setLocalBudgetTier(parentBudgetTier);
  }, [parentBudgetTier]);

  const [selectedNode, setSelectedNode] = useState<string | null>('servers'); // Default to servers to answer server connection immediately!

  // Hardware models based on budget tier and redundancy settings
  const getHardwareConfig = () => {
    const isRed = isRedundant;
    switch (localBudgetTier) {
      case 'economic':
        return {
          router: { 
            model: "MikroTik Cloud Core CCR2004-16G-2S+", 
            price: 1100, 
            ports: "16x 1G RJ45, 2x 10G SFP+", 
            desc: "Küçük işletmeler için tek veya yedeksiz çift WAN sonlandırma yapabilen bütçe dostu yönlendirici.",
            whySelected: "Düşük bütçeli projelerde yüksek lisans maliyetlerinden kaçınarak temel yönlendirme ve NAT (Network Address Translation) işlemlerini gerçekleştirmek üzere seçilmiştir."
          },
          firewall: { 
            model: isRed ? "FortiGate 40F HA Dual Cluster (2 Adet)" : "FortiGate 40F Tek Cihaz", 
            price: isRed ? 1900 : 950, 
            ports: "5x GE RJ45, UTM Lisansı", 
            desc: "SME segmenti için antivirüs, web filtreleme ve VPN sonlandırma sunan endüstri standardı güvenlik duvarı.",
            whySelected: "Kullanıcıların internet çıkışını denetlemek, dışarıdan gelen siber saldırıları engellemek ve şubeler arası güvenli IPSec VPN tünelleri kurmak için seçilmiştir. Yedekli modda iki cihaz birbirini anlık izler."
          },
          spine: { 
            model: isRed ? "Cisco Catalyst 9300L 24-Port L3" : "Spine Katmanı Yok (Doğrudan Bağlantı)", 
            price: isRed ? 4200 : 0, 
            ports: "24x 1G RJ45, 4x 10G SFP+", 
            desc: "Temel katman-3 routing yapan, omurga görevi üstlenen anahtar grubu.",
            whySelected: "Ekonomik sınıfta büyük Spine switch maliyetlerinden kaçınmak için tek veya çift katmanlı hafif L3 omurga mimarisi kurulur."
          },
          userLeaf: { 
            model: "Ubiquiti UniFi USW-48-PoE Gen2", 
            price: 950, 
            ports: "48x GbE RJ45, 4x 10G SFP+", 
            desc: "Kullanıcı bilgisayarları ve IP telefonları için sessiz, yönetilebilir PoE access switch.",
            whySelected: "Ofis çalışanlarının PC ve IP telefonlarını aynı anda besleyip veri iletimi sağlamak için seçilmiştir. VLAN desteği sayesinde ses ve veriyi fiziksel kablo çekmeden ayırır."
          },
          poeLeaf: { 
            model: "Ubiquiti UniFi USW-24-PoE (Kameralar & AP için)", 
            price: 420, 
            ports: "24x GbE PoE (120W Bütçe)", 
            desc: "IP kameralar ve kablosuz erişim noktaları (AP) için bütçe dostu PoE anahtar.",
            whySelected: "Kameralara ve tavan tipi AP'lere tek bir ethernet kablosu üzerinden hem elektrik hem de veri taşımak (PoE) için seçilmiştir. Harici adaptör kablolamasını ortadan kaldırır."
          },
          otLeaf: { 
            model: "Endüstriyel DIN-Rail 8-Port L2 Switch", 
            price: 180, 
            ports: "8x FE RJ45, Ray Tipi Montaj", 
            desc: "Fabrika zeminindeki toz, nem ve titreşime dayanıklı fansız endüstriyel anahtar.",
            whySelected: "PLC ve CNC ünitelerinin fabrika zeminindeki ağır elektrik parazitlerinden ve tozdan etkilenmeden veri haberleşmesi yapması amacıyla ray montajlı endüstriyel switch tercih edilmiştir."
          },
          server: { 
            model: "Dell PowerEdge T350 Kule Tipi", 
            price: 1950, 
            ports: "2x 1GbE LOM, Intel Xeon", 
            desc: "Şirket içi Active Directory, dosya paylaşımı ve muhasebe programları için tek işlemcili sunucu.",
            whySelected: "Ekonomik ve güvenilir bir donanım üzerinde temel yerel servisleri çalıştırmak için seçilmiştir. Çift disk RAID-1 yapısıyla disk arızalarına karşı korumalıdır."
          },
          storage: { 
            model: "Synology DS1821+ 8-Bay NAS", 
            price: 1100, 
            ports: "4x 1GbE, 8 Disk Yuvası", 
            desc: "Yedekleme ve merkezi dosya depolama için RAID-6 destekli NAS cihazı.",
            whySelected: "Şirket verilerinin her gece otomatik yedeklenmesi ve kullanıcıların ortak dosya havuzuna erişmesi amacıyla bütçe dostu depolama olarak seçilmiştir."
          },
          pdu: { model: "APC Basic 1U PDU AP9565", price: 180, desc: "Temel akım korumalı kabin içi grup priz ünitesi." },
          rack: { model: "32U Ekonomik Network Kabini", price: 450, desc: "Temperli cam kapaklı, yan panelleri sökülebilir hafif şasi kabin." }
        };
      case 'medium':
        return {
          router: { 
            model: isRed ? "Cisco Catalyst 8300 WAN Cluster (2 Adet)" : "Cisco Catalyst 8300 Tek Cihaz", 
            price: isRed ? 8500 : 4500, 
            ports: "4x 10G SFP+, 4x 1G Combo", 
            desc: "Çift ISP metro ethernet hatlarını BGP protokolü ile yedekli çalıştıran kurumsal yönlendirici.",
            whySelected: "Metro internet hatlarını dinamik yönlendirme (BGP) ve yedekli geçiş (failover) mimarisi ile sonlandırarak şirket internetinin 1 saniye bile kesilmemesini sağlamak amacıyla seçilmiştir."
          },
          firewall: { 
            model: isRed ? "FortiGate 80F Active-Passive HA Cluster" : "FortiGate 80F Standalone", 
            price: isRed ? 5200 : 2600, 
            ports: "8x GE RJ45, 2x Shared SFP", 
            desc: "Gelişmiş Tehdit Koruması (ATP), IPS, SSL De-cryption ve uygulama denetimi sunan HA uyumlu duvar.",
            whySelected: "İki adet FortiGate 80F cihazı 'Active-Passive HA' protokolü ile birbirine fiber heartbeat kablolarıyla bağlanır. Ana cihaz çöktüğünde tüm internet oturumları kesilmeden diğer cihaza anlık aktarılır."
          },
          spine: { 
            model: isRed ? "2x Cisco Catalyst 9300L 48X L3 Spine" : "1x Cisco Catalyst 9300L L3 Spine", 
            price: isRed ? 14000 : 7000, 
            ports: "48x 10G SFP+ Core, 480Gbps Stack", 
            desc: "Tüm binadaki Leaf switch'leri 10G fiber hatlarla toplayan L3 omurga switch yapısı.",
            whySelected: "Spine-Leaf mimarisinde omurga switch'ler, katlardaki tüm trafiği ultra düşük gecikmeyle anahtarlar. Çift Spine kullanıldığında 'Cisco StackWise' ile tek mantıksal cihaz gibi çalışarak tam yedeklilik sunarlar."
          },
          userLeaf: { 
            model: "Cisco Catalyst 9200L-48P PoE+ (Kat Dağıtım)", 
            price: 2900, 
            ports: "48x GbE PoE+, 4x 10G SFP+ Uplink", 
            desc: "Stackable kurumsal kat dağıtım switch'i. 370W PoE gücü ve kurumsal 802.1X güvenliği.",
            whySelected: "Kullanıcı bilgisayarlarını, IP telefonları ve yazıcıları bağlamak için seçilmiştir. IP telefonların PoE beslemesini yaparken arkalarındaki PC'ye internet geçişi sağlar. Stacking desteği vardır."
          },
          poeLeaf: { 
            model: "Cisco Catalyst 9200L-24P PoE+ (Kameralar & AP)", 
            price: 1950, 
            ports: "24x GbE PoE+, 4x 10G Uplink", 
            desc: "IP kameralar ve tavan tipi Wi-Fi AP'ler için yüksek bütçeli, güvenli PoE access switch.",
            whySelected: "Kameralar ve AP'ler için özel PoE besleme katmanıdır. Kamera verilerini tamamen ayrı bir VLAN'da izole ederek kurumsal veri ağının tıkanmasını ve siber sızmaları engeller."
          },
          otLeaf: { 
            model: "Cisco IE-2000-8TC DIN-Rail Endüstriyel", 
            price: 1150, 
            ports: "8x 10/100 RJ45, 2x Combo SFP", 
            desc: "Aşırı sıcaklığa, elektromanyetik dalgalara dayanıklı L2 akıllı endüstriyel switch.",
            whySelected: "Fabrikadaki PLC ve CNC ünitelerinin Modbus/TCP ve Profinet otomasyon paketlerini milisaniye hassasiyetinde önceliklendirmek (QoS) ve kesintisiz halka yedekliliği (MRP) kurmak için seçilmiştir."
          },
          server: { 
            model: "Dell PowerEdge R650 1U Rack Sunucu", 
            price: 5200, 
            ports: "2x 10GbE SFP+ DAC, Intel Xeon Çift PSU", 
            desc: "Sanal makineler (VMware ESXi/Hyper-V) için çift yedekli güç kaynaklı kurumsal rack sunucu.",
            whySelected: "Yüksek RAM ve CPU gücü gerektiren sanallaştırma altyapımız için seçilmiştir. Arkasındaki çift 10G SFP+ portu LACP EtherChannel ile iki farklı ToR switch'e bağlanarak hem hızı 20G'ye çıkarır hem de hat yedekliliği sağlar."
          },
          storage: { 
            model: "Synology RS3621RPxs Enterprise NAS/SAN", 
            price: 4500, 
            ports: "2x 10GbE SFP+, Çift Güç Kaynağı", 
            desc: "iSCSI ve NFS protokolleri ile sanallaştırma sunucularına veri depolama alanı sunan yedekli NAS.",
            whySelected: "Sanallaştırma sunucularımızın (VMware ESXi) sanal disklerini (VMDK) iSCSI protokolü üzerinden 10G fiber hızında yazıp okuması için çift güç kaynaklı bu kurumsal rack tipi depolama seçilmiştir."
          },
          pdu: { model: "APC Metered 1U Akıllı PDU AP8853", price: 650, desc: "Güç tüketimini IP üzerinden anlık bildiren ve port akım kontrolü yapan akıllı PDU." },
          rack: { model: "42U Kurumsal Isı Tahliyeli Perfore Kabinet", price: 1100, desc: "Ön ve arka kapakları %80 perfore delikli, dikey kablo düzenleyicili yüksek mukavemetli kabin." }
        };
      case 'premium':
      default:
        return {
          router: { 
            model: "Cisco ISR 4431 WAN High-Performance HA Pair (2 Adet)", 
            price: 24000, 
            ports: "4x SFP/RJ45 Combo, Donanımsal SSL/IPSec Şifreleme", 
            desc: "Veri merkezi seviyesinde, şifreli tünelleri (IPSec) donanımsal hızlandırıcılar ile sıfır kayıpla yöneten çift yönlendirici.",
            whySelected: "Binlerce kullanıcının şifreli tünel, SD-WAN ve dış hat ses (SIP Trunk) trafiğini donanımsal chipler yardımıyla gecikmesiz yönlendirmek üzere en yüksek yedeklilik sınıfında seçilmiştir."
          },
          firewall: { 
            model: "Palo Alto PA-1410 Active-Active HA Pair (2 Adet)", 
            price: 36000, 
            ports: "4x 10G SFP+, 12x 1G SFP", 
            desc: "Uygulama bazlı Katman-7 filtreleme, anlık siber tehdit kum havuzu (Wildfire) ve SSL şifre çözme sunan dünya devi NGFW.",
            whySelected: "En üst düzey siber güvenlik gereksinimleri için Palo Alto'nun tescilli single-pass mimarisi seçilmiştir. İki cihaz Active-Active çalışarak trafiği paylaşır ve biri göçerse sıfır milisaniyede devralır."
          },
          spine: { 
            model: "2x Cisco Nexus 93180YC-FX3 Datacenter Spine", 
            price: 48000, 
            ports: "48x 10G/25G SFP28, 6x 100G QSFP28", 
            desc: "Veri merkezi sınıfı, VXLAN EVPN mimarisini destekleyen, sub-microsecond gecikmeli devasa omurga.",
            whySelected: "Yüksek performanslı veri merkezleri ve kampüs omurgaları için Nexus anahtarlar seçilmiştir. 3.6 Tbps anahtarlama kapasitesi ile kablo tıkanıklığını tarihe gömer."
          },
          userLeaf: { 
            model: "Cisco Catalyst 9300-48U Premium Stackable", 
            price: 5800, 
            ports: "48x GbE UPoE (90W Port Başına), Modular Uplink 25G", 
            desc: "U90W gücüyle akıllı aydınlatmaları ve yeni nesil Wi-Fi 7 AP'leri dahi besleyen, yapay zeka analitiği destekli premium switch.",
            whySelected: "Geleceğe yatırım olarak 90W UPoE port gücü sunan Catalyst 9300 serisi seçilmiştir. Cisco DNA ile ağdaki tüm anormallikleri otomatik tespit eder."
          },
          poeLeaf: { 
            model: "Cisco Catalyst 9300-24U Premium PoE+", 
            price: 4200, 
            ports: "24x GbE UPoE, Modüler 25G SFP28 Sınırı", 
            desc: "Kritik PTZ yüksek güçlü güvenlik kameraları ve Wi-Fi 7 tavan cihazları için üstün kaliteli PoE anahtar.",
            whySelected: "Havaalanı veya büyük fabrikalarda kullanılan hareketli ve ısıtıcılı dış ortam kameralarının yüksek güç (60W+) ihtiyaçlarını kesintisiz karşılamak amacıyla seçilmiştir."
          },
          otLeaf: { 
            model: "Cisco Industrial IE-3300 Modüler L3 Endüstriyel", 
            price: 2600, 
            ports: "Modüler (8x Gigabit RJ45, 2x 1G SFP Fiber)", 
            desc: "Zorlu çevre koşulları için IP30 korumalı, Layer-3 dinamik yönlendirme yapabilen premium endüstriyel switch.",
            whySelected: "Ağır sanayi hatlarında sadece veri iletimi değil, aynı zamanda cihaz düzeyinde dinamik IP yönlendirme (OSPF) yapabilen modüler IE-3300 serisi tercih edilmiştir."
          },
          server: { 
            model: "Dell PowerEdge R750 Enterprise Dual-Processor", 
            price: 11000, 
            ports: "4x 25GbE SFP28 OCP 3.0, Redundant 1400W PSU", 
            desc: "Büyük ölçekli veri tabanları, ERP yazılımları ve sanal bulut mimarileri için çift Intel Xeon Gold işlemcili canavar.",
            whySelected: "Kritik şirket servislerinin, ERP veritabanlarının sıfır gecikmeyle çalışması için çift 25G fiber arabirimli Dell R750 seçilmiştir. 25G DAC kablolar ile Nexus omurgasına doğrudan bağlanır."
          },
          storage: { 
            model: "Dell PowerVault ME5012 Dual-Controller SAN", 
            price: 17500, 
            ports: "8x 10G/25G SFP28 Fiber Kanal / iSCSI, Çift Aktif Kontrolör", 
            desc: "Donanımsal Active-Active çift işlemcili, sıfır veri kaybı garantili gerçek kurumsal SAN depolama donanımı.",
            whySelected: "Sanallaştırma sunucularına eş zamanlı (MPIO) olarak saniyede 250.000 disk yazma/okuma (IOPS) hızı sağlamak ve tek bir kontrolör arızalansa bile veri akışını kesintisiz sürdürmek için seçilmiştir."
          },
          pdu: { model: "APC Switched Outlet-Level PDU AP8953 (Sıfır-U)", price: 1450, desc: "Port bazında uzaktan prizi kapatıp açabilen sensörlü dikey PDU." },
          rack: { model: "42U APC NetShelter SX Premium Kabinet", price: 2400, desc: "1360 kg taşıma kapasiteli, sismik sabitleme kitli, sızdırmaz hava koridorlu kurumsal veri merkezi kabini." }
        };
    }
  };

  const hw = getHardwareConfig();

  // Dynamic Switch & Rack calculation based on user variables
  const routerQty = isRedundant ? 2 : 1;
  const firewallQty = isRedundant ? 2 : 1;
  const spineQty = isRedundant ? (localBudgetTier === 'economic' ? 1 : 2) : 0;
  
  // High-precision switches needed calculation
  const totalUserPorts = localAssets.pcs + localAssets.ipPhones + localAssets.printers;
  const userLeafQty = Math.max(1, Math.ceil(totalUserPorts / 44)); // 44 usable ports per 48p switch
  
  const totalPoEPorts = localAssets.cameras + localAssets.wifiAPs;
  const poeLeafQty = Math.max(1, Math.ceil(totalPoEPorts / 20)); // 20 usable ports per 24p switch

  const otLeafQty = (localAssets.plcs + localAssets.cncs + localAssets.modbusGateways) > 0 
    ? Math.max(1, Math.ceil((localAssets.plcs + localAssets.cncs + localAssets.modbusGateways) / 6))
    : 0;

  const serverQty = localAssets.servers;
  const storageQty = localAssets.sanStorages;
  const pduQty = isRedundant ? 2 : 1;
  const rackQty = 1; // All fits in 1 main rack for these quantities

  // Cable estimations
  const cat6BlueQty = localAssets.pcs + localAssets.ipPhones + localAssets.printers;
  const cat6YellowQty = localAssets.cameras + localAssets.wifiAPs;
  const cat6GreenQty = localAssets.plcs + localAssets.cncs + localAssets.modbusGateways;
  const dacBlackQty = serverQty * (isRedundant ? 2 : 1);
  const fiberOM4Qty = (spineQty > 0 ? (userLeafQty + poeLeafQty + otLeafQty) * (isRedundant ? 2 : 1) : 4);

  // Fiber SFP+ Optik Transceiver & Patch kablolar (Dinamik Gereksinimler)
  const opticTransceiverQty = fiberOM4Qty * 2; // Her fiber hattın iki ucuna SFP+ modülü takılır
  const patchPanelCat6Ports = Math.ceil((cat6BlueQty + cat6YellowQty) / 24) * 24;

  const cableCosts = (cat6BlueQty * 10) + (cat6YellowQty * 12) + (cat6GreenQty * 15) + (dacBlackQty * 45) + (fiberOM4Qty * 65);
  const opticCosts = opticTransceiverQty * (localBudgetTier === 'economic' ? 35 : localBudgetTier === 'medium' ? 95 : 280);
  const patchPanelCosts = (patchPanelCat6Ports / 24) * 120;
  const laborCost = localBudgetTier === 'economic' ? 2500 : localBudgetTier === 'medium' ? 6500 : 18000;

  // Total calculated cost
  const totalCost = 
    (hw.router.price * routerQty) +
    (hw.firewall.price * firewallQty) +
    (hw.spine.price * spineQty) +
    (hw.userLeaf.price * userLeafQty) +
    (hw.poeLeaf.price * poeLeafQty) +
    (hw.otLeaf.price * otLeafQty) +
    (hw.server.price * serverQty) +
    (hw.storage.price * storageQty) +
    (hw.pdu.price * pduQty) +
    (hw.rack.price * rackQty) +
    cableCosts +
    opticCosts +
    patchPanelCosts +
    laborCost;

  const isOverBudget = totalCost > localBudgetLimit;
  const budgetUsagePercent = Math.min(100, Math.round((totalCost / localBudgetLimit) * 100));

  // Sync state to parent budget limit if changed (guarded to avoid unneeded renders)
  useEffect(() => {
    try {
      if (parentBudgetLimit !== localBudgetLimit) {
        parentSetBudgetLimit(localBudgetLimit);
      }
      if (parentBudgetTier !== localBudgetTier) {
        parentSetBudgetTier(localBudgetTier);
      }
    } catch (e) {}
  }, [localBudgetLimit, localBudgetTier, parentBudgetLimit, parentBudgetTier]);

  return (
    <div className="flex flex-col flex-1 bg-white">
      
      {/* 1. PORTAL HEADER SECTION */}
      <div className="bg-slate-900 text-white px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg animate-pulse">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-bold">
              YENİ NESİL İNTERAKTİF FİZİKSEL TOPOLOJİ VE CANLI KURULUM PORTALI
            </span>
            <h3 className="text-lg font-extrabold tracking-tight">
              Screws-to-Code: Akıllı Altyapı Mimarı
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cisco Packet Tracer kalitesinde interaktif şema, kat bazlı yerleşim, dinamik kablolama ve sıfırdan anlama rehberi
            </p>
          </div>
        </div>

        {/* Global Controls: Hardware Class & Redundancy */}
        <div className="flex flex-wrap items-center gap-2.5 bg-slate-800/80 p-2 rounded-xl border border-slate-700/60 shadow-inner">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-slate-400 font-bold px-1.5">Donanım Kalitesi:</span>
            <select
              value={localBudgetTier}
              onChange={(e) => setLocalBudgetTier(e.target.value as any)}
              className="text-xs bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="economic">Ekonomik (SME / MikroTik / Ubiquiti)</option>
              <option value="medium">Orta Sınıf (Kurumsal Cisco / Fortinet)</option>
              <option value="premium">Premium Sınıf (Nexus / Palo Alto / SAN)</option>
            </select>
          </div>

          <div className="h-4 w-[1px] bg-slate-700" />

          {/* Redundancy Switcher */}
          <button
            onClick={() => setIsRedundant(!isRedundant)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              isRedundant 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-amber-600 text-white shadow-md'
            }`}
          >
            <Shield className="h-3 w-3" />
            {isRedundant ? 'Yedekli Yapı (Redundant HA)' : 'Yedeksiz Yapı (Standby)'}
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC REAL-TIME INVENTORY EDITOR PANEL */}
      <div className="bg-slate-50 border-b border-slate-200 p-5 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4 border-b border-slate-200 pb-2.5">
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" /> ENVANTER VE BİNA FİZİKSEL YAPISINI ÖZELLEŞTİRİN
              </h4>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                Kendi bilgisayar, kamera, sunucu ve kat adetlerinizi belirleyin. Ağ haritası ve kablo bacakları anında yeniden çizilecektir!
              </p>
            </div>

            {/* Floors and Building Configuration */}
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-indigo-500" /> Bina Fiziksel Yapısı:
              </span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((floor) => (
                  <button
                    key={floor}
                    onClick={() => setNumFloors(floor)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      numFloors === floor 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {floor} Katlı Bina
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Asset Incrementer Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* PCs */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">💻 Ofis Bilgisayarları</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-slate-800">{localAssets.pcs} adet</span>
                <div className="flex gap-1">
                  <button onClick={() => updateLocalAsset('pcs', -2)} className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center justify-center font-extrabold text-slate-700">-</button>
                  <button onClick={() => updateLocalAsset('pcs', 2)} className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center justify-center font-extrabold text-slate-700">+</button>
                </div>
              </div>
            </div>

            {/* IP Phones */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">📞 IP Telefonlar (VoIP)</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-slate-800">{localAssets.ipPhones} adet</span>
                <div className="flex gap-1">
                  <button onClick={() => updateLocalAsset('ipPhones', -2)} className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center justify-center font-extrabold text-slate-700">-</button>
                  <button onClick={() => updateLocalAsset('ipPhones', 2)} className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center justify-center font-extrabold text-slate-700">+</button>
                </div>
              </div>
            </div>

            {/* IP Cameras */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between ring-2 ring-amber-500/20">
              <span className="text-[10px] text-amber-700 font-bold block mb-1">📹 IP Güvenlik Kameraları</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-slate-800">{localAssets.cameras} adet</span>
                <div className="flex gap-1">
                  <button onClick={() => updateLocalAsset('cameras', -1)} className="w-5 h-5 bg-amber-50 hover:bg-amber-100 rounded text-xs flex items-center justify-center font-extrabold text-amber-800">-</button>
                  <button onClick={() => updateLocalAsset('cameras', 1)} className="w-5 h-5 bg-amber-50 hover:bg-amber-100 rounded text-xs flex items-center justify-center font-extrabold text-amber-800">+</button>
                </div>
              </div>
            </div>

            {/* Wi-Fi APs */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">📶 Wi-Fi Access Pointler</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-slate-800">{localAssets.wifiAPs} adet</span>
                <div className="flex gap-1">
                  <button onClick={() => updateLocalAsset('wifiAPs', -1)} className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center justify-center font-extrabold text-slate-700">-</button>
                  <button onClick={() => updateLocalAsset('wifiAPs', 1)} className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center justify-center font-extrabold text-slate-700">+</button>
                </div>
              </div>
            </div>

            {/* Hypervisor Servers */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between ring-2 ring-purple-500/20">
              <span className="text-[10px] text-purple-700 font-bold block mb-1">🖥️ Fiziksel Sunucular</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-slate-800">{localAssets.servers} adet</span>
                <div className="flex gap-1">
                  <button onClick={() => updateLocalAsset('servers', -1)} className="w-5 h-5 bg-purple-50 hover:bg-purple-100 rounded text-xs flex items-center justify-center font-extrabold text-purple-800">-</button>
                  <button onClick={() => updateLocalAsset('servers', 1)} className="w-5 h-5 bg-purple-50 hover:bg-purple-100 rounded text-xs flex items-center justify-center font-extrabold text-purple-800">+</button>
                </div>
              </div>
            </div>

            {/* SAN Storage */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">💾 iSCSI SAN Depolama</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-slate-800">{localAssets.sanStorages} adet</span>
                <div className="flex gap-1">
                  <button onClick={() => updateLocalAsset('sanStorages', -1)} className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center justify-center font-extrabold text-slate-700">-</button>
                  <button onClick={() => updateLocalAsset('sanStorages', 1)} className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center justify-center font-extrabold text-slate-700">+</button>
                </div>
              </div>
            </div>

            {/* PLCs & CNCs */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between ring-2 ring-emerald-500/20">
              <span className="text-[10px] text-emerald-700 font-bold block mb-1">⚙️ Endüstriyel PLC / CNC</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-slate-800">{localAssets.plcs + localAssets.cncs} adet</span>
                <div className="flex gap-1">
                  <button onClick={() => { updateLocalAsset('plcs', -1); updateLocalAsset('cncs', -1); }} className="w-5 h-5 bg-emerald-50 hover:bg-emerald-100 rounded text-xs flex items-center justify-center font-extrabold text-emerald-800">-</button>
                  <button onClick={() => { updateLocalAsset('plcs', 1); updateLocalAsset('cncs', 1); }} className="w-5 h-5 bg-emerald-50 hover:bg-emerald-100 rounded text-xs flex items-center justify-center font-extrabold text-emerald-800">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUB TABS BAR */}
      <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setDesignerSubTab('topology')}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            designerSubTab === 'topology' ? 'bg-white border border-slate-200 text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Network className="h-4 w-4 text-blue-600" />
          🕸️ İnteraktif Katlı Ağ Topolojisi
        </button>
        <button
          onClick={() => setDesignerSubTab('budget')}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            designerSubTab === 'budget' ? 'bg-white border border-slate-200 text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="h-4 w-4 text-amber-500 animate-bounce" />
          💵 Proje BOM & Bütçe Analizi
        </button>
        <button
          onClick={() => setDesignerSubTab('components')}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            designerSubTab === 'components' ? 'bg-white border border-slate-200 text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4 text-indigo-500" />
          📖 PoE & ToR Neden Seçildi? (Sıfırdan Öğrenim)
        </button>
        <button
          onClick={() => setDesignerSubTab('checklist')}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            designerSubTab === 'checklist' ? 'bg-white border border-slate-200 text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="h-4 w-4 text-emerald-500" />
          🛠️ Adım Adım Fiziksel Kurulum Rehberi
        </button>
      </div>

      {/* 4. MAIN DYNAMIC WORKSPACE */}
      <div className="p-6 flex-1 bg-slate-50">
        
        {designerSubTab === 'topology' && (() => {
          // Generate individual endpoint devices based on the local assets
          const isRed = isRedundant;
          const endpoints: Array<{
            id: string;
            name: string;
            type: 'pc' | 'phone' | 'camera' | 'ap' | 'printer' | 'plc' | 'cnc' | 'server' | 'storage';
            ip: string;
            vlan: string;
            floor: number;
            x: number;
            y: number;
            parentLeaf: string;
            cableColor: string;
            portLabel: string;
          }> = [];

          // 1. Ofis Bilgisayarları (PCs)
          const pcCount = Math.min(6, localAssets.pcs);
          for (let i = 0; i < pcCount; i++) {
            const floor = numFloors === 3 ? (i < 2 ? 3 : i < 4 ? 2 : 1) : numFloors === 2 ? (i < 3 ? 2 : 1) : 1;
            endpoints.push({
              id: `pc-${i+1}`,
              name: `Ofis-PC-${i+1}`,
              type: 'pc',
              ip: `10.10.10.${11 + i}`,
              vlan: 'VLAN 10',
              floor,
              x: 0,
              y: 0,
              parentLeaf: 'leaf-1',
              cableColor: '#3b82f6', // Blue for data
              portLabel: `Fa0/${i+1}`
            });
          }

          // 2. IP Telefonlar (VoIP)
          const phoneCount = Math.min(4, localAssets.ipPhones);
          for (let i = 0; i < phoneCount; i++) {
            const floor = numFloors === 3 ? (i === 0 ? 3 : i <= 2 ? 2 : 1) : numFloors === 2 ? (i < 2 ? 2 : 1) : 1;
            endpoints.push({
              id: `phone-${i+1}`,
              name: `IP-Phone-${i+1}`,
              type: 'phone',
              ip: `10.10.20.${11 + i}`,
              vlan: 'VLAN 20',
              floor,
              x: 0,
              y: 0,
              parentLeaf: 'leaf-1',
              cableColor: '#a855f7', // Purple for Voice
              portLabel: `Fa0/${pcCount + i + 1}`
            });
          }

          // 3. Yazıcılar (Printers)
          const printerCount = Math.min(2, localAssets.printers);
          for (let i = 0; i < printerCount; i++) {
            const floor = numFloors; // put on the top floor
            endpoints.push({
              id: `printer-${i+1}`,
              name: `Yazici-${i+1}`,
              type: 'printer',
              ip: `10.10.10.20${i}`,
              vlan: 'VLAN 10',
              floor,
              x: 0,
              y: 0,
              parentLeaf: 'leaf-1',
              cableColor: '#3b82f6', // Blue
              portLabel: `Fa0/${pcCount + phoneCount + i + 1}`
            });
          }

          // 4. IP Kameralar (CCTVs)
          const cameraCount = Math.min(4, localAssets.cameras);
          for (let i = 0; i < cameraCount; i++) {
            const floor = numFloors === 3 ? (i === 0 ? 3 : i <= 2 ? 2 : 1) : numFloors === 2 ? (i < 2 ? 2 : 1) : 1;
            endpoints.push({
              id: `camera-${i+1}`,
              name: `CCTV-Kamera-${i+1}`,
              type: 'camera',
              ip: `10.10.30.${11 + i}`,
              vlan: 'VLAN 30',
              floor,
              x: 0,
              y: 0,
              parentLeaf: 'leaf-2',
              cableColor: '#eab308', // Yellow for PoE Camera
              portLabel: `PoE-Fa0/${i+1}`
            });
          }

          // 5. Wi-Fi Access Points (APs)
          const apCount = Math.min(3, localAssets.wifiAPs);
          for (let i = 0; i < apCount; i++) {
            const floor = numFloors === 3 ? (i === 0 ? 3 : i === 1 ? 2 : 1) : numFloors === 2 ? (i === 0 ? 2 : 1) : 1;
            endpoints.push({
              id: `ap-${i+1}`,
              name: `WiFi-AP-${i+1}`,
              type: 'ap',
              ip: `10.10.40.${11 + i}`,
              vlan: 'VLAN 40',
              floor,
              x: 0,
              y: 0,
              parentLeaf: 'leaf-2',
              cableColor: '#06b6d4', // Cyan for Wireless
              portLabel: `PoE-Fa0/${cameraCount + i + 1}`
            });
          }

          // 6. Endüstriyel OT Cihazları (PLCs / CNCs - Always on Floor 1)
          const plcCount = Math.min(3, localAssets.plcs);
          for (let i = 0; i < plcCount; i++) {
            endpoints.push({
              id: `plc-${i+1}`,
              name: `Siemens-PLC-${i+1}`,
              type: 'plc',
              ip: `10.10.50.${11 + i}`,
              vlan: 'VLAN 50',
              floor: 1,
              x: 0,
              y: 0,
              parentLeaf: 'leaf-3',
              cableColor: '#22c55e', // Green for OT
              portLabel: `IndFa0/${i+1}`
            });
          }

          const cncCount = Math.min(2, localAssets.cncs);
          for (let i = 0; i < cncCount; i++) {
            endpoints.push({
              id: `cnc-${i+1}`,
              name: `Mazak-CNC-${i+1}`,
              type: 'cnc',
              ip: `10.10.50.${31 + i}`,
              vlan: 'VLAN 50',
              floor: 1,
              x: 0,
              y: 0,
              parentLeaf: 'leaf-3',
              cableColor: '#22c55e', // Green for OT
              portLabel: `IndFa0/${plcCount + i + 1}`
            });
          }

          // 7. Sunucular & SAN Depolama (MDF Sistem Odası - Always Floor 1)
          const srvCount = Math.min(3, localAssets.servers);
          for (let i = 0; i < srvCount; i++) {
            endpoints.push({
              id: `server-${i+1}`,
              name: `VM-Host-${i+1} (Dell)`,
              type: 'server',
              ip: `10.10.60.${11 + i}`,
              vlan: 'VLAN 60',
              floor: 1,
              x: 0,
              y: 0,
              parentLeaf: 'leaf-4',
              cableColor: '#1e293b', // Black DAC
              portLabel: `Te1/0/${i+1}`
            });
          }

          if (localAssets.sanStorages > 0) {
            endpoints.push({
              id: `san-storage`,
              name: `iSCSI-SAN (Storage)`,
              type: 'storage',
              ip: `10.10.60.20`,
              vlan: 'VLAN 60',
              floor: 1,
              x: 0,
              y: 0,
              parentLeaf: 'leaf-4',
              cableColor: '#06b6d4', // OM4 Fiber
              portLabel: `Te1/0/10`
            });
          }

          // Dynamic Overlap Prevention positioning logic (sorted by parentLeaf for straight cables!)
          const leafOrder: Record<string, number> = {
            'leaf-1': 1,
            'leaf-2': 2,
            'leaf-3': 3,
            'leaf-4': 4
          };

          for (let f = 1; f <= 3; f++) {
            const floorEps = endpoints.filter(ep => ep.floor === f);
            if (floorEps.length > 0) {
              floorEps.sort((a, b) => {
                const leafDiff = (leafOrder[a.parentLeaf] || 9) - (leafOrder[b.parentLeaf] || 9);
                if (leafDiff !== 0) return leafDiff;
                return a.name.localeCompare(b.name);
              });

              const xStart = 80;
              const xEnd = 1450;
              const count = floorEps.length;

              if (count === 1) {
                floorEps[0].x = 1530 / 2;
              } else {
                const step = (xEnd - xStart) / (count - 1);
                for (let idx = 0; idx < count; idx++) {
                  floorEps[idx].x = Math.round(xStart + idx * step);
                }
              }

              // Perfect centered Y placement
              const yVal = f === 3 ? 525 : f === 2 ? 625 : 735;
              for (let idx = 0; idx < count; idx++) {
                floorEps[idx].y = yVal;
              }
            }
          }

          // Backbone Switches & Routers
          const backboneNodes: Array<{
            id: string;
            name: string;
            type: 'isp' | 'router' | 'firewall' | 'spine' | 'leaf';
            ip: string;
            role: string;
            isBackup: boolean;
            x: number;
            y: number;
            ports: string[];
            vlan?: string;
            desc: string;
          }> = [
            { id: 'isp-1', name: '🌐 ISP-1 Metro Eth (ANA HATTINIZ)', type: 'isp' as const, ip: '85.96.10.42/30', role: 'Birincil Metro Ethernet Internet Girişi', isBackup: false, x: 400, y: 50, ports: ['G0/0/0'], desc: 'Şirketinize atanmış simetrik, garantili ana internet devresi.' },
            ...(isRed ? [{ id: 'isp-2', name: '📡 ISP-2 Radyolink (YEDEK / STANDBY)', type: 'isp' as const, ip: '195.175.2.13/30', role: 'Yedek LTE/Kablosuz Genişbant', isBackup: true, x: 1100, y: 50, ports: ['G0/0/0'], desc: 'Fiziksel fiber kazı kopmalarına karşı anında devreye giren havadan yedek internet altyapısı.' }] : []),
            
            { id: 'router-1', name: '⚙️ Edge-Router-1 (MASTER GATEWAY)', type: 'router' as const, ip: '192.168.100.1', role: 'Sınır Yönlendirici (Cisco/MikroTik)', isBackup: false, x: 450, y: 120, ports: ['G0/0/1', 'G0/0/2'], desc: 'Tüm LAN bacaklarının dış internete NAT/yönlendirmesini sağlayan birincil aktif router.' },
            ...(isRed ? [{ id: 'router-2', name: '⚙️ Edge-Router-2 (YEDEK / VRRP-STANDBY)', type: 'router' as const, ip: '192.168.100.2', role: 'Yedek Sınır Yönlendirici (Active-Passive)', isBackup: true, x: 1050, y: 120, ports: ['G0/0/1', 'G0/0/2'], desc: 'HSRP/VRRP protokolüyle Router-1 çökünce saniyeler içinde trafiği devralan yedek router.' }] : []),

            { id: 'firewall-1', name: '🛡️ NGFW-Firewall-1 (HA ACTIVE)', type: 'firewall' as const, ip: '192.168.1.1', role: 'Yeni Nesil Güvenlik Duvarı (FortiGate)', isBackup: false, x: 450, y: 195, ports: ['Port1 (Outside)', 'Port2 (Inside)'], desc: 'Saldırı engelleme (IPS), antivirüs ve web filtrelemeden sorumlu birincil aktif firewall.' },
            ...(isRed ? [{ id: 'firewall-2', name: '🛡️ NGFW-Firewall-2 (YEDEK / HA PASSIVE)', type: 'firewall' as const, ip: '192.168.1.2', role: 'Yedek Güvenlik Duvarı (Cluster Sync)', isBackup: true, x: 1050, y: 195, ports: ['Port1 (Outside)', 'Port2 (Inside)'], desc: 'FortiGate Clustering protokolü ile anlık oturum senkronizasyonu yapan yedek pasif firewall.' }] : []),

            { id: 'spine-1', name: '🕸️ Core-Spine-1 (MDF CENTRAL)', type: 'spine' as const, ip: '10.0.0.1', role: 'Merkez Omurga L3 Switch', isBackup: false, x: 450, y: 275, ports: ['G1/0/1', 'Te1/1/1'], desc: 'Tüm bina ve üretim katlarındaki dikey optik fiber bacaklarını toplayan Katman-3 omurga anahtarı.' },
            ...(isRed ? [{ id: 'spine-2', name: '🕸️ Core-Spine-2 (YEDEK / STACK)', type: 'spine' as const, ip: '10.0.0.2', role: 'Yedek Omurga Switch (Stack)', isBackup: true, x: 1050, y: 275, ports: ['G1/0/1', 'Te1/1/1'], desc: 'Stack kabloları ile bağlı, birinci anahtarla yedekli çalışan Katman-3 yedek omurga anahtarı.' }] : []),

            // Distribution Leaf Switches
            { id: 'leaf-1', name: '📂 Leaf-1 (Ofis Dağıtım - User PoE+)', type: 'leaf' as const, ip: '10.0.1.1', role: 'User Access Switch (VLAN 10/20)', isBackup: false, x: 250, y: 390, ports: ['Fa0/1 - Fa0/24', 'Gi1/0/1 (Uplink)'], vlan: 'VLAN 10, 20', desc: 'İdari ofislerdeki PC, IP telefon ve ağ yazıcılarını bağlayan ve telefonlara PoE güç veren dağıtım anahtarı.' },
            { id: 'leaf-2', name: '📂 Leaf-2 (IoT Dağıtım - AP & CCTV PoE+)', type: 'leaf' as const, ip: '10.0.2.1', role: 'IoT Access Switch (VLAN 30/40)', isBackup: false, x: 680, y: 390, ports: ['PoE-Fa0/1 - PoE-Fa0/24', 'Gi1/0/1 (Uplink)'], vlan: 'VLAN 30, 40', desc: 'Bina genelindeki IP güvenlik kameraları ve Wi-Fi AP cihazlarına tek hattan güç ve ağ ileten PoE+ anahtar.' },
            ...(otLeafQty > 0 ? [{ id: 'leaf-3', name: '📂 Leaf-3 (Fabrika OT - Industrial Switch)', type: 'leaf' as const, ip: '10.0.3.1', role: 'OT Industrial Switch (VLAN 50)', isBackup: false, x: 1110, y: 390, ports: ['IndFa0/1 - IndFa0/8', 'Gi1/0/1 (Uplink)'], vlan: 'VLAN 50', desc: 'Fabrika sahasındaki PLC ve CNC tezgahlarını endüstriyel standartta bağlayan zırhlı, sarsıntıya dayanıklı IE anahtarı.' }] : []),
            { id: 'leaf-4', name: '📂 Leaf-4 (Server Cabinet - ToR Server Switch)', type: 'leaf' as const, ip: '10.0.4.1', role: 'Top-of-Rack Sanallaştırma Switch (VLAN 60)', isBackup: false, x: 1420, y: 390, ports: ['Te1/0/1 - Te1/0/24 (10G/25G)'], vlan: 'VLAN 60', desc: 'MDF kabinindeki sunucular ve iSCSI SAN depolama ünitesini 10G/25G SFP+ bacaklarla karşılayan yüksek hızlı ToR anahtar.' },
          ];

          // Combine selected item details finder
          const getActiveNodeDetails = () => {
            if (!selectedNode) return null;
            
            // Search in backbone
            const bb = backboneNodes.find(n => n.id === selectedNode);
            if (bb) {
              return {
                id: bb.id,
                name: bb.name,
                ip: bb.ip,
                role: bb.role,
                vlan: bb.vlan || 'Yok (Backbone / Routed)',
                desc: bb.desc,
                cableColor: 'Mavi / Fiber LC Turkuaz',
                isBackup: bb.isBackup,
                guide: bb.type === 'isp' ? 'Servis sağlayıcının getirdiği fiber optik sonlandırma kutusundan (GPON/ONT/Metro modem) gelen bakır Ethernet kablosunu Edge Router WAN portuna bağlayın. IP bloğu statik olarak servis sağlayıcı tarafından atanır.' :
                      bb.type === 'router' ? 'Edge yönlendiricinin LAN bacağını NGFW firewall cihazının WAN1 portuna kırmızı Cat6 kabloyla girin. Yedekli çalışmada, her iki yönlendirici kendi aralarında kalp atışı (keepalive) alışverişi yapar.' :
                      bb.type === 'firewall' ? 'Firewall LAN bacağını Core Spine anahtarlarına bağlayın. HA yapısı için iki firewall arkasındaki Heartbeat portlarını birbirine doğrudan kırmızı Cat6 ile bağlayın ve Active-Passive yapılandırma yükleyin.' :
                      bb.type === 'spine' ? 'Kat anahtarlarından gelen fiber OM4 sonlandırma patch panellerinden, omurganın SFP+ yuvalarına LC-LC turkuaz fiber patch kablolar ve 10G Transceiver kullanarak bağlantı sağlayın. Portları Trunk (802.1Q) olarak tanımlayın.' :
                      'Kat ara kabininden (IDF) gelen Cat6 veya fiber hatları, switchin ana uplink portuna girin. VLAN tanımlamalarını trunk üzerinden geçirin.'
              };
            }

            // Search in endpoints
            const ep = endpoints.find(e => e.id === selectedNode);
            if (ep) {
              return {
                id: ep.id,
                name: ep.name,
                ip: ep.ip,
                role: ep.type === 'pc' ? 'Kullanıcı Masaüstü Bilgisayarı' :
                      ep.type === 'phone' ? 'IP VoIP Telefon Cihazı' :
                      ep.type === 'camera' ? 'IP Güvenlik Kamerası (CCTV)' :
                      ep.type === 'ap' ? 'Kablosuz Erişim Noktası (Wi-Fi AP)' :
                      ep.type === 'printer' ? 'Ağ Yazıcısı' :
                      ep.type === 'plc' ? 'Fabrika Sahası PLC Kontrol Ünitesi' :
                      ep.type === 'cnc' ? 'Endüstriyel CNC Tezgahı' :
                      ep.type === 'server' ? 'Sanal Altyapı ESXi Sunucu Hostu' : 'iSCSI SAN Veri Depolama Ünitesi',
                vlan: ep.vlan,
                desc: `${ep.name} terminal cihazı, ${ep.vlan} ağına bağlıdır. IP adresi ${ep.ip} olarak statik tanımlanmıştır.`,
                cableColor: ep.type === 'pc' || ep.type === 'printer' ? 'Mavi Cat6 UTP (Genel Ofis Veri)' :
                            ep.type === 'phone' ? 'Mor Cat6 UTP (IP Telefon / Voice)' :
                            ep.type === 'camera' ? 'Sarı Cat6 UTP (PoE Güvenlik)' :
                            ep.type === 'ap' ? 'Mavi / Turkuaz Cat6 UTP (Kablosuz)' :
                            ep.type === 'plc' || ep.type === 'cnc' ? 'Yeşil Zırhlı SF/UTP (Endüstriyel Sinyal OT)' :
                            ep.type === 'server' ? 'Siyah DAC SFP+ (10G Kabin İçi)' : 'Turkuaz OM4 LC-LC MultiMode Fiber Optik (10G/25G SAN)',
                isBackup: false,
                guide: ep.type === 'pc' ? 'Masadaki RJ45 duvar prizinden PC ethernet kartına mavi Cat6 patch kablo bağlayın. Duvar prizinin arkası, IDF ara kabinindeki patch panele, oradan da Leaf-1 anahtarının ilgili portuna bağlıdır.' :
                      ep.type === 'phone' ? 'IP telefonun LAN portunu mor Cat6 ile masadaki priz üzerinden Leaf-1 PoE anahtarına bağlayın. IP telefonun arkasındaki PC çıkışından ise kullanıcının bilgisayarına mavi kablo ile köprü atabilirsiniz.' :
                      ep.type === 'camera' ? 'Tavandaki kamera buat kutusundan gelen sarı Cat6 kablosunu Leaf-2 PoE switch portuna takın. Cihaz ek güce ihtiyaç duymadan 48V PoE+ üzerinden beslenip çalışmaya başlayacaktır.' :
                      ep.type === 'ap' ? 'Asma tavan içindeki Access Point bacağını turkuaz/mavi Cat6 kablo yardımıyla Leaf-2 PoE+ switch portuna bağlayın. AP kablosuz sinyal yayınlayarak istemcileri VLAN 40 üzerinden ağa dahil eder.' :
                      ep.type === 'plc' || ep.type === 'cnc' ? 'Elektromanyetik motor parazitlerinden korunmak için yeşil renkli çift örgülü zırhlı SF/UTP kablo kullanın. Kablonun ucunu fabrikanın korunaklı kanalından geçirip Leaf-3 Endüstriyel switch portuna bağlayın.' :
                      ep.type === 'server' ? 'MDF kabini içinde Dell sunucunun arkasındaki SFP+ kartına siyah DAC kablosunu takın. Kablonun diğer ucunu Leaf-4 ToR-1 anahtarına, yedek portunu ise ToR-2 anahtarına çapraz bağlayın. LACP LACP EtherChannel tanımlayın.' :
                      'SAN depolama ünitesinin arkasındaki Controller A/B optik portlarına 10G SFP+ optik modül ve OM4 LC duplex turkuaz fiber kablo takarak ToR switchlerinin optik yuvalarına çapraz bağlayın (çift veri yolu / MPIO yedekliliği).'
              };
            }

            return null;
          };

          const activeNodeDetails = getActiveNodeDetails();

          return (
            <div className="flex flex-col gap-6 w-full">
              
              {/* TOPOLOGY CANVAS CARD (FULL SCREEN WIDTH) */}
              <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-600 uppercase font-bold tracking-widest block">
                      CISCO PACKET TRACER STANDARTLARINDA PROFESYONEL VE NET ŞEMA
                    </span>
                    <h4 className="text-lg font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      🏢 Cisco Tarzı İnteraktif Altyapı & Kablolama Şeması ({numFloors} Katlı Sistem)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-4xl leading-relaxed">
                      Bu şema, envanterinizdeki tüm donanımları ve her bir bilgisayar, IP telefon, yazıcı, kamera, AP, PLC ve sunucuyu **tek tek ayrı birer düğüm (node) olarak** çizmektedir. Cihazlar arasındaki bağlantı bacakları (portlar), VLAN kimlikleri, IP adresleri ve kablo türleri Cisco standartlarına uygun olarak görselleştirilmiştir. 
                      <strong className="text-slate-700 ml-1">Standby/Yedek cihazlar açıkça işaretlenmiştir. Cihazlara tıklayarak detaylı kurulum kılavuzunu altta görebilirsiniz.</strong>
                    </p>
                  </div>
                </div>

                {/* VISUAL BLUEPRINT ENVIRONMENT */}
                <div className="relative border border-slate-200 rounded-2xl bg-slate-50 shadow-md p-4 overflow-x-auto select-none">
                  
                  {/* Subtle Grid overlay for network planning board feeling (Light Edition) */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:30px_30px] opacity-80 pointer-events-none" />

                  {/* Main SVG Vector Canvas containing connections & lines */}
                  <svg width="1530" height="800" className="relative z-10 block">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                      </marker>
                      <linearGradient id="fiberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="50%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#0284c7" />
                      </linearGradient>
                    </defs>

                    {/* PHYSICAL FLOORS SHADED REGIONS (Blueprint style background zones) */}
                    {/* Floor 3 */}
                    {numFloors === 3 && (
                      <g>
                        <rect x="20" y="480" width="1490" height="90" rx="12" fill="#4f46e5" fillOpacity="0.04" stroke="#4f46e5" strokeOpacity="0.12" strokeDasharray="3,3" />
                        <text x="35" y="505" fill="#4f46e5" className="text-[10px] font-mono font-extrabold tracking-wider" opacity="0.9">3. KAT (İDARİ OFİSLER & YÖNETİM ZONU)</text>
                      </g>
                    )}

                    {/* Floor 2 */}
                    {numFloors >= 2 && (
                      <g>
                        <rect x="20" y="580" width="1490" height="90" rx="12" fill="#64748b" fillOpacity="0.04" stroke="#64748b" strokeOpacity="0.12" strokeDasharray="3,3" />
                        <text x="35" y="605" fill="#475569" className="text-[10px] font-mono font-extrabold tracking-wider" opacity="0.9">2. KAT (ÇAĞRI MERKEZİ & OPERASYON ZONU)</text>
                      </g>
                    )}

                    {/* Floor 1 / MDF / OT */}
                    <g>
                      <rect x="20" y="680" width="1490" height="110" rx="12" fill="#0284c7" fillOpacity="0.04" stroke="#0284c7" strokeOpacity="0.15" strokeDasharray="3,3" />
                      <text x="35" y="705" fill="#0369a1" className="text-[10px] font-mono font-extrabold tracking-wider" opacity="0.9">1. KAT (ZEMİN: MDF SİSTEM ODASI, GİRİŞ & FABRİKA SAHASI)</text>
                    </g>

                    {/* WAN CONNECTIONS (ISP -> ROUTER) */}
                    {/* ISP-1 -> Router-1 */}
                    <line x1="400" y1="50" x2="450" y2="120" stroke="#d97706" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_15s_linear_infinite]" markerEnd="url(#arrow)" />
                    {isRed && (
                      <>
                        {/* ISP-2 -> Router-2 */}
                        <line x1="1100" y1="50" x2="1050" y2="120" stroke="#d97706" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_15s_linear_infinite]" markerEnd="url(#arrow)" />
                        {/* Cross ISP Redundancy Lines */}
                        <line x1="400" y1="50" x2="1050" y2="120" stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="5,5" />
                        <line x1="1100" y1="50" x2="450" y2="120" stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="5,5" />
                      </>
                    )}

                    {/* ROUTER -> FIREWALL */}
                    <line x1="450" y1="120" x2="450" y2="195" stroke="#ef4444" strokeWidth="2.5" />
                    {isRed && (
                      <>
                        <line x1="1050" y1="120" x2="1050" y2="195" stroke="#ef4444" strokeWidth="2.5" />
                        {/* Heartbeat sync line between Firewalls */}
                        <line x1="450" y1="195" x2="1050" y2="195" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
                        <text x="750" y="190" fill="#dc2626" textAnchor="middle" className="text-[8px] font-mono font-bold">FW CLUSTER HEARTBEAT (HA SYNC)</text>
                      </>
                    )}

                    {/* FIREWALL -> SPINE CORE */}
                    <line x1="450" y1="195" x2="450" y2="275" stroke="#ef4444" strokeWidth="2.5" />
                    {isRed && (
                      <>
                        <line x1="1050" y1="195" x2="1050" y2="275" stroke="#ef4444" strokeWidth="2.5" />
                        {/* Cross Connection Mesh Router/Firewall */}
                        <line x1="450" y1="195" x2="1050" y2="275" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.4" />
                        <line x1="1050" y1="195" x2="450" y2="275" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.4" />
                      </>
                    )}

                    {/* SPINE CORES -> LEAF ACCESS SWITCHES (High Speed Backbone Fiber Rings - OM4 LC) */}
                    {backboneNodes.filter(b => b.type === 'leaf').map((leaf) => {
                      // Spine 1 to Leaf
                      const s1x = 450, s1y = 275;
                      const s2x = 1050, s2y = 275;
                      return (
                        <g key={`backbone-links-${leaf.id}`}>
                          {/* Spine 1 Link */}
                          <path d={`M ${s1x} ${s1y} Q ${(s1x + leaf.x)/2} ${(s1y + leaf.y)/2 - 30} ${leaf.x} ${leaf.y}`} fill="none" stroke="url(#fiberGrad)" strokeWidth="2.5" />
                          <text x={(s1x + leaf.x)/2} y={(s1y + leaf.y)/2 - 12} fill="#0369a1" className="text-[7.5px] font-mono font-bold text-center" textAnchor="middle">OM4 10G LC</text>
                          
                          {/* Spine 2 Link (only if redundant Spine-2 exists) */}
                          {isRed && (
                            <>
                              <path d={`M ${s2x} ${s2y} Q ${(s2x + leaf.x)/2} ${(s2y + leaf.y)/2 - 30} ${leaf.x} ${leaf.y}`} fill="none" stroke="url(#fiberGrad)" strokeWidth="2.5" strokeDasharray="1,2" />
                              <text x={(s2x + leaf.x)/2} y={(s2y + leaf.y)/2 - 12} fill="#0e7490" className="text-[7.5px] font-mono font-bold text-center" textAnchor="middle">OM4 (YEDEK)</text>
                            </>
                          )}
                        </g>
                      );
                    })}

                    {/* INTERFACE CONNECTIONS: LEAF TO ENDPOINTS */}
                    {endpoints.map((ep) => {
                      const leafNode = backboneNodes.find(b => b.id === ep.parentLeaf);
                      if (!leafNode) return null;

                      // Check if endpoints of higher floor are hidden (based on numFloors setting)
                      if (ep.floor > numFloors) return null;

                      return (
                        <g key={`link-${ep.id}`}>
                          <line
                            x1={leafNode.x}
                            y1={leafNode.y}
                            x2={ep.x}
                            y2={ep.y}
                            stroke={ep.cableColor}
                            strokeWidth={ep.type === 'server' ? '2.5' : ep.type === 'storage' ? '2' : '1.5'}
                            opacity={selectedNode === ep.id || selectedNode === leafNode.id ? '1' : '0.65'}
                          />
                          {/* Animated tiny data flow circles */}
                          <circle r="2.5" fill="#22c55e" opacity="0.8">
                            <animateMotion dur={`${2 + Math.random() * 3}s`} repeatCount="indefinite" path={`M ${leafNode.x} ${leafNode.y} L ${ep.x} ${ep.y}`} />
                          </circle>

                          {/* Port labels styled microscopic */}
                          <text x={ep.x} y={ep.y - 14} fill="#94a3b8" className="text-[6.5px] font-mono font-bold" textAnchor="middle">
                            {ep.portLabel}
                          </text>
                        </g>
                      );
                    })}

                  </svg>

                  {/* DOM NODES (Overlaid using foreignObject for rich CSS styling & clicks) */}
                  <div className="absolute inset-0 pointer-events-none z-20">
                    
                    {/* Render Backbone Devices */}
                    {backboneNodes.map((node) => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node.id)}
                        className={`absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                          selectedNode === node.id
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-110'
                            : 'bg-white border-slate-200 text-slate-800 shadow-sm hover:border-indigo-500 hover:bg-indigo-50/50'
                        }`}
                        style={{
                          left: `${node.x}px`,
                          top: `${node.y}px`,
                          transform: 'translate(-50%, -50%)',
                          width: node.type === 'leaf' ? '170px' : '145px',
                          minHeight: '62px'
                        }}
                      >
                        {/* Device Badge Icons & Indicators */}
                        <div className="flex items-center gap-1.5 justify-center">
                          {node.type === 'isp' && <span className="text-sm">🌐</span>}
                          {node.type === 'router' && <Cpu className={`h-3.5 w-3.5 ${selectedNode === node.id ? 'text-white' : 'text-blue-600'}`} />}
                          {node.type === 'firewall' && <Shield className={`h-3.5 w-3.5 ${selectedNode === node.id ? 'text-white' : 'text-red-600'}`} />}
                          {node.type === 'spine' && <Network className={`h-3.5 w-3.5 ${selectedNode === node.id ? 'text-white' : 'text-cyan-600'}`} />}
                          {node.type === 'leaf' && <Layers className={`h-3.5 w-3.5 ${selectedNode === node.id ? 'text-white' : 'text-indigo-600'}`} />}
                          
                          <span className="text-[9px] font-mono font-bold uppercase truncate max-w-[120px]">
                            {node.id.toUpperCase()}
                          </span>

                          {/* Active / Backup Indicator Dot */}
                          <span className={`w-2 h-2 rounded-full ${node.isBackup ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`} />
                        </div>

                        {/* Title & Technical label */}
                        <span className="text-[9.5px] font-mono block mt-1 font-extrabold truncate max-w-full">
                          {node.name.replace('🌐 ', '').replace('📡 ', '').replace('⚙️ ', '').replace('🛡️ ', '').replace('🕸️ ', '').replace('📂 ', '')}
                        </span>

                        {/* IP Address Label */}
                        <span className={`text-[8.5px] font-mono font-normal block mt-0.5 ${selectedNode === node.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {node.ip}
                        </span>

                        {/* Standby marker */}
                        {node.isBackup && (
                          <span className={`text-[6.5px] font-mono font-extrabold px-1 py-0.2 rounded border mt-0.5 ${
                            selectedNode === node.id ? 'bg-amber-800 text-amber-200 border-amber-600' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            YEDEK / STANDBY
                          </span>
                        )}
                        {node.type === 'leaf' && (
                          <span className={`text-[7px] font-mono font-bold px-1 rounded mt-0.5 ${
                            selectedNode === node.id ? 'bg-indigo-800 text-indigo-200' : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {node.vlan}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Render Endpoint Devices */}
                    {endpoints.map((ep) => {
                      if (ep.floor > numFloors) return null;
                      return (
                        <div
                          key={ep.id}
                          onClick={() => setSelectedNode(ep.id)}
                          className={`absolute pointer-events-auto cursor-pointer flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
                            selectedNode === ep.id
                              ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105'
                              : 'bg-white border-slate-200 text-slate-800 shadow-sm hover:border-blue-500 hover:bg-blue-50/50'
                          }`}
                          style={{
                            left: `${ep.x}px`,
                            top: `${ep.y}px`,
                            transform: 'translate(-50%, -50%)',
                            width: '100px',
                            minHeight: '48px'
                          }}
                        >
                          <div className="flex items-center gap-1 justify-center">
                            {ep.type === 'pc' && <span className="text-xs">💻</span>}
                            {ep.type === 'phone' && <span className="text-xs">📞</span>}
                            {ep.type === 'camera' && <span className="text-xs">📹</span>}
                            {ep.type === 'ap' && <span className="text-xs">📶</span>}
                            {ep.type === 'printer' && <span className="text-xs">🖨️</span>}
                            {ep.type === 'plc' && <span className="text-xs">⚙️</span>}
                            {ep.type === 'cnc' && <span className="text-xs">📟</span>}
                            {ep.type === 'server' && <span className="text-xs">🖥️</span>}
                            {ep.type === 'storage' && <span className="text-xs">💾</span>}

                            <span className="text-[7.5px] font-mono font-bold uppercase truncate">
                              {ep.name}
                            </span>
                          </div>

                          <span className={`text-[8px] font-mono block mt-0.5 font-bold ${selectedNode === ep.id ? 'text-blue-100' : 'text-slate-700'}`}>
                            {ep.ip}
                          </span>
                          
                          <span className={`text-[6.5px] font-mono block font-light ${selectedNode === ep.id ? 'text-blue-200' : 'text-slate-500'}`}>
                            {ep.vlan}
                          </span>
                        </div>
                      );
                    })}

                  </div>

                </div>

                {/* COLOR-CODED CABLES LEGEND (Cisco Packet Tracer Standard) */}
                <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl mt-4 grid grid-cols-2 md:grid-cols-5 gap-3.5 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shrink-0" />
                    <div>
                      <strong className="text-slate-800 block text-[10px]">Mavi Cat6 (VLAN 10)</strong>
                      <span className="text-slate-500 text-[9px] block">İdari & Ofis Bilgisayarları</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shrink-0" />
                    <div>
                      <strong className="text-slate-800 block text-[10px]">Mor Cat6 (VLAN 20)</strong>
                      <span className="text-slate-500 text-[9px] block">IP Telefon / Ses Trafiği</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shrink-0" />
                    <div>
                      <strong className="text-slate-800 block text-[10px]">Sarı Cat6 (VLAN 30)</strong>
                      <span className="text-slate-500 text-[9px] block">PoE IP Güvenlik Kameraları</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shrink-0" />
                    <div>
                      <strong className="text-slate-800 block text-[10px]">Yeşil Cat6 (VLAN 50)</strong>
                      <span className="text-slate-500 text-[9px] block">Endüstriyel OT (PLC/CNC)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shrink-0" />
                    <div>
                      <strong className="text-slate-800 block text-[10px]">Turkuaz OM4 (Fiber)</strong>
                      <span className="text-slate-500 text-[9px] block">10G/40G Backbone Linkler</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* LEVEL 2: DETAILED INTERACTION & FIELD TECHNICIAN GUIDELINES */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
                
                {/* Selected Node Interface Port Config (7 cols) */}
                <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                      <Settings className="h-4 w-4 text-blue-600 animate-spin" /> ⚙️ SEÇİLEN PORT VE VLAN YAPILANDIRMASI (CISCO IOS STYLE)
                    </h4>

                    {activeNodeDetails ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-[10px] font-mono text-indigo-400 block">SEÇİLEN CİHAZ VE ROLÜ</span>
                            <strong className="text-sm font-extrabold tracking-wider block mt-0.5">{activeNodeDetails.name}</strong>
                            <span className="text-[11px] text-slate-400 block mt-0.5">{activeNodeDetails.role}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-emerald-400 block">STATİK IP ADRESİ</span>
                            <span className="text-sm font-mono font-bold text-emerald-400 block mt-0.5">{activeNodeDetails.ip}</span>
                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono border border-indigo-900 inline-block mt-1">
                              {activeNodeDetails.vlan}
                            </span>
                          </div>
                        </div>

                        {/* Cisco Config Codeblock Simulation */}
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Cisco CLI Port Yapılandırma Komutları</span>
                          <div className="bg-slate-950 text-slate-300 p-4 rounded-xl font-mono text-[10.5px] border border-slate-800 shadow-inner leading-relaxed">
                            <div className="text-slate-500 select-none">! Cihaz arayüz yapılandırma moduna giriş</div>
                            <div>{activeNodeDetails.id.startsWith('leaf') || activeNodeDetails.id.startsWith('spine') ? (
                              <>
                                <div><span className="text-indigo-400">Switch#</span> configure terminal</div>
                                <div><span className="text-indigo-400">Switch(config)#</span> interface GigabitEthernet 1/0/12</div>
                                <div><span className="text-indigo-400">Switch(config-if)#</span> description {activeNodeDetails.role.toUpperCase()} BAGLANTISI</div>
                                <div><span className="text-indigo-400">Switch(config-if)#</span> switchport mode access</div>
                                <div><span className="text-indigo-400">Switch(config-if)#</span> switchport access vlan {activeNodeDetails.vlan.includes('10') ? '10' : activeNodeDetails.vlan.includes('20') ? '20' : activeNodeDetails.vlan.includes('30') ? '30' : activeNodeDetails.vlan.includes('50') ? '50' : '60'}</div>
                                {activeNodeDetails.vlan.includes('20') && <div><span className="text-indigo-400">Switch(config-if)#</span> switchport voice vlan 20</div>}
                                <div><span className="text-indigo-400">Switch(config-if)#</span> spanning-tree portfast</div>
                                <div><span className="text-indigo-400">Switch(config-if)#</span> no shutdown</div>
                                <div><span className="text-indigo-400">Switch(config-if)#</span> end</div>
                                <div><span className="text-indigo-400">Switch#</span> write memory</div>
                              </>
                            ) : activeNodeDetails.id.startsWith('router') ? (
                              <>
                                <div><span className="text-blue-400">Router#</span> configure terminal</div>
                                <div><span className="text-blue-400">Router(config)#</span> interface GigabitEthernet 0/0/1</div>
                                <div><span className="text-blue-400">Router(config-if)#</span> description LAN BACAGI GATEWAY</div>
                                <div><span className="text-blue-400">Router(config-if)#</span> ip address {activeNodeDetails.ip} 255.255.255.0</div>
                                <div><span className="text-blue-400">Router(config-if)#</span> standby 1 ip {activeNodeDetails.ip.replace('.1', '.254').replace('.2', '.254')}</div>
                                <div><span className="text-blue-400">Router(config-if)#</span> standby 1 priority {activeNodeDetails.isBackup ? '95' : '105'}</div>
                                <div><span className="text-blue-400">Router(config-if)#</span> standby 1 preempt</div>
                                <div><span className="text-blue-400">Router(config-if)#</span> no shutdown</div>
                                <div><span className="text-blue-400">Router(config-if)#</span> end</div>
                              </>
                            ) : (
                              <>
                                <div><span className="text-emerald-400">Router#</span> ip dhcp pool OFIS_HAVUZU</div>
                                <div><span className="text-emerald-400">Router(dhcp-config)#</span> network 10.10.10.0 255.255.255.0</div>
                                <div><span className="text-emerald-400">Router(dhcp-config)#</span> default-router 10.10.10.1</div>
                                <div><span className="text-emerald-400">Router(dhcp-config)#</span> dns-server 8.8.8.8 1.1.1.1</div>
                              </>
                            )}</div>
                          </div>
                        </div>

                        <div>
                          <strong className="text-slate-800 block text-xs">Donanım Analizi & Amaç:</strong>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {activeNodeDetails.desc}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <Compass className="h-8 w-8 text-slate-300 mb-2 animate-bounce" />
                        <strong className="text-slate-600 block text-xs">İnteraktif Port Dedektörü Aktif!</strong>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">
                          Cisco şemasındaki herhangi bir bilgisayara, switch'e, kameraya veya telefona tıklayarak **o cihazın bacak bağlantılarını, VLAN numaralarını ve Cisco port CLI komutlarını** anında burada inceleyin!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-[11px] text-indigo-800 flex items-start gap-2 font-mono">
                    <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>IP Adresleme Standartları:</strong> Şirket ağında IP çakışmalarını sıfıra indirmek için sunucular, yazıcılar ve anahtarlar .1 ile .99 arasındaki bloklardan statik olarak el ile yapılandırılır. Kullanıcı bilgisayarları ve telefonlar ise DHCP havuzundan otomatik IP alırlar.
                    </div>
                  </div>
                </div>

                {/* Field Technician Physical Guide (5 cols) */}
                <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                      <Cable className="h-4 w-4 text-emerald-600" /> 🛠️ SAHA TEKNİSYENİ KURULUM & BAĞLANTI REHBERİ
                    </h4>

                    {activeNodeDetails ? (
                      <div className="space-y-4">
                        <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl">
                          <strong className="text-emerald-800 block text-xs mb-1">🔌 Hangi Kablo ve Nasıl Bağlanacak?</strong>
                          <div className="text-xs text-emerald-700 leading-relaxed font-sans space-y-2">
                            <div>
                              <span className="font-bold">Önerilen Kablo Türü:</span> {activeNodeDetails.cableColor}
                            </div>
                            <p className="mt-1 text-[11.5px]">
                              {activeNodeDetails.guide}
                            </p>
                          </div>
                        </div>

                        {/* Step-by-Step Commissioning in Field */}
                        <div>
                          <strong className="text-slate-800 block text-xs mb-1.5">Saha Devreye Alma ve Test Adımları:</strong>
                          <div className="space-y-2">
                            <div className="flex gap-2 items-start text-xs text-slate-600">
                              <span className="bg-indigo-50 text-indigo-600 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                              <span>Fiziksel kabloyu switch portuna ve cihazın Ethernet portuna sıkıca oturtun. Klik sesini ve RJ45 tırnağının kilitlendiğini duyun.</span>
                            </div>
                            <div className="flex gap-2 items-start text-xs text-slate-600">
                              <span className="bg-indigo-50 text-indigo-600 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                              <span>Switch üzerindeki ilgili portun LED ışığının önce turuncu, STP (Spanning Tree) onayından sonra sabit yeşil yandığını teyit edin.</span>
                            </div>
                            <div className="flex gap-2 items-start text-xs text-slate-600">
                              <span className="bg-indigo-50 text-indigo-600 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                              <span>Cihaz konsolundan veya arayüzünden ağ geçidine ping atın (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">ping 10.10.x.1</code>). Paket kaybının %0 olduğunu doğrulayın.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <Cable className="h-8 w-8 text-slate-300 mb-2" />
                        <strong className="text-slate-600 block text-xs">Fiziksel Kurulum Asistanı Aktif!</strong>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">
                          Yukarıdaki Cisco ağ şemasından kurulumunu yapacağınız herhangi bir donanıma tıklayın, sahadaki teknisyeninize **birebir kablolama talimatlarını** anında verelim!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-[11px] text-emerald-800 font-mono">
                    💡 <span className="font-bold">Öneri:</span> Sahadaki teknisyenin her kabloyu çektikten sonra bir etiketleme makinesi ile kablonun iki ucuna da switch port kodunu (örn: <code className="bg-white px-1 py-0.2 rounded font-mono">L1-P14</code>) yazması arıza anında müdahale süresini %90 kısaltır.
                  </div>
                </div>

              </div>

            </div>
          );
        })()}

        {/* ======================================= */}
        {/* B. DETAILED BOM & BUDGET LIST SUBTAB */}
        {designerSubTab === 'budget' && (
          <div className="flex flex-col gap-6">
            
            {/* Budget Limit Slider / Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                <div>
                  <h4 className="text-xs font-mono font-bold text-blue-600 flex items-center gap-1.5 uppercase">
                    <Zap className="h-4 w-4 text-amber-500" /> TOPLAM PROJE GİDERLERİ VE MALİYET DENETLEME SİSTEMİ
                  </h4>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Donanım sınıfına, yedeklilik ayarlarına ve envanter adetlerinize göre hesaplanan Bill of Materials (BOM) listesi.</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-inner">
                  <span className="text-xs font-bold text-slate-600">Bütçe Sınırı (USD):</span>
                  <input
                    type="range"
                    min="15000"
                    max="250000"
                    step="5000"
                    value={localBudgetLimit}
                    onChange={(e) => setLocalBudgetLimit(Number(e.target.value))}
                    className="w-32 md:w-48 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                  />
                  <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 border border-slate-200 rounded shadow-sm">
                    ${localBudgetLimit.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress limit bar */}
              <div>
                <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                  <span className="text-slate-500">Hesaplanan Proje Maliyeti:</span>
                  <span className={isOverBudget ? 'text-red-600' : 'text-emerald-600'}>
                    ${totalCost.toLocaleString()} ({budgetUsagePercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner flex">
                  <div
                    style={{ width: `${budgetUsagePercent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-emerald-500 to-blue-600'
                    }`}
                  />
                </div>
                {isOverBudget ? (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 font-semibold flex items-center gap-2 font-sans shadow-sm">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    Maliyet bütçeyi ${ (totalCost - localBudgetLimit).toLocaleString() } aşıyor! Üst panelden 'Donanım Sınıfı'nı 'Ekonomik' olarak seçebilir veya envanteri küçültebilirsiniz.
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-2 font-sans shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Proje maliyeti bütçe sınırları içerisindedir. Gönül rahatlığıyla satın alma ve kurulum aşamasına geçebilirsiniz!
                  </div>
                )}
              </div>
            </div>

            {/* Bill of Materials Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 font-mono text-[10px] text-slate-600">
                    <th className="p-3.5">Donanım Kategori</th>
                    <th className="p-3.5">Önerilen Profesyonel Ürün</th>
                    <th className="p-3.5 text-center">Birim Fiyat</th>
                    <th className="p-3.5 text-center">Miktar</th>
                    <th className="p-3.5 text-right">Toplam Fiyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Router */}
                  <tr>
                    <td className="p-3.5 font-semibold">İnternet Yönlendiricisi (Router)</td>
                    <td className="p-3.5 text-blue-600 font-mono font-bold">
                      {hw.router.model}
                      <span className="block text-[10px] text-slate-400 font-normal font-sans mt-0.5">{hw.router.desc}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono">${hw.router.price.toLocaleString()}</td>
                    <td className="p-3.5 text-center font-mono font-semibold">{routerQty}</td>
                    <td className="p-3.5 text-right font-mono font-bold">${(hw.router.price * routerQty).toLocaleString()}</td>
                  </tr>

                  {/* Firewall */}
                  <tr>
                    <td className="p-3.5 font-semibold">NGFW Güvenlik Duvarı (HA)</td>
                    <td className="p-3.5 text-blue-600 font-mono font-bold">
                      {hw.firewall.model}
                      <span className="block text-[10px] text-slate-400 font-normal font-sans mt-0.5">{hw.firewall.desc}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono">${hw.firewall.price.toLocaleString()}</td>
                    <td className="p-3.5 text-center font-mono font-semibold">{firewallQty}</td>
                    <td className="p-3.5 text-right font-mono font-bold">${(hw.firewall.price * firewallQty).toLocaleString()}</td>
                  </tr>

                  {/* Spine Switch */}
                  {spineQty > 0 && (
                    <tr>
                      <td className="p-3.5 font-semibold">L3 Omurga Switch (Core Spine)</td>
                      <td className="p-3.5 text-blue-600 font-mono font-bold">
                        {hw.spine.model}
                        <span className="block text-[10px] text-slate-400 font-normal font-sans mt-0.5">{hw.spine.desc}</span>
                      </td>
                      <td className="p-3.5 text-center font-mono">${hw.spine.price.toLocaleString()}</td>
                      <td className="p-3.5 text-center font-mono font-semibold">{spineQty}</td>
                      <td className="p-3.5 text-right font-mono font-bold">${(hw.spine.price * spineQty).toLocaleString()}</td>
                    </tr>
                  )}

                  {/* User Leaf Switches */}
                  <tr>
                    <td className="p-3.5 font-semibold">Ofis Kullanıcı Dağıtım Switch (Leaf)</td>
                    <td className="p-3.5 text-blue-600 font-mono font-bold">
                      {hw.userLeaf.model}
                      <span className="block text-[10px] text-slate-400 font-normal font-sans mt-0.5">{hw.userLeaf.desc}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono">${hw.userLeaf.price.toLocaleString()}</td>
                    <td className="p-3.5 text-center font-mono font-semibold">{userLeafQty}</td>
                    <td className="p-3.5 text-right font-mono font-bold">${(hw.userLeaf.price * userLeafQty).toLocaleString()}</td>
                  </tr>

                  {/* PoE Leaf Switches */}
                  <tr>
                    <td className="p-3.5 font-semibold">IP Kamera & AP PoE Dağıtım Switch</td>
                    <td className="p-3.5 text-blue-600 font-mono font-bold">
                      {hw.poeLeaf.model}
                      <span className="block text-[10px] text-slate-400 font-normal font-sans mt-0.5">{hw.poeLeaf.desc}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono">${hw.poeLeaf.price.toLocaleString()}</td>
                    <td className="p-3.5 text-center font-mono font-semibold">{poeLeafQty}</td>
                    <td className="p-3.5 text-right font-mono font-bold">${(hw.poeLeaf.price * poeLeafQty).toLocaleString()}</td>
                  </tr>

                  {/* OT Switches */}
                  {otLeafQty > 0 && (
                    <tr>
                      <td className="p-3.5 font-semibold">Endüstriyel OT Saha Switch</td>
                      <td className="p-3.5 text-blue-600 font-mono font-bold">
                        {hw.otLeaf.model}
                        <span className="block text-[10px] text-slate-400 font-normal font-sans mt-0.5">{hw.otLeaf.desc}</span>
                      </td>
                      <td className="p-3.5 text-center font-mono">${hw.otLeaf.price.toLocaleString()}</td>
                      <td className="p-3.5 text-center font-mono font-semibold">{otLeafQty}</td>
                      <td className="p-3.5 text-right font-mono font-bold">${(hw.otLeaf.price * otLeafQty).toLocaleString()}</td>
                    </tr>
                  )}

                  {/* Servers */}
                  <tr>
                    <td className="p-3.5 font-semibold">Hypervisor Sanallaştırma Sunucusu</td>
                    <td className="p-3.5 text-blue-600 font-mono font-bold">
                      {hw.server.model}
                      <span className="block text-[10px] text-slate-400 font-normal font-sans mt-0.5">{hw.server.desc}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono">${hw.server.price.toLocaleString()}</td>
                    <td className="p-3.5 text-center font-mono font-semibold">{serverQty}</td>
                    <td className="p-3.5 text-right font-mono font-bold">${(hw.server.price * serverQty).toLocaleString()}</td>
                  </tr>

                  {/* SAN Storage */}
                  {storageQty > 0 && (
                    <tr>
                      <td className="p-3.5 font-semibold">iSCSI SAN Merkezi Veri Depolama</td>
                      <td className="p-3.5 text-blue-600 font-mono font-bold">
                        {hw.storage.model}
                        <span className="block text-[10px] text-slate-400 font-normal font-sans mt-0.5">{hw.storage.desc}</span>
                      </td>
                      <td className="p-3.5 text-center font-mono">${hw.storage.price.toLocaleString()}</td>
                      <td className="p-3.5 text-center font-mono font-semibold">{storageQty}</td>
                      <td className="p-3.5 text-right font-mono font-bold">${(hw.storage.price * storageQty).toLocaleString()}</td>
                    </tr>
                  )}

                  {/* Rack */}
                  <tr>
                    <td className="p-3.5 font-semibold">Premium Perfore Ağ Kabineti</td>
                    <td className="p-3.5 text-blue-600 font-mono font-bold">{hw.rack.model}</td>
                    <td className="p-3.5 text-center font-mono">${hw.rack.price.toLocaleString()}</td>
                    <td className="p-3.5 text-center font-mono font-semibold">{rackQty}</td>
                    <td className="p-3.5 text-right font-mono font-bold">${(hw.rack.price * rackQty).toLocaleString()}</td>
                  </tr>

                  {/* Cables Estimate */}
                  <tr>
                    <td className="p-3.5 font-semibold">Kablolama Altyapısı (Cat6, OM4 Fiber, SFP+ DAC)</td>
                    <td className="p-3.5 text-slate-600">
                      Ofis içi dikey ve yatay tüm bağlantı kabloları:
                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                        {cat6BlueQty}x Mavi Cat6, {cat6YellowQty}x Sarı Cat6, {cat6GreenQty}x Yeşil Cat6, {dacBlackQty}x SFP+ DAC, {fiberOM4Qty}x OM4 Fiber
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono">-</td>
                    <td className="p-3.5 text-center font-mono">-</td>
                    <td className="p-3.5 text-right font-mono font-bold">${cableCosts.toLocaleString()}</td>
                  </tr>

                  {/* Optic SFP+ Modules */}
                  <tr>
                    <td className="p-3.5 font-semibold">Fiber Optik SFP+ Lazer Transceiver Modülleri</td>
                    <td className="p-3.5 text-slate-600">
                      Switch Uplink portları için {opticTransceiverQty} adet fiber modül.
                    </td>
                    <td className="p-3.5 text-center font-mono">-</td>
                    <td className="p-3.5 text-center font-mono">-</td>
                    <td className="p-3.5 text-right font-mono font-bold">${opticCosts.toLocaleString()}</td>
                  </tr>

                  {/* Patch Panels */}
                  <tr>
                    <td className="p-3.5 font-semibold">Cat6 RJ45 24-Port Patch Paneller</td>
                    <td className="p-3.5 text-slate-600">
                      Kabin içi kablo sonlandırma panelleri ({Math.max(1, Math.ceil(patchPanelCat6Ports/24))} adet).
                    </td>
                    <td className="p-3.5 text-center font-mono">-</td>
                    <td className="p-3.5 text-center font-mono">-</td>
                    <td className="p-3.5 text-right font-mono font-bold">${patchPanelCosts.toLocaleString()}</td>
                  </tr>

                  {/* Labor */}
                  <tr className="bg-slate-50/50">
                    <td className="p-3.5 font-semibold text-slate-800">Uçtan Uca Sertifikasyon & Kurulum İşçiliği</td>
                    <td className="p-3.5 text-slate-500 italic">Etiketleme, Fluke Testi ve Devreye Alma Hizmetleri</td>
                    <td className="p-3.5 text-center font-mono">-</td>
                    <td className="p-3.5 text-center font-mono">-</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-800">${laborCost.toLocaleString()}</td>
                  </tr>

                  {/* TOTAL SUM */}
                  <tr className="bg-slate-900 text-white font-extrabold text-sm">
                    <td className="p-4" colSpan={3}>TOPLAM PROJE SATIN ALMA BEDELİ (BOM BEDELİ)</td>
                    <td className="p-4 text-center font-mono font-extrabold">-</td>
                    <td className="p-4 text-right font-mono text-blue-400 font-extrabold">${totalCost.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* C. ALL INVENTORY PRODUCTS - EDUCATIONAL GUIDE (Sıfırdan Öğrenenler İçin Eğitim Kılavuzu) */}
        {designerSubTab === 'components' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-blue-900 flex items-center gap-2 mb-2 font-sans">
                <Compass className="h-5 w-5 text-blue-600" /> SIFIRDAN ÖĞRENİM: TÜM ENVANTER ÜRÜNLERİNİN GÖREVLERİ VE GEREKLİLİKLERİ
              </h3>
              <p className="text-xs text-blue-700 leading-relaxed font-sans">
                Bir kurumsal ağ mimarisinde kullanılan tüm donanımlar süs veya rastgele seçim değildir. Her cihaz, veri trafiğinin güvenli, hızlı ve kesintisiz akmasını sağlayan hayati birer dişlidir. Aşağıda, projenizde seçtiğiniz her bir envanter ürününün neden var olduğunu ve ne işe yaradığını tane tane öğrenebilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* 1. Edge Router */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                      <Compass className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Ağ Giriş Kapısı</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">Sınır Yönlendirici (Edge Router)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Şirketinizin yerel ağını (LAN) dış internet dünyasına (WAN) bağlayan akıllı kavşaktır. İnternet servis sağlayıcıdan (ISP) gelen ham internet sinyalini alır, IP paketlerini yönlendirir, NAT (Network Address Translation) yaparak iç ağdaki yüzlerce bilgisayarı tek bir genel IP üzerinden internete çıkartır. Yedekli internet hatları (Fiber + Radyolink) arasında otomatik yük dengelemesi (Load Balancing) ve hat kopmasında standby hatta otomatik geçiş (Failover) işlemlerini yönetir.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-rose-700 font-mono">
                  📌 Router Olmasaydı: İçerideki hiçbir cihaz internet paketlerinin nereye gideceğini bilemezdi.
                </div>
              </div>

              {/* 2. NGFW Firewall */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                      <Shield className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Siber Kalkan</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">Yeni Nesil Güvenlik Duvarı (NGFW)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Sınır yönlendiricinin hemen arkasında duran zırhlı kapı muhafızıdır. Geleneksel güvenlik duvarlarından farkı, paketleri sadece IP/port düzeyinde değil, Katman-7 uygulama düzeyinde incelemesidir (Deep Packet Inspection). Şirket içine sızmaya çalışan fidye yazılımlarını (Ransomware), virüsleri ve dış saldırıları anında bloklar. Çalışanların zararlı sitelere girmesini engeller (Web Filtering) ve şirket dışından sisteme bağlanacak personeller için şifreli, güvenli tüneller (IPSec/SSL VPN) oluşturur.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-red-700 font-mono">
                  📌 Firewall Olmasaydı: Ağınız hacker saldırılarına ve zararlı yazılımlara tamamen açık kalırdı.
                </div>
              </div>

              {/* 3. Core Spine Switch */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Network className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Merkezi Omurga</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">Omurga Switch (Core L3 Switch)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Tüm kurumsal ağın merkezi sinir sistemidir. Katlardan gelen dikey optik fiber kabloları üzerinde toplar. Ofis bilgisayarları, kameralar, sunucular ve fabrika makineleri arasındaki farklı sanal ağları (VLAN) Katman-3 seviyesinde saniyede milyarlarca paket hızıyla yönlendirir (Inter-VLAN Routing). Switch'ler arasında döngü (loop) oluşmasını Spanning Tree (STP) protokolü ile önler.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-blue-700 font-mono">
                  📌 Omurga Olmasaydı: Katlar arası ve VLAN'lar arası trafik saniyeler içinde kilitlenir ve çökerdi.
                </div>
              </div>

              {/* 4. User Leaf Switch */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                      <Zap className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Ofis Dağıtım</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">Ofis Dağıtım Switch'i (Leaf-1)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> İdari kadronun, muhasebe, HR ve satış departmanlarının bulunduğu ofis alanlarına port kapasitesi sağlar. Masaüstü bilgisayarlar, IP Telefonlar ve ağ yazıcıları doğrudan bu switch'e bağlanır. IP telefonlar için ek bir prize gerek bırakmadan, Cat6 kablosu üzerinden hem enerji hem de ses verisi iletir (PoE). Ofis trafiğini diğer riskli ağlardan (CCTV veya fabrika makineleri) yalıtarak güvenli VLAN 10 ve VLAN 20 sınırlarına hapseder.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-amber-700 font-mono">
                  📌 Ofis Switch'i Olmasaydı: Masalardaki onlarca bilgisayarı sisteme bağlayacak fiziksel port bulamazdınız.
                </div>
              </div>

              {/* 5. PoE Switch */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Layers className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">IoT & CCTV Güç Deposu</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">Yüksek Güçlü PoE+ IoT Switch (Leaf-2)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Bina genelindeki yüksek çözünürlüklü IP güvenlik kameraları (CCTV) ve tavan tipi çift bantlı Wi-Fi Access Point (AP) cihazlarını beslemek için özel olarak tasarlanmıştır. Bu cihazlar yüksek akım (PoE+ 30W) çekerler. Standart bir switch bu gücü veremez. Aynı zamanda, kameralardan gelen devasa video yayın akışının (multicast stream), normal kullanıcıların bilgisayarlarını yavaşlatmaması için CCTV trafiğini izole bir VLAN 30 ağında tutarak ağın şişmesini engeller.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-emerald-700 font-mono">
                  📌 PoE Switch Olmasaydı: Tavandaki her bir kamera ve AP için ayrı bir elektrik hattı çekmeniz gerekirdi.
                </div>
              </div>

              {/* 6. OT Industrial Switch */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Zırhlı Endüstriyel</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">Endüstriyel Saha Switch'i (Leaf-3)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Fabrika sahası, atölye veya tozlu üretim hollerindeki zorlu şartlara dayanıklı zırhlı donanımdır. Fansız metal kasasıyla -40°C ila +75°C sıcaklıklarda, yoğun toz, nem, titreşim ve yüksek elektromanyetik parazit (kaynak makineleri vb.) altında tıkır tıkır çalışır. DIN-Ray montajlıdır. Fabrika sahasındaki akıllı PLC ünitelerini ve CNC tezgahlarını sisteme bağlar ve endüstriyel ağ protokollerini (Profinet, Modbus) gecikmesiz iletir.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-purple-700 font-mono">
                  📌 Endüstriyel Switch Olmasaydı: Toz ve sıcaklık yüzünden normal ofis switchleri 3 günde yanardı.
                </div>
              </div>

              {/* 7. Virtualization Server */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg">
                      <ServerIcon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Sanal Beyinler</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">Sanal Sunucu Donanımı (Hypervisor Host)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Şirketinizin ERP yazılımı, muhasebe veritabanları, Active Directory kimlik doğrulama sistemi, SQL sunucuları ve yerel dosya paylaşım gibi hayati servisleri üzerinde çalıştıran çok güçlü fiziksel bilgisayardır. İçine kurulan VMware ESXi veya Hyper-V gibi yazılımlar sayesinde, bu tek güçlü donanım üzerinde 15-20 adet ayrı işletim sistemi (sanal makine) birbirini etkilemeden bağımsız ve yüksek verimlilikle çalışabilir.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-cyan-700 font-mono">
                  📌 Sunucu Olmasaydı: Her bir kurumsal yazılım için ayrı ayrı 15 adet fiziksel kasa satın almanız gerekirdi.
                </div>
              </div>

              {/* 8. SAN Storage */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
                      <Database className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Merkezi Disk Havuzu</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">iSCSI SAN Depolama Ünitesi (Storage)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Sanal sunucuların işletim sistemi disklerini ve şirketin tüm ERP/veritabanı verilerini üzerinde barındıran çok yüksek hızlı ve yedekli disk çekmecesidir (iSCSI SAN). Sunucuların kendi içinde disk barındırması yerine veriler burada tek havuzda toplanır. Sunucular ile Storage arasında ultra hızlı optik fiber kablolar (10G/25G SFP+) çekilir. Böylece sanal sunuculardan biri yansa dahi, diğer sağlam sunucu anında Storage'daki diske bağlanıp sistemi kesintisiz çalıştırmaya devam eder (VMware HA / Canlı Göç).
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-teal-700 font-mono">
                  📌 Storage Olmasaydı: Sunucu yandığında içindeki tüm veriler ve ERP sistemi günlerce kurtarılamazdı.
                </div>
              </div>

              {/* 9. Smart PDU & UPS */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                      <Activity className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Akıllı Enerji</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">Akıllı PDU ve Çift Güç Ünitesi</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Sistem odası kabinetindeki tüm aktif cihazlara kesintisiz ve dengeli elektrik dağıtan akıllı priz grubudur. Şebekedeki dalgalanmaları filtreler, sıcaklık ve nem sensörleriyle kabin içi ortamı izler. En önemli görevi, her prizin enerjisini ağ üzerinden uzaktan açıp kapatabilmesidir. Böylece kilitlenen bir sunucu veya switch'i, sistem odasına gitmeden uzaktan resetleyip (Power Cycle) anında kurtarabilirsiniz. Çift besleme ile UPS-1 ve UPS-2 sistemlerine çapraz bağlanır.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-orange-700 font-mono">
                  📌 Akıllı PDU Olmasaydı: Kilitlenen bir cihazı kapatıp açmak için gece yarısı fabrikaya gitmek zorunda kalırdınız.
                </div>
              </div>

              {/* 10. Modbus Gateway */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                      <Settings className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">OT Protokol Çevirici</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">Modbus TCP Gateway (Protokol Dönüştürücü)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Fabrika sahasındaki eski tip seri haberleşme (RS-485/RS-232 Modbus RTU) kullanan sayaçlar, PLC'ler, sensörler ve iklimlendirme üniteleri ile modern ethernet tabanlı (Modbus TCP) ağlar arasında çift yönlü köprü kuran akıllı tercümandır. Seri sinyalleri TCP/IP paketlerine sararak LAN üzerindeki SCADA kontrol yazılımlarına veya sunuculara gecikmesiz ulaştırır.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-amber-700 font-mono">
                  📌 Modbus Gateway Olmasaydı: Eski nesil endüstriyel cihazların verilerini SCADA yazılımına aktaramazdınız.
                </div>
              </div>

              {/* 11. Kabinet Rack (Cabinet Chassis) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-slate-50 text-slate-600 rounded-lg">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Fiziksel Zırh</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">42U Dikili Tip Sistem Odası Kabineti (Rack Cabinet)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Sistem odasındaki tüm değerli aktif ve pasif donanımları (Sunucular, Switch'ler, Depolama üniteleri vb.) 19 inç montaj standardında fiziksel olarak düzenleyen, koruyan ve soğutan metal zırhlı kafestir. Kilitli ön/arka cam kapıları ile yetkisiz fiziksel müdahaleleri engellerken, dikey kablo düzenleyicileri ile kablolama karmaşasını bitirir. Sismik ayakları ile sarsıntılara direnir ve fan grupları ile kabin içi hava sirkülasyonu sağlar.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-700 font-mono">
                  📌 Kabinet Olmasaydı: Tüm değerli cihazlarınız masa üstlerinde üst üste yığılır, kablolar karışır ve aşırı ısınarak yanardı.
                </div>
              </div>

              {/* 12. Kullanıcı Cihazları (PC, Phone, Printer, AP) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                      <LayoutGrid className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Kullanıcı Terminalleri</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">Kullanıcı Ağ Donanımları (PC, IP-Phone, AP & Yazıcı)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Kurumsal personelin günlük operasyonlarını gerçekleştirdiği uç noktalardır. **Ofis PC'leri** doğrudan veri üretip işlerken, **IP Telefonlar** analog ses sinyallerini sayısallaştırıp ayrı bir ses sanal ağında (VLAN 20) taşır. **Wi-Fi Access Point'ler** tavan tipi montaj ile tüm ofise yüksek hızlı, kesintisiz kablosuz kapsama alanı (VLAN 40) sunar. **Yazıcılar** ise ağ üzerinden paylaşılarak merkezi çıktı işlerini yönetir.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-sky-700 font-mono">
                  📌 Kullanıcı Cihazları Olmasaydı: Personellerin sisteme, internete ve kurumsal sunuculara erişeceği fiziksel arayüzleri kalmazdı.
                </div>
              </div>

              {/* 13. CCTV Kamera & IoT Donanımları */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Eye className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Fiziksel Güvenlik</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">IP Güvenlik Kameraları & PoE IoT Terminal Cihazları</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Fabrika, ofis ve sistem odası gibi kritik fiziksel alanların 7/24 görsel olarak gözetlenmesini ve güvenliğini sağlayan gözlerdir. IP kameralar yüksek çözünürlüklü video yayın akışlarını (H.265 multicast stream) doğrudan Leaf-2 PoE+ switch portlarına gönderir ve ek bir elektrik adaptörüne ihtiyaç duymadan PoE (Power over Ethernet) hattından beslenir. Trafikleri, ağın diğer kısımlarını yavaşlatmaması için VLAN 30'da tutulur.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-emerald-700 font-mono">
                  📌 IP Kameralar Olmasaydı: Fabrika sahası fiziksel kör noktalarla dolar ve güvenlik açıkları izlenemezdi.
                </div>
              </div>

              {/* 14. Endüstriyel OT Cihazları (PLC & CNC) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Zap className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Üretim Sahası OT</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 mb-1.5 font-sans">Endüstriyel Saha PLC Kontrol & CNC Tezgah Üniteleri</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    <strong className="text-slate-700">Neden Gerekli?</strong> Fabrika üretim hattındaki fiziksel makineleri, robotik kolları, CNC torna ve bükme tezgahlarını, montaj bantlarını yöneten donanımlardır. **Siemens PLC'ler** anlık sensör verilerini ve mekanik hareketleri kontrol ederken, **Mazak CNC tezgahları** merkezi sunuculardan aldıkları CAD/CAM tasarım dosyalarını fiziksel ürüne dönüştürür. Ağ bağlantıları endüstriyel standartta izole bir sanal ağda (VLAN 50) tutulur ve şoklara dayanıklı zırhlı kablolarla Leaf-3 endüstriyel switchine bağlanır.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-indigo-700 font-mono">
                  📌 OT Donanımları Olmasaydı: Üretim bantları manuel çalışmak zorunda kalır ve akıllı fabrika otomasyonu kurulamazdı.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* D. STEP BY STEP INSTALLATION CHECKLIST - 16 DETAILED STEPS */}
        {designerSubTab === 'checklist' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h4 className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                <CheckSquare className="h-5 w-5 text-emerald-500" /> SIFIRDAN ADIM ADIM PROFESYONEL AG KURULUM REHBERİ (16 ADIM)
              </h4>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
                ANSI/TIA-568 STANDARTLARINDA
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-5 font-sans leading-relaxed">
              Hiçbir ağ veya donanım bilgisi olmayan bir saha montajcısının veya teknisyenin dahi sıfırdan takip ederek, bir fabrikada veya holding binasında hatasız, cisco standartlarında bir altyapı kurmasını sağlayacak eksiksiz kurulum kılavuzu:
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              
              {/* SOL SÜTUN: FİZİKSEL VE ALTYAPI KURULUMU (1-8) */}
              <div className="space-y-4">
                <div className="p-3 font-mono font-bold text-slate-700 bg-slate-100/70 border-l-4 border-slate-400 rounded">
                  ETAP I: FİZİKSEL HAZIRLIK & YAPISAL ALTYAPI
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <strong className="text-slate-800 text-xs block mb-1 font-sans">Saha Keşfi, Çevre ve İklimlendirme Hazırlığı:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      MDF Sistem odası olarak kullanılacak alanı belirleyin. Toz sızdırmazlığı sağlayın ve odayı kilitli kapı ile güvenceye alın. Kurulacak tüm donanımların çekeceği toplam ısıyı (BTU) hesaplayarak, odadaki sıcaklığı sürekli 18°C - 21°C aralığında sabit tutacak en az iki adet yedekli hassas klima montajını tamamlayın.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <strong className="text-slate-800 text-xs block mb-1 font-sans">MDF Kabinet Sismik Montajı ve Bakır Topraklama:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      42U boyutundaki dikili tip sistem odası (MDF) kabinetini, beton zemin üzerine sismik sabitleme ayakları ve çelik dübeller kullanarak deprem sarsıntılarına karşı sabitleyin. Kabinin metal şasisini, odadaki ana bakır topraklama barasına en az 16mm² kalınlığında sarı-yeşil bakır örgü kabloyla irtibatlandırın.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">3</div>
                  <div>
                    <strong className="text-slate-800 text-xs block mb-1 font-sans">Güç Kaynağı, UPS ve Çift Akıllı PDU Montajı:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      Kabinet içine kesintisiz güç kaynaklarını (UPS) monte edin. Kabinin sağ ve sol dikey sütunlarına dikey tip Akıllı PDU-A ve Akıllı PDU-B'yi yerleştirin. PDU-A'yı UPS-1'e, PDU-B'yi UPS-2'ye (veya doğrudan şebekeye) bağlayarak sistem odasında tam faz yedekliliği sağlayın.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">4</div>
                  <div>
                    <strong className="text-slate-800 text-xs block mb-1 font-sans">Donanımların Kabin Layout'una Göre Dizilmesi (Ağır-Hafif):</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      Ağırlık merkezini aşağıda tutmak için ağır donanımları kabinin en alt yuvalarına yerleştirin: Akü grupları (1U-4U), VMware Sunucuları ve SAN depolama ünitesi (5U-10U). Göz hizasına L3 Omurga Switch'leri ve ToR switch'leri monte edin (20U-25U). Kabinin en üst kısmına ise hafif olan fiber organizerleri, Cat6 patch panelleri, Router ve Firewall cihazlarını koyun (30U-42U).
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">5</div>
                  <div>
                    <strong className="text-slate-800 text-xs block mb-1 font-sans">Yapısal Yatay Kablolama ve Patch Panel Sonlandırma:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      Katlardan gelen tüm yatay Cat6 LSZH bakır ağ kablolarını sırayla soyun ve RJ45 Patch Panellerin arkasındaki pinlere Krone çakma aletiyle T568B standardına sadık kalarak çakın. Katlar arasındaki dikey omurga bağlantısını sağlayan çok damarlı OM4 zırhlı fiber optik hatları ise Fiber Sonlandırma Kutularında (F/O Patch Panel) füzyon ek cihazı ile sonlandırın.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">6</div>
                  <div>
                    <strong className="text-slate-800 text-xs block mb-1 font-sans">Kablo Renk Kodlaması ve Kanal İçi Dağıtım Standardı:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      Karmaşayı önlemek için kablo renk standardını uygulayın: Ofis bilgisayarları için MAVİ Cat6, IP Telefonlar için MOR, Güvenlik Kameraları için SARI, Fabrika OT makineleri için YEŞİL kablolar kullanın. Kablo tavalarında güç kablolarını sağ taraftan, veri kablolarını sol taraftan geçirin; birbirlerine asla paralel ve bitişik bağlamayın.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">7</div>
                  <div>
                    <strong className="text-slate-800 text-xs block mb-1 font-sans">Masaüstü ve Saha Priz Gruplarının Keystone Sonlandırması:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      Ofis alanlarındaki sıva altı, sıva üstü veya masa üstü buat gruplarında Cat6 kablo uçlarını T568B standardında RJ45 Keystone Jack'lar ile sonlandırın. Her prizi benzersiz bir kod ile etiketleyin (Örn: F2-OF12-P1) ve RJ45 ağ prizlerinin sarsıntıda çıkmayacak şekilde sıkı oturduğunu test edin.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">8</div>
                  <div>
                    <strong className="text-slate-800 text-xs block mb-1 font-sans">IDF Kat Kabinlerinin Konumlandırılması ve Kat İçi Dağıtım:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      Binanın 2. ve 3. katlarında 12U veya 16U boyutunda duvar tipi kat kabinetleri (IDF) konumlandırın. MDF ana sistem odasından katlara gelen dikey optik fiber kabloları buralardaki fiber patch panellerde sonlandırıp kat içi kenar switchlerin (Leaf-1/2) uplink bağlantılarına hazır hale getirin.
                    </span>
                  </div>
                </div>
              </div>

              {/* SAĞ SÜTUN: ELEKTRİK, BAĞLANTI VE AKTİF CİHAZ YÖNETİMİ (9-16) */}
              <div className="space-y-4">
                <div className="p-3 font-mono font-bold text-slate-700 bg-slate-100/70 border-l-4 border-slate-400 rounded">
                  ETAP II: GÜÇ, AKTİF DONANIM, YEDEKLİLİK & GÜVENLİK
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">9</div>
                  <div>
                    <strong className="text-slate-800 text-xs block mb-1 font-sans">Çapraz Elektrik Bağlantıları ve PSU Yedekliliği:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      Çift güç kaynağına (Redundant PSU) sahip sunucuların, SAN depolamanın, Router ve Firewall cihazlarının birinci güç kaynağı kablosunu (PSU-1) dikey PDU-A priz grubuna takın. İkinci yedek güç kaynağı kablosunu (PSU-2) ise karşı taraftaki dikey PDU-B priz grubuna takarak elektriksel kesintisizlik sağlayın.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">10</div>
                  <div>
                    <strong className="text-slate-800 text-xs block mb-1 font-sans">MDF - IDF Omurga Fiber Optik Uplink Bağlantıları:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      L3 Omurga Switch portlarına ve katlardaki dağıtım switch uplink portlarına 10G/25G SFP+ transistör modüllerini takın. Modüller arasına LC-LC OM4 fiber patch kabloları bağlayın. Fiber kabloyu kabin içinde bükmeyin; kıvrım yarıçapının 30 mm'den az olmamasına (fiberin kırılmaması için) dikkat edin.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">11</div>
                  <div>
                    <strong className="text-slate-800 text-xs block mb-1 font-sans">Aktif Cihazların İlk Boot Testi ve Konsol Girişi:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      Cihazlara ilk elektriği vererek fanların çalışmasını ve ön paneldeki STATUS/SYS ledlerinin yeşile dönmesini izleyin. RJ45-to-USB Cisco konsol kablosunu bilgisayarınıza bağlayıp terminal emülatörü (Putty/SecureCRT) ile 9600 baud (veya cihazın standardına göre 115200) hızında aktif cihazların işletim sistemine (IOS-XE/FortiOS) bağlanın.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">12</div>
                  <div>
                    <strong className="text-slate-800 text-xs block mb-1 font-sans">802.1Q Trunk, VLAN'lar ve Spanning-Tree Yapılandırması:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      Uplink portlarını 802.1Q standardında TRUNK port olarak işaretleyin. Switchler üzerinde VLAN 10, 20, 30, 40, 50, 60 tanımlarını yapın. Switchler arasında yayın fırtınalarını engellemek için Rapid Spanning Tree (RSTP) veya MSTP yapılandırmasını kurun. Kullanıcıların bağlı olduğu uç portlarda Spanning-Tree PortFast ayarını açarak cihazların saniyeler içinde IP almasını sağlayın.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">13</div>
                  <div>
                    <strong className="text-slate-800 block mb-1 text-xs font-sans">HA Yedeklilik, LACP Bağlantıları ve VRRP/BGP Kurulumu:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      ToR Server Switch'leri arasında vPC (Virtual Port Channel) senkronizasyonunu ve peer-link bağlantısını kurun. Sunuculardan gelen 10G bacakları LACP (802.3ad) ile birleştirerek 20Gbps bant genişliği elde edin. Sınır Router'lar arasında VRRP/HSRP ağ geçidi yedekliliğini ve dışarıda BGP / OSPF dinamik yönlendirme protokollerini kurarak hat kopmalarına karşı tam yedekliliği aktifleştirin.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">14</div>
                  <div>
                    <strong className="text-slate-800 block mb-1 text-xs font-sans">OT/Saha Modbus Gateway ve IP Dağıtım Konfigürasyonu:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      Leaf-3 endüstriyel switch'e bağlı Modbus Gateway cihazlarının seri port ayarlarını (9600 baud, 8-N-1, RTU) ve IP adreslerini yapılandırın. PLC ve CNC cihazlarından gelen Modbus RTU sinyallerini Modbus TCP protokolüne dönüştürerek SCADA sunucusuyla kesintisiz iletişimlerini test edin.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">15</div>
                  <div>
                    <strong className="text-slate-800 block mb-1 text-xs font-sans">Port Güvenliği (802.1X / MAC Binding) ve Güvenlik Duvarı Kural Sıkılaştırması:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      Switch portlarında yetkisiz cihazların ağa sızmasını engellemek amacıyla MAC port güvenliğini (MAC binding) veya 802.1X IEEE kimlik doğrulamayı aktif edin. NGFW Güvenlik Duvarı üzerinde sadece izinli portların (HTTPS, SSH, SQL vb.) geçişine izin veren katı kurallar yazın, saldırı tespit sistemini (IPS) devreye alın.
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">16</div>
                  <div>
                    <strong className="text-slate-800 block mb-1 text-xs font-sans">Fluke Sertifikasyonu, Kalıcı Etiketleme ve Yapılandırma Yedeği:</strong>
                    <span className="text-slate-500 block leading-relaxed text-[11px] font-sans">
                      Tüm bakır ve fiber hatları Fluke DSX-8000 test cihazıyla test ederek standart sertifikasyon raporlarını (.pdf) çıkartın. Her kablonun iki ucunu da şemaya göre etiketleyin (Örn: FL1-MDF-P17-to-SW1-P1). Tüm cihazların çalışan konfigürasyonlarını kalıcı hafızaya kaydedin (`write memory` veya `copy run start`) ve harici bir TFTP/git sunucusuna yedekleyin.
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
