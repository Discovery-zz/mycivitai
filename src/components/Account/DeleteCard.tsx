//这段代码定义了一个React组件DeleteCard，它允许用户删除他们的账户。
//当用户点击"Delete your account"按钮时，它会打开一个确认模态框，
//询问用户是否确定要删除他们的账户。如果用户确认，它将打开另一个模态框，
//询问用户是否也要删除他们创建的所有模型。根据用户的选择，它将调用deleteAccountMutation.mutateAsync函数，
//传入当前用户的信息和一个可选的removeModels参数。
// 导入所需的组件和库
import { Button, Card, Stack, Text, Title } from '@mantine/core';
import { closeModal, openConfirmModal } from '@mantine/modals';
import { signOut } from 'next-auth/react';

import { useCurrentUser } from '~/hooks/useCurrentUser';
import { showErrorNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';

// 定义一个React组件DeleteCard
export function DeleteCard() {
  // 使用自定义钩子useCurrentUser获取当前用户的信息
  const currentUser = useCurrentUser();

  // 使用trpc的变异钩子删除用户，并在成功后登出，在失败时显示错误通知
  const deleteAccountMutation = trpc.user.delete.useMutation({
    async onSuccess() {
      // 当用户账户成功删除后，执行登出操作
      await signOut();
    },
    onError(error) {
      // 当删除操作失败时，显示一个错误通知
      showErrorNotification({ error: new Error(error.message) });
    },
  });

  // 定义一个函数handleDeleteAccount，它打开一个确认模态框
  const handleDeleteAccount = () => {
    // 打开第一个确认模态框，询问用户是否确定要删除账户
    openConfirmModal({
      modalId: 'delete-confirm',
      title: 'Delete your account',
      children: 'Are you sure you want to delete your account? All data will be permanently lost.',
      centered: true,
      labels: { cancel: `Cancel`, confirm: `Yes, I am sure` },
      confirmProps: { color: 'red' },
      closeOnConfirm: false,
      onConfirm: () =>
        // 当用户确认删除账户时，打开第二个模态框，询问是否删除与账户关联的模型
        openConfirmModal({
          modalId: 'wipe-confirm',
          title: 'Wipe your models',
          children:
            'Do you want to delete all the models you have created along with your account?',
          centered: true,
          closeOnCancel: false,
          closeOnConfirm: false,
          labels: { cancel: 'Yes, wipe them', confirm: 'No, leave them up' },
          confirmProps: { color: 'red', loading: deleteAccountMutation.isLoading },
          cancelProps: { loading: deleteAccountMutation.isLoading },
          onConfirm: () =>
            // 当用户选择不删除模型时，执行删除账户的操作
            currentUser ? deleteAccountMutation.mutateAsync({ ...currentUser }) : undefined,
          onCancel: () =>
            // 当用户选择删除模型时，执行删除账户和模型的操作
            currentUser
              ? deleteAccountMutation.mutateAsync({ ...currentUser, removeModels: true })
              : undefined,
          onClose: () => 
            // 当第二个模态框关闭时，关闭第一个模态框
            closeModal('delete-confirm'),
        }),
    });
  };

  // 返回一个卡片组件，其中包含一个标题、一段文本和一个按钮，当点击按钮时调用handleDeleteAccount函数
  return (
    <Card withBorder>
      <Stack>
        <Title order={2}>Delete account</Title>
        <Text size="sm">
          Once you delete your account, there is no going back. Please be certain when taking this
          action.
        </Text>
        <Button variant="outline" color="red" onClick={handleDeleteAccount}>
          Delete your account
        </Button>
      </Stack>
    </Card>
  );
}