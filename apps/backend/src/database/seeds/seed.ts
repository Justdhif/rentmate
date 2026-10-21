import * as dotenv from 'dotenv';
dotenv.config();
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as bcrypt from 'bcrypt';
import * as schema from '../schema';

async function runSeed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  console.log('🚀 Starting RentMate database seeder...');
  console.log('📡 Connecting to PostgreSQL database...');

  const client = postgres(connectionString, { ssl: 'require', max: 5 });
  const db = drizzle(client, { schema });

  try {
    console.log('🧹 Cleaning existing tables...');
    await client`
      TRUNCATE TABLE 
        maintenance_attachments,
        maintenance_requests,
        payment_invoices,
        payments,
        room_assignments,
        rooms,
        properties_facilities,
        properties,
        user_profiles,
        users
      CASCADE;
    `;
    console.log('✅ Tables cleaned successfully.');

    // 1. USERS & PROFILES
    console.log('👤 Seeding Users & User Profiles...');
    const defaultPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const usersData = [
      {
        email: 'admin@rentmate.com',
        role: 'ADMIN' as const,
        fullName: 'Super Admin RentMate',
        username: 'admin',
        phoneNumber: '+628119876543',
        gender: 'Laki-laki',
        birthDate: '1990-01-01',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      },
      {
        email: 'owner@rentmate.com',
        role: 'OWNER' as const,
        fullName: 'H. Budi Santoso',
        username: 'budisantoso',
        phoneNumber: '+628122334455',
        gender: 'Laki-laki',
        birthDate: '1980-05-12',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      },
      {
        email: 'technician@rentmate.com',
        role: 'TECHNICIAN' as const,
        fullName: 'Joko Widodo (Teknisi Listrik & AC)',
        username: 'jokoteknisi',
        phoneNumber: '+628135566778',
        gender: 'Laki-laki',
        birthDate: '1988-03-14',
        avatarUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200',
      },
      {
        email: 'tech.agus@rentmate.com',
        role: 'TECHNICIAN' as const,
        fullName: 'Agus Pratama (Teknisi Plumbing & Bangunan)',
        username: 'aguspratama',
        phoneNumber: '+628137788990',
        gender: 'Laki-laki',
        birthDate: '1992-11-25',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      },
      {
        email: 'tenant@rentmate.com',
        role: 'TENANT' as const,
        fullName: 'Dimas Aditya Pratama',
        username: 'dimasaditya',
        phoneNumber: '+628141122334',
        gender: 'Laki-laki',
        birthDate: '1998-07-19',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
      },
      {
        email: 'tenant.sari@rentmate.com',
        role: 'TENANT' as const,
        fullName: 'Sari Indah Lestari',
        username: 'sarilestari',
        phoneNumber: '+628142233445',
        gender: 'Perempuan',
        birthDate: '2000-02-14',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      },
      {
        email: 'tenant.rizky@rentmate.com',
        role: 'TENANT' as const,
        fullName: 'Rizky Maulana',
        username: 'rizkym',
        phoneNumber: '+628143344556',
        gender: 'Laki-laki',
        birthDate: '1999-10-08',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      },
      {
        email: 'tenant.nadia@rentmate.com',
        role: 'TENANT' as const,
        fullName: 'Nadia Utami',
        username: 'nadiautami',
        phoneNumber: '+628144455667',
        gender: 'Perempuan',
        birthDate: '2001-04-30',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
      },
      {
        email: 'tenant.farhan@rentmate.com',
        role: 'TENANT' as const,
        fullName: 'Farhan Nugraha',
        username: 'farhannugraha',
        phoneNumber: '+628145566778',
        gender: 'Laki-laki',
        birthDate: '1997-12-05',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
      },
      {
        email: 'tenant.arif@rentmate.com',
        role: 'TENANT' as const,
        fullName: 'Arif Setiawan',
        username: 'arifsetiawan',
        phoneNumber: '+628146677889',
        gender: 'Laki-laki',
        birthDate: '2002-08-18',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      },
      {
        email: 'user@rentmate.com',
        role: 'USER' as const,
        fullName: 'Rian Pratama (Pencari Kos)',
        username: 'rianpratama',
        phoneNumber: '+628151234567',
        gender: 'Laki-laki',
        birthDate: '2001-08-10',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      },
    ];

    const usersMap: Record<string, any> = {};

    for (const u of usersData) {
      const [insertedUser] = await db
        .insert(schema.users)
        .values({
          email: u.email,
          passwordHash,
          role: u.role,
          isVerified: true,
          provider: 'local',
          lastLoginAt: new Date(),
        })
        .returning();

      await db.insert(schema.userProfiles).values({
        userId: insertedUser.id,
        fullName: u.fullName,
        username: u.username,
        phoneNumber: u.phoneNumber,
        gender: u.gender,
        birthDate: u.birthDate,
        avatarUrl: u.avatarUrl,
      });

      usersMap[u.email] = insertedUser;
    }
    console.log(`✅ Seeded ${Object.keys(usersMap).length} users & profiles.`);

    // 2. PROPERTIES & FACILITIES
    console.log('🏢 Seeding Properties & Property Facilities...');
    const ownerBudi = usersMap['owner@rentmate.com'];

    const propertiesData = [
      {
        key: 'harmoni',
        ownerId: ownerBudi.id,
        name: 'Kost Harmoni Residence Tebet',
        address: 'Jl. Tebet Barat Dalam Raya No. 42, Tebet, Jakarta Selatan 12810',
        description:
          'Kost eksklusif dan tenang di lokasi sangat strategis kawasan Tebet. Hanya 5 menit jalan kaki ke Stasiun Tebet dan akses mudah ke Kota Kasablanka & Kuningan. Suasana nyaman untuk pekerja profesional dan mahasiswa.',
        rules:
          '1. Jam malam/tenang pukul 22.00 - 06.00 WIB.\n2. Tamu lawan jenis dilarang menginap di dalam kamar.\n3. Dilarang merokok di dalam kamar ber-AC.\n4. Matikan alat elektronik dan AC saat meninggalkan kamar.',
        contactInfo: '+628122334455 (Budi Santoso)',
        photos: [
          'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        ],
        facilities: [
          'High-Speed Wi-Fi (100 Mbps)',
          'Dapur Bersama & Kulkas',
          'Area Parkir Mobil & Motor Luas',
          'Security 24 Jam & One Gate System',
          'CCTV di Setiap Koridor',
          'Ruang Santai / Co-working Space',
          'Mesin Cuci & Area Jemuran Luas',
          'Dispenser Air Minum Gratis',
        ],
      },
      {
        key: 'griya_putri',
        ownerId: ownerBudi.id,
        name: 'Kost Griya Putri Asri Kemang',
        address: 'Jl. Kemang Timur No. 18, Bangka, Mampang Prapatan, Jakarta Selatan 12730',
        description:
          'Kost khusus putri yang asri, bersih, dan sangat aman di jantung Kemang. Dikelilingi kafe, supermarket, dan perkantoran. Lingkungan tenang dengan pengawasan keamanan maksimal.',
        rules:
          '1. Khusus penghuni putri.\n2. Gerbang utama dikunci pukul 23.00 WIB.\n3. Tamu pria hanya diperkenankan di ruang tamu utama / lobi bersama.\n4. Menjaga kebersihan dan kenyamanan bersama.',
        contactInfo: '+628122334455 (Budi Santoso)',
        photos: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
        ],
        facilities: [
          'Wi-Fi Fiber Optic',
          'Security 24 Jam Khusus Kost Putri',
          'Dapur Bersama Lengkap Alat Masak',
          'Parkir Motor Aman & Beratap',
          'Ruang Tamu Bersama Nyaman',
          'Dispenser Air Minum Bersama',
          'Layanan Kebersihan Area Umum Tiap Hari',
        ],
      },
      {
        key: 'graha_mhs',
        ownerId: ownerBudi.id,
        name: 'Kost Graha Mahasiswa Margonda',
        address: 'Jl. Margonda Raya No. 250, Pondok Cina, Beji, Depok, Jawa Barat 16424',
        description:
          'Kost modern dan dinamis tepat di samping Kampus UI Depok & Gunadarma. Dekat stasiun KRL Pondok Cina. Dilengkapi ruang belajar bersama dan internet super cepat untuk menunjang aktivitas kuliah.',
        rules:
          '1. Dilarang membawa miras atau obat-obatan terlarang.\n2. Waktu berkunjung tamu maksimal pukul 22.00 WIB.\n3. Menjaga kebersihan dapur dan fasilitas bersama.\n4. Parkir rapi sesuai slot kendaraan.',
        contactInfo: '+628122334455 (Budi Santoso)',
        photos: [
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        ],
        facilities: [
          'Dedicated High-Speed WiFi (150 Mbps)',
          'Ruang Belajar Bersama (Study Room)',
          'Parkir Motor & Mobil Berkanopi',
          'Access Card & CCTV 24 Jam',
          'Dapur Bersama Tiap Lantai',
          'Laundry Koin & Kantin Dekat Kost',
        ],
      },
    ];

    const propertiesMap: Record<string, any> = {};

    for (const p of propertiesData) {
      const [insertedProperty] = await db
        .insert(schema.properties)
        .values({
          ownerId: p.ownerId,
          name: p.name,
          address: p.address,
          description: p.description,
          rules: p.rules,
          contactInfo: p.contactInfo,
          photos: p.photos,
        })
        .returning();

      propertiesMap[p.key] = insertedProperty;

      for (const facilityName of p.facilities) {
        await db.insert(schema.propertyFacilities).values({
          propertyId: insertedProperty.id,
          name: facilityName,
        });
      }
    }
    console.log(`✅ Seeded ${Object.keys(propertiesMap).length} properties & facilities.`);

    // 3. ROOMS
    console.log('🚪 Seeding Rooms...');
    const roomsData = [
      // Property 1: Kost Harmoni Residence Tebet (5 rooms)
      {
        key: 'harmoni_101',
        propertyId: propertiesMap['harmoni'].id,
        roomNumber: '101',
        floor: 1,
        roomType: 'Deluxe Queen',
        price: '2200000.00',
        status: 'OCCUPIED' as const,
        description: 'Kamar deluxe lantai 1 dengan jendela menghadap taman dalam. Sejuk, tenang, dan nyaman.',
        facilities: [
          'AC Daikin 1/2 PK',
          'Kamar Mandi Dalam',
          'Water Heater Ariston',
          'Kasur Springbed Queen Size (160x200)',
          'Meja Kerja & Kursi Ergonomis',
          'Lemari Pakaian 2 Pintu',
          'Smart TV 32 Inch',
        ],
        photos: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        ],
      },
      {
        key: 'harmoni_102',
        propertyId: propertiesMap['harmoni'].id,
        roomNumber: '102',
        floor: 1,
        roomType: 'Deluxe Queen',
        price: '2200000.00',
        status: 'OCCUPIED' as const,
        description: 'Kamar deluxe lantai 1 posisi sudut dengan sirkulasi udara sangat baik.',
        facilities: [
          'AC Daikin 1/2 PK',
          'Kamar Mandi Dalam',
          'Water Heater',
          'Kasur Springbed Queen Size',
          'Meja Belajar Kayu Jati',
          'Lemari Pakaian Minimalis',
        ],
        photos: [
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
        ],
      },
      {
        key: 'harmoni_103',
        propertyId: propertiesMap['harmoni'].id,
        roomNumber: '103',
        floor: 1,
        roomType: 'Standard Single',
        price: '1700000.00',
        status: 'AVAILABLE' as const,
        description: 'Kamar standard minimalis yang nyaman dan bersih, siap huni.',
        facilities: [
          'AC Panasonic 1/2 PK',
          'Kamar Mandi Luar Bersih',
          'Kasur Single Bed (100x200)',
          'Meja & Kursi Kerja',
          'Lemari Pakaian 1 Pintu',
        ],
        photos: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
        ],
      },
      {
        key: 'harmoni_201',
        propertyId: propertiesMap['harmoni'].id,
        roomNumber: '201',
        floor: 2,
        roomType: 'VIP Balcony Suite',
        price: '2800000.00',
        status: 'OCCUPIED' as const,
        description: 'Kamar VIP lantai 2 dilengkapi balkon pribadi dengan pemandangan kota yang asri.',
        facilities: [
          'AC Sharp 1 PK Inverter',
          'Balkon Pribadi',
          'Kamar Mandi Dalam Mewah',
          'Water Heater & Kaca Shower',
          'Kasur King Koil King Size',
          'Kulkas Mini Bar',
          'Smart TV 43 Inch 4K',
          'Meja Kerja Eksekutif',
        ],
        photos: [
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
        ],
      },
      {
        key: 'harmoni_202',
        propertyId: propertiesMap['harmoni'].id,
        roomNumber: '202',
        floor: 2,
        roomType: 'VIP Suite',
        price: '2800000.00',
        status: 'MAINTENANCE' as const,
        description: 'Kamar VIP lantai 2 sedang dalam proses pengecatan ulang dan servis pendingin ruangan.',
        facilities: [
          'AC Inverter 1 PK',
          'Kamar Mandi Dalam',
          'Water Heater',
          'Kasur Springbed King',
          'Lemari Wardrobe Besar',
        ],
        photos: [
          'https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=800',
        ],
      },

      // Property 2: Kost Griya Putri Asri Kemang (4 rooms)
      {
        key: 'griya_a1',
        propertyId: propertiesMap['griya_putri'].id,
        roomNumber: 'A1',
        floor: 1,
        roomType: 'Putri Standard',
        price: '1500000.00',
        status: 'OCCUPIED' as const,
        description: 'Kamar lantai 1 dekat lobby, pencahayaan alami melimpah dengan wallpaper estetis.',
        facilities: [
          'AC Gree 1/2 PK',
          'Kamar Mandi Dalam',
          'Kasur Single Springbed',
          'Cermin Rias & Meja Kerja',
          'Lemari Pakaian Minimalis',
        ],
        photos: [
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
        ],
      },
      {
        key: 'griya_a2',
        propertyId: propertiesMap['griya_putri'].id,
        roomNumber: 'A2',
        floor: 1,
        roomType: 'Putri Standard',
        price: '1500000.00',
        status: 'OCCUPIED' as const,
        description: 'Kamar nyaman, bersih, sirkulasi udara sejuk dekat taman samping.',
        facilities: [
          'AC Gree 1/2 PK',
          'Kamar Mandi Dalam',
          'Kasur Single Springbed',
          'Meja Belajar',
          'Lemari Pakaian',
        ],
        photos: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
        ],
      },
      {
        key: 'griya_b1',
        propertyId: propertiesMap['griya_putri'].id,
        roomNumber: 'B1',
        floor: 2,
        roomType: 'Putri Deluxe',
        price: '1900000.00',
        status: 'AVAILABLE' as const,
        description: 'Kamar deluxe lantai 2 dengan kamar mandi dalam & water heater.',
        facilities: [
          'AC Daikin 1/2 PK',
          'Kamar Mandi Dalam',
          'Water Heater',
          'Kasur Queen Size (160x200)',
          'Meja Rias & Kerja',
          'Lemari 2 Pintu dengan Kaca',
        ],
        photos: [
          'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
        ],
      },
      {
        key: 'griya_b2',
        propertyId: propertiesMap['griya_putri'].id,
        roomNumber: 'B2',
        floor: 2,
        roomType: 'Putri Deluxe',
        price: '1900000.00',
        status: 'AVAILABLE' as const,
        description: 'Kamar deluxe luas lantai 2 dengan view asri pepohonan Kemang.',
        facilities: [
          'AC Daikin 1/2 PK',
          'Kamar Mandi Dalam',
          'Water Heater',
          'Kasur Queen Size',
          'Meja Kerja & Lemari',
        ],
        photos: [
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
        ],
      },

      // Property 3: Kost Graha Mahasiswa Margonda (3 rooms)
      {
        key: 'graha_101',
        propertyId: propertiesMap['graha_mhs'].id,
        roomNumber: '101',
        floor: 1,
        roomType: 'Student Standard',
        price: '1600000.00',
        status: 'OCCUPIED' as const,
        description: 'Kamar mahasiswa lantai 1 dengan meja belajar luas dan koneksi LAN / WiFi kencang.',
        facilities: [
          'AC 1/2 PK',
          'Kamar Mandi Dalam',
          'Kasur Single Bed',
          'Meja Belajar Komputer & Rak Buku',
          'Lemari Pakaian',
        ],
        photos: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
        ],
      },
      {
        key: 'graha_102',
        propertyId: propertiesMap['graha_mhs'].id,
        roomNumber: '102',
        floor: 1,
        roomType: 'Student Standard',
        price: '1600000.00',
        status: 'AVAILABLE' as const,
        description: 'Kamar siap huni untuk mahasiswa baru atau pekerja muda Margonda.',
        facilities: [
          'AC 1/2 PK',
          'Kamar Mandi Dalam',
          'Kasur Single Bed',
          'Meja Belajar & Kursi',
          'Lemari Pakaian',
        ],
        photos: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
        ],
      },
      {
        key: 'graha_201',
        propertyId: propertiesMap['graha_mhs'].id,
        roomNumber: '201',
        floor: 2,
        roomType: 'Student Studio',
        price: '2000000.00',
        status: 'MAINTENANCE' as const,
        description: 'Kamar studio luas lantai 2, sedang dalam perbaikan kran wastafel dan plafon.',
        facilities: [
          'AC 3/4 PK',
          'Kamar Mandi Dalam',
          'Water Heater',
          'Kasur Queen Bed',
          'Meja Belajar & Lemari',
        ],
        photos: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        ],
      },
    ];

    const roomsMap: Record<string, any> = {};

    for (const r of roomsData) {
      const [insertedRoom] = await db
        .insert(schema.rooms)
        .values({
          propertyId: r.propertyId,
          roomNumber: r.roomNumber,
          floor: r.floor,
          roomType: r.roomType,
          price: r.price,
          status: r.status,
          description: r.description,
          facilities: r.facilities,
          photos: r.photos,
        })
        .returning();

      roomsMap[r.key] = insertedRoom;
    }
    console.log(`✅ Seeded ${Object.keys(roomsMap).length} rooms.`);

    // 4. ROOM ASSIGNMENTS
    console.log('📋 Seeding Room Assignments...');
    const tenantDimas = usersMap['tenant@rentmate.com'];
    const tenantRizky = usersMap['tenant.rizky@rentmate.com'];
    const tenantFarhan = usersMap['tenant.farhan@rentmate.com'];
    const tenantSari = usersMap['tenant.sari@rentmate.com'];
    const tenantNadia = usersMap['tenant.nadia@rentmate.com'];
    const tenantArif = usersMap['tenant.arif@rentmate.com'];

    const assignmentsData = [
      {
        key: 'assign_dimas',
        roomId: roomsMap['harmoni_101'].id,
        tenantId: tenantDimas.id,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        monthlyRent: '2200000.00',
        status: 'ACTIVE' as const,
        notes: 'Kontrak sewa tahunan (Jan 2026 - Des 2026), pembayaran setiap tanggal 10.',
      },
      {
        key: 'assign_rizky',
        roomId: roomsMap['harmoni_102'].id,
        tenantId: tenantRizky.id,
        startDate: '2026-02-01',
        endDate: '2026-08-01',
        monthlyRent: '2200000.00',
        status: 'ACTIVE' as const,
        notes: 'Kontrak 6 bulan, mahasiswa magang di Kuningan.',
      },
      {
        key: 'assign_farhan',
        roomId: roomsMap['harmoni_201'].id,
        tenantId: tenantFarhan.id,
        startDate: '2025-11-01',
        endDate: '2026-11-01',
        monthlyRent: '2800000.00',
        status: 'ACTIVE' as const,
        notes: 'Karyawan konsultan SCBD, perpanjangan sewa tahun ke-2.',
      },
      {
        key: 'assign_sari',
        roomId: roomsMap['griya_a1'].id,
        tenantId: tenantSari.id,
        startDate: '2026-01-15',
        endDate: '2026-07-15',
        monthlyRent: '1500000.00',
        status: 'ACTIVE' as const,
        notes: 'Mahasiswi semester akhir, kontrak 6 bulan.',
      },
      {
        key: 'assign_nadia',
        roomId: roomsMap['griya_a2'].id,
        tenantId: tenantNadia.id,
        startDate: '2026-02-01',
        endDate: '2027-02-01',
        monthlyRent: '1500000.00',
        status: 'ACTIVE' as const,
        notes: 'Karyawati startup Kemang, kontrak sewa 1 tahun.',
      },
      {
        key: 'assign_arif',
        roomId: roomsMap['graha_101'].id,
        tenantId: tenantArif.id,
        startDate: '2026-01-01',
        endDate: '2027-01-01',
        monthlyRent: '1600000.00',
        status: 'ACTIVE' as const,
        notes: 'Mahasiswa Fasilkom UI semester 6, kontrak 1 tahun.',
      },
      // Past / Ended assignment
      {
        key: 'assign_dimas_past',
        roomId: roomsMap['harmoni_103'].id,
        tenantId: tenantDimas.id,
        startDate: '2025-06-01',
        endDate: '2025-12-31',
        monthlyRent: '1700000.00',
        status: 'ENDED' as const,
        notes: 'Pindah ke Kamar 101 yang lebih besar per 1 Januari 2026.',
      },
    ];

    const assignmentsMap: Record<string, any> = {};

    for (const a of assignmentsData) {
      const [insertedAssignment] = await db
        .insert(schema.roomAssignments)
        .values({
          roomId: a.roomId,
          tenantId: a.tenantId,
          startDate: a.startDate,
          endDate: a.endDate,
          monthlyRent: a.monthlyRent,
          status: a.status,
          notes: a.notes,
        })
        .returning();

      assignmentsMap[a.key] = insertedAssignment;
    }
    console.log(`✅ Seeded ${Object.keys(assignmentsMap).length} room assignments.`);

    // 5. PAYMENTS & INVOICES
    console.log('💳 Seeding Payments & Payment Invoices...');
    const paymentsData = [
      // Dimas (Room 101 - 2.200.000)
      {
        tenantId: tenantDimas.id,
        roomId: roomsMap['harmoni_101'].id,
        amount: '2200000.00',
        dueDate: '2026-01-10',
        paidAt: new Date('2026-01-08T10:15:30Z'),
        status: 'PAID' as const,
        paymentMethod: 'bca_va',
        transactionReference: 'TRX-20260108-BCA-101',
        snapToken: 'snap-token-seed-202601-101',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-1',
        period: '2026-01',
        invoiceNumber: 'INV/202601/HM-101',
      },
      {
        tenantId: tenantDimas.id,
        roomId: roomsMap['harmoni_101'].id,
        amount: '2200000.00',
        dueDate: '2026-02-10',
        paidAt: new Date('2026-02-09T14:20:00Z'),
        status: 'PAID' as const,
        paymentMethod: 'qris',
        transactionReference: 'TRX-20260209-QRIS-101',
        snapToken: 'snap-token-seed-202602-101',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-2',
        period: '2026-02',
        invoiceNumber: 'INV/202602/HM-101',
      },
      {
        tenantId: tenantDimas.id,
        roomId: roomsMap['harmoni_101'].id,
        amount: '2200000.00',
        dueDate: '2026-03-10',
        paidAt: null,
        status: 'OVERDUE' as const,
        paymentMethod: null,
        transactionReference: null,
        snapToken: 'snap-token-seed-202603-101',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-3',
        period: '2026-03',
        invoiceNumber: null,
      },

      // Rizky (Room 102 - 2.200.000)
      {
        tenantId: tenantRizky.id,
        roomId: roomsMap['harmoni_102'].id,
        amount: '2200000.00',
        dueDate: '2026-02-10',
        paidAt: new Date('2026-02-05T09:30:15Z'),
        status: 'PAID' as const,
        paymentMethod: 'mandiri_va',
        transactionReference: 'TRX-20260205-MND-102',
        snapToken: 'snap-token-seed-202602-102',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-4',
        period: '2026-02',
        invoiceNumber: 'INV/202602/HM-102',
      },
      {
        tenantId: tenantRizky.id,
        roomId: roomsMap['harmoni_102'].id,
        amount: '2200000.00',
        dueDate: '2026-03-25',
        paidAt: null,
        status: 'PENDING' as const,
        paymentMethod: null,
        transactionReference: null,
        snapToken: 'snap-token-seed-202603-102',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-5',
        period: '2026-03',
        invoiceNumber: null,
      },

      // Farhan (Room 201 - 2.800.000)
      {
        tenantId: tenantFarhan.id,
        roomId: roomsMap['harmoni_201'].id,
        amount: '2800000.00',
        dueDate: '2026-01-05',
        paidAt: new Date('2026-01-03T16:45:00Z'),
        status: 'PAID' as const,
        paymentMethod: 'bca_va',
        transactionReference: 'TRX-20260103-BCA-201',
        snapToken: 'snap-token-seed-202601-201',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-6',
        period: '2026-01',
        invoiceNumber: 'INV/202601/HM-201',
      },
      {
        tenantId: tenantFarhan.id,
        roomId: roomsMap['harmoni_201'].id,
        amount: '2800000.00',
        dueDate: '2026-02-05',
        paidAt: new Date('2026-02-04T11:10:00Z'),
        status: 'PAID' as const,
        paymentMethod: 'bca_va',
        transactionReference: 'TRX-20260204-BCA-201',
        snapToken: 'snap-token-seed-202602-201',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-7',
        period: '2026-02',
        invoiceNumber: 'INV/202602/HM-201',
      },
      {
        tenantId: tenantFarhan.id,
        roomId: roomsMap['harmoni_201'].id,
        amount: '2800000.00',
        dueDate: '2026-03-05',
        paidAt: new Date('2026-03-04T08:50:00Z'),
        status: 'PAID' as const,
        paymentMethod: 'gopay',
        transactionReference: 'TRX-20260304-GPY-201',
        snapToken: 'snap-token-seed-202603-201',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-8',
        period: '2026-03',
        invoiceNumber: 'INV/202603/HM-201',
      },

      // Sari (Room A1 - 1.500.000)
      {
        tenantId: tenantSari.id,
        roomId: roomsMap['griya_a1'].id,
        amount: '1500000.00',
        dueDate: '2026-02-15',
        paidAt: new Date('2026-02-14T18:00:00Z'),
        status: 'PAID' as const,
        paymentMethod: 'qris',
        transactionReference: 'TRX-20260214-QRIS-A1',
        snapToken: 'snap-token-seed-202602-A1',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-9',
        period: '2026-02',
        invoiceNumber: 'INV/202602/GP-A1',
      },
      {
        tenantId: tenantSari.id,
        roomId: roomsMap['griya_a1'].id,
        amount: '1500000.00',
        dueDate: '2026-03-15',
        paidAt: null,
        status: 'PENDING' as const,
        paymentMethod: null,
        transactionReference: null,
        snapToken: 'snap-token-seed-202603-A1',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-10',
        period: '2026-03',
        invoiceNumber: null,
      },

      // Nadia (Room A2 - 1.500.000)
      {
        tenantId: tenantNadia.id,
        roomId: roomsMap['griya_a2'].id,
        amount: '1500000.00',
        dueDate: '2026-02-10',
        paidAt: null,
        status: 'FAILED' as const,
        paymentMethod: 'bca_va',
        transactionReference: 'TRX-20260210-FAIL-A2',
        snapToken: 'snap-token-seed-202602-A2-FAIL',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-11',
        period: '2026-02',
        invoiceNumber: null,
      },
      {
        tenantId: tenantNadia.id,
        roomId: roomsMap['griya_a2'].id,
        amount: '1500000.00',
        dueDate: '2026-02-12',
        paidAt: new Date('2026-02-12T13:40:00Z'),
        status: 'PAID' as const,
        paymentMethod: 'bca_va',
        transactionReference: 'TRX-20260212-BCA-A2',
        snapToken: 'snap-token-seed-202602-A2-RETRY',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-12',
        period: '2026-02',
        invoiceNumber: 'INV/202602/GP-A2',
      },

      // Arif (Graha Mhs 101 - 1.600.000)
      {
        tenantId: tenantArif.id,
        roomId: roomsMap['graha_101'].id,
        amount: '1600000.00',
        dueDate: '2026-02-10',
        paidAt: new Date('2026-02-08T11:25:00Z'),
        status: 'PAID' as const,
        paymentMethod: 'bca_va',
        transactionReference: 'TRX-20260208-BCA-GM101',
        snapToken: 'snap-token-seed-202602-GM101',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-13',
        period: '2026-02',
        invoiceNumber: 'INV/202602/GM-101',
      },
      {
        tenantId: tenantArif.id,
        roomId: roomsMap['graha_101'].id,
        amount: '1600000.00',
        dueDate: '2026-03-10',
        paidAt: null,
        status: 'PENDING' as const,
        paymentMethod: null,
        transactionReference: null,
        snapToken: 'snap-token-seed-202603-GM101',
        snapRedirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-14',
        period: '2026-03',
        invoiceNumber: null,
      },
    ];

    let seededInvoicesCount = 0;
    for (const pay of paymentsData) {
      const { invoiceNumber, ...paymentValues } = pay;
      const [insertedPayment] = await db
        .insert(schema.payments)
        .values(paymentValues)
        .returning();

      if (invoiceNumber && pay.status === 'PAID') {
        await db.insert(schema.paymentInvoices).values({
          paymentId: insertedPayment.id,
          invoiceNumber,
          invoiceUrl: `https://rentmate.id/invoices/${invoiceNumber.replace(/\//g, '-')}.pdf`,
          createdAt: pay.paidAt ?? new Date(),
        });
        seededInvoicesCount++;
      }
    }
    console.log(`✅ Seeded ${paymentsData.length} payments and ${seededInvoicesCount} payment invoices.`);

    // 6. MAINTENANCE REQUESTS & ATTACHMENTS
    console.log('🛠️ Seeding Maintenance Requests & Attachments...');
    const techJoko = usersMap['technician@rentmate.com'];
    const techAgus = usersMap['tech.agus@rentmate.com'];

    const maintenanceData = [
      {
        ticketNumber: 'MT-1001',
        roomId: roomsMap['harmoni_101'].id,
        tenantId: tenantDimas.id,
        assignedTo: techJoko.id,
        category: 'Pendingin Ruangan (AC)',
        description:
          'AC di kamar 101 mengeluarkan suara berisik bergetar dan hembusan angin tidak dingin sejak 2 hari yang lalu. Suhu ruangan tetap gerah meski remote diset di 18°C.',
        priority: 'HIGH' as const,
        status: 'RESOLVED' as const,
        aiSummary:
          'AC kurang dingin disertai kebisingan unit indoor/blower, indikasi penumpukan debu tebal pada evaporator atau kebocoran freon R32.',
        aiRecommendation:
          'Lakukan pencucian total (deep cleaning) unit indoor dan outdoor, pembersihan filter udara, serta ukur tekanan freon (normal 140-150 psi pada R32).',
        estimatedCost: '250000.00',
        actualCost: '250000.00',
        workSummary:
          'Dilakukan pembersihan menyeluruh unit indoor & outdoor, pengencangan baut braket blower yang kendur, dan penambahan freon R32.',
        materialsUsed: 'Freon R32 0.5 kg, Pembersih kimia koil pendingin',
        resolvedAt: new Date('2026-02-20T11:00:00Z'),
        closedAt: new Date('2026-02-21T09:00:00Z'),
        attachments: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
            fileType: 'BEFORE',
          },
          {
            fileUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
            fileType: 'AFTER',
          },
        ],
      },
      {
        ticketNumber: 'MT-1002',
        roomId: roomsMap['harmoni_102'].id,
        tenantId: tenantRizky.id,
        assignedTo: techAgus.id,
        category: 'Plumbing / Pipa Saluran',
        description:
          'Kran wastafel di kamar mandi bocor terus-menerus pada bagian leher kran. Air menetes terus ke lantai dan membuat area kamar mandi selalu becek.',
        priority: 'MEDIUM' as const,
        status: 'IN_PROGRESS' as const,
        aiSummary:
          'Kebocoran pada leher kran wastafel kamar mandi, menyebabkan genangan air terus-menerus dan pemborosan air.',
        aiRecommendation:
          'Periksa seal karet (O-ring) pada drat sambungan leher kran. Jika aus atau retak, ganti seal atau unit kran stainless fleksibel 1/2 inch baru.',
        estimatedCost: '120000.00',
        actualCost: null,
        workSummary: 'Kran lama sudah dibongkar, sedang memasang kran stainless fleksibel pengganti.',
        materialsUsed: 'Kran fleksibel 1/2 inch, Seal tape pipa Onda',
        resolvedAt: null,
        closedAt: null,
        attachments: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
            fileType: 'BEFORE',
          },
        ],
      },
      {
        ticketNumber: 'MT-1003',
        roomId: roomsMap['griya_a1'].id,
        tenantId: tenantSari.id,
        assignedTo: techJoko.id,
        category: 'Kelistrikan',
        description:
          'Stopkontak di sebelah meja belajar mengeluarkan bau hangus terbakar dan ada percikan api kecil saat mencolokkan adaptor charger. Saklar langsung saya matikan.',
        priority: 'URGENT' as const,
        status: 'ASSIGNED' as const,
        aiSummary:
          'Percikan api dan bau hangus pada stopkontak dinding. Risiko bahaya korsleting arus pendek dan kebakaran tinggi.',
        aiRecommendation:
          'TINDAKAN SEGERA: Turunkan saklar MCB kamar terkait. Buka penutup stopkontak, periksa terminal kabel dari kemungkinan kendor atau isolasi kabel meleleh, dan pasang stopkontak SNI baru.',
        estimatedCost: '150000.00',
        actualCost: null,
        workSummary: null,
        materialsUsed: null,
        resolvedAt: null,
        closedAt: null,
        attachments: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
            fileType: 'BEFORE',
          },
        ],
      },
      {
        ticketNumber: 'MT-1004',
        roomId: roomsMap['griya_a2'].id,
        tenantId: tenantNadia.id,
        assignedTo: null,
        category: 'Pintu & Lemari',
        description:
          'Engsel pintu lemari pakaian sebelah kiri terlepas sekrupnya sehingga pintu menggantung miring dan sulit ditutup.',
        priority: 'LOW' as const,
        status: 'REPORTED' as const,
        aiSummary: 'Engsel sendok lemari pakaian longgar/lepas, masalah perabot kamar non-urgent.',
        aiRecommendation:
          'Gunakan sekrup kayu yang sedikit lebih tebal atau beri sumbatan lem kayu (wood filler) pada lubang sekrup lama sebelum memasang kembali.',
        estimatedCost: '50000.00',
        actualCost: null,
        workSummary: null,
        materialsUsed: null,
        resolvedAt: null,
        closedAt: null,
        attachments: [],
      },
      {
        ticketNumber: 'MT-1005',
        roomId: roomsMap['harmoni_201'].id,
        tenantId: tenantFarhan.id,
        assignedTo: null,
        category: 'Kebocoran & Plafon',
        description:
          'Plafon di dekat kusen jendela kamar lantai 2 mengalami rembesan air saat hujan lebat kemarin, ada noda kecokelatan di gipsum.',
        priority: 'HIGH' as const,
        status: 'REVIEWING' as const,
        aiSummary:
          'Rembesan air hujan pada plafon dekat kusen jendela, indikasi sealant eksterior jendela rusak atau retak rambut pada dinding luar.',
        aiRecommendation:
          'Cek dinding eksterior lantai 2 dari luar, bersihkan dan aplikasikan lem sealant silikon anti-air pada kusen jendela serta waterproofing pada dinding luar.',
        estimatedCost: '350000.00',
        actualCost: null,
        workSummary: null,
        materialsUsed: null,
        resolvedAt: null,
        closedAt: null,
        attachments: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
            fileType: 'BEFORE',
          },
        ],
      },
      {
        ticketNumber: 'MT-1006',
        roomId: roomsMap['harmoni_202'].id,
        tenantId: tenantDimas.id,
        assignedTo: techAgus.id,
        category: 'Renovasi & Pemeliharaan',
        description:
          'Pengecatan ulang seluruh dinding kamar 202 dan perapian nat keramik kamar mandi sebelum kamar disewakan kembali.',
        priority: 'MEDIUM' as const,
        status: 'CLOSED' as const,
        aiSummary:
          'Pekerjaan pemeliharaan rutin kamar kosong: pengecatan dinding dan rekondisi nat keramik kamar mandi.',
        aiRecommendation:
          'Gunakan cat interior tahan jamur (anti-fungal) dan pasta pengisi nat keramik kedap air AM 53.',
        estimatedCost: '600000.00',
        actualCost: '580000.00',
        workSummary:
          'Pengecatan 2 lapis selesai dengan rapi, nat keramik kamar mandi sudah ditutup ulang dan dibersihkan.',
        materialsUsed: 'Cat tembok Dulux 5kg, Pasta pengisi nat keramik AM 53, Kuas & roll cat',
        resolvedAt: new Date('2026-02-15T15:00:00Z'),
        closedAt: new Date('2026-02-16T10:00:00Z'),
        attachments: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800',
            fileType: 'BEFORE',
          },
          {
            fileUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=800',
            fileType: 'AFTER',
          },
        ],
      },
      {
        ticketNumber: 'MT-1007',
        roomId: roomsMap['graha_201'].id,
        tenantId: tenantArif.id,
        assignedTo: techAgus.id,
        category: 'Plumbing & Sanitasi',
        description:
          'Kran wastafel dol/longgar dan ada rembesan air pada pipa pembuangan di atas plafon kamar mandi kamar 201.',
        priority: 'HIGH' as const,
        status: 'IN_PROGRESS' as const,
        aiSummary:
          'Kebocoran pipa pembuangan di atas plafon kamar mandi serta kran wastafel rusak aus drat.',
        aiRecommendation:
          'Ganti sambungan fitting pipa PVC 1.5 inch dan kencangkan klem gantung pipa. Pasang unit kran wastafel baru.',
        estimatedCost: '220000.00',
        actualCost: null,
        workSummary: 'Plafon sudah dibuka, sedang mengganti elbow sambungan pipa PVC yang retak.',
        materialsUsed: 'Elbow PVC 1.5 inch Rucika, Lem pipa PVC Isarplas, Kran wastafel Onda',
        resolvedAt: null,
        closedAt: null,
        attachments: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
            fileType: 'BEFORE',
          },
        ],
      },
    ];

    let seededAttachmentsCount = 0;
    for (const m of maintenanceData) {
      const { attachments, ...requestValues } = m;
      const [insertedReq] = await db
        .insert(schema.maintenanceRequests)
        .values(requestValues)
        .returning();

      if (attachments && attachments.length > 0) {
        for (const att of attachments) {
          await db.insert(schema.maintenanceAttachments).values({
            maintenanceRequestId: insertedReq.id,
            fileUrl: att.fileUrl,
            fileType: att.fileType,
          });
          seededAttachmentsCount++;
        }
      }
    }
    console.log(
      `✅ Seeded ${maintenanceData.length} maintenance requests and ${seededAttachmentsCount} attachments.`,
    );

    console.log('🎉 =======================================================');
    console.log('🎉 All 10 database tables seeded successfully!');
    console.log('🎉 FOCUSED ON SINGLE OWNER: H. Budi Santoso (owner@rentmate.com)');
    console.log('🎉 =======================================================');
    console.log('📋 Default credentials for testing (Password: Password123!):');
    console.log('   - ADMIN:       admin@rentmate.com');
    console.log('   - OWNER:       owner@rentmate.com (H. Budi Santoso - Pemilik Seluruh Properti)');
    console.log('   - TECHNICIAN:  technician@rentmate.com (Joko Widodo - Listrik/AC)');
    console.log('   - TECHNICIAN:  tech.agus@rentmate.com (Agus Pratama - Plumbing)');
    console.log('   - TENANT 1:    tenant@rentmate.com (Dimas Aditya - Harmoni Rm 101)');
    console.log('   - TENANT 2:    tenant.sari@rentmate.com (Sari Indah - Griya Putri Rm A1)');
    console.log('   - TENANT 3:    tenant.rizky@rentmate.com (Rizky Maulana - Harmoni Rm 102)');
    console.log('   - TENANT 4:    tenant.nadia@rentmate.com (Nadia Utami - Griya Putri Rm A2)');
    console.log('   - TENANT 5:    tenant.farhan@rentmate.com (Farhan Nugraha - Harmoni Rm 201)');
    console.log('   - TENANT 6:    tenant.arif@rentmate.com (Arif Setiawan - Graha Mhs Rm 101)');
    console.log('🎉 =======================================================');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  } finally {
    await client.end();
  }
}

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});