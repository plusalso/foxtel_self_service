import React, { useState, useEffect } from "react";
import { Flex, Text, TextField, TextArea, Switch } from "@radix-ui/themes";

interface ToggleableTextFieldProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  multiline?: boolean;
}

export const ToggleableTextField: React.FC<ToggleableTextFieldProps> = ({
  label,
  value,
  onChange,
  multiline = false,
}) => {
  // Assume the field starts enabled.
  const [enabled, setEnabled] = useState(true);
  // Cache the value so we can restore it if the field is toggled back on.
  const [cachedValue, setCachedValue] = useState(value);

  // If value updates externally while enabled, update the cache.
  useEffect(() => {
    if (enabled) {
      setCachedValue(value);
    }
  }, [value, enabled]);

  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      // Toggle on: restore the cached value.
      setEnabled(true);
      onChange(cachedValue || "Your Text");
    } else {
      // Toggle off: save the current value and clear the parent's value.
      setCachedValue(value);
      setEnabled(false);
      onChange("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onChange(e.target.value);
    setCachedValue(e.target.value);
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
            <TextArea
              value={value}
              onChange={handleChange}
              placeholder={`Enter ${label}`}
              style={{ minHeight: "100px" }}
            />
          ) : (
            <TextField.Root type="text" value={value} onChange={handleChange} placeholder={`Enter ${label}`} />
          )}
        </>
      )}
    </Flex>
  );
};
