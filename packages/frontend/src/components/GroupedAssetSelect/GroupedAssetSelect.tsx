import React, { useState } from "react";
import { Flex, Select, Text } from "@radix-ui/themes";
import { FigmaTemplateGroup } from "../../features/figma/types/template";
import { LuCornerDownRight } from "react-icons/lu";
import Combobox from "../ComboBox/ComboBox";
import { getS3ImageUrl } from "@/features/figma/hooks/use-figma-image";

interface GroupedAssetSelectProps {
  group: FigmaTemplateGroup;
  templateName: string;
  onSelect: (group: FigmaTemplateGroup, mainGroupName: string, assetId: string) => void;
}

export const GroupedAssetSelect: React.FC<GroupedAssetSelectProps> = ({ group, templateName, onSelect }) => {
  const [selectedMainGroup, setSelectedMainGroup] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");

  const handleMainGroupChange = (mainGroupName: string) => {
    setSelectedMainGroup(mainGroupName);
    setSelectedAsset(null); // Reset asset selection when main group changes
    setInputValue(""); // Reset input value
  };

  const handleAssetChange = (assetId: string) => {
    setSelectedAsset(assetId);
    if (selectedMainGroup) {
      onSelect(group, selectedMainGroup, assetId);
    } else {
      onSelect(group, group.name, assetId);
    }
  };

  // Group assets by the first part of their name
  const groupedAssets = group.assets.reduce(
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

  const mainGroupNames = Object.keys(groupedAssets).filter((name) => name !== "");

  return (
    <Flex direction="column" gap="2">
      <Text size="2">{group.name}</Text>
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
                assets={groupedAssets[selectedMainGroup].map((asset) => ({
                  id: asset.id,
                  name: asset.name,
                  imageUrl: getS3ImageUrl(templateName, group.name, asset.id),
                }))}
                value={selectedAsset}
                inputValue={inputValue}
                onInputValueChange={setInputValue}
                onValueChange={handleAssetChange}
              />
            </Flex>
          )}
          {/* {selectedMainGroup && (
            <Flex direction="row" gap="2" align="center">
              <LuCornerDownRight />
              <Select.Root value={selectedAsset || ""} onValueChange={handleAssetChange}>
                <Select.Trigger placeholder="Select Asset" style={{ flexGrow: 1 }} />
                <Select.Content>
                  {groupedAssets[selectedMainGroup]?.map((asset) => (
                    <Select.Item key={asset.id} value={asset.id}>
                      {asset.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          )} */}
        </>
      ) : (
        <Select.Root value={selectedAsset || ""} onValueChange={handleAssetChange}>
          <Select.Trigger placeholder="Select Asset" />
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
};
