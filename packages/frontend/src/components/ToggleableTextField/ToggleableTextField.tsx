import React, { useEffect, useState } from "react";
import { Flex, Text, TextField, TextArea, Switch } from "@radix-ui/themes";

interface ToggleableTextFieldProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  multiline?: boolean;
  disabled?: boolean;
  fieldId: string;
  defaultEndabled?: boolean;
  onToggle: (fieldId: string, enabled: boolean) => void;
}

export const ToggleableTextField: React.FC<ToggleableTextFieldProps> = ({
  label,
  value,
  onChange,
  multiline = false,
  disabled = false,
  fieldId,
  onToggle,
  defaultEndabled = true,
}) => {
  // Assume the field starts enabled.
  const [enabled, setEnabled] = useState(defaultEndabled);

  useEffect(() => {
    setEnabled(defaultEndabled);
    onToggle(fieldId, defaultEndabled);
  }, [defaultEndabled]);

  const handleSwitchChange = (checked: boolean) => {
    setEnabled(checked);
    onToggle(fieldId, checked);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Flex direction="column" gap="2">
      <Flex direction="row" justify="between" align="center">
        <Text as="label" size="2">
          {label}
        </Text>
        <Flex align="center" gap="4">
          <Switch size="1" checked={enabled} onCheckedChange={handleSwitchChange} style={{ outline: "none" }} />
        </Flex>
      </Flex>
      {enabled && (
        <>
          {multiline ? (
            <>
              <TextArea
                value={value}
                onChange={handleChange}
                placeholder={`Enter ${label}`}
                style={{ minHeight: "100px" }}
                disabled={disabled}
              />
            </>
          ) : (
            <TextField.Root value={value} onChange={handleChange} placeholder={`Enter ${label}`} disabled={disabled} />
          )}
        </>
      )}
    </Flex>
  );
};
