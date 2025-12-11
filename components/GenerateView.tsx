import React, { useState, useEffect } from 'react';
import { DesignConfig, GeneratedImage, HOME_STYLES } from '../types';
import { generateArchitectureImage } from '../services/geminiService';
import { Sidebar } from './Sidebar';
import * as LucideIcons from 'lucide-react';

interface GenerateViewProps {
  config: DesignConfig;
  setConfig: React.Dispatch<React.SetStateAction<DesignConfig>>;
  onGenerate: (image: GeneratedImage) => void;
  onSaveDraft: (images: GeneratedImage[]) => void;
  autoGenerateTrigger?: number;
  initialImages?: GeneratedImage[];
}

export const GenerateView: React.FC<GenerateViewProps> = ({ config, setConfig, onGenerate, onSaveDraft, autoGenerateTrigger, initialImages }) => {
  const [loading, setLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState<GeneratedImage[]>(initialImages || []);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [draftSaved, setDraftSaved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  
  // Zoom Modal State
  const [zoomedImage, setZoomedImage] = useState<GeneratedImage | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (autoGenerateTrigger && autoGenerateTrigger > 0) {
        generateBoth();
    }
  }, [autoGenerateTrigger]);

  // Restore images if initialImages changes (e.g. returning from library/resume)
  useEffect(() => {
    if (initialImages) {
        setCurrentImages(initialImages);
    }
  }, [initialImages]);

  // Countdown timer logic
  useEffect(() => {
    let interval: any;
    if (loading) {
      setTimeLeft(5); // Estimated generation time
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (type: 'blueprint' | 'exterior') => {
    setLoading(true);
    setError(null);
    // Clear previous images if we are starting a new single generation
    setCurrentImages([]); 

    try {
      const styleName = HOME_STYLES.find(s => s.id === config.styleId)?.name || 'Modern';
      const base64Image = await generateArchitectureImage(config, type, styleName);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: base64Image,
        type,
        timestamp: Date.now(),
        config: { ...config },
        prompt: config.customPrompt
      };

      setCurrentImages([newImage]);
      // Removed auto-save: onGenerate(newImage); 
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Please check API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateBoth = async () => {
    setLoading(true);
    setError(null);
    setCurrentImages([]); // Clear previous
    
    const styleName = HOME_STYLES.find(s => s.id === config.styleId)?.name || 'Modern';

    // Helper to process one generation task
    const processGeneration = async (type: 'blueprint' | 'exterior') => {
        try {
            const url = await generateArchitectureImage(config, type, styleName);
            const newImage: GeneratedImage = {
                id: Date.now().toString() + (type === 'blueprint' ? '_bp' : '_ext'),
                url: url,
                type: type,
                timestamp: Date.now(),
                config: { ...config },
                prompt: config.customPrompt
            };
            
            // Removed auto-save: onGenerate(newImage);
            
            // Update local view incrementally
            setCurrentImages(prev => {
                return [...prev, newImage];
            });
        } catch (err: any) {
            console.error(`Error generating ${type}:`, err);
            // Crucial: If it's a validation error from the service (starts with "Error:"), rethrow it so Promise.all catches it
            if (err.message && err.message.startsWith("Error:")) {
                throw err;
            }
        }
    };

    try {
        // Run both in parallel
        await Promise.all([
            processGeneration('exterior'),
            processGeneration('blueprint')
        ]);
    } catch (err: any) {
        // This will now catch the validation error thrown inside processGeneration
        setError(err.message || 'Failed to generate images.');
    } finally {
        setLoading(false);
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = (id: string) => {
    if (savedIds.has(id)) return; // Already saved

    const imageToSave = currentImages.find(img => img.id === id);
    if (imageToSave) {
        onGenerate(imageToSave); // Trigger save to Library (App state)
        setSavedIds(prev => new Set(prev).add(id));
    }
  };

  const handleDraftClick = () => {
    onSaveDraft(currentImages); // Pass current images to be saved with the draft
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const openZoomModal = (img: GeneratedImage) => {
    setZoomedImage(img);
    setZoomLevel(1);
  };

  const closeZoomModal = () => {
    setZoomedImage(null);
    setZoomLevel(1);
  };

  const adjustZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Determine grid columns based on content count (including placeholder if loading)
  const showPlaceholder = loading;
  const totalItems = currentImages.length + (showPlaceholder ? 1 : 0);
  const gridCols = totalItems > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      
      {/* Top Action Bar */}
      <div className="p-4 px-6 border-b border-slate-200 bg-white flex justify-center shrink-0">
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-5xl items-center justify-center relative">
          
          <button 
            onClick={() => handleGenerate('blueprint')}
            disabled={loading}
            className="flex-1 bg-slate-800 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap text-sm"
          >
            <LucideIcons.PenTool className="w-4 h-4" />
            Generate Blueprint
          </button>
          
          <button 
            onClick={() => handleGenerate('exterior')}
            disabled={loading}
            className="flex-1 bg-sky-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-sky-600 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-sky-200 whitespace-nowrap text-sm"
          >
            <LucideIcons.Image className="w-4 h-4" />
            Generate Exterior
          </button>

          <button 
            onClick={generateBoth}
            disabled={loading}
            className="flex-1 bg-sky-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-sky-700 transition flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap text-sm"
          >
            <LucideIcons.Layers className="w-4 h-4" />
            Generate Both
          </button>

          <button 
            onClick={handleDraftClick}
            disabled={loading}
            className={`px-4 py-2.5 h-full rounded-lg font-semibold transition flex items-center justify-center gap-2 border whitespace-nowrap text-sm ml-auto ${
                draftSaved 
                ? 'bg-green-50 text-green-600 border-green-200' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600'
            }`}
            title="Save current config as Draft"
          >
            {draftSaved ? <LucideIcons.Check className="w-4 h-4" /> : <LucideIcons.Save className="w-4 h-4" />}
            <span className="hidden xl:inline">{draftSaved ? 'Saved' : 'Save Draft'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Sidebar + Canvas */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Config Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-white h-full z-10 overflow-y-auto">
            <Sidebar config={config} setConfig={setConfig} />
        </div>

        {/* Canvas */}
        <div className="flex-1 p-6 overflow-auto bg-slate-50/50 relative">
            <div className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center items-center">
                
                {loading && currentImages.length === 0 ? (
                    <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
                        {/* Single Sky Blue Spinner */}
                        <div className="w-12 h-12 border-4 border-sky-200 border-l-sky-600 rounded-full animate-spin" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>

                        <div className="text-center space-y-2">
                             <div className="text-4xl font-mono font-bold text-slate-700 tabular-nums tracking-tight">
                                {timeLeft}s
                             </div>
                            <p className="text-slate-500 font-medium">Visualizing your dream home...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 flex flex-col items-center gap-2 text-center p-8 max-w-lg bg-red-50 rounded-xl border border-red-100">
                        <LucideIcons.AlertTriangle className="w-10 h-10" />
                        <p className="font-semibold">Validation Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                ) : (currentImages.length > 0 || loading) ? (
                    <div className={`w-full h-full p-4 grid gap-4 overflow-auto ${gridCols}`}>
                        {currentImages.map((img) => (
                            <div key={img.id} className="relative group w-full h-full bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center border border-slate-100 min-h-[300px]">
                                <img 
                                    src={img.url} 
                                    alt="Generated Architecture" 
                                    className="max-w-full max-h-full object-contain"
                                />
                                {/* Type Label */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm uppercase tracking-wider font-bold">
                                        {img.type}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                                    <button
                                        onClick={() => openZoomModal(img)}
                                        className="p-2 bg-black/60 text-white rounded-full backdrop-blur-md hover:bg-sky-500 transition-colors"
                                        title="Maximize & Zoom"
                                    >
                                        <LucideIcons.Maximize2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleSave(img.id)}
                                        className={`p-2 rounded-full backdrop-blur-md transition-colors ${savedIds.has(img.id) ? 'bg-green-500 text-white cursor-default' : 'bg-black/60 text-white hover:bg-sky-500'}`}
                                        title={savedIds.has(img.id) ? "Saved to Library" : "Save to Library"}
                                    >
                                        {savedIds.has(img.id) ? <LucideIcons.Check className="w-5 h-5" /> : <LucideIcons.Save className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => downloadImage(img.url, `archvision-${img.type}-${img.id}.png`)}
                                        className="p-2 bg-black/60 text-white rounded-full backdrop-blur-md hover:bg-sky-500 transition-colors"
                                        title="Download Image"
                                    >
                                        <LucideIcons.Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {/* Loading Placeholder for Parallel Generation */}
                        {loading && (
                            <div className="w-full h-full bg-slate-50 rounded-lg border border-slate-100 min-h-[300px] flex flex-col items-center justify-center animate-pulse">
                                {/* Small inline spinner row for the parallel card */}
                                <div className="flex gap-2 mb-4">
                                     <div className="w-6 h-6 border-2 border-sky-500 border-r-transparent rounded-full animate-spin"></div>
                                </div>
                                <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
                                    Generating... <span className="font-mono text-xs bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{timeLeft}s</span>
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center p-12 max-w-lg">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <LucideIcons.Image className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Visualize</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Configure your dream home parameters in the sidebar to the left and click generate to create AI-powered architectural blueprints and exterior visualizations.
                        </p>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="text-white">
                    <h3 className="font-bold">{HOME_STYLES.find(s => s.id === zoomedImage.config.styleId)?.name} {zoomedImage.type === 'blueprint' ? 'Blueprint' : 'Exterior'}</h3>
                    <p className="text-xs text-slate-400">Scroll to pan when zoomed</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-black/50 rounded-lg p-1 mr-4">
                        <button onClick={() => adjustZoom(-0.25)} className="p-2 hover:bg-white/20 rounded-md text-white transition-colors">
                            <LucideIcons.ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-white text-xs font-mono w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                        <button onClick={() => adjustZoom(0.25)} className="p-2 hover:bg-white/20 rounded-md text-white transition-colors">
                            <LucideIcons.ZoomIn className="w-5 h-5" />
                        </button>
                        <button onClick={() => setZoomLevel(1)} className="px-3 py-1.5 ml-1 hover:bg-white/20 rounded-md text-white text-xs font-semibold transition-colors">
                            Reset
                        </button>
                    </div>

                    <button 
                        onClick={closeZoomModal}
                        className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                    >
                        <LucideIcons.X className="w-6 h-6" />
                    </button>
                </div>
            </div>
            
            {/* Image Container */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8 relative" onClick={(e) => { if(e.target === e.currentTarget) closeZoomModal() }}>
                <img 
                    src={zoomedImage.url} 
                    alt="Zoomed" 
                    className="transition-transform duration-200 ease-out origin-center"
                    style={{ 
                        transform: `scale(${zoomLevel})`,
                        maxWidth: zoomLevel === 1 ? '100%' : 'none',
                        maxHeight: zoomLevel === 1 ? '100%' : 'none',
                        cursor: zoomLevel > 1 ? 'grab' : 'default'
                    }}
                    draggable={false}
                />
            </div>
        </div>
      )}
    </div>
  );
};