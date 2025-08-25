import { useState, useEffect, useCallback } from 'react';

/**
 * 安全的 localStorage hook，包含错误处理
 * 当 localStorage 不可用或抛出异常时，会降级到内存存储
 */
function useSafeLocalStorage<T>(key: string, defaultValue: T) {
  // 检查 localStorage 是否可用
  const isLocalStorageAvailable = (() => {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  })();

  // 从 localStorage 读取初始值
  const getStoredValue = (): T => {
    if (!isLocalStorageAvailable) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to read localStorage key "${key}":`, error);
      return defaultValue;
    }
  };

  const [value, setValue] = useState<T>(getStoredValue);

  // 设置值的函数
  const setStoredValue = useCallback(
    (newValue: T | ((prevValue: T) => T)) => {
      try {
        const valueToStore =
          typeof newValue === 'function'
            ? (newValue as (prevValue: T) => T)(value)
            : newValue;

        setValue(valueToStore);

        // 尝试保存到 localStorage
        if (isLocalStorageAvailable) {
          try {
            localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.warn(`Failed to save localStorage key "${key}":`, error);
            // 继续执行，仅内存状态生效
          }
        }
      } catch (error) {
        console.error(`Error updating localStorage key "${key}":`, error);
      }
    },
    [key, value, isLocalStorageAvailable]
  );

  // 监听 localStorage 变化（同一域名下其他标签页的变化）
  useEffect(() => {
    if (!isLocalStorageAvailable) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(
            `Failed to parse storage event for key "${key}":`,
            error
          );
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, isLocalStorageAvailable]);

  return [value, setStoredValue] as const;
}

export default useSafeLocalStorage;
