// 导入所需的组件和类型
//这段代码定义了一个React组件AccountsCard，它接受一个providers属性，并显示一个表格，
//其中包含所有OAuth提供者和与它们关联的账户。用户可以点击"Connect"链接来连接一个新的账户，
//或者点击"Remove"链接来删除一个已连接的账户（只要他们有多于一个的账户）。
import { Table, Group, Text, LoadingOverlay, Card, Title, Stack } from '@mantine/core';
import { BuiltInProviderType } from 'next-auth/providers';
import { getProviders, signIn } from 'next-auth/react';
import { SocialLabel } from '~/components/Social/SocialLabel';
import { trpc } from '~/utils/trpc';

// 定义一个React组件AccountsCard，它接受一个providers属性
export function AccountsCard({ providers }: { providers: AsyncReturnType<typeof getProviders> }) {
  // 使用trpc的上下文
  const utils = trpc.useContext();
  // 使用trpc的查询钩子获取账户数据
  const { data: accounts = [] } = trpc.account.getAll.useQuery();

  // 使用trpc的变异钩子删除账户，并在成功后使账户数据无效
  const { mutate: deleteAccount, isLoading: deletingAccount } = trpc.account.delete.useMutation({
    onSuccess: async () => {
      await utils.account.invalidate();
    },
  });

  // 如果providers不存在，则返回null
  if (!providers) return null;

  // 返回一个卡片组件，其中包含一个表格，显示所有提供者和与它们关联的账户
  return (
    <Card withBorder>
      <Stack>
        <Stack spacing={0}>
          <Title order={2}>Connected Accounts</Title>
          <Text color="dimmed" size="sm">
            Connect multiple accounts to your user and sign in with any of them
          </Text>
        </Stack>
        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={deletingAccount} />
          <Table striped withBorder>
            <tbody>
              {Object.values(providers)
                .filter((provider) => provider.type === 'oauth')
                .map((provider) => {
                  const account = accounts.find((account) => account.provider === provider.id);
                  return (
                    <tr key={provider.id}>
                      <td>
                        <Group position="apart">
                          <SocialLabel
                            key={provider.id}
                            type={provider.id as BuiltInProviderType}
                          />
                          {!account ? (
                            <Text
                              variant="link"
                              style={{ cursor: 'pointer' }}
                              onClick={() => signIn(provider.id, { callbackUrl: '/user/account' })}
                            >
                              Connect
                            </Text>
                          ) : accounts.length > 1 ? (
                            <Text
                              variant="link"
                              color="red"
                              style={{ cursor: 'pointer' }}
                              onClick={() => deleteAccount({ id: account.id })}
                            >
                              Remove
                            </Text>
                          ) : null}
                        </Group>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </div>
      </Stack>
    </Card>
  );
}