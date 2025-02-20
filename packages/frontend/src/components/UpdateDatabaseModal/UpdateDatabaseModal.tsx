import React, { useState, useEffect } from "react";
import { AlertDialog, Button, Flex, Text } from "@radix-ui/themes";
import { LuRefreshCw } from "react-icons/lu";
import clsx from "clsx";
import styles from "./UpdateDatabaseModal.module.scss";

interface UpdateDatabaseModalProps {
  isDisabled?: boolean;
  isLoading?: boolean;
  onUpdate: (dontShowAgain: boolean) => void;
  onCancel: () => void;
}

export function UpdateDatabaseModal({ onUpdate, onCancel, isDisabled, isLoading }: UpdateDatabaseModalProps) {
  // Determines if the user already saved their "don't show again" preference.
  const [hasStoredDontShow, setHasStoredDontShow] = useState(false);
  // Local state to track the current checkbox toggle in the modal.
  const [dontShowPreference, setDontShowPreference] = useState(false);

  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const storedDontShow = localStorage.getItem("updateDatabaseDontShowAgain");
    if (storedDontShow === "true") {
      setHasStoredDontShow(true);
      setDontShowAgain(true);
    }
  }, []);

  if (hasStoredDontShow || dontShowAgain) {
    return (
      <Button variant="outline" disabled={isDisabled} onClick={() => onUpdate(true)}>
        <LuRefreshCw
          className={clsx("w-4 h-4", {
            [styles.animateSpin]: isLoading,
          })}
        />
        {isLoading ? "Updating..." : "Update Database"}
      </Button>
    );
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update local state—don't write to localStorage immediately.
    setDontShowPreference(e.target.checked);
  };

  const handleUpdate = () => {
    // Persist the preference if the user toggled "don't show again".
    if (dontShowPreference) {
      localStorage.setItem("updateDatabaseDontShowAgain", "true");
      setDontShowAgain(true);
    }
    onUpdate(dontShowPreference);
  };

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button variant="outline" disabled={isDisabled}>
          <LuRefreshCw
            className={clsx("w-4 h-4", {
              [styles.animateSpin]: isLoading,
            })}
          />
          Update Database
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Update Database</AlertDialog.Title>
        <AlertDialog.Description size="2">
          This will update the assets from your selected file. This could take several minutes depending on the size of
          your file.
        </AlertDialog.Description>

        <Flex direction="column" gap="3" mt="4">
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={dontShowPreference} onChange={handleCheckboxChange} />
            <Text size="2">Don't show this message again</Text>
          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="solid" onClick={handleUpdate}>
              Update Database
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
