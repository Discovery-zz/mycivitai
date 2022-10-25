import { Stack, FileInput, Progress, FileInputProps } from '@mantine/core';
import { IconUpload, IconCircleCheck } from '@tabler/icons';
import { useEffect, useState } from 'react';
import { useS3Upload } from '~/hooks/use-s3-upload';
import { UploadType, UploadTypeUnion } from '~/server/common/enums';

export function FileInputUpload({
  uploadType = 'default',
  onChange,
  fileUrlString: initialFile,
  ...props
}: Props) {
  const [localFile, setLocalFile] = useState<File>();
  const { files, uploadToS3, resetFiles } = useS3Upload();
  const { file, progress } = files[0] ?? { file: null, progress: 0 };

  const handleOnChange: FileInputProps['onChange'] = async (file) => {
    let url: string | null = null;

    if (file) {
      const uploaded = await uploadToS3(file, uploadType);
      url = uploaded.url;
    } else {
      resetFiles();
    }

    onChange(file, url);
  };

  useEffect(() => {
    async function getFileFromUrl(url: string, name: string, defaultType = 'image/jpeg') {
      const response = await fetch(url);
      const data = await response.blob();

      const tempFile = new File([data], name, {
        type: data.type || defaultType,
      });
      setLocalFile(tempFile);
    }

    if (initialFile)
      getFileFromUrl(initialFile, decodeURIComponent(initialFile.split('/').pop() ?? ''));
  }, [initialFile]);

  return (
    <Stack>
      <FileInput
        {...props}
        icon={<IconUpload size={16} />}
        onChange={handleOnChange}
        value={file ?? localFile}
        rightSection={file && progress === 100 ? <IconCircleCheck color="green" size={24} /> : null}
      />
      {file && progress < 100 ? (
        <Progress
          size="xl"
          value={progress}
          label={`${Math.floor(progress)}%`}
          color={progress < 100 ? 'blue' : 'green'}
        />
      ) : null}
    </Stack>
  );
}

type Props = Omit<FileInputProps, 'icon' | 'onChange'> & {
  onChange: (file: File | null, url: string | null) => void;
  uploadType?: UploadType | UploadTypeUnion;
  fileUrlString?: string;
};
