"use client";

import { useEffect } from "react";
import { tape } from "@/lib/tape";

/** 테이프 엔진 시작 */
export default function Boot() {
  useEffect(() => tape.start(), []);
  return null;
}
