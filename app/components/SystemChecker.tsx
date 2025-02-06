"use client";

import React from "react";
import { LLMModel } from "@/app/data/llm-models";
import { Check, X } from "lucide-react";

export interface SystemInfo {
  CPU: string;
  RAM: string;
  GPU: string;
  VRAM: string;
  OS: string;
}

interface SystemCheckerProps {
  systemInfo?: SystemInfo;
  comparisonModel?: LLMModel;
}

function compareRAMorVRAM(actual: string, required: string): boolean {
  if (actual === "Unknown") return false;

  const actualGB = parseFloat(actual.split(" ")[0]);
  const requiredGB = parseFloat(required.split(" ")[0]);
  return actualGB >= requiredGB;
}

function compareOS(actual: string, required: string): boolean {
  if (actual === "Unknown") return false;
  return actual.toLowerCase() === required.toLowerCase();
}

export function SystemChecker({
  systemInfo,
  comparisonModel,
}: SystemCheckerProps) {
  if (!systemInfo) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="p-4 text-left font-medium border">Your System</th>
            {comparisonModel && (
              <th className="p-4 text-left font-medium border">
                {comparisonModel.name} Requirements
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-4 border">
              <div className="flex items-center gap-2">
                <span className="font-medium">CPU:</span>
                <span
                  className={systemInfo.CPU === "Unknown" ? "text-red-500" : ""}
                >
                  {systemInfo.CPU}
                </span>
              </div>
            </td>
            {comparisonModel && (
              <td className="p-4 border">
                <div className="flex items-center gap-2">
                  {systemInfo.CPU !== "Unknown" ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  {comparisonModel.requirements.CPU}
                </div>
              </td>
            )}
          </tr>
          <tr className="bg-muted/50">
            <td className="p-4 border">
              <div className="flex items-center gap-2">
                <span className="font-medium">RAM:</span>
                <span
                  className={systemInfo.RAM === "Unknown" ? "text-red-500" : ""}
                >
                  {systemInfo.RAM}
                </span>
              </div>
            </td>
            {comparisonModel && (
              <td className="p-4 border">
                <div className="flex items-center gap-2">
                  {compareRAMorVRAM(
                    systemInfo.RAM,
                    comparisonModel.requirements.RAM,
                  ) ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  {comparisonModel.requirements.RAM}
                </div>
              </td>
            )}
          </tr>
          <tr>
            <td className="p-4 border">
              <div className="flex items-center gap-2">
                <span className="font-medium">GPU:</span>
                <span
                  className={systemInfo.GPU === "Unknown" ? "text-red-500" : ""}
                >
                  {systemInfo.GPU}
                </span>
              </div>
            </td>
            {comparisonModel && (
              <td className="p-4 border">
                <div className="flex items-center gap-2">
                  {systemInfo.GPU !== "Unknown" ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  {comparisonModel.requirements.GPU}
                </div>
              </td>
            )}
          </tr>
          <tr className="bg-muted/50">
            <td className="p-4 border">
              <div className="flex items-center gap-2">
                <span className="font-medium">VRAM:</span>
                <span
                  className={
                    systemInfo.VRAM === "Unknown" ? "text-red-500" : ""
                  }
                >
                  {systemInfo.VRAM}
                </span>
              </div>
            </td>
            {comparisonModel && (
              <td className="p-4 border">
                <div className="flex items-center gap-2">
                  {compareRAMorVRAM(
                    systemInfo.VRAM,
                    comparisonModel.requirements.VRAM,
                  ) ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  {comparisonModel.requirements.VRAM}
                </div>
              </td>
            )}
          </tr>
          <tr>
            <td className="p-4 border">
              <div className="flex items-center gap-2">
                <span className="font-medium">OS:</span>
                <span
                  className={systemInfo.OS === "Unknown" ? "text-red-500" : ""}
                >
                  {systemInfo.OS}
                </span>
              </div>
            </td>
            {comparisonModel && (
              <td className="p-4 border">
                <div className="flex items-center gap-2">
                  {compareOS(systemInfo.OS, comparisonModel.requirements.OS) ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  {comparisonModel.requirements.OS}
                </div>
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
