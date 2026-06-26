import { VlanMapping, RackItem } from './types';

export interface CompanyPreset {
  name: string;
  desc: string;
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

export const COMPANY_PRESETS: CompanyPreset[] = [
  {
    name: "Küçük Ölçekli Ofis (KOBİ)",
    desc: "20 Kullanıcı, Temel Ofis Ağ Çözümleri",
    pcs: 15,
    ipPhones: 5,
    wifiAPs: 2,
    cameras: 4,
    printers: 2,
    plcs: 0,
    cncs: 0,
    modbusGateways: 0,
    spines: 0,
    leafs: 2,
    firewalls: 1,
    servers: 1,
    sanStorages: 0,
    smartPDUs: 2,
    racks: 1,
  },
  {
    name: "Orta Ölçekli Fabrika & Ofis",
    desc: "150 Çalışan, Endüstriyel Üretim ve Ofis Entegrasyonu",
    pcs: 60,
    ipPhones: 20,
    wifiAPs: 8,
    cameras: 16,
    printers: 5,
    plcs: 12,
    cncs: 4,
    modbusGateways: 2,
    spines: 2,
    leafs: 4,
    firewalls: 2,
    servers: 3,
    sanStorages: 1,
    smartPDUs: 4,
    racks: 2,
  },
  {
    name: "Büyük Ölçekli Kurumsal Veri Merkezi",
    desc: "Bölgesel Genel Merkez, Yüksek Güvenlikli Veri İşleme & Hibrit Hibrit Bulut",
    pcs: 350,
    ipPhones: 120,
    wifiAPs: 40,
    cameras: 64,
    printers: 15,
    plcs: 30,
    cncs: 10,
    modbusGateways: 5,
    spines: 2,
    leafs: 6,
    firewalls: 2,
    servers: 8,
    sanStorages: 2,
    smartPDUs: 6,
    racks: 3,
  }
];

export const PHASE_GUIDES = [
  {
    id: 1,
    title: "FAZ 1: Saha Keşfi & Fiziksel Altyapı",
    desc: "Kabin yerleşimi, kafes somunları, güç yedekliliği ve kablolama standartları.",
    screws: [
      {
        title: "Kafes Somunları (Cage Nuts) ve Ray Montajı",
        detail: "Tüm ağır donanımlar (Dell R750 Sunucular, Dell ME5 SAN depolama) kabinetin en alt bölgesine (1U - 12U) yerleştirilir. Bu, kabinetin ağırlık merkezini aşağıda tutarak devrilmesini engeller. ToR (Top of Rack) Leaf switchler ise en üste (40U - 42U) yerleştirilir."
      },
      {
        title: "Çift Güç Kaynağı (Dual-PSU) ve Akıllı PDU Yedekliliği",
        detail: "Her sunucu ve switch üzerinde çift PSU bulunur. PSU-1 her zaman UPS-1'e bağlı olan PDU-A'ya (Siyah kablo), PSU-2 ise jeneratör destekli UPS-2'ye bağlı olan PDU-B'ye (Gri kablo) takılır. Akıllı PDU'lar port başına akım (Amper) çekişini izler."
      },
      {
        title: "Kablo Tipleri ve Standartları",
        detail: "- Cat6/Cat6A RJ45 (Mavi): Ofis uç birimleri, IP kameralar ve PLC üniteleri için. Maksimum mesafe 100 metredir.\n- DAC (Direct Attach Copper) Twinax (Siyah): Kabin içi ToR switch ile sunucu arası 10G/25G bağlantılar için (Maksimum 3-5m, sıfır gecikme).\n- OM4 LC-LC Multi-mode Fiber (Turkuaz/Magenta): Kabinler arası Leaf-Spine omurga 40G/100G bağlantısı için. SFP+ / QSFP28 modülleri kullanılır."
      },
      {
        title: "Etiketleme Standardı",
        detail: "ANSI/TIA-606-B standardına göre her kablo iki ucundan da etiketlenir. Etiket şablonu: [Kaynak Kabinet]-[U-Sırası]-[Port ID] > [Hedef Kabinet]-[U-Sırası]-[Port ID]"
      }
    ]
  },
  {
    id: 2,
    title: "FAZ 2: Omurga-Erişim (Spine-Leaf) Mimarisi",
    desc: "Yatay (Doğu-Batı) veri trafiğini optimize eden, öngörülebilir gecikmeli omurga tasarımı.",
    screws: [
      {
        title: "Neden Spine-Leaf?",
        detail: "Geleneksel 3 katmanlı (Core-Aggregation-Access) mimari, sanallaştırılmış veri merkezlerindeki Doğu-Batı (sunucudan sunucuya) trafiği için uygun değildir ve STP (Spanning Tree) engellemeleri nedeniyle bant genişliği kaybı yaşatır. Spine-Leaf yapısında her Leaf, her Spine'a doğrudan bağlıdır. Trafik her zaman en fazla 2 sekmede (hop) hedefe ulaşır."
      },
      {
        title: "Transceiver Montajı",
        detail: "SFP+/QSFP28 modülleri takılırken kilit kolunun yukarıda olduğundan emin olunmalıdır. OM4 fiber patch kablonun koruyucu başlıkları çıkartılıp alkollü mendille temizlendikten sonra çıt sesi duyulana kadar modüle itilir. Rx (Alıcı) ve Tx (Verici) yönleri çapraz bağlanır."
      },
      {
        title: "IP Ataması & Underlay Yönlendirme (Routing)",
        detail: "Leaf ve Spine arasındaki her bağlantı ayrı bir /31 veya /30 Layer 3 alt ağıdır. Loopback IP adresleri tanımlanır (Örn: Spine-1 için 10.0.0.1/32). Ardından, fabric erişilebilirliği için OSPF veya eBGP protokolü yapılandırılır."
      }
    ],
    cli: {
      brand: "Cisco Nexus (OS)",
      code: `! SPINE-1 Underlay Yapılandırması
feature ospf
feature interface-vlan

interface loopback0
  ip address 10.0.0.1/32
  ip router ospf 1 area 0.0.0.0

interface Ethernet1/1
  description BAGLANTI_TO_LEAF-1
  no switchport
  ip address 10.255.0.1/30
  ip router ospf 1 area 0.0.0.0
  no shutdown

router ospf 1
  router-id 10.0.0.1`
    }
  },
  {
    id: 3,
    title: "FAZ 3: Mantıksal Bölümleme & Overlay",
    desc: "VLAN segmentasyonu, alt ağ şemaları ve LACP/vPC ile kesintisiz sunucu yedekliliği.",
    screws: [
      {
        title: "VLAN & Subnet Bölümlemesi",
        detail: "Ağ güvenliği ve performans için cihaz grupları izole edilir. Ofis bilgisayarları, IP kameralar, fabrika PLC cihazları ve veri merkezi sunucuları farklı VLAN'larda tutulur. VLAN'lar arası geçişler Firewall/L3 Switch üzerindeki kurallarla sınırlandırılır."
      },
      {
        title: "LACP & vPC (Virtual Port Channel)",
        detail: "Bir sunucu veya depolama ünitesinin tek bir switche bağlı olması durumunda, o switch arızalanırsa bağlantı kopar. vPC veya MC-LAG teknolojisi ile sunucu, iki farklı Leaf switch'e fiziksel kablolar çeker. İki switch tek bir mantıksal switch gibi davranır. LACP (802.3ad) protokolü ve LACP Mode Active (LACP Modu 4) aktif edilir."
      }
    ],
    cli: {
      brand: "Juniper Junos OS",
      code: `# LEAF-1 vPC/MC-LAG ve VLAN Yapılandırması
set vlans MGMT vlan-id 10
set vlans CORP vlan-id 20
set vlans OT vlan-id 50
set vlans CCTV vlan-id 90

# vPC Peer Link (Leaf-1 <-> Leaf-2)
set interfaces ae0 description "MC-LAG_PEER_LINK"
set interfaces ae0 aggregated-ether-options lacp active
set interfaces ae0 unit 0 family ethernet-switching interface-mode trunk
set interfaces ae0 unit 0 family ethernet-switching vlan members all`
    }
  },
  {
    id: 4,
    title: "FAZ 4: Kenar Güvenliği & Depolama Mimarisi",
    desc: "Next-Gen Firewall entegrasyonu, WAN yedekliliği, iSCSI Lossless Ethernet ve OOB Yönetim Ağı.",
    screws: [
      {
        title: "Firewall Entegrasyonu ve DMZ",
        detail: "Spine katmanının üzerine yerleştirilen NGFW (Yeni Nesil Güvenlik Duvarı), dış dünya ile iç ağı korur. Web-facing sunucular DMZ (Arındırılmış Bölge) VLAN'ında izole edilir. WAN tarafında ISP-1 (Fiber) ve ISP-2 (Metro/LTE) aktif-pasif veya aktif-aktif failover çalışır."
      },
      {
        title: "Lossless Ethernet (Kayıpsız Ağ) & SAN",
        detail: "SAN (Depolama Alan Ağı) trafiğinde iSCSI protokolü kullanılır. TCP paket kayıpları depolama performansını yerle bir edebilir. Bunu önlemek için PFC (Priority Flow Control - 802.1Qbb) ve ECN (Explicit Congestion Notification) aktifleştirilerek tıkanıklık anında sıfır paket kaybı garanti edilir."
      },
      {
        title: "OOB (Out-of-Band) Yönetim",
        detail: "Ana ağ çöktüğünde dahi cihazlara erişebilmek için, sunucuların iDRAC/iLO portları ve switchlerin Management (CON/MGMT) portları tamamen bağımsız, internete kapalı bir yönetim switchine bağlanır."
      }
    ],
    cli: {
      brand: "Palo Alto Networks / Fortigate",
      code: `# FortiGate NGFW WAN & Zones Yapılandırması
config system interface
    edit "wan1"
        set vdom "root"
        set ip 198.51.100.2 255.255.255.252
        set status up
    next
    edit "wan2"
        set vdom "root"
        set ip 203.0.113.2 255.255.255.248
        set status up
    next
end

config system link-monitor
    edit "WAN-FAILOVER"
        set srcintf "wan1"
        set server "8.8.8.8"
        set gateway-ip 198.51.100.1
    next
end`
    }
  },
  {
    id: 5,
    title: "FAZ 5: Doğrulama, Sorun Giderme & Hata Simülasyonu",
    desc: "Afet testleri, fiber kopmaları, kabinet güç kayıpları ve adım adım paket izleme.",
    screws: [
      {
        title: "Felaket Senaryoları",
        detail: "- Spine-1 Enerji Kesintisi: Leaf switchler trafiği milisaniyeler içinde Spine-2 üzerinden yönlendirmelidir. BFD (Bidirectional Forwarding Detection) protokolü bu geçişi hızlandırır.\n- Fiber Patch Kopması: Leaf-1 ile Spine-1 arasındaki OM4 kablosu koptuğunda, dinamik yönlendirme (OSPF/BGP) rotayı günceller."
      },
      {
        title: "Paket Walkthrough (Paket Yolculuğu)",
        detail: "Bir cihaz diğerine paket gönderirken:\n1. ARP Tablosu kontrol edilir (IP -> MAC eşleşmesi).\n2. Cihaz kendi subnetinin dışındaysa Default Gateway'e yönlendirilir.\n3. Switch MAC adres tablosuna bakarak paketi ilgili porta yönlendirir.\n4. Firewall üzerinde güvenlik kuralları (Security Policies) kontrol edilir."
      }
    ],
    cli: {
      brand: "Sorun Giderme Komutları",
      code: `# Cisco Nexus Sorun Giderme
show ip route
show mac address-table
show vpc brief
show lacp neighbor
ping 10.0.0.1 vrf default
traceroute 8.8.8.8`
    }
  }
];

export const VLAN_MATRIX_PRESET: VlanMapping[] = [
  { id: 10, name: "MGMT", subnet: "192.168.10.0/24", gateway: "192.168.10.1", purpose: "OOB / iDRAC / iLO ve Cihaz Yönetim Arayüzleri", color: "border-yellow-500 text-yellow-400 bg-yellow-500/10" },
  { id: 20, name: "CORP_OFIS", subnet: "10.20.0.0/22", gateway: "10.20.0.1", purpose: "Ofis Bilgisayarları, IP Telefonlar ve Yazıcılar", color: "border-blue-500 text-blue-400 bg-blue-500/10" },
  { id: 30, name: "DC_SERVERS", subnet: "10.30.0.0/24", gateway: "10.30.0.1", purpose: "Veri Merkezi Sunucuları, Uygulamalar ve Veritabanları", color: "border-purple-500 text-purple-400 bg-purple-500/10" },
  { id: 50, name: "OT_FACTORY", subnet: "10.50.0.0/24", gateway: "10.50.0.1", purpose: "Endüstriyel PLC, CNC ve Assembly Hat Cihazları", color: "border-green-500 text-green-400 bg-green-500/10" },
  { id: 90, name: "CCTV_SEC", subnet: "172.16.90.0/24", gateway: "172.16.90.1", purpose: "IP Güvenlik Kameraları ve NVR Kayıt Sunucuları", color: "border-red-500 text-red-400 bg-red-500/10" }
];

export interface PacketWalkScenario {
  name: string;
  source: string;
  target: string;
  steps: {
    device: string;
    layer: 'Fiziksel' | 'Veri İletim' | 'Ağ' | 'Güvenlik';
    desc: string;
    detail: string;
  }[];
}

export const PACKET_SCENARIOS: PacketWalkScenario[] = [
  {
    name: "Fabrika Alanı PLC (VLAN 50) -> Veritabanı Sunucusu (VLAN 30)",
    source: "PLC Cihazı (10.50.0.15)",
    target: "Üretim SQL Veritabanı Sunucusu (10.30.0.8)",
    steps: [
      {
        device: "PLC Ünitesi (Fabrika Sahası)",
        layer: "Fiziksel",
        desc: "Paket Oluşturma ve Fiziksel Çıkış",
        detail: "PLC ünitesi, üretim sayaç verisini veritabanına göndermek için IP paketini hazırlar. RJ45 Cat6 kablo üzerinden elektriksel sinyal olarak sinyali gönderir."
      },
      {
        device: "Saha Erişim Switchi (Leaf-3)",
        layer: "Veri İletim",
        desc: "VLAN Etiketleme (802.1Q)",
        detail: "Switch, gelen paketi VLAN 50 (OT) olarak etiketler. MAC adresi tablosuna bakar ve hedef default gateway'e ulaştırmak için Spine switchlere giden OM4 fiber hatta aktarır."
      },
      {
        device: "Omurga Switch (Spine-1)",
        layer: "Ağ",
        desc: "Omurga Yönlendirme (Loopback & L3)",
        detail: "Spine switch, paketi VLAN 50 alt ağından VLAN 30 alt ağına geçirmek üzere yönlendirme tablosunu inceler. Ancak iki VLAN arası trafik kural gereği Firewall onayından geçmelidir."
      },
      {
        device: "Next-Gen Firewall (Palo Alto)",
        layer: "Güvenlik",
        desc: "Zonlar Arası Güvenlik Analizi",
        detail: "Güvenlik duvarı 'OT-Zone' dan 'DC-Zone' a doğru gelen SQL (port 1433) istek iznini doğrular. Paketi inceler (Deep Packet Inspection), zararlı kod barındırmadığını teyit eder ve onaylar."
      },
      {
        device: "Erişim Switchi (Leaf-1)",
        layer: "Veri İletim",
        desc: "vPC & LACP Dağıtımı",
        detail: "VLAN 30 etiketini alan Leaf-1 switchi, veritabanı sunucusuna giden vPC port grubunu (LACP port-channel) bulur ve trafiği yük dengeli olarak sunucunun çift bağlı DAC kablosuna iletir."
      },
      {
        device: "Veritabanı Sunucusu (VMS-1)",
        layer: "Ağ",
        desc: "TCP Paket Kabulü ve Yanıt",
        detail: "Sunucu üzerindeki sanal anahtar (vSwitch) paketi VLAN 30 tag'ini sökerek sanal makineye iletir. SQL Server paketi kabul eder ve PLC'ye onay (ACK) paketini ters yoldan geri gönderir."
      }
    ]
  },
  {
    name: "Ofis Mühendisi PC (VLAN 20) -> İnternet / Bulut (WAN)",
    source: "Mühendis Bilgisayarı (10.20.1.55)",
    target: "Google Public DNS (8.8.8.8)",
    steps: [
      {
        device: "Mühendis PC (Kabin Yanı)",
        layer: "Fiziksel",
        desc: "Cat6 Kablolama ve IP Çıkışı",
        detail: "Bilgisayar, hedef IP 8.8.8.8'in yerel alt ağda (10.20.0.0/22) olmadığını anlar. Paketi Default Gateway adresi olan 10.20.0.1'e göndermek için Cat6 mavi kabloyla switch portuna iletir."
      },
      {
        device: "Ofis Dağıtım Switchi (Leaf-2)",
        layer: "Veri İletim",
        desc: "Trunk Port ve Fiber Uplink",
        detail: "Mavi kablodan gelen paketi VLAN 20 olarak etiketler. 802.1Q trunk portu üzerinden OM4 LC-LC fiber optik patch kablosu kullanarak Spine-2'ye yönlendirir."
      },
      {
        device: "Omurga Switch (Spine-2)",
        layer: "Ağ",
        desc: "Default Route (0.0.0.0/0) Eşleşmesi",
        detail: "Yönlendirme tablosunda 8.8.8.8 için özel bir rota bulamaz ve paketi '0.0.0.0/0' (en iyi default rota) kuralına göre kenar güvenlik duvarı (Firewall) WAN bacağına gönderir."
      },
      {
        device: "Kenar Güvenlik Duvarı (NGFW)",
        layer: "Güvenlik",
        desc: "NAT (Ağ Adresi Çevirisi) ve WAN Failover",
        detail: "İç ağ IP'si olan 10.20.1.55, internette yönlendirilemez. Firewall, NAT (Source NAT) yaparak bu IP'yi ISP-1 dış bacak IP'si ile değiştirir. Paket dışarı yollanır."
      }
    ]
  }
];
