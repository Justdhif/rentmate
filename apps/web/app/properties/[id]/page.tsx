import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PropertyDetailView } from '@/components/properties/PropertyDetailView';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <PropertyDetailView propertyId={id} />
    </AppLayout>
  );
}
