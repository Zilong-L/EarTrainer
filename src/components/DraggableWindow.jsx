import React, { useState, useRef, useEffect } from 'react';
import { Portal } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

const DraggableWindow = ({ children }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 200, height: 150 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragRef = useRef(null);
    const resizeRef = useRef(null);
    const { i18n } = useTranslation();

    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX - position.x,
            startY: e.clientY - position.y,
        };
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            const x = e.clientX - dragRef.current.startX;
            const y = e.clientY - dragRef.current.startY;
            setPosition({ x, y });
        } else if (isResizing) {
            const newWidth = e.clientX - resizeRef.current.startX;
            const newHeight = e.clientY - resizeRef.current.startY;
            setSize({
                width: Math.max(newWidth, 50),
                height: Math.max(newHeight, 50),
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    const handleResizeMouseDown = (e) => {
        setIsResizing(true);
        resizeRef.current = {
            startX: e.clientX - size.width,
            startY: e.clientY - size.height,
        };
        e.stopPropagation();
    };

    useEffect(() => {
        const handleMouseLeave = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

    const windowStyle = {
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        background: '#fff',
        border: '1px solid #ccc',
        padding: '20px',
        cursor: 'move',
        zIndex: 1000,
        overflow: 'hidden',
    };

    const resizeHandleStyle = {
        position: 'absolute',
        right: '0px',
        bottom: '0px',
        width: '20px',
        height: '20px',
        background: 'rgba(0, 0, 0, 0.2)',
        cursor: 'se-resize',
        zIndex: 1001,
    };

    return (
        <Portal>
            <div
                style={windowStyle}
                onMouseDown={handleMouseDown}
                className={i18n.language === 'zh' ? 'font-chinese' : 'font-chewy'}
            >
                {children}
                <div
                    style={resizeHandleStyle}
                    onMouseDown={handleResizeMouseDown}
                />
            </div>
        </Portal>
    );
};

export default DraggableWindow;
