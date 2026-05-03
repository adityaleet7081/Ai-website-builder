import { X } from "lucide-react";
import { useEffect, useState } from "react"

interface EditorPanelProps {
    selectedElement: {
        tagName: string;
        className: string;
        text: string;
        styles: {
            padding: string; margin: string; backgroundColor: string; color: string; fontSize: string;
        };
    } | null;
    onUpdate: (updates: unknown) => void;
    onClose: () => void;
}

const EditorPanel = ({ selectedElement, onUpdate, onClose }: EditorPanelProps) => {
    const [values, setValues] = useState(selectedElement)

    useEffect(() => { setValues(selectedElement) }, [selectedElement])

    if (!selectedElement || !values) return null;

    const handleChange = (field: string, value: string) => {
        const newValues = { ...values, [field]: value };
        if (field in values.styles) newValues.styles = { ...values.styles, [field]: value }
        setValues(newValues); onUpdate({ [field]: value });
    }
    const handleStyleChange = (styleName: string, value: string) => {
        const newStyles = { ...values.styles, [styleName]: value };
        setValues({ ...values, styles: newStyles }); onUpdate({ styles: { [styleName]: value } })
    }

    return (
        <div className="absolute top-4 right-4 w-72 rounded-2xl shadow-2xl p-4 z-50 anim-scaleIn"
            style={{ background: 'rgba(15, 15, 35, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-active)' }}>
            <div className="flex justify-between items-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-cyan)' }} />
                    Inspector
                </h3>
                <button onClick={onClose} className="btn-ghost p-1 rounded-md text-[var(--text-muted)]"><X size={14} /></button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-mono tracking-wider uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Content</label>
                    <textarea value={values.text} onChange={(e) => handleChange('text', e.target.value)}
                        className="input-dark w-full text-xs p-2 rounded-lg min-h-[60px]" />
                </div>
                <div>
                    <label className="block text-[10px] font-mono tracking-wider uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Classes</label>
                    <input type='text' value={values.className || ''} onChange={(e) => handleChange('className', e.target.value)}
                        className="input-dark w-full text-xs p-2 rounded-lg font-mono" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Padding</label>
                        <input type='text' value={values.styles.padding} onChange={(e) => handleStyleChange('padding', e.target.value)}
                            className="input-dark w-full text-xs p-2 rounded-lg font-mono" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Margin</label>
                        <input type='text' value={values.styles.margin} onChange={(e) => handleStyleChange('margin', e.target.value)}
                            className="input-dark w-full text-xs p-2 rounded-lg font-mono" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Background</label>
                        <div className="flex items-center gap-2 p-1.5 rounded-lg input-dark">
                            <input type='color' value={values.styles.backgroundColor === 'rgba(0,0,0,0' ? '#ffffff' : values.styles.backgroundColor}
                                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} className="w-5 h-5 cursor-pointer rounded border-0" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Color</label>
                        <div className="flex items-center gap-2 p-1.5 rounded-lg input-dark">
                            <input type='color' value={values.styles.color} onChange={(e) => handleStyleChange('color', e.target.value)}
                                className="w-5 h-5 cursor-pointer rounded border-0" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditorPanel