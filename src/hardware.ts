export type HardwareCategory =
  | 'router' | 'firewall' | 'spine' | 'userLeaf' | 'poeLeaf'
  | 'otLeaf' | 'server' | 'storage' | 'ap' | 'pdu' | 'rack';

export type HardwareTier = 'economic' | 'medium' | 'premium' | 'ultra';

export interface HardwareProduct {
  id: string;
  brand: string;
  model: string;
  category: HardwareCategory;
  tier: HardwareTier;
  price: number; // USD
  ports: string;
  throughput?: string;
  desc: string;
  whySelected: string;
  specs?: Record<string, string>;
}

export const HARDWARE_CATALOG: HardwareProduct[] = [
  // ─────────────────────── ROUTERS ───────────────────────
  {
    id: 'router-mikrotik-ccr2004', brand: 'MikroTik', model: 'Cloud Core Router CCR2004-16G-2S+',
    category: 'router', tier: 'economic', price: 1100,
    ports: '16x 1G RJ45, 2x 10G SFP+', throughput: '10 Gbps',
    desc: 'RouterOS tabanlı çift WAN ve NAT destekli bütçe yönlendirici.',
    whySelected: 'Lisans maliyeti olmadan BGP, OSPF, MPLS ve NAT ile küçük işletme internet çıkışı.',
    specs: { CPU: '4-Core ARM 1.4GHz', RAM: '4 GB', Flash: '128 MB', PoE: 'Hayır' }
  },
  {
    id: 'router-mikrotik-ccr2116', brand: 'MikroTik', model: 'Cloud Core Router CCR2116-12G-4S+',
    category: 'router', tier: 'economic', price: 1950,
    ports: '12x 1G RJ45, 4x 10G SFP+', throughput: '120 Gbps',
    desc: 'Yüksek çekirdek sayılı MikroTik omurga yönlendirici.',
    whySelected: 'Daha ağır trafik yükünde ISP düzeyi BGP tam tablo (full-route) tutma kapasitesi.',
    specs: { CPU: '16-Core Annapurna Alpine AL21400 1.8GHz', RAM: '16 GB', Flash: '128 MB', PoE: 'Hayır' }
  },
  {
    id: 'router-cisco-c8300', brand: 'Cisco', model: 'Catalyst 8300-1N1S-4T2X',
    category: 'router', tier: 'medium', price: 4500,
    ports: '4x 1G/10G Combo, 2x 10G SFP+', throughput: '25 Gbps',
    desc: 'SD-WAN ve BGP destekli kurumsal şube yönlendirici.',
    whySelected: 'Cisco SD-WAN/Viptela entegrasyonu ile çift ISP yük dengeleme ve otomatik failover.',
    specs: { CPU: 'Multi-Core x86', RAM: '8 GB', Flash: '32 GB eMMC', 'SD-WAN': 'Evet' }
  },
  {
    id: 'router-cisco-c8500', brand: 'Cisco', model: 'Catalyst 8500L-8S4X',
    category: 'router', tier: 'medium', price: 8500,
    ports: '8x 1G SFP, 4x 10G SFP+', throughput: '100 Gbps',
    desc: 'Büyük şube ve WAN aggregation için yüksek bant genişlikli router.',
    whySelected: 'Çok şubeli holding yapılarında merkezi WAN hub ve SD-WAN kontrolör entegrasyonu.',
    specs: { CPU: 'Multi-Core x86 64-bit', RAM: '16 GB', 'MPLS': 'Evet', 'SD-WAN': 'Evet' }
  },
  {
    id: 'router-cisco-isr4431', brand: 'Cisco', model: 'ISR 4431/K9',
    category: 'router', tier: 'premium', price: 12000,
    ports: '4x Modüler NIM Yuvası, 2x Built-in GbE', throughput: '2 Gbps',
    desc: 'Donanımsal IPSec/SSL şifreleme kartlı kurumsal modüler WAN yönlendirici.',
    whySelected: 'Yüksek şifreleme iş yükü, VOIP, SD-WAN ve çoklu WAN arayüzü ihtiyacı için.',
    specs: { CPU: 'Cisco UADP 2.0 ASIC', RAM: '8 GB', 'ISM Yuvası': '2x', 'NIM Yuvası': '4x' }
  },
  {
    id: 'router-cisco-asr1002', brand: 'Cisco', model: 'ASR 1002-HX',
    category: 'router', tier: 'premium', price: 24000,
    ports: '4x 10G SFP+, 2x 100G QSFP28', throughput: '60 Gbps',
    desc: 'Veri merkezi çıkışı için 100G destekli yüksek erişilebilirlik router.',
    whySelected: 'BGP full-route table ve yüksek bant genişliği gerektiren büyük ölçekli WAN çıkışı.',
    specs: { 'RP': 'Çift ESP60', 'Failover': 'Sub-second NSF/SSO', MPLS: 'Evet' }
  },
  {
    id: 'router-juniper-srx345', brand: 'Juniper', model: 'SRX345 Services Gateway',
    category: 'router', tier: 'premium', price: 14000,
    ports: '16x GbE, 4x SFP', throughput: '5 Gbps',
    desc: 'Junos OS ile bütünleşik router+security services gateway.',
    whySelected: 'Juniper ekosisteminde yönetilen şube WAN sonlandırma ve UTM entegrasyonu.',
    specs: { OS: 'Junos 21.x+', IPS: 'Evet', MPLS: 'Evet', RAM: '4 GB' }
  },
  {
    id: 'router-fortinet-fr100g', brand: 'Fortinet', model: 'FortiGate Rugged 100G',
    category: 'router', tier: 'medium', price: 5800,
    ports: '4x WAN GbE, 16x LAN GbE, 2x SFP', throughput: '8 Gbps Firewall',
    desc: 'Dayanıklı, bütünleşik UTM+Router combo.',
    whySelected: 'FortiGuard lisansıyla Unified Threat Management + çift WAN failover.',
    specs: { 'Çalışma Sıcaklığı': '-40°C / +70°C', 'IPS Throughput': '2.5 Gbps', VPN: 'IPSec + SSL' }
  },

  // ─────────────────────── FIREWALLS ───────────────────────
  {
    id: 'fw-fortinet-40f', brand: 'Fortinet', model: 'FortiGate 40F',
    category: 'firewall', tier: 'economic', price: 950,
    ports: '5x GE RJ45 (1 WAN+4 LAN)', throughput: '5 Gbps FW',
    desc: 'SME için temel UTM, VPN ve web filtreleme güvenlik duvarı.',
    whySelected: 'Küçük ofislerde düşük TCO ile IPS, antivirus, web filtreleme ve SSL-VPN.',
    specs: { 'FW Throughput': '5 Gbps', 'IPS Throughput': '1 Gbps', 'SSL-VPN': '200 tünel', 'HA': 'Active-Passive' }
  },
  {
    id: 'fw-fortinet-60f', brand: 'Fortinet', model: 'FortiGate 60F',
    category: 'firewall', tier: 'economic', price: 1200,
    ports: '10x GE RJ45, 2x SFP', throughput: '10 Gbps FW',
    desc: 'Daha büyük küçük ofis segmenti için genişletilmiş port sayılı NGFW.',
    whySelected: '50-100 kullanıcılı SME ortamında tam UTM + DMZ segmentasyonu.',
    specs: { 'FW Throughput': '10 Gbps', 'IPS Throughput': '1.4 Gbps', 'Eş Zamanlı Bağlantı': '700K' }
  },
  {
    id: 'fw-fortinet-80f', brand: 'Fortinet', model: 'FortiGate 80F',
    category: 'firewall', tier: 'medium', price: 2600,
    ports: '8x GE RJ45, 2x Shared Media SFP', throughput: '20 Gbps FW',
    desc: 'HA kümesi destekli orta ölçekli NGFW.',
    whySelected: 'Active-Passive HA ile kesintisiz hizmet ve gelişmiş Katman-7 denetimi.',
    specs: { 'FW Throughput': '20 Gbps', 'NGFW Throughput': '1.8 Gbps', HA: 'Active-Passive/Active-Active', Users: '~200' }
  },
  {
    id: 'fw-fortinet-100f', brand: 'Fortinet', model: 'FortiGate 100F',
    category: 'firewall', tier: 'medium', price: 4200,
    ports: '22x GE RJ45, 4x 10G SFP+', throughput: '40 Gbps FW',
    desc: 'Yüksek bant genişlikli kurumsal NGFW + SD-WAN.',
    whySelected: '200-500 kullanıcılı kurumsal ağlarda tam NGFW, SSL-deep inspection ve SD-WAN.',
    specs: { 'FW Throughput': '40 Gbps', 'SSL İnceleme': '1.3 Gbps', 'VPN Tüneli': '2500', Users: '~500' }
  },
  {
    id: 'fw-fortinet-400e', brand: 'Fortinet', model: 'FortiGate 400E',
    category: 'firewall', tier: 'premium', price: 18000,
    ports: '12x GE RJ45, 8x 10G SFP+, 2x 40G QSFP+', throughput: '160 Gbps FW',
    desc: 'Büyük kurumsal ve veri merkezi çevre güvenliği için yüksek kapasiteli NGFW.',
    whySelected: 'Büyük holding ve veri merkezi perimeter security; yüksek eş zamanlı bağlantı.',
    specs: { 'FW Throughput': '160 Gbps', 'NGFW': '22 Gbps', 'Eş Zamanlı Bağlantı': '12M', HA: 'A-A/A-P' }
  },
  {
    id: 'fw-fortinet-600f', brand: 'Fortinet', model: 'FortiGate 600F',
    category: 'firewall', tier: 'premium', price: 28000,
    ports: '18x 10G SFP+, 4x 25G SFP28', throughput: '230 Gbps FW',
    desc: 'NP7 ASIC donanımsal hızlandırmalı enterprise datacenter NGFW.',
    whySelected: 'Veri merkezi bant genişliği için NP7 ASIC ile donanımsal IPS ve şifreleme.',
    specs: { 'FW Throughput': '239 Gbps', 'IPS': '30 Gbps', NP7: 'Evet', 'SSL Decrypt': '55 Gbps' }
  },
  {
    id: 'fw-paloalto-pa820', brand: 'Palo Alto', model: 'PA-820',
    category: 'firewall', tier: 'medium', price: 7500,
    ports: '8x GbE, 4x SFP', throughput: '1.9 Gbps App-ID',
    desc: 'Single-Pass mimarili Palo Alto Networks NGFW.',
    whySelected: 'Uygulama bazlı Katman-7 filtreleme (App-ID) ve WildFire bulut sandbox analizi.',
    specs: { 'Threat Prevention': '1.8 Gbps', 'VPN': '1.4 Gbps', WildFire: 'Evet', GlobalProtect: 'Evet' }
  },
  {
    id: 'fw-paloalto-pa1410', brand: 'Palo Alto', model: 'PA-1410',
    category: 'firewall', tier: 'premium', price: 18000,
    ports: '4x 10G SFP+, 12x 1G SFP', throughput: '5.2 Gbps App-ID',
    desc: 'Active-Active HA destekli orta ölçekli datacenter NGFW.',
    whySelected: 'Sıfır milisaniye failover ile kritik veri merkezi çevre güvenliği ve Panorama yönetimi.',
    specs: { 'FW Throughput': '10 Gbps', HA: 'Active-Active', 'Panorama': 'Evet', 'URL Filtering': 'Evet' }
  },
  {
    id: 'fw-paloalto-pa3410', brand: 'Palo Alto', model: 'PA-3410',
    category: 'firewall', tier: 'ultra', price: 38000,
    ports: '8x 10G SFP+, 4x 25G SFP28, 2x 100G', throughput: '15 Gbps App-ID',
    desc: 'Yüksek kapasiteli datacenter NGFW Palo Alto CDSS entegrasyonu ile.',
    whySelected: 'Büyük ölçekli veri merkezi ve kampüs çevre güvenliği için yüksek throughput.',
    specs: { 'FW Throughput': '26 Gbps', 'ML-Powered': 'Evet', 'CDSS': 'Evet' }
  },
  {
    id: 'fw-cisco-ftd4100', brand: 'Cisco', model: 'Firepower 4110 FTD',
    category: 'firewall', tier: 'premium', price: 28000,
    ports: '8x 10G SFP+, 2x 40G QSFP', throughput: '10 Gbps',
    desc: 'Cisco Secure Firewall Threat Defense tabanlı yüksek kapasiteli NGFW.',
    whySelected: 'Cisco DNA ve SecureX entegrasyonu ile bütünleşik kurumsal güvenlik operasyonu.',
    specs: { IPS: '10 Gbps', 'FirePOWER Servisleri': 'Evet', SecureX: 'Evet', FMC: 'Gerekli' }
  },
  {
    id: 'fw-checkpoint-1600', brand: 'Check Point', model: 'Quantum Spark 1600',
    category: 'firewall', tier: 'medium', price: 5500,
    ports: '8x GbE, 2x SFP', throughput: '3.5 Gbps',
    desc: 'Check Point Infinity Architecture uyumlu SMB/mid-market NGFW.',
    whySelected: 'Check Point Smart Console merkezi yönetimi ile çoklu site güvenlik politikası.',
    specs: { 'Threat Prevention': '700 Mbps', Sandbox: 'SandBlast', 'Mgmt': 'Smart-1 Cloud' }
  },

  // ─────────────────────── SPINE / CORE SWITCHES ───────────────────────
  {
    id: 'spine-cisco-nexus93180', brand: 'Cisco', model: 'Nexus 93180YC-FX3',
    category: 'spine', tier: 'premium', price: 24000,
    ports: '48x 10G/25G SFP28 + 6x 100G QSFP28', throughput: '3.6 Tbps',
    desc: 'VXLAN EVPN destekli veri merkezi Leaf-Spine omurgası.',
    whySelected: 'Leaf-Spine mimarisinde VXLAN overlay, EVPN multi-tenancy ve otomatik provisioning.',
    specs: { Latency: '2.1 µs', Buffer: '40 MB', VXLAN: 'Evet', 'EVPN': 'Evet' }
  },
  {
    id: 'spine-cisco-nexus9300gx', brand: 'Cisco', model: 'Nexus 9300-GX2',
    category: 'spine', tier: 'ultra', price: 48000,
    ports: '64x 100G QSFP28 + 2x 400G QSFP-DD', throughput: '12.8 Tbps',
    desc: 'Hyperscale datacenter 400G omurgası.',
    whySelected: 'En büyük veri merkezlerinde yüksek yoğunluk 100G/400G bağlantısı.',
    specs: { Buffer: '56 MB Shared', Latency: '<1 µs', BFD: 'Evet', MPLS: 'Evet' }
  },
  {
    id: 'spine-arista-7050cx3', brand: 'Arista', model: '7050CX3-32S',
    category: 'spine', tier: 'premium', price: 22000,
    ports: '32x 100G QSFP28 + 2x 10G SFP+', throughput: '6.4 Tbps',
    desc: 'Arista EOS ile programlanabilir cloud-native omurga.',
    whySelected: 'CloudVision otomasyonu ve EVPN/VXLAN ile tam telemetri.',
    specs: { EOS: 'Evet', CloudVision: 'Evet', Latency: '1.2 µs', Buffer: '32 MB' }
  },
  {
    id: 'spine-cisco-9300l48', brand: 'Cisco', model: 'Catalyst 9300L-48T-4G',
    category: 'spine', tier: 'medium', price: 7000,
    ports: '48x 1G RJ45 + 4x 10G SFP+ Uplink', throughput: '480 Gbps',
    desc: 'Kurumsal kampüs ağı için L3 yönlendirmeli omurga switch.',
    whySelected: 'Cisco DNA Center ve StackWise-480 ile kampüs L3 omurga yedekliliği.',
    specs: { StackWise: '480 Gbps', DNA: 'Evet', L3: 'Tam IPv4/IPv6', PoE: 'Opsiyonel' }
  },
  {
    id: 'spine-hpe-cx10000', brand: 'HPE Aruba', model: 'CX 10000',
    category: 'spine', tier: 'premium', price: 35000,
    ports: '32x 100G QSFP28', throughput: '6.4 Tbps',
    desc: 'DPU tabanlı akıllı programlanabilir Aruba veri merkezi omurgası.',
    whySelected: 'Aruba ESP + ClearPass entegrasyonu ile akıllı ağ segmentasyonu ve güvenlik.',
    specs: { DPU: 'AMD Pensando', eBPF: 'Evet', ClearPass: 'Entegrasyon', Mikrosegmentasyon: 'Evet' }
  },
  {
    id: 'spine-juniper-qfx5120', brand: 'Juniper', model: 'QFX5120-48Y',
    category: 'spine', tier: 'premium', price: 28000,
    ports: '48x 25G SFP28 + 8x 100G QSFP28', throughput: '4.3 Tbps',
    desc: 'Junos OS tabanlı EVPN/VXLAN destekli veri merkezi omurgası.',
    whySelected: 'Juniper Apstra ile intent-based networking ve otomatik konfigürasyon doğrulama.',
    specs: { OS: 'Junos', Apstra: 'Entegrasyon', Latency: '< 1 µs', Buffer: '64 MB' }
  },
  {
    id: 'spine-cisco-9300-48s', brand: 'Cisco', model: 'Catalyst 9300-48S',
    category: 'spine', tier: 'medium', price: 9500,
    ports: '48x GbE SFP + 4x 10G SFP+ Uplink', throughput: '520 Gbps',
    desc: 'SFP tabanlı kurumsal optik fiber kampüs omurga switch.',
    whySelected: 'Tam optik fiber altyapısında Catalyst 9000 serisinin çekirdek bileşeni.',
    specs: { Fiber: 'Tüm Portlar SFP', OSPF: 'Evet', BGP: 'Evet', QoS: '8 Kuyruk' }
  },

  // ─────────────────────── USER LEAF / DAĞITIM SWITCH ───────────────────────
  {
    id: 'leaf-ubiquiti-usw48poe', brand: 'Ubiquiti', model: 'UniFi USW-48-PoE Gen2',
    category: 'userLeaf', tier: 'economic', price: 950,
    ports: '48x GbE PoE+ (600W) + 4x 10G SFP+', throughput: '70 Gbps',
    desc: 'UniFi Controller ile bulut yönetimli 48 portlu yönetilebilir PoE switch.',
    whySelected: 'Küçük ve orta ofislerde düşük TCO ile VLAN, PoE ve bulut yönetim.',
    specs: { PoE: '600W Toplam', UniFi: 'Tam Entegrasyon', VLAN: '802.1Q', L3: 'Statik Yönlendirme' }
  },
  {
    id: 'leaf-cisco-9200l48p', brand: 'Cisco', model: 'Catalyst 9200L-48P-4G',
    category: 'userLeaf', tier: 'medium', price: 2900,
    ports: '48x GbE PoE+ (740W) + 4x 1G SFP', throughput: '176 Gbps',
    desc: 'Cisco DNA Center yönetimli stackable kurumsal kat dağıtım switch.',
    whySelected: 'Cisco SD-Access ve 802.1X NAC entegrasyonu ile tam kurumsal güvenlik.',
    specs: { PoE: '740W', DNA: 'Evet', '802.1X': 'Evet', Stack: 'StackWise' }
  },
  {
    id: 'leaf-cisco-9200l48pg', brand: 'Cisco', model: 'Catalyst 9200L-48PG-4X',
    category: 'userLeaf', tier: 'medium', price: 3600,
    ports: '48x GbE PoE+ + 4x 10G SFP+', throughput: '176 Gbps',
    desc: '10G uplink destekli geliştirilmiş Catalyst 9200L.',
    whySelected: '10G uplink gerektiren yüksek bant genişlikli kat dağıtım noktaları için.',
    specs: { Uplink: '4x 10G SFP+', PoE: '740W', DNA: 'Evet' }
  },
  {
    id: 'leaf-cisco-9300-48u', brand: 'Cisco', model: 'Catalyst 9300-48U',
    category: 'userLeaf', tier: 'premium', price: 5800,
    ports: '48x GbE UPoE (90W/port) + 4x 25G SFP28', throughput: '256 Gbps',
    desc: 'Wi-Fi 7 AP ve akıllı aydınlatma destekli 90W UPoE premium switch.',
    whySelected: 'Wi-Fi 7 AP (60W+) ve yüksek güç gerektiren uç noktalar için geleceğe hazır.',
    specs: { UPoE: '90W/Port', Uplink: '25G SFP28', MACsec: 'Evet', DNA: 'Evet' }
  },
  {
    id: 'leaf-aruba-2930f48', brand: 'HPE Aruba', model: '2930F 48G PoE+ 4SFP+',
    category: 'userLeaf', tier: 'medium', price: 2200,
    ports: '48x GbE PoE+ + 4x 10G SFP+', throughput: '104 Gbps',
    desc: 'ClearPass NAC entegreli Aruba kurumsal PoE switch.',
    whySelected: 'Aruba ESP ekosistemi ile kimlik tabanlı ağ erişim denetimi (NAC).',
    specs: { ClearPass: 'Tam Entegrasyon', PoE: '740W', Uplink: '4x 10G', 'Dynamic Segmentation': 'Evet' }
  },
  {
    id: 'leaf-cisco-1000-48fp', brand: 'Cisco', model: 'Catalyst 1000-48FP-4G-L',
    category: 'userLeaf', tier: 'economic', price: 1450,
    ports: '48x GbE PoE+ (740W) + 4x 1G SFP', throughput: '104 Gbps',
    desc: 'Yönetilebilir ama DNA lisansı gerektirmeyen giriş seviyesi Cisco switch.',
    whySelected: 'Cisco DNA Center gerektirmeyen daha küçük bütçeli kurumsal alanlar için.',
    specs: { PoE: '740W', VLAN: '255', STP: 'RSTP/MSTP', L3: 'Statik' }
  },
  {
    id: 'leaf-hpe-1920s24poe', brand: 'HPE', model: 'OfficeConnect 1920S 24G PoE+',
    category: 'userLeaf', tier: 'economic', price: 680,
    ports: '24x GbE PoE+ + 2x 1G SFP', throughput: '52 Gbps',
    desc: 'Küçük işletme için uygun fiyatlı yönetilebilir PoE switch.',
    whySelected: 'Bütçe kısıtlı küçük ofis veya şube noktaları için temel VLAN ve PoE.',
    specs: { PoE: '195W', VLAN: '802.1Q', STP: 'RSTP', WebGUI: 'Evet' }
  },

  // ─────────────────────── POE LEAF (KAMERA & AP) ───────────────────────
  {
    id: 'poe-ubiquiti-usw24poe', brand: 'Ubiquiti', model: 'UniFi USW-24-PoE',
    category: 'poeLeaf', tier: 'economic', price: 420,
    ports: '24x GbE PoE (260W) + 2x 1G SFP', throughput: '26 Gbps',
    desc: 'IP kamera ve AP için bütçe dostu bulut yönetimli PoE switch.',
    whySelected: 'Kamera ve AP VLAN segmentasyonu için düşük maliyetli UniFi ekosistemi.',
    specs: { PoE: '260W Toplam', UniFi: 'Evet', VLAN: 'Evet', PoEStandard: '802.3af/at' }
  },
  {
    id: 'poe-cisco-9200l24p', brand: 'Cisco', model: 'Catalyst 9200L-24P-4G',
    category: 'poeLeaf', tier: 'medium', price: 1950,
    ports: '24x GbE PoE+ + 4x 1G SFP', throughput: '96 Gbps',
    desc: 'Kamera ve AP için kurumsal PoE dağıtım switch.',
    whySelected: 'Kamera trafiğini QoS ile önceliklendirme ve 802.1X kamera kimlik doğrulama.',
    specs: { PoE: '370W', DNA: 'Evet', QoS: '8 Kuyruk', '802.1X': 'Evet' }
  },
  {
    id: 'poe-cisco-9300-24u', brand: 'Cisco', model: 'Catalyst 9300-24U',
    category: 'poeLeaf', tier: 'premium', price: 4200,
    ports: '24x GbE UPoE (90W/Port) + 4x 25G SFP28', throughput: '128 Gbps',
    desc: 'Yüksek güçlü PTZ kamera ve Wi-Fi 7 AP için 90W UPoE.',
    whySelected: 'Pan-Tilt-Zoom kameralar (30-60W) ve Wi-Fi 7 AP (60W+) beslemek için.',
    specs: { UPoE: '90W/Port', Toplam: '2160W', Uplink: '4x 25G SFP28', DNA: 'Evet' }
  },
  {
    id: 'poe-netgear-m4300-28g', brand: 'NETGEAR', model: 'M4300-28G PoE+',
    category: 'poeLeaf', tier: 'medium', price: 1600,
    ports: '24x GbE PoE+ + 4x 10G SFP+', throughput: '64 Gbps',
    desc: 'NETGEAR Prosafe yönetilebilir PoE switch.',
    whySelected: 'Cisco alternatifinize ihtiyaç varken kurumsal özellik sunan uygun fiyatlı seçenek.',
    specs: { PoE: '385W', SFP: '4x 10G', VLAN: '802.1Q', LACP: 'Evet' }
  },
  {
    id: 'poe-aruba-2530-24p', brand: 'HPE Aruba', model: '2530-24G PoE+',
    category: 'poeLeaf', tier: 'economic', price: 650,
    ports: '24x GbE PoE+ + 2x GbE SFP', throughput: '52 Gbps',
    desc: 'Güvenilir Aruba SME PoE switch.',
    whySelected: 'Aruba ClearPass entegrasyonuyla maliyet etkin kamera ve AP PoE çözümü.',
    specs: { PoE: '195W', VLAN: '802.1Q', PoEStandard: '802.3af/at', LLDP: 'Evet' }
  },
  {
    id: 'poe-cisco-sg350-28p', brand: 'Cisco', model: 'SG350-28P-K9 PoE',
    category: 'poeLeaf', tier: 'economic', price: 780,
    ports: '24x GbE PoE+ (195W) + 4x Combo SFP', throughput: '56 Gbps',
    desc: 'Cisco Small Business yönetilebilir PoE switch.',
    whySelected: 'Küçük ofislerde Cisco kalitesiyle güvenlik kamerası ve AP PoE beslemesi.',
    specs: { PoE: '195W', VLAN: '256', STP: 'RSTP/MSTP', SSL: 'HTTPS Yönetim' }
  },

  // ─────────────────────── ENDÜSTRİYEL / OT SWITCH ───────────────────────
  {
    id: 'ot-cisco-ie2000', brand: 'Cisco', model: 'IE-2000-8TC',
    category: 'otLeaf', tier: 'economic', price: 950,
    ports: '8x FE RJ45 + 2x Combo SFP', throughput: '1 Gbps',
    desc: 'DIN-Ray IP30 korumalı endüstriyel L2 switch.',
    whySelected: 'Fabrika zemin koşullarında PLC ve SCADA cihazlarına yönetimli bağlantı.',
    specs: { 'Koruma': 'IP30, NEMA', 'Sıcaklık': '-40°C / +70°C', DIN: 'Evet', 'MTBFx': '200K saat' }
  },
  {
    id: 'ot-cisco-ie3300', brand: 'Cisco', model: 'IE-3300-8T2S',
    category: 'otLeaf', tier: 'medium', price: 1150,
    ports: '8x GbE RJ45 + 2x 1G SFP Combo', throughput: '16 Gbps',
    desc: 'Endüstriyel L3 dinamik yönlendirme destekli switch.',
    whySelected: 'OSPF/RIP ile dinamik OT yönlendirme ve MRP halka yedekliliği.',
    specs: { L3: 'OSPF, RIP, PBR', MRP: 'Evet (IEC 62439-2)', 'Sıcaklık': '-40°C / +70°C', DIN: 'Evet' }
  },
  {
    id: 'ot-cisco-ie4000', brand: 'Cisco', model: 'IE-4000-4T4P4G-E',
    category: 'otLeaf', tier: 'premium', price: 2600,
    ports: '4x FE, 4x FE PoE, 4x Combo SFP GbE', throughput: '12 Gbps',
    desc: 'Modüler ve endüstriyel protokol destekli gelişmiş L3 switch.',
    whySelected: 'Profinet, EtherNet/IP, Modbus/TCP ve RSPAN ile kapsamlı OT ağ yönetimi.',
    specs: { Profinet: 'Evet', 'EtherNet/IP': 'Evet', MRP: 'Evet', 'Sıcaklık': '-40°C / +75°C' }
  },
  {
    id: 'ot-moxa-eds508a', brand: 'Moxa', model: 'EDS-508A-MM-SC',
    category: 'otLeaf', tier: 'economic', price: 780,
    ports: '6x 10/100 RJ45 + 2x 100M Fiber MM (SC)', throughput: '0.8 Gbps',
    desc: 'Fiber bağlantılı DIN-Ray yönetilen endüstriyel switch.',
    whySelected: 'Uzak PLC noktalarına fiber optik ile elektromanyetik gürültüden yalıtılmış bağlantı.',
    specs: { Fiber: 'MM SC', RSTP: 'Evet', 'Sıcaklık': '-40°C / +75°C', DIN: 'Evet' }
  },
  {
    id: 'ot-hirschmann-rs30', brand: 'Hirschmann', model: 'RS30-0802M2T1DAUHH',
    category: 'otLeaf', tier: 'medium', price: 1400,
    ports: '8x FE RJ45 + 2x Fiber MM', throughput: '1 Gbps',
    desc: 'MRP halka protokolü destekli endüstriyel switch.',
    whySelected: 'MRP (Media Redundancy Protocol) ile milisaniye altı iyileşme süreli halka topoloji.',
    specs: { MRP: 'IEC 62439-2', 'Geri Kazanım': '< 200ms', 'Sıcaklık': '-40°C / +70°C', VLAN: 'Evet' }
  },
  {
    id: 'ot-siemens-x308', brand: 'Siemens', model: 'SCALANCE X308-2M',
    category: 'otLeaf', tier: 'medium', price: 1800,
    ports: '8x GbE RJ45 + 2x Combo SFP', throughput: '8 Gbps',
    desc: 'Siemens PROFINET ekosistemiyle tam entegre endüstriyel switch.',
    whySelected: 'Siemens TIA Portal ve PROFINET cihaz yönetimiyle sorunsuz otomasyon entegrasyonu.',
    specs: { PROFINET: 'IO Controller/Device', TIA: 'Portal Entegrasyon', 'Sıcaklık': '-40°C / +70°C' }
  },
  {
    id: 'ot-phoenix-fl3008', brand: 'Phoenix Contact', model: 'FL SWITCH 3008',
    category: 'otLeaf', tier: 'economic', price: 580,
    ports: '8x 10/100 RJ45', throughput: '0.8 Gbps',
    desc: 'Basit, güvenilir DIN-Ray yönetilemeyen endüstriyel switch.',
    whySelected: 'Küçük OT segmentleri için gereksiz yönetim ek yükü olmadan basit bağlantı.',
    specs: { 'Sıcaklık': '-40°C / +70°C', DIN: 'Evet', Yönetim: 'Yönetilemeyen', IP: 'IP20' }
  },
  {
    id: 'ot-wago-852-1113', brand: 'WAGO', model: '852-1113 8-Port Managed',
    category: 'otLeaf', tier: 'economic', price: 720,
    ports: '8x GbE + 2x SFP', throughput: '2 Gbps',
    desc: 'WAGO endüstriyel yönetilen Gigabit switch.',
    whySelected: 'WAGO PLC ekosistemi ve EtherNet/IP protokolüyle fabrika otomasyon bağlantısı.',
    specs: { 'EtherNet/IP': 'Evet', VLAN: '802.1Q', RSTP: 'Evet', DIN: 'Evet' }
  },

  // ─────────────────────── SUNUCULAR ───────────────────────
  {
    id: 'server-dell-r250', brand: 'Dell', model: 'PowerEdge R250 1U',
    category: 'server', tier: 'economic', price: 1600,
    ports: '1x GbE + 1x 10G iDRAC', throughput: null,
    desc: 'Şube ofis için kompakt 1U rack sunucu.',
    whySelected: 'Şube AD, DNS, DHCP ve yazıcı sunucusu için düşük enerji ve maliyet.',
    specs: { CPU: 'Intel Xeon E-2300', RAM: '16-64 GB ECC', 'Disk': '4x 3.5" SATA/SAS', iDRAC: '9 Express' }
  },
  {
    id: 'server-dell-t350', brand: 'Dell', model: 'PowerEdge T350 Tower',
    category: 'server', tier: 'economic', price: 1950,
    ports: '2x GbE LOM', throughput: null,
    desc: 'Kule tipi, Active Directory ve dosya sunucusu için temel sunucu.',
    whySelected: 'Küçük işletmede AD, dosya paylaşımı ve muhasebe uygulamaları için düşük gürültülü kule.',
    specs: { CPU: 'Intel Xeon E-2300', RAM: '16-128 GB ECC', RAID: 'PERC H355', 'Form Factor': 'Tower' }
  },
  {
    id: 'server-dell-r650', brand: 'Dell', model: 'PowerEdge R650 1U',
    category: 'server', tier: 'medium', price: 5200,
    ports: '2x 10G SFP+ OCP 3.0', throughput: null,
    desc: '1U rack sunucu, VMware ESXi/Hyper-V sanallaştırma için.',
    whySelected: 'LACP ile iki ToR switch bağlantısı, 20G bant ve sanallaştırma için yüksek erişilebilirlik.',
    specs: { CPU: 'Intel Xeon Scalable Gen3', RAM: 'Max 1TB DDR4', PSU: 'Çift 1400W', iDRAC: '9 Enterprise' }
  },
  {
    id: 'server-dell-r750', brand: 'Dell', model: 'PowerEdge R750 2U',
    category: 'server', tier: 'premium', price: 11000,
    ports: '4x 25G SFP28 OCP 3.0', throughput: null,
    desc: 'Çift işlemcili yüksek yoğunluklu hesaplama sunucusu.',
    whySelected: 'ERP, büyük veritabanı ve yoğun sanallaştırma; 25G MPIO ile SAN bağlantısı.',
    specs: { CPU: '2x Intel Xeon Gold', RAM: 'Max 3TB DDR4', PSU: 'Çift 1400W', iDRAC: '9 Enterprise Plus' }
  },
  {
    id: 'server-dell-r760', brand: 'Dell', model: 'PowerEdge R760 2U',
    category: 'server', tier: 'ultra', price: 18000,
    ports: '4x 25G + 2x 100G SFP28', throughput: null,
    desc: 'PCIe Gen5 ve DDR5 RAM destekli yeni nesil 2U hesaplama sunucusu.',
    whySelected: 'AI/ML iş yükleri ve büyük ölçekli veritabanı için en son donanım platformu.',
    specs: { CPU: '2x Intel Xeon Scalable Gen4', RAM: 'Max 8TB DDR5', PCIe: 'Gen 5.0' }
  },
  {
    id: 'server-hpe-dl380g10', brand: 'HPE', model: 'ProLiant DL380 Gen10 Plus 2U',
    category: 'server', tier: 'medium', price: 6500,
    ports: '2x 10GbE FlexLOM', throughput: null,
    desc: 'HPE iLO 5 uzaktan yönetim destekli kurumsal sanallaştırma sunucusu.',
    whySelected: 'HPE OneView ve SimpliVity entegrasyonu için HPE ekosisteminde tercih edilen sunucu.',
    specs: { CPU: '2x Intel Xeon Scalable', RAM: 'Max 3TB DDR4', iLO: '5 Enterprise', Form: '2U Rack' }
  },
  {
    id: 'server-lenovo-sr650', brand: 'Lenovo', model: 'ThinkSystem SR650 V2',
    category: 'server', tier: 'medium', price: 5800,
    ports: '2x 10G RJ45', throughput: null,
    desc: 'Lenovo XClarity yönetimiyle dengeli sanallaştırma sunucusu.',
    whySelected: 'XClarity Administrator ile merkezi yönetim ve rekabetçi fiyat/performans oranı.',
    specs: { CPU: '2x Intel Xeon Scalable', RAM: 'Max 3TB', XClarity: 'Evet', Form: '2U Rack' }
  },
  {
    id: 'server-fujitsu-rx2540', brand: 'Fujitsu', model: 'PRIMERGY RX2540 M6',
    category: 'server', tier: 'medium', price: 6200,
    ports: '4x GbE + 2x 10GbE Mezzanine', throughput: null,
    desc: 'Fujitsu PRIMERGY serisi kurumsal 2U rack sunucu.',
    whySelected: 'EMEIA bölgesinde güvenilir destek ağı ve Fujitsu Infrastructure Manager entegrasyonu.',
    specs: { CPU: '2x Intel Xeon Ice Lake', RAM: 'Max 4TB ECC', iRMC: 'S6', iSCSI: 'Opsiyonel' }
  },

  // ─────────────────────── DEPOLAMA ───────────────────────
  {
    id: 'storage-synology-ds1821', brand: 'Synology', model: 'DiskStation DS1821+',
    category: 'storage', tier: 'economic', price: 1100,
    ports: '4x GbE RJ45 (Linklerle 8 Gbps)', throughput: '4 Gbps',
    desc: 'RAID-6 destekli SME yedekleme ve dosya sunucusu NAS.',
    whySelected: 'Hyperbackup ile otomatik bulut yedeklemesi ve SMB/NFS ortak dosya paylaşımı.',
    specs: { 'Disk Yuvası': '8', RAID: '0,1,5,6,10', DSM: '7.x', 'RAM': '4 GB ECC' }
  },
  {
    id: 'storage-synology-rs3621', brand: 'Synology', model: 'RackStation RS3621RPxs',
    category: 'storage', tier: 'medium', price: 4500,
    ports: '2x 10G SFP+ + 4x GbE', throughput: '10 Gbps',
    desc: 'iSCSI ve NFS destekli çift güç kaynağıyla kurumsal rack NAS.',
    whySelected: 'VMware ESXi ve Hyper-V için iSCSI block storage ve yüksek erişilebilirlik.',
    specs: { 'Disk Yuvası': '12', RAID: '0,1,5,6,10,F1', iSCSI: 'Evet', 'Çift PSU': 'Evet' }
  },
  {
    id: 'storage-dell-me4012', brand: 'Dell', model: 'PowerVault ME4012',
    category: 'storage', tier: 'medium', price: 8500,
    ports: '2x 10G iSCSI + 12 Disk Yuvası (SAS/SSD)', throughput: '12 Gbps',
    desc: 'Çift kontrolörlü karma SAS/SSD iSCSI SAN depolama.',
    whySelected: 'VMware sunucularına MPIO iSCSI bağlantısı ile sanallaştırma depolama platformu.',
    specs: { Kontrolör: 'Çift Aktif-Pasif', 'Disk Yuvası': '12 SFF', iSCSI: '10G', IOPS: '200K+' }
  },
  {
    id: 'storage-dell-me5012', brand: 'Dell', model: 'PowerVault ME5012',
    category: 'storage', tier: 'premium', price: 17500,
    ports: '8x 10G/25G SFP28 (iSCSI/FC)', throughput: '25 Gbps',
    desc: 'Active-Active çift işlemcili kurumsal SAN depolama.',
    whySelected: 'Kontrolör arızasında sıfır veri kaybı; 250K+ IOPS eş zamanlı okuma/yazma.',
    specs: { Kontrolör: 'Çift Aktif-Aktif', IOPS: '250K+', 'Latency': '<500µs', MPIO: 'Evet' }
  },
  {
    id: 'storage-hpe-msa2062', brand: 'HPE', model: 'MSA 2062 SAN',
    category: 'storage', tier: 'medium', price: 6500,
    ports: '2x 10G iSCSI + 2x 16G FC', throughput: '12 Gbps',
    desc: 'HPE yönetilebilir karma Fiber Channel ve iSCSI SAN.',
    whySelected: 'HPE ProLiant sunucu ekosistemiyle entegre SAN ve iSCSI dual-controller depolama.',
    specs: { 'FC': '16G', iSCSI: '10G', 'Disk': '24x SFF SAS/SSD', HPE: 'SSM Yönetim' }
  },
  {
    id: 'storage-netapp-affa400', brand: 'NetApp', model: 'AFF A400',
    category: 'storage', tier: 'ultra', price: 85000,
    ports: '4x 32G FC + 4x 100G NVMe-oF', throughput: '30 GB/s',
    desc: 'All-Flash NVMe mimarili veri merkezi depolama platformu.',
    whySelected: 'En yüksek IOPS gerektiren büyük veritabanları ve yüksek trafik veri merkezleri için.',
    specs: { 'Latency': '<200µs', IOPS: '700K+', ONTAP: '9.x', 'NVMe-oF': 'Evet' }
  },
  {
    id: 'storage-pure-fa-c60', brand: 'Pure Storage', model: 'FlashArray//C60',
    category: 'storage', tier: 'ultra', price: 75000,
    ports: '4x 32G FC / 2x 100G NVMe', throughput: '12 GB/s',
    desc: 'Pure Storage Purity OS ile konsolidasyonlu NVMe-oF depolama.',
    whySelected: 'Veri azaltma (deduplication+compression) ile etkin maliyet ve yüksek IOPS.',
    specs: { Dedup: 'Satır içi', Compression: 'Evet', 'Latency': '<500µs', Evergreen: 'Evet' }
  },

  // ─────────────────────── ACCESS POINTS ───────────────────────
  {
    id: 'ap-ubiquiti-u6pro', brand: 'Ubiquiti', model: 'UniFi U6 Pro',
    category: 'ap', tier: 'economic', price: 179,
    ports: '1x GbE PoE (802.3at)', throughput: '5.3 Gbps',
    desc: 'Wi-Fi 6 (802.11ax) tavan tipi kurumsal AP.',
    whySelected: 'UniFi Controller ile merkezi yönetim ve uygun fiyatlı Wi-Fi 6 tavan kapsaması.',
    specs: { Standard: 'Wi-Fi 6 (802.11ax)', Bands: '2.4+5 GHz', PoE: '802.3af/at', Coverage: '~300 m²' }
  },
  {
    id: 'ap-ubiquiti-u6mesh', brand: 'Ubiquiti', model: 'UniFi U6 Mesh',
    category: 'ap', tier: 'economic', price: 199,
    ports: '1x GbE PoE veya 24V Passive PoE', throughput: '4.8 Gbps',
    desc: 'Dış ortam ve mesh bağlantı Wi-Fi 6 AP.',
    whySelected: 'Kablo çekilemeyen alanlarda mesh bağlantı ve IP67 korumayla dış ortam Wi-Fi.',
    specs: { IP: 'IP67', Standard: '802.11ax', Mesh: 'Evet', Outdoor: 'Evet' }
  },
  {
    id: 'ap-cisco-9130ax', brand: 'Cisco', model: 'Catalyst 9130AXI',
    category: 'ap', tier: 'medium', price: 1200,
    ports: '1x 2.5G mGig PoE+', throughput: '5.4 Gbps',
    desc: 'Cisco DNA Center yönetimli Wi-Fi 6 kurumsal AP.',
    whySelected: 'Cisco DNA Center ve SD-Access entegrasyonu; WPA3 ve Cisco AI Network Analytics.',
    specs: { Standard: 'Wi-Fi 6 (802.11ax)', Bands: '2.4+5 GHz', DNA: 'Evet', Coverage: '~550 m²' }
  },
  {
    id: 'ap-cisco-9136', brand: 'Cisco', model: 'Catalyst 9136AXI',
    category: 'ap', tier: 'premium', price: 1800,
    ports: '1x 2.5G + 1x 1G mGig PoE+', throughput: '9.4 Gbps',
    desc: 'Wi-Fi 6E tri-band 6GHz spektrumu destekli Cisco kurumsal AP.',
    whySelected: '6GHz spektrumuyla stadyum, hastane ve üniversite gibi çok yoğun ortamlar.',
    specs: { Standard: 'Wi-Fi 6E (802.11ax)', Bands: '2.4+5+6 GHz', UPoE: '90W', DNA: 'Evet' }
  },
  {
    id: 'ap-aruba-ap635', brand: 'HPE Aruba', model: 'AP-635',
    category: 'ap', tier: 'premium', price: 1600,
    ports: '2x 2.5G PoE+', throughput: '7.8 Gbps',
    desc: 'Wi-Fi 6E tri-band yüksek yoğunluk Aruba kurumsal AP.',
    whySelected: 'Aruba ClearPass ve AI Insights entegrasyonu ile adaptif radyo yönetimi.',
    specs: { Standard: 'Wi-Fi 6E', Bands: '2.4+5+6 GHz', ClearPass: 'Entegrasyon', Aruba: 'ESP Uyumlu' }
  },
  {
    id: 'ap-ruckus-r850', brand: 'Ruckus', model: 'R850',
    category: 'ap', tier: 'premium', price: 1600,
    ports: '2x GbE', throughput: '4.8 Gbps',
    desc: 'BeamFlex+ uyarlamalı anten teknolojili Wi-Fi 6 AP.',
    whySelected: 'Dinamik anten yönelimi ile çok duvarlı ofis ve sanayi ortamlarında üstün kapsama.',
    specs: { Standard: 'Wi-Fi 6', BeamFlex: '+6dBi adaptif', PoE: '802.3at', SmartZone: 'Evet' }
  },
  {
    id: 'ap-aruba-ap504', brand: 'HPE Aruba', model: 'AP-504',
    category: 'ap', tier: 'medium', price: 650,
    ports: '1x GbE PoE+', throughput: '2.4 Gbps',
    desc: 'Wi-Fi 6 çift bantlı ekonomik Aruba AP.',
    whySelected: 'Küçük/orta ofisler için Aruba Central yönetimli uygun fiyatlı Wi-Fi 6 AP.',
    specs: { Standard: 'Wi-Fi 6', Bands: '2.4+5 GHz', ArubaOS: '10.x', Central: 'Evet' }
  },

  // ─────────────────────── PDU ───────────────────────
  {
    id: 'pdu-apc-basic', brand: 'APC', model: 'Basic Rack PDU AP9565 1U',
    category: 'pdu', tier: 'economic', price: 180,
    ports: '8x C13 Çıkış', throughput: null,
    desc: 'Temel akım korumalı 1U yatay grup priz PDU.',
    whySelected: 'Ekonomik rack kurulumlarında temel güç dağıtımı ve devre koruması.',
    specs: { Çıkış: '8x C13', Giriş: 'C14', Faz: '1-Faz', Yönetim: 'Yok' }
  },
  {
    id: 'pdu-apc-metered', brand: 'APC', model: 'Metered Rack PDU AP8853',
    category: 'pdu', tier: 'medium', price: 650,
    ports: '16x C13 + 2x C19, IP Yönetim', throughput: null,
    desc: 'Port başına amper izlemeli ve IP üzerinden yönetimli akıllı PDU.',
    whySelected: 'Güç tüketimini uzaktan IP üzerinden gerçek zamanlı izleme ve aşırı akım uyarısı.',
    specs: { Çıkış: '16x C13 + 2x C19', Yönetim: 'IP/Web/SNMP', İzleme: 'Amper/Port', Montaj: '0U Dikey' }
  },
  {
    id: 'pdu-apc-switched', brand: 'APC', model: 'Switched Rack PDU AP8953',
    category: 'pdu', tier: 'premium', price: 1450,
    ports: '20x C13, Uzaktan Port Kontrolü', throughput: null,
    desc: 'Port bazında uzaktan açıp kapatılabilen ve izlenebilen akıllı dikey PDU.',
    whySelected: 'Uzaktan güç döngüsü, donmuş cihaz yeniden başlatma ve güç planlaması için.',
    specs: { Çıkış: '20x C13', Yönetim: 'IP + SSH + SNMP', Kontrol: 'Port Başına On/Off', Log: 'Evet' }
  },
  {
    id: 'pdu-raritan-px3', brand: 'Raritan', model: 'PX3-5200R Dikey PDU',
    category: 'pdu', tier: 'premium', price: 1800,
    ports: '24x C13 + 6x C19, Güç Ölçüm', throughput: null,
    desc: 'Sıcaklık ve nem sensörlü gelişmiş akıllı PDU.',
    whySelected: 'Çevre izleme (sıcaklık/nem) ve port başına güç ölçümü ile gelişmiş veri merkezi yönetimi.',
    specs: { Çıkış: '24x C13 + 6x C19', Sensör: 'Sıcaklık/Nem', 'Güç Ölçüm': 'Gerçek Zamanlı', Cascading: 'Evet' }
  },

  // ─────────────────────── RACK KABİNETLER ───────────────────────
  {
    id: 'rack-eco-32u', brand: 'Generic', model: '32U Ekonomik Network Kabini',
    category: 'rack', tier: 'economic', price: 450,
    ports: null, throughput: null,
    desc: 'Standart 32U, cam kapıklı ekonomik ağ kabini.',
    whySelected: 'Küçük ve orta ofis MDF/IDF noktaları için uygun fiyatlı standart kabin.',
    specs: { Yükseklik: '32U (1.6m)', Genişlik: '600mm', Derinlik: '600mm', Taşıma: '600 kg' }
  },
  {
    id: 'rack-corp-42u', brand: 'Generic', model: '42U Kurumsal Perfore Kabinet',
    category: 'rack', tier: 'medium', price: 1100,
    ports: null, throughput: null,
    desc: 'Ön/arka %80 perfore kapılı, dikey kablo düzenleyicili kurumsal kabin.',
    whySelected: 'Yüksek ısı yayımlı donanımlar için iyi hava akışı ve kablo yönetimi.',
    specs: { Yükseklik: '42U (2.1m)', 'Kapak Perforasyonu': '%80', 'Dikey Org.': 'Dahil', Taşıma: '1000 kg' }
  },
  {
    id: 'rack-apc-netshelter', brand: 'APC', model: 'NetShelter SX 42U',
    category: 'rack', tier: 'premium', price: 2400,
    ports: null, throughput: null,
    desc: '1360 kg taşıma kapasiteli, sismik sabitleme kitli veri merkezi kabini.',
    whySelected: 'Deprem bölgeleri ve yoğun donanım yüklemeleri için veri merkezi sınıfı kabin.',
    specs: { Yükseklik: '42U (2.03m)', Taşıma: '1360 kg', Sismik: 'Zone 4', 'Hava Koridoru': 'Ön/Arka' }
  },
  {
    id: 'rack-rittal-ts8', brand: 'Rittal', model: 'TS IT 42U',
    category: 'rack', tier: 'premium', price: 2200,
    ports: null, throughput: null,
    desc: 'Rittal TS8 serisi modüler yüksek yoğunluklu veri merkezi kabini.',
    whySelected: 'Modüler yapısı ile ön/arka kapı seçenekleri ve yüksek yoğunluklu soğutma adaptasyonu.',
    specs: { Yükseklik: '42U', Genişlik: '800mm', Taşıma: '1500 kg', 'VX IT': 'Uyumlu' }
  }
];

export function getProductsByCategory(category: HardwareCategory): HardwareProduct[] {
  return HARDWARE_CATALOG.filter(p => p.category === category);
}

export function getProductById(id: string): HardwareProduct | undefined {
  return HARDWARE_CATALOG.find(p => p.id === id);
}

export const CATEGORY_LABELS: Record<HardwareCategory, string> = {
  router: 'Internet Yönlendiricisi (Router)',
  firewall: 'NGFW Güvenlik Duvarı',
  spine: 'L3 Omurga Switch (Spine/Core)',
  userLeaf: 'Ofis Kullanıcı Dağıtım Switch',
  poeLeaf: 'IP Kamera & AP PoE Switch',
  otLeaf: 'Endüstriyel OT Saha Switch',
  server: 'Fiziksel Sunucu',
  storage: 'SAN/NAS Depolama',
  ap: 'Wi-Fi Access Point',
  pdu: 'Akıllı Güç Dağıtım (PDU)',
  rack: 'Network Kabineti (Rack)',
};
