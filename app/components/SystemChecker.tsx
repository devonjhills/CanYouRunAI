import React from "react";

export const SystemChecker = () => {
  return (
    <div className="bg-card text-card-foreground p-6 mb-8 shadow-lg border border-border rounded-[--radius]">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
        System Check Results
      </h2>
      <div className="space-y-6">
        {/* CPU Check */}
        <div className="p-4 border-l-4 border-chart-2 bg-secondary rounded-[--radius] shadow-sm">
          <h3 className="font-bold text-foreground">CPU</h3>
          <p className="text-muted-foreground">Intel Core i7-12700K</p>
          <p className="text-chart-2 font-medium">✓ Meets all requirements</p>
        </div>

        {/* RAM Check */}
        <div className="p-4 border-l-4 border-chart-4 bg-secondary rounded-[--radius] shadow-sm">
          <h3 className="font-bold text-foreground">RAM</h3>
          <p className="text-muted-foreground">8GB DDR4</p>
          <p className="text-chart-4 font-medium">
            ⚠ Minimum requirements met, upgrade recommended
          </p>
        </div>

        {/* GPU Check */}
        <div className="p-4 border-l-4 border-chart-1 bg-secondary rounded-[--radius] shadow-sm">
          <h3 className="font-bold text-foreground">GPU</h3>
          <p className="text-muted-foreground">Intel UHD Graphics</p>
          <p className="text-chart-1 font-medium">✗ Upgrade required for optimal performance</p>
        </div>
    </div>
  </div>
  );
};