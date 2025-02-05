import { Form } from "@radix-ui/react-form";
import { Select, Button, Container, Flex, Text, TextField } from "@radix-ui/themes";
import { LuRefreshCw } from "react-icons/lu";

export function TemplateGenerator() {
  return (
    <Container size="2">
      <Flex direction="column" gap="4">
        {/* Update Database Button */}
        <Button variant="soft">
          <LuRefreshCw />
          Update Database
        </Button>

        <Form>
          <Flex direction="column" gap="4">
            {/* Template Selection */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Template
              </Text>
              <Select.Root defaultValue="single-event">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="single-event">Single Event Fixture Tile</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Brand/Type Selection */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Brand / Type
              </Text>
              <Select.Root defaultValue="fox-mini">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="fox-mini">Fox Mini</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Top Text Input */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Top Text
              </Text>
              <TextField.Root placeholder="Enter top text" />
            </Flex>

            {/* Bottom Text Input */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Bottom Text
              </Text>
              <TextField.Root placeholder="Enter bottom text" />
            </Flex>

            {/* Wedge 1 Selection */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Wedge 1
              </Text>
              <Select.Root defaultValue="f1">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="f1">F1</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Wedge 2 Selection */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Wedge 2
              </Text>
              <Select.Root defaultValue="australia">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="australia">Australia</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Output filename */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Output filename
              </Text>
              <TextField.Root placeholder="Enter filename"></TextField.Root>
            </Flex>

            {/* Filetype Selection */}
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Filetype
              </Text>
              <Select.Root defaultValue="png">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="png">PNG • 1920x1080</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Download Button */}
            <Button size="3" variant="solid">
              Download
            </Button>
          </Flex>
        </Form>
      </Flex>
    </Container>
  );
}
