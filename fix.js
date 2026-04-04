const fs = require('fs');
const filePath = 'c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/app/admin/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Eu irei cortar o arquivo até a linha 3512, que é o fechamento do 'Selecione Fase' no select do HTML de QuickView. (a linha 3512 é exatamente a div de Selecione Fase que funcionava no nosso TS).
const sliceIdx = 3512; 
const rawBase = lines.slice(0, sliceIdx).join('\n');

// Esta é a constante com o final integro extraido dos view_files e concatenado perfeito.
const rest = `                                                        <div className="col-span-3">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Ato / Título (Notificação) *</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                placeholder="Ex: Layout Premium Aprovado"
                                                                value={qvTitle}
                                                                onChange={e => setQvTitle(e.target.value)}
                                                                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-[14px] font-medium text-foreground focus:border-primary outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="bg-secondary/20 border border-border/60 rounded-2xl p-4 space-y-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5"><LinkIcon size={12} /> Link de Homologação (Injetar Automático)</label>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <input
                                                                    type="text"
                                                                    placeholder="https://..."
                                                                    value={qvPreviewUrl}
                                                                    onChange={e => setQvPreviewUrl(e.target.value)}
                                                                    className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-[13px] text-foreground focus:border-primary outline-none font-medium"
                                                                />
                                                                <div className="w-[160px] flex gap-2">
                                                                    <div className="flex-1 bg-card border border-border rounded-xl flex items-center px-2 py-2.5 focus-within:border-primary">
                                                                        <input
                                                                            type="number"
                                                                            placeholder="H"
                                                                            value={qvHours}
                                                                            onChange={e => setQvHours(e.target.value)}
                                                                            className="w-full bg-transparent text-[14px] font-bold text-center text-foreground outline-none"
                                                                        />
                                                                        <span className="text-[9px] font-black text-muted-foreground">H</span>
                                                                    </div>
                                                                    <div className="flex-1 bg-card border border-border rounded-xl flex items-center px-2 py-2.5 focus-within:border-primary">
                                                                        <input
                                                                            type="number"
                                                                            placeholder="M"
                                                                            value={qvMinutes}
                                                                            onChange={e => setQvMinutes(e.target.value)}
                                                                            className="w-full bg-transparent text-[14px] font-bold text-center text-foreground outline-none"
                                                                        />
                                                                        <span className="text-[9px] font-black text-muted-foreground">M</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        disabled={qvLoading || !qvTitle.trim()}
                                                        className={\`w-full h-12 rounded-2xl font-black text-[14px] uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl \${
                                                            qvMode === 'reply' ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-primary text-black shadow-primary/20'
                                                        }\`}
                                                    >
                                                        {qvLoading ? <><Loader2 size={18} className="animate-spin" /> ...</> : <><Send size={15} /> {qvMode === 'reply' ? 'Enviar Correção' : 'Confirmar Atualização'}</>}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground border border-dashed border-border/60 rounded-2xl">
                                                <Activity size={20} className="mb-2 opacity-20" />
                                                <p className="text-[12px] font-medium">Nenhuma ação selecionada</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ── Action Bar (always at bottom) ── */}
                                <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-border bg-card/90 backdrop-blur-md flex flex-wrap items-center gap-2">
                                    {firstDenied && qvMode !== 'reply' && (
                                        <button
                                            onClick={() => { setQvMode('reply'); setQvStage(firstDenied.stage); setQvRevisionOf(firstDenied.id); setQvTitle(''); setQvMessage(''); setQvPreviewUrl(quickViewProject.preview_url || ''); setQvHours(''); }}
                                            className="flex-1 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 hover:bg-blue-500/20 text-[12px] font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw size={14} /> Responder com Correção
                                        </button>
                                    )}
                                    {qvMode !== 'new' && (
                                        <button
                                            onClick={() => { setQvMode('new'); setQvStage(quickViewProject.current_stage || 1); setQvTitle(''); setQvMessage(''); setQvRevisionOf(''); setQvPreviewUrl(quickViewProject.preview_url || ''); setQvHours(''); }}
                                            className="flex-1 h-11 rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 text-[12px] font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Send size={14} /> Nova Atualização
                                        </button>
                                    )}
                                    {qvMode !== null && (
                                        <button onClick={() => setQvMode(null)} className="h-10 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground text-[12px] font-bold transition-all">
                                            Cancelar
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    </>
                );
            })()}

                    </div>
                )}
            </div>

            <ImageCropperModal
                open={showCropper}
                onClose={() => {
                    setShowCropper(false);
                    setCropperTarget(null);
                }}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
}
`;

fs.writeFileSync(filePath, rawBase + '\\n' + rest);
console.log('Restaurado!');
