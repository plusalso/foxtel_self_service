import { useFigmaNodes } from "@/features/figma/hooks/use-figma-nodes";
import { Text, Flex, Card } from "@radix-ui/themes";

interface FigmaImageLoaderProps {
  fileId: string;
  nodeIds: string[];
  className?: string;
}

function FigmaImageLoaderContent({ fileId, nodeIds }: FigmaImageLoaderProps) {
  const { imagesQuery, isLoading, error } = useFigmaNodes({ fileId, nodeIds });

  if (isLoading) {
    return (
      <Flex align="center" justify="center" p="4">
        <Text>Loading Figma assets...</Text>
      </Flex>
    );
  }

  if (error) {
    throw error;
  }

  return (
    <Flex direction="column" gap="4">
      {nodeIds.map((nodeId) => (
        <Card key={nodeId}>
          <img
            src={imagesQuery.data?.images[nodeId]}
            alt={`Figma node ${nodeId}`}
            style={{
              maxWidth: "100%",
              height: "auto",
              display: "block",
            }}
            loading="lazy"
          />
        </Card>
      ))}
    </Flex>
  );
}

export function FigmaImageLoader(props: FigmaImageLoaderProps) {
  return <FigmaImageLoaderContent {...props} />;
}
