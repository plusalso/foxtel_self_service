import { Card, Text, Flex } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";

function getMetadata() {
  console.log("Fetching metadata...");
  return fetch("/api/metadata")
    .then((res) => {
      console.log("Response status:", res.status);
      return res.text();
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      throw err;
    });
}

export function ApiTest() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["metadata"],
    queryFn: getMetadata,
  });

  console.log("Query state:", { data, isLoading, error });

  if (isLoading) {
    return (
      <Card>
        <Text>Loading API test...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text color="red">API Error: {(error as Error).message}</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Flex direction="column" gap="2">
        <Text>API Test Result:</Text>
        <Text>Timestamp: {data}</Text>
      </Flex>
    </Card>
  );
}
