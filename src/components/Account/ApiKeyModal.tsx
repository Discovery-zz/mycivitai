// 导入所需的组件和类型
//这段代码定义了一个React组件ApiKeyModal，它允许用户输入一个API密钥的名称，
//并在提交后显示生成的API密钥。用户可以复制API密钥，并在复制后显示一个确认消息。
import {
  Button,
  Text,
  Group,
  Modal,
  ModalProps,
  Stack,
  Code,
  Box,
  CopyButton,
  ActionIcon,
} from '@mantine/core';
import { KeyScope } from '@prisma/client';
import { IconClipboard } from '@tabler/icons-react';
import { TypeOf } from 'zod';
import { Form, InputText, useForm } from '~/libs/form';
import { addApiKeyInputSchema } from '~/server/schema/api-key.schema';
import { showErrorNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';

// 定义一个schema常量，它是API密钥输入的验证模式
const schema = addApiKeyInputSchema;

// 定义一个React组件ApiKeyModal，它接受ModalProps类型的props
export function ApiKeyModal({ ...props }: Props) {
  // 使用useForm钩子初始化表单状态，并传入一些默认值和验证模式
  const form = useForm({
    schema,
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: { name: '', scope: [KeyScope.Read, KeyScope.Write] },
  });
  // 使用trpc的上下文
  const queryUtils = trpc.useContext();

  // 使用trpc的变异钩子添加API密钥，并在成功后使API密钥数据无效，失败时显示错误通知
  const {
    data: apiKey,
    isLoading: mutating,
    mutate,
    reset,
  } = trpc.apiKey.add.useMutation({
    onSuccess() {
      queryUtils.apiKey.getAllUserKeys.invalidate();
    },
    onError(error) {
      showErrorNotification({
        title: 'Unable to generate API Key',
        error: new Error(error.message),
      });
    },
  });
  // 定义一个函数handleSaveApiKey，它接受表单值并调用变异函数
  const handleSaveApiKey = (values: TypeOf<typeof schema>) => {
    mutate(values);
  };

  // 定义一个函数handleClose，它重置表单和变异状态，并调用props.onClose
  const handleClose = () => {
    form.reset();
    reset();
    props.onClose();
  };

  // 返回一个模态框组件，其中包含一个表单，允许用户输入API密钥的名称，并在提交后显示API密钥
  return (
    <Modal
      {...props}
      onClose={handleClose}
      closeOnClickOutside={!mutating}
      closeOnEscape={!mutating}
    >
      {apiKey ? (
        <Stack spacing={4}>
          <Text weight={500}>Here is your API Key:</Text>
          <CopyButton value={apiKey}>
            {({ copied, copy }) => (
              <Box pos="relative" onClick={copy} sx={{ cursor: 'pointer' }}>
                <ActionIcon
                  pos="absolute"
                  top="50%"
                  right={10}
                  variant="transparent"
                  sx={{ transform: 'translateY(-50%) !important' }}
                >
                  <IconClipboard />
                </ActionIcon>
                <Code block color={copied ? 'green' : undefined}>
                  {copied ? 'Copied' : apiKey}
                </Code>
              </Box>
            )}
          </CopyButton>
          <Text size="xs" color="dimmed">
            {`Be sure to save this, you won't be able to see it again.`}
          </Text>
        </Stack>
      ) : (
        <Form form={form} onSubmit={handleSaveApiKey}>
          <Stack>
            <InputText name="name" label="Name" placeholder="Your API Key name" withAsterisk />
            <Group position="apart">
              <Button variant="default" disabled={mutating} onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="filled" loading={mutating} type="submit">
                Save
              </Button>
            </Group>
          </Stack>
        </Form>
      )}
    </Modal>
  );
}

// 定义Props类型为ModalProps
type Props = ModalProps;
