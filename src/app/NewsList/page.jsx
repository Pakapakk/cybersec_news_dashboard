"use client";
import React, { Suspense } from "react";
import NewsListContent from "./NewsListContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsListContent />
    </Suspense>
  );
}