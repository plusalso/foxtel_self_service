import { Form } from "@radix-ui/react-form";
import { Select, Flex, Text, Spinner } from "@radix-ui/themes";
import { useEffect, useState, useCallback } from "react";
import { useTemplateState } from "@/features/figma/context/TemplateContext";
import singleEventFixtureTileConfig from "@/features/figma/templates/single-event-fixture-tile.json";
import {
  FigmaTemplateGroup,
  ResizableImageDefaults,
  StaticAssetField,
  TemplateConfig,
} from "@/features/figma/types/template";
import ImageUpload from "../ImageUploader/ImageUploader";
import DownloadButton from "../DownloadButton/DownloadButton";
import { GroupedAssetSelect } from "@/components/GroupedAssetSelect/GroupedAssetSelect";
import { useFigmaAssets } from "@/features/figma/hooks/use-figma-assets";
import { SyncFigmaButton } from "@/features/figma/components/SyncFigmaButton/SyncFigmaButton";
import editorialClippagesConfig from "@/features/figma/templates/editorial-clippages.json";
import singleEventShowConfig from "@/features/figma/templates/single-event+show.json";
import bespokeMinisBytesConfig from "@/features/figma/templates/bestpoke-minis+bytes.json";
import nbaConfig from "@/features/figma/templates/nba.json";
import { ToggleableTextField } from "../ToggleableTextField/ToggleableTextField";
import styles from "./SidebarForm.module.scss";
import { LuArrowUpRight } from "react-icons/lu";
import { useTemplateFilenames } from "@/features/figma/hooks/use-template-filenames";

const templateConfigs = {
  "Single Event Fixture Tile": singleEventFixtureTileConfig as TemplateConfig,
  "Editorial Clippages": editorialClippagesConfig as TemplateConfig,
  "Single Event + Show": singleEventShowConfig as TemplateConfig,
  "Bespoke Minis + Bites": bespokeMinisBytesConfig as TemplateConfig,
  NBA: nbaConfig as TemplateConfig,
};

interface GroupedAssetState {
  mainGroup: string | null;
  assetId: string | null;
}

export function SidebarForm() {
  const [selectedSource, setSelectedSource] = useState<string>(Object.keys(templateConfigs)[0]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [selectedAssets, setSelectedAssets] = useState<Record<string, { pageName: string; assetId: string }>>({});
  const [groupedAssetSelections, setGroupedAssetSelections] = useState<Record<string, GroupedAssetState>>({});
  const [groupedFields, setGroupedFields] = useState<
    Record<string, { name: string; id: string; assets: any[]; defaultValue: any }>
  >({});
  const {
    textInputs,
    persistentFieldValues,
    setOverlayAssets,
    setTemplateConfig,
    setCustomImage,
    setTextInputs,
    setPersistentFieldValue,
    setCustomImageDefaults,
    setCurrentPreset,
    toggleFieldEnabled,
  } = useTemplateState();

  const templateConfig = templateConfigs[selectedSource as keyof typeof templateConfigs];
  const presets = templateConfig.presets || [];

  // Update selectedPreset when source changes or on initial mount
  useEffect(() => {
    if (presets.length > 0) {
      setSelectedPresetId(presets[0].id);
      setCurrentPreset(presets[0]);
    }
  }, [selectedSource]);

  // Update current preset when selection changes
  useEffect(() => {
    const preset = presets.find((p) => p.id === selectedPresetId);
    if (preset) {
      setCurrentPreset(preset);
    }
  }, [selectedPresetId, presets]);

  //remove the custom image when the preset changes
  useEffect(() => {
    setCustomImage("");
  }, [selectedPresetId]);

  const selectedPresetConfig = presets.find((preset) => preset.id === selectedPresetId);

  // Get all unique assetSourcePages from the template config
  const assetPages = templateConfig.fields
    .filter((field) => {
      // Include both dropdown assets and static assets
      return (
        (field.type === "figmaAssetDropdownSelect" || field.type === "text" || field.type === "staticAsset") &&
        field.assetSourcePage
      );
    })
    .map((field) => field.assetSourcePage)
    .filter((page): page is string => !!page);

  // Fetch assets for all pages
  const { data: assetsData, isLoading: isLoadingAssets } = useFigmaAssets({
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
        const matchingAsset = pageAssets.find((asset) => asset.name === field.defaultValue);
        if (!matchingAsset) return null;

        return {
          templateName: selectedSource,
          pageName: fullField.assetSourcePage,
          assetId: matchingAsset.id,
          fileId: templateConfig.fileId,
        };
      })
      .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));

    // Add static assets
    const staticAssets = selectedPresetConfig?.fields
      .map((field) => {
        const fullField = templateConfig.fields.find(
          (f): f is StaticAssetField => f.id === field.fieldId && f.type === "staticAsset"
        );
        if (!fullField) return null;

        const asset = assetsData?.assets[fullField.assetSourcePage]?.find((a) => a.name === fullField.assetName);
        if (!asset) return null;
        console.log("fullfiled zindex", fullField.zIndex);
        return {
          templateName: selectedSource,
          pageName: fullField.assetSourcePage,
          assetId: asset.id,
          fileId: templateConfig.fileId,
          zIndex: fullField.zIndex ?? 50, // Pass zIndex through
        };
      })
      .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));

    console.log("before setOverlayAssets:", [
      ...(textBackgroundAssets || []),
      ...(backgroundAssets || []),
      ...(staticAssets || []),
    ]);

    setOverlayAssets([...(textBackgroundAssets || []), ...(backgroundAssets || []), ...(staticAssets || [])]);

    //set the custom image defaults
    const customImageDefaults: ResizableImageDefaults = {
      x: selectedPresetConfig?.uploadedImageDefaults?.x || 0,
      y: selectedPresetConfig?.uploadedImageDefaults?.y || 0,
      width: selectedPresetConfig?.uploadedImageDefaults?.width || "auto",
      height: selectedPresetConfig?.uploadedImageDefaults?.height || "auto",
    };
    setCustomImageDefaults(customImageDefaults);
    // Only clear text inputs when preset changes
  }, [selectedPresetConfig, selectedAssets, templateConfig.fields]);

  // Update a separate effect to initialize text inputs from persistent values when preset changes
  useEffect(() => {
    if (!selectedPresetConfig) return;

    const initialTextInputs: Record<string, string> = {};

    selectedPresetConfig.fields.forEach((field) => {
      const fullField = templateConfig.fields.find((f) => f.id === field.fieldId);
      if (fullField?.type === "text" || fullField?.type === "textArea") {
        //Check if there's a persistent value first
        if (persistentFieldValues[field.fieldId] !== undefined) {
          //Use the persistent value, even if it's an empty string
          initialTextInputs[field.fieldId] = persistentFieldValues[field.fieldId];
        } else {
          //Only use the default value if there's no persistent value
          initialTextInputs[field.fieldId] = field.defaultValue || "";
        }
      }
    });

    setTextInputs(initialTextInputs);
  }, [selectedPresetId, persistentFieldValues]);

  //Create grouped fields when assets or config changes
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
          defaultValue: field.defaultValue,
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
        const selectedAsset = fieldAssets.find((asset) => asset.name === field.defaultValue) || sortedAssets[0];

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

  // Modify the text field change handler to update both textInputs and persistentFieldValues
  const handleTextFieldChange = (fieldId: string, value: string) => {
    console.log(`Field ${fieldId} changed to: "${value}"`);
    setTextInputs((prev) => ({ ...prev, [fieldId]: value }));
    setPersistentFieldValue(fieldId, value);
  };

  // First, add a function to check if a field is enabled
  const isFieldEnabled = (fieldId: string): boolean => {
    if (!selectedPresetConfig) return true;

    const presetField = selectedPresetConfig.fields.find((field) => field.fieldId === fieldId);
    // If defaultEnabled is not specified, default to true
    return presetField?.defaultEnabled !== false;
  };

  // Add a handler for toggling fields
  const handleFieldToggle = (fieldId: string, enabled: boolean) => {
    toggleFieldEnabled(fieldId, enabled);
  };

  // Use the custom hook to get filenames
  const templateFilenames = useTemplateFilenames(templateConfigs);

  // If assets are loading, show a centered spinner

  return (
    <div style={{ height: "100%" }}>
      <Flex direction="column" gap="0" justify="between" style={{ height: "100%", overflowY: "auto" }}>
        <Flex direction="column" gap="4" px="6" py="6">
          <Flex direction="column" gap="2">
            <Flex direction="row" gap="2" justify="between" align="center">
              <Text as="label" size="2">
                Source
              </Text>
              <Text size="2" className={styles.openFileLink}>
                <a href={`https://www.figma.com/design/${templateConfig.fileId}`} target="_blank" rel="noreferrer">
                  Open File <LuArrowUpRight />
                </a>
              </Text>
            </Flex>
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
                    {templateFilenames[source] || source}
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
              <Select.Root value={selectedPresetId} onValueChange={(value) => setSelectedPresetId(value)}>
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

          {isLoadingAssets && (
            <Flex align="center" justify="center" style={{ height: "100%" }}>
              <Spinner size="3" />
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
                        key={`${selectedPresetId}-${field.fieldId}`}
                        group={{
                          ...groupData,
                          value: field.defaultValue,
                        }}
                        selection={groupedAssetSelections[field.fieldId]}
                        onSelect={handleAssetSelection}
                        pageName={fullField?.assetSourcePage || ""}
                        fileId={templateConfig.fileId}
                      />
                    ) : null;
                  case "text":
                  case "textArea":
                    const isEnabled = isFieldEnabled(field.fieldId);
                    return (
                      <ToggleableTextField
                        key={`${selectedPresetId}-${field.fieldId}`}
                        label={fullField?.label || "Text Field"}
                        value={textInputs[field.fieldId] || ""}
                        onChange={(val) => {
                          handleTextFieldChange(field.fieldId, val);
                        }}
                        multiline={fullField.type === "textArea"}
                        defaultEndabled={isEnabled}
                        fieldId={field.fieldId}
                        onToggle={handleFieldToggle}
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
        <Flex
          direction="column"
          pt="5"
          pb="5"
          px="6"
          gap="2"
          style={{
            marginTop: "auto",
            borderTop: "1px solid var(--gray-4)",
            position: "sticky",
            bottom: 0,
            backgroundColor: "white",
          }}
        >
          <DownloadButton />
        </Flex>
      </Flex>
    </div>
  );
}
