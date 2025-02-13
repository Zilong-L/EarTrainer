import { motion } from 'framer-motion';
// 新增：桌面端按钮组件

  // 新增：使用 Framer Motion 做柱状动画
  const AudioBars = ({className}) => {
    const bars = [0, 1, 2, 3];
    return (
      <div className={"flex space-x-1 justify-center text-text-primary "+className}>
        {bars.map((i) => (
          <motion.div
            key={i}
            className="bg-text-primary w-2 h-4 origin-bottom self-center"
            initial={{ scaleY: 0.2 }}
            animate={{ scaleY: [0.2, 0.8, 0.2, 0.5, 0.2] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 0,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    );
  };
  
export {AudioBars};