"use client";

import React from "react";
import LoginPage from "./LoginPage";

export default function LoginPageClient() {
  const handleSuccess = () => {
    window.location.reload();
  };

  return <LoginPage onLoginSuccess={handleSuccess} />;
}
