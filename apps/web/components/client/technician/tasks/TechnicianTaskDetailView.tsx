"use client";

import React from "react";
import { useParams } from "next/navigation";
import { MaintenanceView } from "@/components/client/owner/maintenance/MaintenanceView";

export function TechnicianTaskDetailView() {
  const params = useParams();
  const id = params?.id as string;

  return <MaintenanceView initialTaskId={id} />;
}
