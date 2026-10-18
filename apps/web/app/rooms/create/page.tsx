import { CreateRoomView } from '@/components/rooms/CreateRoomView';

export const metadata = {
  title: 'Tambah Kamar Baru - RentMate',
  description: 'Daftarkan unit kamar baru lengkap dengan spesifikasi, tarif sewa, fasilitas, dan foto.',
};

export default function CreateRoomPage() {
  return <CreateRoomView />;
}
