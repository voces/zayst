import React, { useState } from "react";
import { Player } from "../../common/types.ts";
import { spacing } from "../ui/spacing.ts";

export const Icon = React.memo((
  { icon, description, structureType, onClick }: {
    icon: "harvester" | "arrow";
    description: React.ReactNode;
    structureType: Player["structureType"];
    onClick: () => void;
  },
) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div>
      <img
        src={`/assets/${icon}.svg`}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 48,
          cursor: "pointer",
          backgroundColor: hovered || icon === structureType
            ? "rgba(0, 0, 0, 0.9)"
            : "rgba(0, 0, 0, 0.5)",
          borderRadius: spacing.xs,
        }}
      />
      {hovered && (
        <span
          style={{
            position: "absolute",
            display: "inline-block",
            verticalAlign: "top",
            marginLeft: spacing.xs,
            padding: spacing.xs,
            borderRadius: spacing.xs,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            fontSize: "75%",
            width: "max-content",
            maxWidth: 300,
          }}
        >
          {description}
        </span>
      )}
    </div>
  );
});
