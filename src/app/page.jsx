"use client";
import React, { Suspense } from "react";
import DashboardContent from "./DashboardContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}