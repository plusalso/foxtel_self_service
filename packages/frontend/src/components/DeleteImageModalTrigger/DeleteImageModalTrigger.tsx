import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { LuTrash2 } from "react-icons/lu";
// import styles from "./DeleteImageModal.module.scss";

interface DeleteImageModalTriggerProps {
  onDelete: () => void;
  onCancel: () => void;
}

export function DeleteImageModalTrigger({ onDelete, onCancel }: DeleteImageModalTriggerProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <LuTrash2 opacity={0.9} />
      </AlertDialog.Trigger>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Delete image</AlertDialog.Title>
        <AlertDialog.Description size="2">Are you sure you want to delete this image?</AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray" onClick={onCancel}>
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="solid" color="red" onClick={onDelete}>
              Delete
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
