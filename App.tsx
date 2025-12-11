import React, { useState, useEffect } from 'react';
import { GenerateView } from './components/GenerateView';
import { LibraryView } from './components/LibraryView';
import { CompareView } from './components/CompareView';
import { DesignConfig, GeneratedImage, ViewMode, HOME_STYLES, Draft } from './types';
import * as LucideIcons from 'lucide-react';

// Default configuration
const DEFAULT_CONFIG: DesignConfig = {
  styleId: 'modern-minimalist',
  bedrooms: 3,
  levels: 2,
  bathrooms: 2,
  lotSize: 500,
  features: ['Garage', 'Garden'],
  customPrompt: ''
};

const App: React.FC = () => {
  const [config, setConfig] = useState<DesignConfig>(DEFAULT_CONFIG);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.HOME);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [sessionImages, setSessionImages] = useState<GeneratedImage[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [autoGenerateTrigger, setAutoGenerateTrigger] = useState<number>(0);

  const handleNewImage = (image: GeneratedImage) => {
    setGeneratedImages(prev => [image, ...prev]);
  };

  const handleSaveDraft = (imagesToSave: GeneratedImage[]) => {
    const styleName = HOME_STYLES.find(s => s.id === config.styleId)?.name || 'Custom';
    const newDraft: Draft = {
        id: Date.now().toString(),
        name: `${styleName} Draft`,
        timestamp: Date.now(),
        config: { ...config },
        images: imagesToSave
    };
    setDrafts(prev => [newDraft, ...prev]);
  };

  const handleLoadSession = (newConfig: DesignConfig, restoredImages: GeneratedImage[] = []) => {
    setConfig(newConfig);
    setSessionImages(restoredImages);
    setViewMode(ViewMode.GENERATE);
  };

  const handleDeleteImage = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDeleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  };

  const handleTemplateClick = (styleId: string) => {
    setConfig(prev => ({ ...prev, styleId }));
    setSessionImages([]); // Clear session images when starting a new template
    setViewMode(ViewMode.GENERATE);
    // Trigger generation with a new timestamp
    setAutoGenerateTrigger(Date.now());
  };

  const navigateHome = () => {
    setConfig(DEFAULT_CONFIG);
    setSessionImages([]);
    setAutoGenerateTrigger(0);
    setViewMode(ViewMode.HOME);
  };

  return (
    <div className="flex flex-col h-screen bg-grid-pattern text-slate-800 overflow-hidden font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-30 relative shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={navigateHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white shadow-lg shadow-slate-200">
                <LucideIcons.Building2 className="w-6 h-6" />
            </div>
            <div className="text-left">
                <h1 className="font-bold text-xl leading-none text-slate-900 tracking-tight">ArchVision</h1>
                <p className="text-xs text-sky-500 font-bold tracking-wide">AI HOME BUILDER</p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4">
           {/* Removed View on GitHub button */}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* Templates Section (Home View Content) */}
        {viewMode === ViewMode.HOME && (
        <div className="px-6 pt-10 shrink-0 flex flex-col items-center">
             <div className="flex items-center justify-center mb-8 w-full">
                <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                    <LucideIcons.Sparkles className="w-6 h-6 text-sky-500" />
                    Quick Templates
                </h3>
             </div>
             
             <div className="w-full flex justify-center">
                 <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-4 max-w-full">
                    {HOME_STYLES.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => handleTemplateClick(style.id)}
                            className="group relative flex-shrink-0 w-80 h-36 bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:shadow-xl hover:border-sky-500 transition-all text-left flex"
                        >
                             <div className="w-32 h-full relative">
                                <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                             </div>
                             <div className="flex-1 p-4 flex flex-col justify-center bg-white">
                                <span className="font-extrabold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-sky-600 transition-colors">{style.name}</span>
                                <span className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed mb-2">{style.description}</span>
                                <span className="text-xs text-sky-500 font-bold mt-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                    Generate <LucideIcons.ArrowRight className="w-3.5 h-3.5" />
                                </span>
                             </div>
                        </button>
                    ))}
                 </div>
             </div>
        </div>
        )}

        {/* View Navigation Tabs */}
        <div className="px-6 shrink-0 mb-4 flex justify-center">
            <div className="bg-white p-1 rounded-xl inline-flex shadow-sm border border-slate-200">
                <button 
                    onClick={navigateHome}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === ViewMode.HOME ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <LucideIcons.Home className="w-4 h-4" /> Home
                </button>
                <button 
                    onClick={() => setViewMode(ViewMode.GENERATE)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === ViewMode.GENERATE ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <LucideIcons.Wand2 className="w-4 h-4" /> Generate
                </button>
                <button 
                    onClick={() => setViewMode(ViewMode.LIBRARY)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === ViewMode.LIBRARY ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <LucideIcons.Library className="w-4 h-4" /> Library 
                    <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] ml-1">{generatedImages.length + drafts.length}</span>
                </button>
                <button 
                    onClick={() => setViewMode(ViewMode.COMPARE)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === ViewMode.COMPARE ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <LucideIcons.LayoutGrid className="w-4 h-4" /> Compare
                </button>
            </div>
        </div>

        {/* Dynamic View Content */}
        <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-50/50">
            {viewMode === ViewMode.HOME && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
                        <LucideIcons.Building2 className="w-12 h-12 text-sky-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-3">Welcome to ArchVision</h2>
                    <p className="max-w-md text-lg">Select a quick template above or start from scratch in the Generate tab.</p>
                </div>
            )}
            {viewMode === ViewMode.GENERATE && (
                <GenerateView 
                    config={config} 
                    setConfig={setConfig}
                    onGenerate={handleNewImage}
                    onSaveDraft={handleSaveDraft}
                    autoGenerateTrigger={autoGenerateTrigger}
                    initialImages={sessionImages}
                />
            )}
            {viewMode === ViewMode.LIBRARY && (
                <LibraryView 
                    images={generatedImages} 
                    drafts={drafts} 
                    onLoadConfig={handleLoadSession}
                    onDeleteImage={handleDeleteImage}
                    onDeleteDraft={handleDeleteDraft}
                />
            )}
            {viewMode === ViewMode.COMPARE && (
                <CompareView />
            )}
        </main>

      </div>
    </div>
  );
};

export default App;