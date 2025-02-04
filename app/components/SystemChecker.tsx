import React from "react";

export const SystemChecker = () => {
  return (
    <div className="neo-card mb-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
        System Check Results
      </h2>
      <div className="space-y-6">
        {/* CPU Check */}
        <div className="neo-brutalist-shadow-sm p-4 border-4 border-chart-4">
          <h3 className="font-bold text-foreground">CPU</h3>
          <p className="text-muted-foreground">Intel Core i7-12700K</p>
          <p className="font-medium">✓ Meets all requirements</p>
        </div>

        {/* RAM Check */}
        <div className="neo-brutalist-shadow-sm p-4 border-4 border-chart-3">
          <h3 className="font-bold text-foreground">RAM</h3>
          <p className="text-muted-foreground">8GB DDR4</p>
          <p className="font-medium">
            ⚠ Minimum requirements met, upgrade recommended
          </p>
        </div>

        {/* GPU Check */}
        <div className="neo-brutalist-shadow-sm p-4 border-4 border-chart-1">
          <h3 className="font-bold text-foreground">GPU</h3>
          <p className="text-muted-foreground">Intel UHD Graphics</p>
          <p className="font-medium">
            ✗ Upgrade required for optimal performance
          </p>
        </div>
      </div>
    </div>
  );
};
