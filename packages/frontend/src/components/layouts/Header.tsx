import { Box, Flex, Text, Avatar } from "@radix-ui/themes";
import styles from "./Header.module.css";

export function Header() {
  return (
    <Box px="4" py="2" className={styles.header}>
      <Flex justify="between" align="center">
        {/* <PlusAlsoLogo /> */}
        <Flex gap="2" align="center">
          <Text size="2">adam.hughes@foxtel.com.au</Text>
          <Avatar size="2" src="https://api.dicebear.com/7.x/pixel-art/svg?seed=foxtel" fallback="F" />
        </Flex>
      </Flex>
    </Box>
  );
}
