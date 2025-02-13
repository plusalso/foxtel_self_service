import { useMemo, useState } from "react";
import { Flex, Select, Text } from "@radix-ui/themes";
import { FigmaAsset, FigmaTemplateGroup } from "../../features/figma/types/template";
import { LuCornerDownRight } from "react-icons/lu";
import Combobox from "../ComboBox/ComboBox";
import { getS3ImageUrl } from "@/features/figma/hooks/use-figma-image";

interface GroupedAssetSelectProps {
  fileId: string;
  pageName: string;
  group: {
    name: string;
    id: string;
    assets: FigmaAsset[];
    value?: string;
  };
  selection?: {
    mainGroup: string | null;
    assetId: string | null;
    inputValue?: string;
  };
  onSelect: (group: FigmaTemplateGroup, pageName: string, assetId: string) => void;
}

export function GroupedAssetSelect({
  group,
  selection = { mainGroup: null, assetId: null, inputValue: "" },
  onSelect,
  pageName,
  fileId,
}: GroupedAssetSelectProps) {
  // Group assets by their main group
  const groupedAssets = useMemo(() => {
    return group.assets.reduce(
      (acc, asset) => {
        const [mainGroup, itemName] = asset.name.split("/");
        const group = itemName ? mainGroup : "";
        acc[group] = acc[group] || [];
        acc[group].push({ ...asset, name: itemName || asset.name });
        return acc;
      },
      {} as Record<string, Array<{ id: string; name: string }>>
    );
  }, [group.assets]);

  const mainGroupNames = useMemo(() => Object.keys(groupedAssets).filter((name) => name !== ""), [groupedAssets]);
  console.log("pagename is ", pageName);
  const comboboxAssets = useMemo(
    () =>
      selection.mainGroup
        ? groupedAssets[selection.mainGroup]?.map((asset) => ({
            id: asset.id,
            name: asset.name,
            imageUrl: getS3ImageUrl(fileId, pageName, asset.id),
          })) || []
        : [],
    [selection.mainGroup, groupedAssets, fileId, pageName]
  );

  // Add state for input value
  const [inputValue, setInputValue] = useState("");

  // Find the selected asset's name for the combobox input value
  const selectedAssetName = useMemo(() => {
    if (!selection.mainGroup || !selection.assetId) return "";
    const asset = groupedAssets[selection.mainGroup]?.find((a) => a.id === selection.assetId);
    return asset?.name || "";
  }, [selection.mainGroup, selection.assetId, groupedAssets]);

  return (
    <Flex direction="column" gap="2">
      <Text as="label" size="2" weight="bold">
        {group.name}
      </Text>
      {mainGroupNames.length > 0 ? (
        <>
          <Select.Root
            value={selection.mainGroup || ""}
            onValueChange={(mainGroup) => {
              const firstAssetInGroup = groupedAssets[mainGroup]?.[0];
              if (firstAssetInGroup) {
                onSelect(group, pageName, firstAssetInGroup.id);
                setInputValue(""); // Reset input value when group changes
              }
            }}
          >
            <Select.Trigger placeholder="Select Main Group" />
            <Select.Content>
              {mainGroupNames.map((name) => (
                <Select.Item key={name} value={name}>
                  {name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          {selection.mainGroup && (
            <Flex direction="row" gap="2" align="center">
              <LuCornerDownRight />
              <Combobox
                assets={comboboxAssets}
                value={selection.assetId || null}
                inputValue={inputValue}
                onInputValueChange={(value) => setInputValue(value)}
                onValueChange={(assetId) => {
                  onSelect(group, pageName, assetId);
                  // Reset input value when an item is selected
                  const selectedAsset = comboboxAssets.find((asset) => asset.id === assetId);
                  setInputValue(selectedAsset?.name || "");
                }}
              />
            </Flex>
          )}
        </>
      ) : (
        <Select.Root value={selection.assetId || ""} onValueChange={(value) => onSelect(group, pageName, value)}>
          <Select.Trigger />
          <Select.Content>
            {group.assets.map((asset) => (
              <Select.Item key={asset.id} value={asset.id}>
                {asset.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      )}
    </Flex>
  );
}
