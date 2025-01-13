import React, { useState,useRef ,useEffect} from 'react';
import { CssBaseline } from '@mui/material';
import WebRoutes from '@components/WebRoutes';
import './i18n'; // 确保 i18n 被引入到项目中
import './styles/themes.css';

function App() {
  const [isDark, setIsDark] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    const notes = [];
    const noteSymbols = ['♪', '♬', '♫', '♩'];
  
    // 创建音符对象
    class Note {
      constructor(x, y, size, speedX, speedY, symbol, mass) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX; // 水平速度
        this.speedY = speedY; // 垂直速度
        this.symbol = symbol;
        this.mass = mass; // 质量
      }
  
      update() {
        // 更新位置
        this.x += this.speedX;
        this.y += this.speedY;
  
        // 碰到边界时反弹
        if (this.x < this.size / 2 || this.x > canvas.width - this.size / 2) {
          this.speedX *= -1;
        }
        if (this.y < this.size / 2 || this.y > canvas.height - this.size / 2) {
          this.speedY *= -1;
        }
      }
  
      draw() {
        ctx.font = `${this.size}px Arial`;
        ctx.fillStyle = 'rgba(255,255,255, 0.7)';
        ctx.fillText(this.symbol, this.x - this.size / 2, this.y + this.size / 2);
      }
    }
  
    // 碰撞检测和速度更新
    const checkCollision = (note1, note2) => {
      const dx = note1.x - note2.x;
      const dy = note1.y - note2.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
  
      // 如果碰撞
      if (distance < note1.size / 2 + note2.size / 2) {
        // 单位方向向量
        const normalX = dx / distance;
        const normalY = dy / distance;
  
        // 相对速度
        const relativeVelocityX = note1.speedX - note2.speedX;
        const relativeVelocityY = note1.speedY - note2.speedY;
  
        // 速度投影到碰撞法线方向
        const dotProduct = relativeVelocityX * normalX + relativeVelocityY * normalY;
  
        // 如果音符正在远离，不需要处理
        if (dotProduct > 0) return;
  
        // 弹性碰撞公式：更新速度
        const impulse =
          (2 * dotProduct) / (note1.mass + note2.mass);
  
        // 更新 note1 的速度
        note1.speedX -= impulse * note2.mass * normalX;
        note1.speedY -= impulse * note2.mass * normalY;
  
        // 更新 note2 的速度
        note2.speedX += impulse * note1.mass * normalX;
        note2.speedY += impulse * note1.mass * normalY;
      }
    };
  
    // 初始化音符
    for (let i = 0; i < 30; i++) {
      notes.push(
        new Note(
          Math.random() * canvas.width, // 随机X位置
          Math.random() * canvas.height, // 随机Y位置
          Math.random() * 24 + 16, // 随机字体大小
          Math.random() * 2 - 1, // 随机水平速度
          Math.random() * 2 - 1, // 随机垂直速度
          noteSymbols[Math.floor(Math.random() * noteSymbols.length)], // 随机符号
          Math.random() * 2 + 1 // 随机质量
        )
      );
    }
  
    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      // 更新和绘制音符
      notes.forEach((note, i) => {
        note.update();
        note.draw();
  
        // 检查与其他音符的碰撞
        for (let j = i + 1; j < notes.length; j++) {
          checkCollision(note, notes[j]);
        }
      });
  
      requestAnimationFrame(animate);
    };
  
    animate();
  
    // 清理动画，防止组件卸载时报错
    return () => {
      cancelAnimationFrame(animate);
    };
  }, []);
  
  
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    document.body.classList.toggle('dark', !isDark); // Toggle dark mode on the body
  };

  return (
      <React.Fragment>
      <CssBaseline /> {/* Normalize the stylesheet */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </button>
      <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1, // 确保叠加在其他组件上
        pointerEvents: 'none', // 使 Canvas 不影响鼠标交互
      }}
    />
      <WebRoutes />
      </React.Fragment>
  );
}

export default App;
