import type { CustomField } from "@measured/puck";
import { ImageUploadField } from "./ImageUploadField";

export function imageField(label = "Image"): CustomField<string> {
  return {
    type: "custom",
    label,
    render: ({ value, onChange }) => (
      <ImageUploadField value={value ?? ""} onChange={onChange} />
    ),
  };
}
