import { Form } from "@radix-ui/react-form";
import { Select, Container, Flex, Text, TextField } from "@radix-ui/themes";
import { useFigmaTemplates } from "@/features/figma/api/get-figma-templates";
import { useEffect, useState } from "react";
import { TemplateHeader } from "@/features/figma/components/TemplateHeader";
import { useTemplate } from "@/features/figma/context/TemplateContext";
import { useQuery } from "@tanstack/react-query";
import singleEventFixtureTileConfig from "@/features/figma/templates/single-event-fixture-tile.json";
import bespokeMinisConfig from "@/features/figma/templates/bespoke-minis-bites-feature-image.json";
import editorialClippagesConfig from "@/features/figma/templates/editorial-clippages.json";
import ImageUpload from "../ImageUploader/ImageUploader";
import DownloadButton from "../DownloadButton/DownloadButton";
import { GroupedAssetSelect } from "@/components/GroupedAssetSelect/GroupedAssetSelect";
import { FigmaTemplateGroup } from "@/features/figma/types/template";
// packages/frontend/src/components/GroupedAssetSelect/GroupedAssetSelector.tsx
//const FIGMA_FILE_ID = "p2dpdOtFr225vT3jjEaIkS";

//these are selected form the Source dropdown
const FIGMA_FILE_IDS = {
  "Single Event Fixture Tile File": "51R2nLVvwmccZxjiIgo29P",
  "Misc Templates": "nj0cfZj9WsfxoVJUIMcE6U",
};

const templateConfigs = {
  "Single Event Fixture Tile": singleEventFixtureTileConfig,
  "Bespoke Minis + Bites - Feature Image": bespokeMinisConfig,
  "Editorial Clippages": editorialClippagesConfig,
};

export function TemplateGenerator() {
  const [selectedFile, setSelectedFile] = useState<string>("File 1");
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templateConfigs>("Single Event Fixture Tile");
  const [selectedAssets, setSelectedAssets] = useState<Record<string, string>>({});
  const { setOverlayAssets, setFileVersion, templateConfig, setTemplateConfig, textInputs, setTextInputs } =
    useTemplate();

  const { data: templateData } = useFigmaTemplates({
    fileId: FIGMA_FILE_IDS[selectedFile as keyof typeof FIGMA_FILE_IDS],
    templateNames: [selectedTemplate],
  });

  const template = templateData?.templates.find((t) => t.name === selectedTemplate);

  const { data: versionData } = useQuery({
    queryKey: ["figma-file-version", FIGMA_FILE_IDS[selectedFile as keyof typeof FIGMA_FILE_IDS]],
    queryFn: async () => {
      const response = await fetch(
        `/api/figma/file-version?fileId=${FIGMA_FILE_IDS[selectedFile as keyof typeof FIGMA_FILE_IDS]}`
      );
      return response.json();
    },
  });

  console.log("fe version", versionData);

  useEffect(() => {
    setTemplateConfig(templateConfigs[selectedTemplate as keyof typeof templateConfigs]);
  }, [selectedTemplate, setTemplateConfig]);

  useEffect(() => {
    const assets =
      template?.groups
        .map((group) => ({
          templateName: template.name,
          groupName: group.name,
          assetId: selectedAssets[group.name] || group.assets[0]?.id,
        }))
        .filter((asset) => asset.assetId) || [];

    setOverlayAssets(assets);
  }, [template, selectedAssets, setOverlayAssets]);

  useEffect(() => {
    if (versionData) {
      setFileVersion(versionData);
    }
  }, [versionData, setFileVersion]);

  console.log("selectedAssets", selectedAssets);

  const handleAssetSelection = (group: FigmaTemplateGroup, _: string, assetId: string) => {
    setSelectedAssets((prev) => ({
      ...prev,
      [group.name]: assetId,
    }));
  };

  return (
    <Container size="2">
      <Flex direction="column" gap="4">
        <TemplateHeader fileId={FIGMA_FILE_IDS[selectedFile as keyof typeof FIGMA_FILE_IDS]} template={template} />

        <Flex direction="column" gap="2">
          <Text as="label" size="2" weight="bold">
            Source
          </Text>
          <Select.Root value={selectedFile} onValueChange={(value) => setSelectedFile(value)}>
            <Select.Trigger />
            <Select.Content>
              {Object.keys(FIGMA_FILE_IDS).map((file) => (
                <Select.Item key={file} value={file}>
                  {file}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="2">
          <Text as="label" size="2" weight="bold">
            Template
          </Text>
          <Select.Root
            value={selectedTemplate}
            onValueChange={(value) => setSelectedTemplate(value as keyof typeof templateConfigs)}
          >
            <Select.Trigger />
            <Select.Content>
              {Object.keys(templateConfigs).map((template) => (
                <Select.Item key={template} value={template}>
                  {template}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Form>
          <Flex direction="column" gap="4">
            {template?.groups.map((group) => (
              <GroupedAssetSelect
                key={group.id}
                group={group}
                onSelect={handleAssetSelection}
                templateName={selectedTemplate}
              />
            ))}
          </Flex>
        </Form>

        {/* Render text fields based on template config */}
        {templateConfig?.fields?.map((field: any) => (
          <Flex direction="column" gap="2" key={field.name}>
            <Text as="label" size="2" weight="bold">
              {field.label}
            </Text>
            <TextField.Root
              type="text"
              value={textInputs[field.name] || ""}
              onChange={(e) => setTextInputs({ ...textInputs, [field.name]: e.target.value })}
              placeholder={`Enter ${field.label}`}
            />
          </Flex>
        ))}
        <ImageUpload />
        <DownloadButton />
      </Flex>
    </Container>
  );
}
