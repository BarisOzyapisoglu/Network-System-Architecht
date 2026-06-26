# NetSim-Architect 🌐💻

**NetSim-Architect**, "Vidadan Koda" (*Screw-to-Code*) felsefesiyle tasarlanmış, ANSI/TIA-568 standartlarına uygun, endüstriyel ve kurumsal ağ ve veri merkezi altyapılarını tasarlayan, simüle eden ve bütçelendiren ultra detaylı bir planlama platformudur.

Bu uygulama; sınır güvenlik duvarlarından (Firewall), omurga switchlere (Spine-Leaf), endüstriyel üretim sahası OT cihazlarından (Modbus Gateway, PLC, CNC), kurumsal uç terminallere (PC, IP Telefon, AP, CCTV) kadar geniş bir yelpazedeki ağ donanımlarını fiziksel ve mantıksal katmanlarda ele alır.

---

## 🚀 Öne Çıkan Özellikler

### 1. Dinamik Spine-Leaf Ağ Topolojisi (Mantıksal Katman)
*   **SVG Tabanlı İnteraktif Canvas:** Tüm cihazlar, bağlantılar ve fiber/bakır hatlar gerçek zamanlı olarak SVG üzerinde çizilir.
*   **LACP ve Optik Fiber OM4 Entegrasyonu:** Spine ve Leaf switchler arasındaki omurga uplink'leri, yedeklilik durumuna göre fiber OM4 10G LC veya DAC kablolarla çift yönlü olarak görselleştirilir.
*   **Seçilebilir Düğümler:** Herhangi bir aktif cihaza tıklayarak cihazın IP adresi, VLAN bilgisi, güç kaynağı durumu ve teknik detayları anında görüntülenebilir.

### 2. Çok Katlı Fiziksel Yerleşim (MDF / IDF Dağıtımı)
*   **MDF (Main Distribution Frame):** Sistem odasının yer aldığı ana dağıtım merkezi.
*   **IDF (Intermediate Distribution Frame):** Katlarda konumlandırılan ve ana omurgaya dikey optik fiber hatlarla bağlanan ara dağıtım kabinetleri.
*   **Kat Bazlı Bölümleme:** 1, 2 veya 3 katlı fiziksel mimarilerde cihazların kat yerleşimleri ve dikey kablolama yolları izlenebilir.

### 3. 42U Sistem Kabin Düzeni (Rack Chassis) & Güç Yedekliliği
*   **U-Pozisyonu Planlaması:** 19 inç standartlarında 42U dikili tip sistem odası kabineti görselleştirmesi.
*   **Çapraz Elektrik Bağlantıları (Dual PDU):** Kritik cihazların (Sunucular, Depolama, Switch'ler) çift güç kaynaklarının (PSU-1 ve PSU-2) bağımsız PDU-A ve PDU-B hatlarına çapraz bağlanarak elektriksel kesintisizliğinin planlanması.
*   **Ağırlık ve Isı Dağılımı:** Donanımların kabin içerisindeki dikey ağırlık dengesi kontrolü.

### 4. VLAN Segmentasyonu ve Endüstriyel OT Entegrasyonu
*   **VLAN Planı:** Güvenlik ve performans amacıyla trafiğin segmentlere ayrılması:
    *   **VLAN 10 (Yönetim):** Sunucular, depolama üniteleri ve aktif cihaz yönetim arayüzleri.
    *   **VLAN 20 (Ses/VoIP):** IP Telefonlar için önceliklendirilmiş ses sanal ağı.
    *   **VLAN 30 (IP-CCTV):** Güvenlik kameralarının yüksek bant genişliği gerektiren multicast video akışları.
    *   **VLAN 40 (Wi-Fi/Misafir):** Kablosuz Access Point ağları.
    *   **VLAN 50 (Endüstriyel OT):** Siemens PLC'ler, Mazak CNC tezgahları gibi üretim sahası donanımları.
*   **Modbus TCP Gateway:** Seri haberleşme (RS-485 Modbus RTU) kullanan eski tip endüstriyel cihazların IP ağlarına Modbus TCP üzerinden güvenle bağlanması.

### 5. ANSI/TIA-568 Standartlarında 16 Adımlı Kurulum Rehberi
*   Fiziksel altyapı hazırlığından sismik kabinet montajına, Keystone sonlandırmasından Fluke DSX-8000 sertifikasyon testlerine ve konfigürasyon yedeklemesine kadar **adım adım profesyonel kurulum kontrol listesi**.

### 6. Akıllı Bütçelendirme ve Donanım Konfigürasyonu
*   **Ekonomik, Orta ve Premium Donanım Sınıfları:** Projenin bütçesine göre seçilen cihazların otomatik konfigürasyon eşleşmeleri:
    *   *Ekonomik Sınıf:* MikroTik ve Fortinet başlangıç modelleri.
    *   *Orta Sınıf:* Cisco Catalyst ve Fortinet standart kurumsal modelleri.
    *   *Premium Sınıf:* Juniper, Cisco Nexus ve Fortinet High-End yedekli mimarileri.

---

## 🛠️ Kullanılan Teknolojiler

*   **Frontend:** React 19 (TypeScript), Vite, Tailwind CSS 4.0, Motion (Animasyonlar)
*   **Backend:** Express.js, TSX, Node.js (Sunucu tarafı entegrasyon ve API desteği)
*   **İkonlar:** `lucide-react`

---

## ⚙️ Kurulum ve Çalıştırma

Uygulamayı yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Bağımlılıkların Yüklenmesi
```bash
npm install
```

### 2. Geliştirici Sunucusunun Başlatılması (Development)
```bash
npm run dev
```
Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

### 3. Üretim Sürümü Derleme (Production Build)
```bash
npm run build
```
Bu komut, istemci tarafı kodları `dist/` klasörüne derler ve sunucuyu `dist/server.cjs` adıyla optimize edilmiş tek bir dosya haline getirir.

### 4. Üretim Sunucusunun Başlatılması
```bash
npm start
```

---

## 📊 Örnek Ağ Katmanları ve IP Yapılandırması

| VLAN ID | VLAN Adı | IP Alt Ağı | Varsayılan Ağ Geçidi | Kullanım Amacı |
| :---: | :--- | :--- | :--- | :--- |
| **VLAN 10** | SYSTEM_MGMT | `10.10.10.0/24` | `10.10.10.1` | Sunucular, SAN Depolama, Switch Yönetimi |
| **VLAN 20** | VOIP_NET | `10.10.20.0/24` | `10.10.20.1` | IP Telefonlar ve Ses Santrali |
| **VLAN 30** | IP_CCTV | `10.10.30.0/24` | `10.10.30.1` | PoE IP Güvenlik Kameraları ve NVR |
| **VLAN 40** | CORP_WIFI | `10.10.40.0/24` | `10.10.40.1` | Access Point'ler ve Kablosuz Cihazlar |
| **VLAN 50** | FACTORY_OT | `10.10.50.0/24` | `10.10.50.1` | Siemens PLC'ler, CNC Makineleri, Modbus Gateway |

---

## 📝 Lisans

Bu proje eğitim ve kurumsal tasarım planlama prototiplemesi amacıyla geliştirilmiştir. Tüm hakları saklıdır.
