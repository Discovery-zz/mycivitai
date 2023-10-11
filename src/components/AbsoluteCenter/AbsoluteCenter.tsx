// 导入createStyles, Stack, 和 StackProps 从 '@mantine/core' 库
//这段代码定义了一个React组件AbsoluteCenter，它使用绝对定位来居中其子元素。
//zIndex属性用于控制组件的堆叠顺序（即在页面的z轴上的位置）。
//useStyles是一个使用createStyles创建的钩子，它返回一个包含root样式类的对象。
//root样式类将被应用到Stack组件上，以实现居中效果。
import { createStyles, Stack, StackProps } from '@mantine/core';

// 定义一个React组件AbsoluteCenter，它接受StackProps类型的props和一个可选的zIndex属性
export function AbsoluteCenter({
  children,  // 子组件
  className,  // CSS类名
  zIndex,  // z-index CSS属性
  ...props  // 其他props
}: StackProps & { zIndex?: number }) {
  // 使用useStyles钩子，并传入zIndex作为参数，获取classes和cx
  const { classes, cx } = useStyles({ zIndex });
  // 返回一个Stack组件，其className由cx函数合并生成的classes.root和传入的className组成，同时传入其他props和children
  return (
    <Stack className={cx(classes.root, className)} {...props}>
      {children}
    </Stack>
  );
}

// 使用createStyles函数创建一个样式钩子useStyles
const useStyles = createStyles((theme, { zIndex = 10 }: { zIndex?: number }) => ({
  // 定义root样式类
  root: {
    position: 'absolute',  // 使用绝对定位
    top: '50%',  // 从顶部偏移50%
    left: '50%',  // 从左侧偏移50%
    transform: 'translate(-50%,-50%)',  // 使用transform平移-50%来居中元素
    zIndex,  // 设置z-index
  },
}));