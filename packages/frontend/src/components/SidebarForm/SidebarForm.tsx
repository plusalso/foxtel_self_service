import { Form } from "@radix-ui/react-form";
import { Select, Flex, Text } from "@radix-ui/themes";
import { useEffect, useState, useCallback } from "react";
import { CustomImageDefaults, useTemplateState } from "@/features/figma/context/TemplateContext";
import singleEventFixtureTileConfig from "@/features/figma/templates/single-event-fixture-tile.json";
import { FigmaTemplateGroup, TemplateConfig } from "@/features/figma/types/template";
import ImageUpload from "../ImageUploader/ImageUploader";
import DownloadButton from "../DownloadButton/DownloadButton";
import { GroupedAssetSelect } from "@/components/GroupedAssetSelect/GroupedAssetSelect";
import { useFigmaAssets } from "@/features/figma/hooks/use-figma-assets";
import { SyncFigmaButton } from "@/features/figma/components/SyncFigmaButton/SyncFigmaButton";
import editorialClippagesConfig from "@/features/figma/templates/editorial-clippages.json";
import singleEventShowConfig from "@/features/figma/templates/single-event+show.json";
import bespokeMinisBytesConfig from "@/features/figma/templates/bestpoke-minis+bytes.json";
import { ToggleableTextField } from "../ToggleableTextField/ToggleableTextField";
const templateConfigs = {
  "Single Event Fixture Tile": singleEventFixtureTileConfig as TemplateConfig,
  "Editorial Clippages": editorialClippagesConfig as TemplateConfig,
  "Single Event + Show": singleEventShowConfig as TemplateConfig,
  "Bespoke Minis + Bites": bespokeMinisBytesConfig as TemplateConfig,
};

interface GroupedAssetState {
  mainGroup: string | null;
  assetId: string | null;
}

export function SidebarForm() {
  const [selectedSource, setSelectedSource] = useState<string>(Object.keys(templateConfigs)[0]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [selectedAssets, setSelectedAssets] = useState<Record<string, { pageName: string; assetId: string }>>({});
  const [groupedAssetSelections, setGroupedAssetSelections] = useState<Record<string, GroupedAssetState>>({});
  const [groupedFields, setGroupedFields] = useState<
    Record<string, { name: string; id: string; assets: any[]; defaultValue: any }>
  >({});
  const { setOverlayAssets, setTemplateConfig, textInputs, setTextInputs, setCustomImageDefaults } = useTemplateState();

  const templateConfig = templateConfigs[selectedSource as keyof typeof templateConfigs];
  const presets = templateConfig.presets || [];

  // Update selectedPreset when source changes or on initial mount
  useEffect(() => {
    if (presets.length > 0) {
      setSelectedPreset(presets[0].id);
    }
  }, [selectedSource]);

  const selectedPresetConfig = presets.find((preset) => preset.id === selectedPreset);

  // Get all unique assetSourcePages from the template config
  const assetPages = templateConfig.fields
    .filter((field) => (field.type === "figmaAssetDropdownSelect" || field.type === "text") && field.assetSourcePage)
    .map((field) => field.assetSourcePage)
    .filter((page): page is string => !!page);

  // Fetch assets for all pages
  const { data: assetsData } = useFigmaAssets({
    fileId: templateConfig.fileId,
    pages: assetPages,
  });

  useEffect(() => {
    setTemplateConfig(templateConfig);
  }, [selectedSource]);

  // Set the overlay assets when the preset changes
  useEffect(() => {
    const backgroundAssets = selectedPresetConfig?.fields
      .map((field) => {
        const fullField = templateConfig.fields.find((f) => f.id === field.fieldId);
        if (fullField?.type !== "figmaAssetDropdownSelect") return null;

        const selected = selectedAssets[field.fieldId];
        if (!selected || !fullField?.assetSourcePage) return null;

        return {
          templateName: selectedSource,
          pageName: selected.pageName,
          assetId: selected.assetId,
          fileId: templateConfig.fileId,
        };
      })
      .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));

    const textBackgroundAssets = selectedPresetConfig?.fields
      .map((field) => {
        const fullField = templateConfig.fields.find((f) => f.id === field.fieldId);
        if (fullField?.type !== "text" || !fullField.assetSourcePage) return null;

        const pageAssets = assetsData?.assets[fullField.assetSourcePage] || [];
        const matchingAsset = pageAssets.find((asset) => asset.name === field.value);
        if (!matchingAsset) return null;

        return {
          templateName: selectedSource,
          pageName: fullField.assetSourcePage,
          assetId: matchingAsset.id,
          fileId: templateConfig.fileId,
        };
      })
      .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));

    setOverlayAssets([...(textBackgroundAssets || []), ...(backgroundAssets || [])]);

    //set the custom image defaults
    const customImageDefaults: CustomImageDefaults = {
      x: parseFloat(selectedPresetConfig?.uploadedImageDefaults?.x || "50%"),
      y: parseFloat(selectedPresetConfig?.uploadedImageDefaults?.y || "0"),
      width: selectedPresetConfig?.uploadedImageDefaults?.width || "auto",
      height: selectedPresetConfig?.uploadedImageDefaults?.height || "auto",
    };
    setCustomImageDefaults(customImageDefaults);
    //clear the text inputs
    setTextInputs({});
  }, [selectedPresetConfig, selectedAssets, templateConfig.fields]);

  // Create grouped fields when assets or config changes
  useEffect(() => {
    if (!assetsData || !selectedPresetConfig) return;

    const newGroupedFields: Record<string, { name: string; id: string; assets: any[]; defaultValue: any }> = {};

    selectedPresetConfig.fields.forEach((field) => {
      const fullField = templateConfig.fields.find((f) => f.id === field.fieldId);
      if (fullField?.type === "figmaAssetDropdownSelect" && fullField.assetSourcePage) {
        newGroupedFields[field.fieldId] = {
          name: fullField.label || "unknown",
          id: field.fieldId,
          assets: assetsData?.assets[fullField.assetSourcePage] || [],
          defaultValue: field.value,
        };
      }
    });

    setGroupedFields(newGroupedFields);
  }, [assetsData, selectedPresetConfig, templateConfig.fields]);

  // Update grouped asset selections and selected assets when preset changes
  useEffect(() => {
    if (!selectedPresetConfig || !assetsData) return;

    const newSelections: Record<string, GroupedAssetState> = {};
    const newSelectedAssets: Record<string, { pageName: string; assetId: string }> = {};

    selectedPresetConfig.fields.forEach((field) => {
      const fullField = templateConfig.fields.find((f) => f.id === field.fieldId);
      if (fullField?.type === "figmaAssetDropdownSelect" && fullField.assetSourcePage) {
        const fieldAssets = assetsData.assets[fullField.assetSourcePage] || [];
        const sortedAssets = [...fieldAssets].sort((a, b) => a.name.localeCompare(b.name));
        const selectedAsset = fieldAssets.find((asset) => asset.name === field.value) || sortedAssets[0];

        if (selectedAsset) {
          const [mainGroup, itemName] = selectedAsset.name.split("/");
          newSelections[field.fieldId] = {
            mainGroup: itemName ? mainGroup : null,
            assetId: selectedAsset.id,
          };
          newSelectedAssets[field.fieldId] = {
            pageName: fullField.assetSourcePage,
            assetId: selectedAsset.id,
          };
        }
      }
    });

    setGroupedAssetSelections(newSelections);
    setSelectedAssets(newSelectedAssets);
  }, [selectedPresetConfig, assetsData, templateConfig.fields]);

  const handleAssetSelection = useCallback(
    (group: FigmaTemplateGroup, pageName: string, assetId: string) => {
      setSelectedAssets((prev) => ({
        ...prev,
        [group.id]: {
          fileId: templateConfig.fileId,
          pageName: pageName,
          assetId,
        },
      }));

      const selectedAsset = group.assets.find((asset) => asset.id === assetId);
      if (selectedAsset) {
        const [mainGroup, itemName] = selectedAsset.name.split("/");
        setGroupedAssetSelections((prev) => ({
          ...prev,
          [group.id]: {
            mainGroup: itemName ? mainGroup : null,
            assetId,
          },
        }));
      }
    },
    [templateConfig.fileId]
  );

  return (
    <div style={{ height: "100%" }}>
      <Flex direction="column" gap="0" justify="between" style={{ height: "100%" }}>
        <Flex direction="column" gap="4">
          <Flex direction="column" gap="2">
            <Text as="label" size="2">
              Source
            </Text>
            <Select.Root
              value={selectedSource}
              onValueChange={(value) => {
                setSelectedSource(value);
              }}
            >
              <Select.Trigger />
              <Select.Content>
                {Object.keys(templateConfigs).map((source) => (
                  <Select.Item key={source} value={source}>
                    {source}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>

          <SyncFigmaButton fileId={templateConfig.fileId} pages={assetPages} />

          {/* Only show preset dropdown if there's more than one preset */}
          {presets.length > 1 && (
            <Flex direction="column" gap="2">
              <Text as="label" size="2">
                Preset
              </Text>
              <Select.Root value={selectedPreset} onValueChange={(value) => setSelectedPreset(value)}>
                <Select.Trigger />
                <Select.Content>
                  {presets.map((preset) => (
                    <Select.Item key={preset.id} value={preset.id}>
                      {preset.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          )}

          <Form>
            <Flex direction="column" gap="4">
              {selectedPresetConfig?.fields.map((field) => {
                const fullField = templateConfig.fields.find((f) => f.id === field.fieldId);
                switch (fullField?.type) {
                  case "figmaAssetDropdownSelect":
                    const groupData = groupedFields[field.fieldId];
                    return groupData ? (
                      <GroupedAssetSelect
                        key={`${selectedPreset}-${field.fieldId}`}
                        group={{
                          ...groupData,
                          value: field.value,
                        }}
                        selection={groupedAssetSelections[field.fieldId]}
                        onSelect={handleAssetSelection}
                        pageName={fullField?.assetSourcePage || ""}
                        fileId={templateConfig.fileId}
                      />
                    ) : null;
                  case "text":
                  case "textArea":
                    return (
                      <ToggleableTextField
                        key={`${selectedPreset}-${field.fieldId}`}
                        label={fullField?.label || "Text Field"}
                        value={textInputs[field.fieldId] || ""}
                        onChange={(val) => {
                          setTextInputs({ ...textInputs, [field.fieldId]: val });
                        }}
                        multiline={fullField.type === "textArea"}
                      />
                    );
                }
              })}
            </Flex>
          </Form>

          {selectedPresetConfig?.supportsUploadedImages && (
            <ImageUpload label={selectedPresetConfig?.uploadedImageLabel || "Custom Image"} />
          )}
        </Flex>
        <Flex direction="column" pt="5" gap="2" style={{ marginTop: "auto", borderTop: "1px solid var(--gray-4)" }}>
          <DownloadButton />
        </Flex>
      </Flex>
    </div>
  );
}
