// 导入所需的组件和类型
//这段代码定义了一个React组件ApiKeysCard，它显示一个包含所有API密钥的表格。
//用户可以点击"Add API key"按钮来打开一个模态框，其中他们可以创建一个新的API密钥。
//用户还可以点击表格中的"Delete"按钮来删除一个API密钥，这将打开一个确认模态框。
import { useDisclosure } from '@mantine/hooks';
import { openConfirmModal } from '@mantine/modals';
import { ApiKey } from '@prisma/client';
import { trpc } from '~/utils/trpc';
import {
  Text,
  Card,
  Stack,
  Group,
  Title,
  Button,
  Box,
  LoadingOverlay,
  Table,
  ActionIcon,
  Center,
  Paper,
} from '@mantine/core';
import { IconPlus, IconCopy, IconTrash } from '@tabler/icons-react';
import { formatDate } from '~/utils/date-helpers';
import { ApiKeyModal } from '~/components/Account/ApiKeyModal';

// 定义一个React组件ApiKeysCard
export function ApiKeysCard() {
  // 使用trpc的上下文
  const utils = trpc.useContext();

  // 使用useDisclosure钩子管理模态框的打开和关闭状态
  const [opened, { toggle }] = useDisclosure(false);

  // 使用trpc的查询钩子获取所有用户API密钥
  const { data: apiKeys = [], isLoading } = trpc.apiKey.getAllUserKeys.useQuery({});

  // 使用trpc的变异钩子删除API密钥，并在成功后使API密钥数据无效
  const deleteApiKeyMutation = trpc.apiKey.delete.useMutation({
    async onSuccess() {
      await utils.apiKey.getAllUserKeys.invalidate();
    },
  });

  // 定义一个函数handleDeleteApiKey，它接受一个id参数并打开一个确认模态框
  const handleDeleteApiKey = (id: number) => {
    openConfirmModal({
      title: 'Delete API Key',
      children: <Text size="sm">Are you sure you want to delete this API Key?</Text>,
      centered: true,
      labels: { confirm: 'Delete API Key', cancel: "No, don't delete it" },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteApiKeyMutation.mutateAsync({ id }),
    });
  };

  // 返回一个卡片组件，其中包含一个表格，显示所有API密钥和一个删除按钮
  return (
    <>
      <Card withBorder>
        <Stack spacing={0}>
          <Group align="start" position="apart">
            <Title order={2}>API Keys</Title>
            <Button
              variant="outline"
              leftIcon={<IconPlus size={14} stroke={1.5} />}
              onClick={() => toggle()}
              compact
            >
              Add API key
            </Button>
          </Group>
          <Text color="dimmed" size="sm">
            You can use API keys to interact with the site through the API as your user. These
            should not be shared with anyone.
          </Text>
        </Stack>
        <Box mt="md" sx={{ position: 'relative' }}>
          <LoadingOverlay visible={isLoading} />
          {apiKeys.length > 0 ? (
            <Table highlightOnHover withBorder>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Created at</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((apiKey, index) => (
                  <tr key={index}>
                    <td>
                      <Group spacing={4}>
                        <Text>{apiKey.name}</Text>
                      </Group>
                    </td>
                    <td>{formatDate(apiKey.createdAt)}</td>
                    <td>
                      <Group position="right">
                        <ActionIcon color="red" onClick={() => handleDeleteApiKey(apiKey.id)}>
                          <IconTrash size="16" stroke={1.5} />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Paper radius="md" mt="lg" p="lg" sx={{ position: 'relative' }} withBorder>
              <Center>
                <Stack spacing={2}>
                  <Text weight="bold">There are no API keys in your account</Text>
                  <Text size="sm" color="dimmed">
                    Start by creating your first API Key to connect your apps.
                  </Text>
                </Stack>
              </Center>
            </Paper>
          )}
        </Box>
      </Card>
      <ApiKeyModal title="Create API Key" opened={opened} onClose={toggle} />
    </>
  );
}