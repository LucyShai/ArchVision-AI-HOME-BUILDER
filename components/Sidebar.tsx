import React, { useState } from 'react';
import { DesignConfig, HOME_STYLES, AVAILABLE_FEATURES } from '../types';
import * as LucideIcons from 'lucide-react';

interface SidebarProps {
  config: DesignConfig;
  setConfig: React.Dispatch<React.SetStateAction<DesignConfig>>;
}

interface AccordionProps {
  title: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2 font-semibold text-slate-700 text-sm">
          <Icon className="w-4 h-4 text-sky-500" />
          {title}
        </span>
        <LucideIcons.ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="p-4 pt-0 animate-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ config, setConfig }) => {
  
  const handleFeatureToggle = (feature: string) => {
    if (config.features.includes(feature)) {
      setConfig({ ...config, features: config.features.filter(f => f !== feature) });
    } else {
      setConfig({ ...config, features: [...config.features, feature] });
    }
  };

  const IconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Home;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="bg-white h-full flex flex-col overflow-y-auto w-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <LucideIcons.Settings2 className="w-5 h-5 text-sky-500" />
          Configuration
        </h2>
      </div>

      {/* Home Styles */}
      <Accordion title="Home Style" icon={LucideIcons.Sparkles} defaultOpen={true}>
        <div className="grid grid-cols-1 gap-2">
          {HOME_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setConfig({ ...config, styleId: style.id })}
              className={`w-full text-left p-2 rounded-lg border flex items-center gap-3 transition-all ${
                config.styleId === style.id
                  ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500'
                  : 'border-slate-200 hover:border-sky-300'
              }`}
            >
              <div className={`p-1.5 rounded-md shrink-0 ${config.styleId === style.id ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>
                {IconComponent(style.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 text-xs truncate">{style.name}</div>
              </div>
              {config.styleId === style.id && <LucideIcons.CheckCircle2 className="w-3 h-3 text-sky-500 shrink-0" />}
            </button>
          ))}
        </div>
      </Accordion>

      {/* Dimensions Sliders */}
      <Accordion title="Dimensions" icon={LucideIcons.Ruler} defaultOpen={false}>
        <div className="space-y-5">
            {/* Bedrooms */}
            <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1"><LucideIcons.Bed className="w-3 h-3" /> Bedrooms</span>
                <span className="text-sky-600 font-bold">{config.bedrooms}</span>
            </div>
            <input
                type="range"
                min="1" max="8" step="1"
                value={config.bedrooms}
                onChange={(e) => setConfig({ ...config, bedrooms: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            </div>

            {/* Levels */}
            <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1"><LucideIcons.Layers className="w-3 h-3" /> Levels</span>
                <span className="text-sky-600 font-bold">{config.levels}</span>
            </div>
            <input
                type="range"
                min="1" max="4" step="1"
                value={config.levels}
                onChange={(e) => setConfig({ ...config, levels: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1"><LucideIcons.Bath className="w-3 h-3" /> Bathrooms</span>
                <span className="text-sky-600 font-bold">{config.bathrooms}</span>
            </div>
            <input
                type="range"
                min="1" max="4" step="1"
                value={config.bathrooms}
                onChange={(e) => setConfig({ ...config, bathrooms: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            </div>

            {/* Lot Size */}
            <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1"><LucideIcons.Maximize className="w-3 h-3" /> Lot Size</span>
                <span className="text-sky-600 font-bold">{config.lotSize} m²</span>
            </div>
            <input
                type="range"
                min="100" max="2000" step="50"
                value={config.lotSize}
                onChange={(e) => setConfig({ ...config, lotSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            </div>
        </div>
      </Accordion>

      {/* Features */}
      <Accordion title="Features" icon={LucideIcons.ListChecks} defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_FEATURES.map((feature) => (
            <button
              key={feature}
              onClick={() => handleFeatureToggle(feature)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                config.features.includes(feature)
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-sky-400 hover:text-sky-500'
              }`}
            >
              {feature}
            </button>
          ))}
        </div>
      </Accordion>

      {/* Custom Prompt */}
      <Accordion title="Custom Instructions" icon={LucideIcons.MessageSquarePlus} defaultOpen={false}>
        <textarea
          value={config.customPrompt}
          onChange={(e) => setConfig({...config, customPrompt: e.target.value})}
          placeholder="Add specific details (e.g., 'red brick facade', 'large oak tree in front')..."
          className="w-full p-3 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none min-h-[100px] resize-none text-sky-600 placeholder:text-slate-400 bg-slate-50"
        />
      </Accordion>

    </div>
  );
};