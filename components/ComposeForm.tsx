import React, { useState, useEffect, useRef } from 'react';
import { X, Paperclip, Image, Trash2, MoreVertical, Sparkles, RotateCcw, ToggleLeft, ToggleRight } from 'lucide-react';
import { User } from '../types';
import { mailStore } from '../services/mailStore';
import { generateEmailDraft, AVAILABLE_MODELS } from '../services/ai';

interface ComposeFormProps {
  currentUser: User;
  initialRecipients?: User[];
  initialSubject?: string;
  initialBody?: string;
  threadId?: string;
  onSend?: () => void;
  onCancel?: () => void;
  className?: string; // To allow custom styling wrapper
}

export const ComposeForm: React.FC<ComposeFormProps> = ({ 
    currentUser, 
    initialRecipients = [], 
    initialSubject = '', 
    initialBody = '', 
    threadId,
    onSend,
    onCancel,
    className = ''
}) => {
  const [toInput, setToInput] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [recipients, setRecipients] = useState<User[]>(initialRecipients);
  
  // Suggestion State
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWebFormat, setIsWebFormat] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [preGenerationData, setPreGenerationData] = useState<{subject: string, body: string} | null>(null);

  // Sync props if they change significantly (optional, mostly for init)
  useEffect(() => {
     if (initialRecipients.length > 0 && recipients.length === 0) setRecipients(initialRecipients);
     if (initialSubject && !subject) setSubject(initialSubject);
  }, [initialRecipients, initialSubject]); // simplified deps

  // Handle outside click for suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableUsers = mailStore.getUsers().filter(u => u.id !== currentUser.id);
  
  // Filter suggestions
  const filteredUsers = toInput ? availableUsers.filter(u => 
    !recipients.some(r => r.id === u.id) && 
    (u.name.toLowerCase().includes(toInput.toLowerCase()) || u.email.toLowerCase().includes(toInput.toLowerCase()))
  ) : [];

  const handleAddRecipient = (user: User) => {
    setRecipients([...recipients, user]);
    setToInput('');
    setShowSuggestions(false);
  };

  const handleSendAction = () => {
    let finalRecipients = [...recipients];
    
    // Simulate finding a user by email string if not added explicitly
    if (finalRecipients.length === 0 && toInput.includes('@')) {
       const found = availableUsers.find(u => u.email === toInput) || {
          id: `ext_${Date.now()}`,
          name: toInput.split('@')[0],
          email: toInput,
          role: 'user' as any,
          avatar: undefined
       };
       finalRecipients.push(found);
    }

    if (finalRecipients.length === 0) {
        alert("Veuillez ajouter un destinataire.");
        return;
    }

    mailStore.sendEmail(currentUser, finalRecipients, subject, body, threadId);
    
    // Reset
    setToInput('');
    setSubject('');
    setBody('');
    setRecipients([]);
    setPreGenerationData(null);
    if (onSend) onSend();
  };

  const handleAiGenerate = async () => {
    if (!body.trim()) {
      alert("Veuillez écrire quelques mots clés dans le corps du message pour guider l'IA.");
      return;
    }

    setIsGenerating(true);
    if (!preGenerationData) {
      setPreGenerationData({ subject, body });
    }

    try {
      const result = await generateEmailDraft(body, isWebFormat, selectedModel);
      setSubject(result.subject);
      setBody(result.body);
    } catch (error) {
      console.error("AI Generation failed", error);
      alert("Erreur lors de la génération. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiReset = () => {
    if (preGenerationData) {
      setSubject(preGenerationData.subject);
      setBody(preGenerationData.body);
      setPreGenerationData(null);
    }
  };

  return (
        <div className={`flex flex-col flex-1 overflow-hidden relative bg-white ${className}`}>
             {/* To Field with Auto-suggest */}
             <div className="px-4 py-2 border-b border-slate-100 flex items-center bg-white relative">
                <span className="text-slate-500 text-sm w-12 font-medium">À</span>
                <div className="flex-1 flex flex-wrap gap-1 relative">
                    {recipients.map(r => (
                        <span key={r.id} className="bg-slate-100 text-slate-800 border border-slate-200 text-xs px-2 py-1 rounded-md flex items-center">
                            {r.name} <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => setRecipients(recipients.filter(x => x.id !== r.id))} />
                        </span>
                    ))}
                    <input 
                        type="text" 
                        className="flex-1 outline-none text-sm min-w-[100px] bg-white text-black placeholder-slate-400"
                        value={toInput}
                        onChange={(e) => {
                          setToInput(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder={recipients.length === 0 ? "Destinataires" : ""}
                        onKeyDown={(e) => {
                           if (e.key === 'Backspace' && toInput === '' && recipients.length > 0) {
                               setRecipients(recipients.slice(0, -1));
                           }
                           if (e.key === 'Enter' && filteredUsers.length > 0) {
                               e.preventDefault();
                               handleAddRecipient(filteredUsers[0]);
                           }
                        }}
                    />
                    
                    {/* Auto-suggestion Dropdown */}
                    {showSuggestions && filteredUsers.length > 0 && (
                      <div ref={suggestionRef} className="absolute top-full left-0 mt-1 w-full max-w-sm bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                        {filteredUsers.map(u => (
                          <div 
                            key={u.id}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
                            onClick={() => handleAddRecipient(u)}
                          >
                             <img src={u.avatar} className="w-6 h-6 rounded-full mr-2 bg-slate-200" alt="" />
                             <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900">{u.name}</span>
                                <span className="text-xs text-slate-500">{u.email}</span>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
             </div>

             {/* Subject */}
             <div className="px-4 py-2 border-b border-slate-100 flex items-center bg-white">
                <span className="text-slate-500 text-sm w-12 font-medium">Objet</span>
                <input 
                    type="text" 
                    className="flex-1 outline-none text-sm font-medium bg-white text-black"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
             </div>
             
             {/* AI Toolbar */}
             <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                   <button 
                     onClick={handleAiGenerate}
                     disabled={isGenerating}
                     className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm
                       ${isGenerating ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
                     `}
                   >
                     {isGenerating ? <div className="animate-spin h-3 w-3 border-2 border-indigo-400 border-t-transparent rounded-full"/> : <Sparkles className="w-3 h-3" />}
                     <span>{isGenerating ? 'Génération...' : 'IA Rédiger'}</span>
                   </button>

                   {preGenerationData && (
                     <button 
                        onClick={handleAiReset}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-medium transition-colors"
                        title="Annuler les changements IA"
                     >
                       <RotateCcw className="w-3 h-3" />
                       <span>Reset</span>
                     </button>
                   )}

                   {/* Model Selector */}
                   <div className="relative">
                      <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-slate-100 border-none text-xs text-slate-600 rounded-md py-1 pl-2 pr-6 outline-none hover:bg-slate-200 cursor-pointer appearance-none"
                        style={{ maxWidth: '140px' }}
                      >
                         {AVAILABLE_MODELS.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                         ))}
                      </select>
                   </div>
                </div>

                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsWebFormat(!isWebFormat)}>
                    <span className={`text-xs font-medium ${isWebFormat ? 'text-indigo-600' : 'text-slate-500'}`}>Format Web</span>
                    {isWebFormat ? <ToggleRight className="w-6 h-6 text-indigo-600" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                </div>
             </div>

             {/* Editor Body */}
             {isWebFormat ? (
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                    <div className="flex-1 overflow-y-auto p-4 bg-white m-2 rounded shadow-sm border border-slate-200">
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: body }}
                        />
                        {!body && <span className="text-slate-400 italic">Le contenu généré s'affichera ici...</span>}
                    </div>
                    
                    {/* Raw HTML Editor (Collapsible or small) */}
                    <div className="px-4 pb-2">
                       <p className="text-xs text-slate-500 mb-1 font-medium">Code HTML (Éditable)</p>
                       <textarea 
                          className="w-full h-24 p-2 text-xs font-mono bg-slate-900 text-green-400 rounded outline-none resize-none"
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder="HTML content..."
                       />
                    </div>
                </div>
             ) : (
                <textarea 
                    className="flex-1 p-4 outline-none resize-none font-sans leading-relaxed bg-white text-black text-sm"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Écrivez votre message ici, ou entrez un prompt pour l'IA..."
                />
             )}

          {/* Footer Toolbar */}
          <div className="p-4 flex justify-between items-center bg-slate-50 border-t border-slate-100">
             <div className="flex items-center space-x-2">
                <button 
                  onClick={handleSendAction}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm"
                >
                    Envoyer
                </button>
                <button className="text-slate-500 hover:bg-slate-200 p-2 rounded-full"><Paperclip className="w-5 h-5" /></button>
                <button className="text-slate-500 hover:bg-slate-200 p-2 rounded-full"><Image className="w-5 h-5" /></button>
             </div>
              <div className="flex items-center space-x-2">
                 {onCancel && (
                     <button onClick={onCancel} className="text-slate-500 hover:text-red-500 px-3 py-2 text-sm">Annuler</button>
                 )}
                 <button className="text-slate-400 hover:text-slate-600 p-2"><Trash2 className="w-5 h-5" /></button>
                 <button className="text-slate-400 hover:text-slate-600 p-2"><MoreVertical className="w-5 h-5" /></button>
             </div>
          </div>
        </div>
  );
};
