import { Form } from "@radix-ui/react-form";
import { Select, Flex, Text, TextField } from "@radix-ui/themes";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useTemplate } from "@/features/figma/context/TemplateContext";
import singleEventFixtureTileConfig from "@/features/figma/templates/single-event-fixture-tile.json";
import { FigmaTemplateGroup, TemplateConfig } from "@/features/figma/types/template";
import ImageUpload from "../ImageUploader/ImageUploader";
import DownloadButton from "../DownloadButton/DownloadButton";
import { GroupedAssetSelect } from "@/components/GroupedAssetSelect/GroupedAssetSelect";
import { useFigmaAssets } from "@/features/figma/api/get-figma-assets";
import { TemplateHeader } from "@/features/figma/components/TemplateHeader";
import editorialClippagesConfig from "@/features/figma/templates/editorial-clippages.json";
const templateConfigs = {
  "Single Event Fixture Tile": singleEventFixtureTileConfig as TemplateConfig,
  "Editorial Clippages": editorialClippagesConfig as TemplateConfig,
};

interface GroupedAssetState {
  mainGroup: string | null;
  assetId: string | null;
}

export function TemplateGenerator() {
  const [selectedSource, setSelectedSource] = useState<string>("Single Event Fixture Tile");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [selectedAssets, setSelectedAssets] = useState<Record<string, { pageName: string; assetId: string }>>({});
  const [groupedAssetSelections, setGroupedAssetSelections] = useState<Record<string, GroupedAssetState>>({});
  const [groupedFields, setGroupedFields] = useState<
    Record<string, { name: string; id: string; assets: any[]; defaultValue: any }>
  >({});
  const { setOverlayAssets, setTemplateConfig, textInputs, setTextInputs } = useTemplate();

  const templateConfig = templateConfigs[selectedSource as keyof typeof templateConfigs];
  console.log("templateConfig", templateConfig);
  const presets = templateConfig.presets || [];

  // Set the first preset as default when component mounts or when presets change
  useEffect(() => {
    if (presets.length > 0 && !selectedPreset) {
      setSelectedPreset(presets[0].id);
    }
  }, [presets]);

  const selectedPresetConfig = presets.find((preset) => preset.id === selectedPreset);

  // Get all unique assetSourcePages from the template config
  const assetPages = templateConfig.fields
    .filter((field) => field.type === "figmaAssetDropdownSelect")
    .map((field) => field.assetSourcePage)
    .filter((page): page is string => !!page);

  // Fetch assets for all pages
  const { data: assets } = useFigmaAssets({
    fileId: templateConfig.fileId,
    pages: assetPages,
  });

  const pageNodeIds = useMemo(() => {
    if (!assets) return [];
    const uniquePageIds = new Set<string>();

    Object.values(assets).forEach((pageAssets) => {
      if (pageAssets.length > 0) {
        const firstAsset = pageAssets[0];
        if (firstAsset.pageId) {
          uniquePageIds.add(firstAsset.pageId);
        }
      }
    });
    
    return Array.from(uniquePageIds);
  }, [assets]);

  console.log("pageNodeIds", pageNodeIds);

  console.log("Template Generator rerender");

  useEffect(() => {
    console.log("setting template config");
    setTemplateConfig(templateConfig);
  }, [selectedSource, setTemplateConfig]);

  // Set the overlay assets when the preset changes
  useEffect(() => {
    console.log("setting overlay assets");
    const assets =
      selectedPresetConfig?.fields
        .map((field) => {
          const fullField = templateConfig.fields.find((f) => f.id === field.fieldId);
          const selected = selectedAssets[field.fieldId];
          if (!selected || !fullField?.assetSourcePage) return null;

          return {
            templateName: selectedSource,
            pageName: selected.pageName,
            assetId: selected.assetId,
            fileId: templateConfig.fileId,
          };
        })
        .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset)) || [];
    console.log("assets", assets);
    setOverlayAssets(assets);
  }, [selectedPresetConfig, selectedAssets, setOverlayAssets, templateConfig.fields]);

  // Create grouped fields when assets or config changes
  useEffect(() => {
    if (!assets || !selectedPresetConfig) return;

    const newGroupedFields: Record<string, { name: string; id: string; assets: any[]; defaultValue: any }> = {};

    selectedPresetConfig.fields.forEach((field) => {
      const fullField = templateConfig.fields.find((f) => f.id === field.fieldId);
      if (fullField?.type === "figmaAssetDropdownSelect" && fullField.assetSourcePage) {
        newGroupedFields[field.fieldId] = {
          name: fullField.label || "unknown",
          id: field.fieldId,
          assets: assets[fullField.assetSourcePage] || [],
          defaultValue: field.value,
        };
      }
    });

    setGroupedFields(newGroupedFields);
  }, [assets, selectedPresetConfig, templateConfig.fields]);

  // Update grouped asset selections and selected assets when preset changes
  useEffect(() => {
    if (!selectedPresetConfig || !assets) return;

    const newSelections: Record<string, GroupedAssetState> = {};
    const newSelectedAssets: Record<string, { pageName: string; assetId: string }> = {};

    selectedPresetConfig.fields.forEach((field) => {
      const fullField = templateConfig.fields.find((f) => f.id === field.fieldId);
      if (fullField?.type === "figmaAssetDropdownSelect" && fullField.assetSourcePage) {
        const fieldAssets = assets[fullField.assetSourcePage] || [];
        const selectedAsset = fieldAssets.find((asset) => asset.name === field.value) || fieldAssets[0];

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
  }, [selectedPresetConfig, assets, templateConfig.fields]);

  const handleAssetSelection = useCallback((group: FigmaTemplateGroup, pageName: string, assetId: string) => {
    // Update both the asset selections and the grouped asset state
    setSelectedAssets((prev) => ({
      ...prev,
      [group.id]: { pageName, assetId },
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
  }, []);
  console.log("allAssetPages", pageNodeIds);
  console.log("assets", assets);
  return (
    <div style={{ height: "100%" }}>
      <Flex direction="column" gap="0" justify="between" style={{ height: "100%" }}>
        <Flex direction="column" gap="4">
          <TemplateHeader fileId={templateConfig.fileId} nodeIds={pageNodeIds} />

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="bold">
              Source
            </Text>
            <Select.Root value={selectedSource} onValueChange={(value) => setSelectedSource(value)}>
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

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="bold">
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

          <Form>
            <Flex direction="column" gap="4">
              {selectedPresetConfig?.fields.map((field) => {
                const fullField = templateConfig.fields.find((f) => f.id === field.fieldId);
                switch (fullField?.type) {
                  case "figmaAssetDropdownSelect":
                    const groupData = groupedFields[field.fieldId];
                    return groupData ? (
                      <GroupedAssetSelect
                        key={field.fieldId}
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
                    return (
                      <Flex direction="column" gap="2" key={field.fieldId}>
                        <Text as="label" size="2" weight="bold">
                          {fullField?.label}
                        </Text>
                        <TextField.Root
                          type="text"
                          value={textInputs[field.fieldId] || ""}
                          onChange={(e) => setTextInputs({ ...textInputs, [field.fieldId]: e.target.value })}
                          placeholder={`Enter ${fullField?.label}`}
                        />
                      </Flex>
                    );
                }
              })}
            </Flex>
          </Form>

          <ImageUpload />
        </Flex>
        <Flex direction="column" pt="5" gap="2" style={{ marginTop: "auto", borderTop: "1px solid var(--gray-4)" }}>
          <DownloadButton />
        </Flex>
      </Flex>
    </div>
  );
}
