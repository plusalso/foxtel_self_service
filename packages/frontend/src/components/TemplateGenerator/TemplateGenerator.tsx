import { Form } from "@radix-ui/react-form";
import { Select, Container, Flex, Text } from "@radix-ui/themes";
import { useFigmaTemplates } from "@/features/figma/api/get-figma-templates";
import React from "react";
import { TemplateHeader } from "@/features/figma/components/TemplateHeader";

//const FIGMA_FILE_ID = "p2dpdOtFr225vT3jjEaIkS";
const FIGMA_FILE_ID = "51R2nLVvwmccZxjiIgo29P";

export function TemplateGenerator() {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("Single Event Fixture Tile");

  const { data: templateData } = useFigmaTemplates({
    fileId: FIGMA_FILE_ID,
    templateNames: [selectedTemplate],
  });

  const template = templateData?.templates.find((t) => t.name === selectedTemplate);

  console.log(template?.groups);

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
          <Select.Root value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="Single Event Fixture Tile">Single Event Fixture Tile</Select.Item>
              <Select.Item value="Bespoke Minis + Bites - Feature Image">
                Bespoke Minis + Bites - Feature Image
              </Select.Item>
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
                <Select.Root defaultValue={group.assets[0]?.id}>
                  <Select.Trigger />
                  <Select.Content>
                    {group.assets.map((asset) => (
                      <Select.Item key={asset.id} value={asset.id}>
                        {asset.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Flex>
            ))}
          </Flex>
        </Form>
      </Flex>
    </Container>
  );
}
