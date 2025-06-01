import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useI18nStore from '@stores/i18nStore';
// Class name constants for reuse
const NAV_BUTTON_BASE = "text-left rounded-lg transition-colors";
const NAV_BUTTON_ACTIVE = "bg-notification-bg text-notification-text";
const NAV_BUTTON_INACTIVE = "text-text-primary hover:bg-bg-hover";

/**
 * A reusable settings panel component that can be used across the application
 * 
 * @param {boolean} isOpen - Whether the settings panel is open
 * @param {function} onClose - Function to call when the panel is closed
 * @param {array} components - Array of component objects to render
 * @param {string} namespace - i18n namespace to use for translations
 * @param {string} title - Title to display in the header (defaults to 'settings.Settings')
 */
function SettingsPanel({
    isOpen,
    onClose,
    components,
    title = 'settings.Settings'
}) {
    const { namespace } = useI18nStore();

    const { t } = useTranslation(namespace);
    const [currentPage, setCurrentPage] = useState('home');

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        }

        // Cleanup function to remove modal-open class when component unmounts
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const getNavButtonClass = (pageId) => {
        return `${NAV_BUTTON_BASE} ${currentPage === pageId ? NAV_BUTTON_ACTIVE : NAV_BUTTON_INACTIVE
            }`;
    };

    if (!isOpen) return null;

    // Find the current page component
    const CurrentPageComponent = components.find(page => page.id === currentPage)?.component;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
            <div className="relative w-[90%] max-w-4xl h-[80vh] bg-bg-common rounded-lg shadow-xl overflow-hidden">
                {/* Header with Settings label and close button */}
                <div className="flex items-center p-4 border-b border-bg-accent">
                    {/* Mobile back button - always takes space but hidden when not needed */}
                    <div className="w-8 md:hidden">
                        {currentPage !== 'home' && (
                            <button
                                onClick={() => setCurrentPage('home')}
                                className="p-2 hover:bg-bg-hover rounded-full"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <h2 className="text-xl font-semibold text-text-primary flex-1 text-center md:text-left">
                        {t(title)}
                    </h2>

                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-bg-hover rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content container with navigation and content area */}
                <div className="flex h-[calc(100%-4rem)]">
                    {/* Navigation Sidebar - Hidden on mobile */}
                    <div className="w-48 border-r border-bg-accent bg-bg-common h-full hidden md:block">
                        <nav className="p-4 space-y-2 bg-bg-common">
                            {components.map(page => (
                                <button
                                    key={page.id}
                                    onClick={() => setCurrentPage(page.id)}
                                    className={`w-full px-4 py-3 ${getNavButtonClass(page.id)}`}
                                >
                                    {t(page.label)}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col pb-6 bg-bg-common">
                        <div className="p-6 overflow-y-auto h-full box-border scrollbar-hide bg-bg-common" style={{
                            paddingBottom: '0',
                            scrollbarGutter: 'stable' // Reserve space for scrollbar
                        }}>
                            {/* Home content - Different for mobile and desktop */}
                            {currentPage === 'home' && (
                                <div className="p-6">
                                    {/* Mobile navigation */}
                                    <div className="md:hidden">
                                        <div className="grid grid-cols-1 gap-4">
                                            {components.map(page => (
                                                <button
                                                    key={page.id}
                                                    onClick={() => setCurrentPage(page.id)}
                                                    className={`p-6 ${getNavButtonClass(page.id)}`}
                                                >
                                                    <h3 className="text-lg font-semibold">
                                                        {t(page.label)}
                                                    </h3>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentPage === 'home' && (
                                <div className="hidden md:block text-center text-text-secondary">
                                    <p className="text-2xl">{t('settings.selectSetting')}</p>
                                </div>
                            )}

                            {currentPage !== 'home' && CurrentPageComponent && (
                                <CurrentPageComponent {...(components.find(page => page.id === currentPage)?.props || {})} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPanel;