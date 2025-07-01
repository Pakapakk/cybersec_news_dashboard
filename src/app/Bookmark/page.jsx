"use client";

import React, { Suspense } from "react";
import BookmarkContent from "./BookmarkContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookmarkContent />
    </Suspense>
  );
}