"use client";
import React, { Suspense } from "react";
import SignInContent from "./SignInContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}