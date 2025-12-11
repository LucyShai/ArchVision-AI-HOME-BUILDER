import React from 'react';
import { HOME_STYLES } from '../types';
import * as LucideIcons from 'lucide-react';

export const CompareView: React.FC = () => {
  // Mock data for comparison based on styles
  const metrics = [
    { label: 'Architectural Detail', key: 'detail' },
    { label: 'Lighting Quality', key: 'lighting' },
    { label: 'Material Rendering', key: 'material' },
    { label: 'Composition', key: 'comp' },
    { label: 'Realism Score', key: 'realism' },
  ];

  // Hardcoded scores for demo purposes to match the "matrix" look
  const getScore = (styleIndex: number, metricIndex: number) => {
    // Generate pseudo-random consistent scores 8-10
    const base = 8;
    const variant = ((styleIndex + metricIndex) * 7) % 3; 
    return base + variant;
  };

  const getAvg = (styleIndex: number) => {
    let sum = 0;
    metrics.forEach((_, i) => sum += getScore(styleIndex, i));
    return (sum / metrics.length).toFixed(1);
  };

  const IconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Home;
    return <Icon className="w-6 h-6 mb-2 text-slate-600" />;
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 min-w-[800px]">
            <div className="flex items-center gap-3 mb-8">
                <h2 className="text-xl font-bold text-slate-800">Quality Comparison Matrix</h2>
                <span className="bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded-full">{HOME_STYLES.length} Templates</span>
            </div>

            <div className="w-full">
                {/* Header Row */}
                <div className="grid grid-cols-6 gap-4 mb-6 border-b border-slate-100 pb-4">
                    <div className="col-span-1 font-semibold text-slate-400 text-sm flex items-end pb-2">Quality Metric</div>
                    {HOME_STYLES.map(style => (
                        <div key={style.id} className="col-span-1 flex flex-col items-center text-center">
                            {IconComponent(style.icon)}
                            <span className="text-xs font-bold text-slate-600">{style.name}</span>
                        </div>
                    ))}
                </div>

                {/* Rows */}
                {metrics.map((metric, metricIdx) => (
                    <div key={metric.key} className="grid grid-cols-6 gap-4 mb-6 items-center hover:bg-slate-50 p-2 rounded-lg transition-colors">
                         <div className="col-span-1">
                            <div className="font-semibold text-slate-700 text-sm">{metric.label}</div>
                            <div className="text-[10px] text-slate-400">Score out of 10</div>
                         </div>
                         {HOME_STYLES.map((style, styleIdx) => {
                             const score = getScore(styleIdx, metricIdx);
                             return (
                                <div key={style.id} className="col-span-1 text-center font-bold text-green-600">
                                    {score}/10
                                </div>
                             );
                         })}
                    </div>
                ))}

                {/* Average Row */}
                <div className="grid grid-cols-6 gap-4 mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 rounded-lg p-4">
                    <div className="col-span-1 font-bold text-slate-800 self-center">Average Score</div>
                    {HOME_STYLES.map((style, styleIdx) => (
                        <div key={style.id} className="col-span-1 flex justify-center">
                            <span className="bg-slate-800 text-white font-bold py-1 px-3 rounded-full text-sm">
                                {getAvg(styleIdx)}/10
                            </span>
                        </div>
                    ))}
                </div>
                
                {/* Awards Row */}
                 <div className="grid grid-cols-6 gap-4 mt-4 px-4 text-xs text-slate-500">
                    <div className="col-span-1"></div>
                    <div className="col-span-1 text-center flex flex-col items-center gap-1">
                        <LucideIcons.CheckCircle2 className="w-4 h-4 text-green-500" />
                        Best Composition
                    </div>
                    <div className="col-span-1 text-center"></div>
                    <div className="col-span-1 text-center flex flex-col items-center gap-1">
                         <LucideIcons.CheckCircle2 className="w-4 h-4 text-green-500" />
                         Best for Detail
                    </div>
                     <div className="col-span-1 text-center"></div>
                     <div className="col-span-1 text-center flex flex-col items-center gap-1">
                         <LucideIcons.CheckCircle2 className="w-4 h-4 text-green-500" />
                         Best Materials
                    </div>
                 </div>

            </div>
        </div>
    </div>
  );
};