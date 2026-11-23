import type { UserProfile } from '../types/career';

export interface SamplePreset {
  id: string;
  label: string;
  summary: string;
  profile: UserProfile;
}

export const SAMPLE_PROFILE_PRESETS: SamplePreset[] = [
  {
    id: 'frontend-yeni-mezun',
    label: 'Yeni Mezun · Frontend Developer',
    summary: 'React, TypeScript ve kullanıcı arayüzü odaklı ilk tam zamanlı rol hazırlığı',
    profile: {
      targetRole: 'Junior Frontend Developer',
      experienceLevel: 'yeni_mezun',
      jobPosting:
        'React ve TypeScript ile ölçeklenebilir web arayüzleri geliştirecek, REST API entegrasyonlarında deneyimli, tasarım ekibiyle yakın çalışabilecek ve erişilebilirlik standartlarına dikkat eden Junior Frontend Developer arıyoruz.',
      resumeText:
        'Bilgisayar Mühendisliği 2025 mezunu. 2 yaz stajında React ve Tailwind CSS ile yönetim panelleri geliştirdim. Bitirme projemde gerçek zamanlı görev takip uygulaması yaptım.',
      hobbies: 'Sokak fotoğrafçılığı, satranç, açık kaynak arayüz bileşenleri incelemek',
      city: 'İstanbul',
      eventFormat: 'hibrit',
    },
  },
  {
    id: 'veri-analisti-stajyer',
    label: 'Stajyer · Veri Analisti',
    summary: 'SQL, Python ve iş zekâsı görselleştirme üzerine staj mülakatı',
    profile: {
      targetRole: 'Veri Analizi Stajyeri',
      experienceLevel: 'stajyer',
      jobPosting:
        'SQL sorguları yazabilen, Excel veya Python (pandas) ile veri temizleme yapabilen, bulgularını iş birimlerine sade grafiklerle sunabilecek uzun dönem Veri Analizi Stajyeri arıyoruz.',
      resumeText:
        'Endüstri Mühendisliği 3. sınıf öğrencisi. Üniversite proje kulübünde anket verilerini Excel ve temel SQL ile analiz edip dönem sonu sunumu hazırladım.',
      hobbies: 'Doğa yürüyüşü, masa oyunları, veri gazeteciliği okumaları',
      city: 'Ankara',
      eventFormat: 'cevrimici',
    },
  },
  {
    id: 'urun-yoneticisi-junior',
    label: 'Junior · Ürün Yöneticisi',
    summary: 'Kullanıcı araştırması, önceliklendirme ve ekip içi iletişim odaklı hazırlık',
    profile: {
      targetRole: 'Associate Product Manager',
      experienceLevel: 'junior',
      jobPosting:
        'Kullanıcı geri bildirimlerini analiz edip ürün yol haritasına dönüştürecek, yazılım ve tasarım ekipleriyle sprint planlaması yapacak, temel ürün metriklerini (retention, conversion) takip edecek Junior Ürün Yöneticisi.',
      resumeText:
        'İşletme mezunu, 1 yıl B2B SaaS şirketinde müşteri başarısı uzmanı olarak çalıştım. Müşteri taleplerini Jira üzerinde kategorize edip ürün ekibine haftalık raporladım.',
      hobbies: 'Doğaçlama tiyatro, kitap kulübü, podcast dinlemek',
      city: 'İzmir',
      eventFormat: 'yuz_yuze',
    },
  },
];
