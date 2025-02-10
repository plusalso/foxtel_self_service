import { Form } from "@radix-ui/react-form";
import { Select, Container, Flex, Text, TextField } from "@radix-ui/themes";
import { useFigmaTemplates } from "@/features/figma/api/get-figma-templates";
import React, { useEffect, useState } from "react";
import { TemplateHeader } from "@/features/figma/components/TemplateHeader";
import { useTemplate } from "@/features/figma/context/TemplateContext";
import { useQuery } from "@tanstack/react-query";
import singleEventFixtureTileConfig from "@/features/figma/templates/single-event-fixture-tile.json";
import bespokeMinisConfig from "@/features/figma/templates/bespoke-minis-bites-feature-image.json";
import editorialClippagesConfig from "@/features/figma/templates/editorial-clippages.json";
import ImageUpload from "../ImageUploader/ImageUploader";
import DownloadButton from "../DownloadButton/DownloadButton";
//const FIGMA_FILE_ID = "p2dpdOtFr225vT3jjEaIkS";
const FIGMA_FILE_ID = "51R2nLVvwmccZxjiIgo29P";

const templateConfigs = {
  "Single Event Fixture Tile": singleEventFixtureTileConfig,
  "Bespoke Minis + Bites - Feature Image": bespokeMinisConfig,
  "Editorial Clippages": editorialClippagesConfig,
};

export function TemplateGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templateConfigs>("Single Event Fixture Tile");
  const [selectedAssets, setSelectedAssets] = useState<Record<string, string>>({});
  const { setOverlayAssets, setFileVersion, templateConfig, setTemplateConfig, textInputs, setTextInputs } =
    useTemplate();

  const { data: templateData } = useFigmaTemplates({
    fileId: FIGMA_FILE_ID,
    templateNames: [selectedTemplate],
  });

  const template = templateData?.templates.find((t) => t.name === selectedTemplate);

  // Add version query
  const { data: versionData } = useQuery({
    queryKey: ["figma-file-version", FIGMA_FILE_ID],
    queryFn: async () => {
      const response = await fetch(`/api/figma/file-version?fileId=${FIGMA_FILE_ID}`);
      return response.json();
    },
  });

  console.log("fe version", versionData);

  useEffect(() => {
    setTemplateConfig(templateConfigs[selectedTemplate as keyof typeof templateConfigs]);
  }, [selectedTemplate, setTemplateConfig]);

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (versionData) {
      setFileVersion(versionData);
    }
  }, [versionData, setFileVersion]);

  return (
    <Container size="2">
      <Flex direction="column" gap="4">
        {/* <Button variant="soft" onClick={() => refetch()}>
          <LuRefreshCw />
          Update Database
        </Button> */}

        <TemplateHeader fileId={FIGMA_FILE_ID} template={template} />

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
              <Flex key={`${group.name}-${group.assets[0]?.id}`} direction="column" gap="2">
                <Text as="label" size="2" weight="bold">
                  {group.name}
                </Text>
                <Select.Root
                  defaultValue={group.assets[0]?.id}
                  onValueChange={(value) => {
                    setSelectedAssets((prev) => ({
                      ...prev,
                      [group.name]: value,
                    }));
                  }}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {group.assets.map((asset) => (
                      <Select.Item key={asset.order} value={asset.id}>
                        {asset.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Flex>
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
