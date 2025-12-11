import React, { useState, useEffect } from 'react';
import { GeneratedImage, HOME_STYLES, DesignConfig, Draft } from '../types';
import * as LucideIcons from 'lucide-react';

interface LibraryViewProps {
  images: GeneratedImage[];
  drafts: Draft[];
  onLoadConfig: (config: DesignConfig, images?: GeneratedImage[]) => void;
  onDeleteImage: (id: string) => void;
  onDeleteDraft: (id: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ images, drafts, onLoadConfig, onDeleteImage, onDeleteDraft }) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [activeTab, setActiveTab] = useState<'saved' | 'drafts'>('saved');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Reset zoom when opening a new image
  useEffect(() => {
    if (selectedImage) {
        setZoomLevel(1);
    }
  }, [selectedImage]);

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const adjustZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const EmptyState = ({ text }: { text: string }) => (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
             <LucideIcons.Library className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-lg font-medium">{text}</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Library Toolbar */}
        <div className="px-6 pt-6 pb-2 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <LucideIcons.FolderOpen className="w-5 h-5 text-sky-500" />
                <h2 className="text-lg font-bold text-slate-800">My Library</h2>
            </div>
            
            {/* Tabs */}
            <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
                <button 
                    onClick={() => setActiveTab('saved')}
                    className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'saved' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Saved Designs ({images.length})
                </button>
                <button 
                    onClick={() => setActiveTab('drafts')}
                    className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'drafts' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Drafts ({drafts.length})
                </button>
            </div>
        </div>

      <div className="flex-1 overflow-y-auto p-6 relative">
      
        {/* Saved Designs Grid */}
        {activeTab === 'saved' && (
            images.length === 0 ? (
                <EmptyState text="No saved designs yet. Generate one to save it!" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {images.map((img) => {
                        const styleName = HOME_STYLES.find(s => s.id === img.config.styleId)?.name;
                        return (
                            <div 
                            key={img.id} 
                            onClick={() => setSelectedImage(img)}
                            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer ring-offset-2 hover:ring-2 hover:ring-sky-200"
                            >
                                <div className="aspect-video relative bg-slate-100 overflow-hidden">
                                    <img src={img.url} alt="Generated" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center gap-1">
                                        {img.type === 'blueprint' ? <LucideIcons.PenTool className="w-3 h-3" /> : <LucideIcons.Image className="w-3 h-3" />}
                                        {img.type}
                                    </div>
                                    
                                    {/* Overlay Actions */}
                                    <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onLoadConfig(img.config, [img]);
                                            }}
                                            className="px-4 py-2 bg-sky-500 text-white rounded-lg font-semibold text-xs shadow-md hover:bg-sky-600 transition-colors flex items-center gap-2"
                                            title="Edit Configuration"
                                        >
                                            <LucideIcons.Pencil className="w-3 h-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadImage(img.url, `archvision-${img.type}-${img.id}.png`);
                                            }}
                                            className="p-2 bg-black/60 text-white rounded-full backdrop-blur-md hover:bg-sky-500 transition-colors"
                                            title="Download"
                                        >
                                            <LucideIcons.Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteImage(img.id);
                                            }}
                                            className="p-2 bg-black/60 text-white rounded-full backdrop-blur-md hover:bg-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <LucideIcons.Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-medium text-slate-500">
                                            {new Date(img.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <h4 className="font-bold text-slate-800 mb-1 line-clamp-1">{styleName || 'Custom'} Residence</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                        {img.prompt ? img.prompt : `${img.config.bedrooms} Bed, ${img.config.levels} Levels, ${img.config.features.length} Features`}
                                    </p>
                                    <div className="flex gap-2 text-xs text-slate-400">
                                    <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{img.config.lotSize} m²</span>
                                    <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{img.config.bedrooms} Bed</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )
        )}

        {/* Drafts Grid */}
        {activeTab === 'drafts' && (
            drafts.length === 0 ? (
                <EmptyState text="No drafts saved. Create a configuration and save it as a draft." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {drafts.map((draft) => {
                        const styleObj = HOME_STYLES.find(s => s.id === draft.config.styleId);
                        const styleName = styleObj?.name || 'Custom';
                        // Prefer draft image if available, otherwise template image
                        const thumbnail = draft.images?.[0]?.url || styleObj?.imageUrl;
                        const hasDraftImage = draft.images && draft.images.length > 0;
                        
                        return (
                            <div 
                                key={draft.id} 
                                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer ring-offset-2 hover:ring-2 hover:ring-sky-200"
                                onClick={() => onLoadConfig(draft.config, draft.images)}
                            >
                                <div className="aspect-video relative bg-slate-100 overflow-hidden group">
                                    <img src={thumbnail} alt="Draft Style" className={`w-full h-full object-cover transition-all duration-500 ${!hasDraftImage ? 'opacity-50 grayscale group-hover:grayscale-0' : 'opacity-90 group-hover:opacity-100'}`} />
                                    
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white/90 backdrop-blur text-slate-800 px-4 py-2 rounded-lg font-bold shadow-sm border border-slate-200 flex items-center gap-2">
                                            <LucideIcons.FileEdit className="w-4 h-4 text-sky-500" />
                                            DRAFT
                                        </div>
                                    </div>

                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200 flex gap-2">
                                         <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onLoadConfig(draft.config, draft.images);
                                            }}
                                            className="px-4 py-2 bg-sky-500 text-white rounded-lg font-semibold text-xs shadow-md hover:bg-sky-600 transition-colors flex items-center gap-2"
                                        >
                                            <LucideIcons.Play className="w-3 h-3" />
                                            Resume
                                        </button>
                                         <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteDraft(draft.id);
                                            }}
                                            className="p-2 bg-white text-red-500 rounded-lg font-semibold text-xs shadow-md hover:bg-red-50 transition-colors"
                                            title="Delete Draft"
                                        >
                                            <LucideIcons.Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-medium text-slate-500">
                                            {new Date(draft.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <h4 className="font-bold text-slate-800 mb-1 line-clamp-1">{draft.name}</h4>
                                    <div className="text-xs text-slate-500 mb-3 space-y-1">
                                        <p>Style: {styleName}</p>
                                        <p>{draft.config.bedrooms} Bed, {draft.config.bathrooms} Bath, {draft.config.levels} Levels</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )
        )}
      </div>

      {/* Review Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
            
            {/* Image Side with Zoom */}
            <div className="flex-1 bg-slate-900 relative overflow-hidden flex flex-col">
               <div className="flex-1 overflow-auto flex items-center justify-center p-8">
                   <img 
                       src={selectedImage.url} 
                       alt="Full View" 
                       className="transition-transform duration-200 ease-out origin-center shadow-2xl" 
                       style={{ 
                        transform: `scale(${zoomLevel})`,
                        maxWidth: zoomLevel === 1 ? '100%' : 'none',
                        maxHeight: zoomLevel === 1 ? '100%' : 'none',
                        cursor: zoomLevel > 1 ? 'grab' : 'default'
                       }}
                       draggable={false}
                   />
               </div>

               {/* Zoom Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
                    <button onClick={() => adjustZoom(-0.25)} className="p-2 hover:bg-white/20 rounded-md text-white transition-colors">
                        <LucideIcons.ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-white text-xs font-mono w-12 text-center select-none">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={() => adjustZoom(0.25)} className="p-2 hover:bg-white/20 rounded-md text-white transition-colors">
                        <LucideIcons.ZoomIn className="w-5 h-5" />
                    </button>
                    <div className="w-px h-4 bg-white/20 mx-1"></div>
                    <button onClick={() => setZoomLevel(1)} className="px-2 py-1 hover:bg-white/20 rounded-md text-white text-xs font-semibold transition-colors">
                        Reset
                    </button>
               </div>

               <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
               >
                 <LucideIcons.X className="w-6 h-6" />
               </button>
            </div>

            {/* Details Side */}
            <div className="w-full md:w-96 bg-white p-6 flex flex-col overflow-y-auto border-l border-slate-200 shadow-xl shrink-0">
                <div className="mb-6">
                   <h2 className="text-2xl font-bold text-slate-800 mb-1">{HOME_STYLES.find(s => s.id === selectedImage.config.styleId)?.name || 'Custom'}</h2>
                   <p className="text-slate-500 text-sm">Generated on {new Date(selectedImage.timestamp).toLocaleString()}</p>
                </div>

                <div className="space-y-6 flex-1">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Configuration</h3>
                        <div className="grid grid-cols-2 gap-3">
                             <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="text-xs text-slate-500">Bedrooms</div>
                                <div className="font-semibold text-slate-800">{selectedImage.config.bedrooms}</div>
                             </div>
                             <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="text-xs text-slate-500">Levels</div>
                                <div className="font-semibold text-slate-800">{selectedImage.config.levels}</div>
                             </div>
                             <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="text-xs text-slate-500">Bathrooms</div>
                                <div className="font-semibold text-slate-800">{selectedImage.config.bathrooms}</div>
                             </div>
                             <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="text-xs text-slate-500">Lot Size</div>
                                <div className="font-semibold text-slate-800">{selectedImage.config.lotSize} m²</div>
                             </div>
                        </div>
                    </div>

                    {selectedImage.config.features.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Features</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedImage.config.features.map(f => (
                                    <span key={f} className="text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded-md border border-sky-100 font-medium">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedImage.config.customPrompt && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Custom Instructions</h3>
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                "{selectedImage.config.customPrompt}"
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
                    <button 
                        onClick={() => {
                            onLoadConfig(selectedImage.config, [selectedImage]);
                            setSelectedImage(null);
                        }}
                        className="w-full py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition flex items-center justify-center gap-2"
                    >
                        <LucideIcons.Pencil className="w-4 h-4" />
                        Edit Configuration
                    </button>
                    <button 
                        onClick={() => downloadImage(selectedImage.url, `archvision-${selectedImage.type}-${selectedImage.id}.png`)}
                        className="w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2"
                    >
                        <LucideIcons.Download className="w-4 h-4" />
                        Download Image
                    </button>
                     <button 
                        onClick={() => {
                            onDeleteImage(selectedImage.id);
                            setSelectedImage(null);
                        }}
                        className="w-full py-3 bg-white text-red-500 border border-red-100 rounded-xl font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2"
                    >
                        <LucideIcons.Trash2 className="w-4 h-4" />
                        Delete Design
                    </button>
                </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};