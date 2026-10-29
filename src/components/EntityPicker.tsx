"use client";
import {
  EntitySelect,
  type EntityOption,
} from "@un-eosg/ui/components/entity-select";
export type { EntityOption };
export function EntityPicker({
  value,
  onChange,
  entities,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  entities: EntityOption[];
  disabled?: boolean;
}) {
  return (
    <EntitySelect
      value={value}
      onChange={onChange}
      entities={entities}
      disabled={disabled}
      required
      labels={{
        input: "Organisational entity",
        placeholder: "Search by acronym or name",
        empty: "No entities found",
        custom: (text) => `Other: ${text}`,
      }}
    />
  );
}
