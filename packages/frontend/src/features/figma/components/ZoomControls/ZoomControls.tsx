import { Flex, Select } from "@radix-ui/themes";
import styles from "./ZoomControls.module.scss";
import { useZoom } from "../../context/ZoomContext";

export function ZoomControls() {
  const { zoom, setZoom } = useZoom();

  const zoomOptions = [
    { value: "fit", label: "Fit" },
    { value: "100", label: "100%" },
    { value: "200", label: "200%" },
  ];

  return (
    <Flex gap="2" align="center" className={styles.zoomControls}>
      <Select.Root
        value={typeof zoom === "number" ? zoom.toString() : zoom}
        onValueChange={(value) => {
          if (value === "fit") {
            setZoom("fit");
          } else {
            setZoom(parseInt(value));
          }
        }}
      >
        <Select.Trigger />
        <Select.Content>
          {zoomOptions.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}
