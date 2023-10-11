//这个代码主要用于生成一个URL，该URL用于获取一个在Cloudflare上存储的图像，
//并可以应用一系列的变体（例如，改变尺寸、模糊度、质量等）。
// 导入MediaType类型从@prisma/client库
import { MediaType } from '@prisma/client';
// 导入env对象从'~/env/client.mjs'模块
import { env } from '~/env/client.mjs';

// 定义一个类型EdgeUrlProps，它包含了一系列可能的属性，这些属性用于配置图像的URL和其变体
export type EdgeUrlProps = {
  src: string;  // 图像的源URL
  name?: string | null;  // 图像的名称，可选
  width?: number | undefined;  // 图像的宽度，可选
  height?: number | undefined;  // 图像的高度，可选
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';  // 图像的适应模式，可选
  anim?: boolean;  // 是否启用动画，可选
  blur?: number;  // 图像的模糊度（0-250），可选
  quality?: number;  // 图像的质量（0-100），可选
  gravity?: 'auto' | 'side' | 'left' | 'right' | 'top' | 'bottom';  // 图像的重力方向，可选
  metadata?: 'keep' | 'copyright' | 'none';  // 图像的元数据保留选项，可选
  background?: string;  // 图像的背景颜色，可选
  gamma?: number;  // 图像的伽马值，可选
  optimized?: boolean;  // 是否启用优化，可选
  transcode?: boolean;  // 是否启用转码，可选
  type?: MediaType;  // 媒体类型（图像、视频、音频），可选
};

// 定义一个对象typeExtensions，它将MediaType映射到对应的文件扩展名
const typeExtensions: Record<MediaType, string> = {
  image: '.jpeg',
  video: '.mp4',
  audio: '.mp3',
};

// 定义一个函数getEdgeUrl，它接受一个源URL（src）和一个包含各种可选参数的对象，并返回一个构造的URL
export function getEdgeUrl(
  src: string,  // 源URL
  { name, type, anim, transcode, ...variantParams }: Omit<EdgeUrlProps, 'src'>  // 其他可选参数
) {
  // 如果src为空、以http开始或以blob开始，则直接返回src
  if (!src || src.startsWith('http') || src.startsWith('blob')) return src;
  
  // 修改参数对象，如果anim为false则设为undefined，如果transcode为true则保持，否则设为undefined
  const modifiedParams = {
    anim: anim ? undefined : anim,
    transcode: transcode ? true : undefined,
    ...variantParams,  // 其他参数保持不变
  };
  
  // 将modifiedParams对象转换为键值对数组，过滤掉值为undefined的项，然后将其转换为字符串形式，并用逗号连接
  const params = Object.entries(modifiedParams)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join(',');
  
  // 获取文件扩展名
  const extension = typeExtensions[type ?? MediaType.image];
  
  // 如果name存在，则移除其中的%字符（因为%是URL编码的转义字符）
  name = (name ?? src).replaceAll('%', '');
  // 如果name包含.，则移除最后一个.及其后的部分，并添加文件扩展名；否则直接在name后添加文件扩展名
  if (name.includes('.')) name = name.split('.').slice(0, -1).join('.') + extension;
  else name = name + extension;
  
  // 返回构造的URL，将env.NEXT_PUBLIC_IMAGE_LOCATION、src、params和name连接起来，中间用/分隔
  return [env.NEXT_PUBLIC_IMAGE_LOCATION, src, params.toString(), name].filter(Boolean).join('/');
}