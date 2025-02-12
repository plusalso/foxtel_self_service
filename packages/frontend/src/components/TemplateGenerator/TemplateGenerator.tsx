import { Form } from "@radix-ui/react-form";
import { Select, Container, Flex, Text, TextField } from "@radix-ui/themes";
import { useEffect, useState, useCallback } from "react";
import { useTemplate } from "@/features/figma/context/TemplateContext";
import singleEventFixtureTileConfig from "@/features/figma/templates/single-event-fixture-tile.json";
import { FigmaTemplateGroup } from "@/features/figma/types/template";
import ImageUpload from "../ImageUploader/ImageUploader";
import DownloadButton from "../DownloadButton/DownloadButton";
import { GroupedAssetSelect } from "@/components/GroupedAssetSelect/GroupedAssetSelect";
import { useFigmaAssets } from "@/features/figma/api/get-figma-assets";

const templateConfigs = {
  "Single Event Fixture Tile": singleEventFixtureTileConfig,
};

export function TemplateGenerator() {
  const [selectedSource, setSelectedSource] = useState<string>("Single Event Fixture Tile");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [selectedAssets, setSelectedAssets] = useState<Record<string, { pageName: string; assetId: string }>>({});
  const [groupedFields, setGroupedFields] = useState<
    Record<string, { name: string; id: string; assets: any[]; defaultValue: any }>
  >({});
  const { setOverlayAssets, setTemplateConfig, textInputs, setTextInputs } = useTemplate();

  const templateConfig = templateConfigs[selectedSource as keyof typeof templateConfigs];
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

  const handleAssetSelection = useCallback((group: FigmaTemplateGroup, pageName: string, assetId: string) => {
    setSelectedAssets((prev) => ({
      ...prev,
      [group.id]: { pageName, assetId },
    }));
  }, []);

  return (
    <Container size="2">
      <Flex direction="column" gap="4">
        {/* <TemplateHeader fileId={templateConfig.fileId} template={templateConfig} /> */}

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
        <DownloadButton />
      </Flex>
    </Container>
  );
}
