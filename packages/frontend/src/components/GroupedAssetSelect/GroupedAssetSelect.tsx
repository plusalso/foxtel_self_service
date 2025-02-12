import { useState, useEffect, useMemo } from "react";
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
  onSelect: (group: FigmaTemplateGroup, pageName: string, assetId: string) => void;
}

export function GroupedAssetSelect({ group, onSelect, pageName, fileId }: GroupedAssetSelectProps) {
  const [selectedMainGroup, setSelectedMainGroup] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");

  // Memoize the groupedAssets calculation
  const groupedAssets = useMemo(() => {
    return group.assets.reduce(
      (acc, asset) => {
        const [mainGroupName, itemName] = asset.name.split("/");
        if (!itemName) {
          acc[""] = acc[""] || [];
          acc[""].push(asset);
        } else {
          if (!acc[mainGroupName]) {
            acc[mainGroupName] = [];
          }
          acc[mainGroupName].push({ ...asset, name: itemName });
        }
        return acc;
      },
      {} as Record<string, Array<{ id: string; name: string }>>
    );
  }, [group.assets]);

  // Memoize the mainGroupNames array
  const mainGroupNames = useMemo(() => {
    return Object.keys(groupedAssets).filter((name) => name !== "");
  }, [groupedAssets]);

  // Memoize the assets array for Combobox to prevent unnecessary rerenders
  const comboboxAssets = useMemo(() => {
    if (!selectedMainGroup) return [];
    return (
      groupedAssets[selectedMainGroup]?.map((asset) => ({
        id: asset.id,
        name: asset.name,
        imageUrl: getS3ImageUrl(fileId, pageName, asset.id),
      })) || []
    );
  }, [selectedMainGroup, groupedAssets, fileId, pageName]);

  // Update selection when value prop changes
  useEffect(() => {
    if (!group.assets.length) return;

    if (group.value) {
      const matchingAsset = group.assets.find((asset) => asset.name === group.value);
      if (matchingAsset) {
        const [mainGroup, itemName] = matchingAsset.name.split("/");
        if (itemName) {
          setSelectedMainGroup(mainGroup);
          setSelectedAsset(matchingAsset.id);
          setInputValue(itemName);
          onSelect(group, pageName, matchingAsset.id);
        }
      }
    }
  }, [group.value, group.assets]); // Only depend on value and assets

  const handleMainGroupChange = (mainGroupName: string) => {
    setSelectedMainGroup(mainGroupName);
    setSelectedAsset(null);
    setInputValue("");
  };

  const handleAssetChange = (assetId: string) => {
    setSelectedAsset(assetId);
    if (selectedMainGroup) {
      onSelect(group, selectedMainGroup, assetId);
    } else {
      onSelect(group, pageName, assetId);
    }
  };

  return (
    <Flex direction="column" gap="2">
      <Text as="label" size="2" weight="bold">
        {group.name}
      </Text>
      {mainGroupNames.length > 0 ? (
        <>
          <Select.Root value={selectedMainGroup || ""} onValueChange={handleMainGroupChange}>
            <Select.Trigger placeholder="Select Main Group" />
            <Select.Content>
              {mainGroupNames.map((mainGroupName) => (
                <Select.Item key={mainGroupName} value={mainGroupName}>
                  {mainGroupName}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          {selectedMainGroup && (
            <Flex direction="row" gap="2" align="center">
              <LuCornerDownRight />
              <Combobox
                assets={comboboxAssets}
                value={selectedAsset}
                inputValue={inputValue}
                onInputValueChange={setInputValue}
                onValueChange={handleAssetChange}
              />
            </Flex>
          )}
        </>
      ) : (
        <Select.Root onValueChange={(value) => onSelect(group, pageName, value)}>
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
