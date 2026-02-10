import React, { useState } from 'react';
import { User, UserRole, AppSettings } from '../types';
import { mailStore } from '../services/mailStore';
import { Plus, Users, Shield, Save, BadgeCheck, Settings } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface AdminPanelProps {
    users: User[];
    currentSettings: AppSettings;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, currentSettings }) => {
    const [activeTab, setActiveTab] = useState<'users' | 'rules' | 'config'>('users');
    const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.USER, isCertified: false, avatar: '' });
    
    // Configuration State
    const [settings, setSettings] = useState<AppSettings>(currentSettings);

    const handleCreateUser = () => {
        if (!newUser.name || !newUser.email) return;
        mailStore.createUser(newUser.name, newUser.email, newUser.role, newUser.isCertified, newUser.avatar);
        setNewUser({ name: '', email: '', role: UserRole.USER, isCertified: false, avatar: '' });
        alert("Utilisateur créé avec succès");
    };

    const handleSaveSettings = () => {
        mailStore.updateSettings(settings);
        alert("Paramètres enregistrés !");
    };

    return (
        <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-red-600" />
                Administration Système
            </h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 px-2 text-sm font-medium border-b-2 ${activeTab === 'users' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Gestion des Utilisateurs
                </button>
                <button 
                    onClick={() => setActiveTab('config')}
                    className={`pb-3 px-2 text-sm font-medium border-b-2 ${activeTab === 'config' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Configuration App
                </button>
                <button 
                    onClick={() => setActiveTab('rules')}
                    className={`pb-3 px-2 text-sm font-medium border-b-2 ${activeTab === 'rules' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Règles & Conformité
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User List */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-700">Utilisateurs Actifs ({users.length})</h3>
                            <button className="text-blue-600 text-sm font-medium hover:underline">Exporter CSV</button>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Nom</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Rôle</th>
                                    <th className="px-6 py-3">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center">
                                            <img src={u.avatar} className="w-6 h-6 rounded-full mr-2 object-cover" alt=""/>
                                            {u.name}
                                            {u.isCertified && <BadgeCheck className="w-4 h-4 text-blue-500 ml-1" />}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === UserRole.ADMIN ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {u.role === UserRole.ADMIN ? 'ADMIN' : 'USER'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-green-600 font-medium">Actif</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Create User Form */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-fit">
                        <h3 className="font-semibold text-slate-700 mb-4 flex items-center">
                            <Plus className="w-4 h-4 mr-2" /> Créer un utilisateur
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Nom complet</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    value={newUser.name}
                                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                                <input 
                                    type="email" 
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    placeholder="exemple@domaine.com"
                                    value={newUser.email}
                                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Photo de Profil</label>
                                <ImageUpload 
                                    value={newUser.avatar} 
                                    onChange={(val) => setNewUser({...newUser, avatar: val})}
                                    placeholder="Photo de profil"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Rôle</label>
                                <select 
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                                    value={newUser.role}
                                    onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                                >
                                    <option value={UserRole.USER}>Utilisateur Standard</option>
                                    <option value={UserRole.ADMIN}>Administrateur</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center">
                                <input 
                                    id="certified-checkbox"
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    checked={newUser.isCertified}
                                    onChange={e => setNewUser({...newUser, isCertified: e.target.checked})}
                                />
                                <label htmlFor="certified-checkbox" className="ml-2 block text-sm text-slate-700 font-medium flex items-center">
                                    Compte Certifié <BadgeCheck className="w-4 h-4 ml-1 text-blue-500" />
                                </label>
                            </div>

                            <button 
                                onClick={handleCreateUser}
                                className="w-full bg-slate-900 text-white py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
                            >
                                Créer l'accès
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'config' && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-2xl">
                    <h3 className="font-semibold text-slate-700 mb-6 flex items-center">
                        <Settings className="w-5 h-5 mr-2" /> Paramètres de l'Application
                    </h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nom de l'Application</label>
                            <input 
                                type="text"
                                className="w-full border border-slate-300 rounded-md px-4 py-2 outline-none focus:border-blue-500"
                                value={settings.appName}
                                onChange={e => setSettings({...settings, appName: e.target.value})}
                            />
                            <p className="text-xs text-slate-500 mt-1">Ce nom sera affiché dans la barre latérale et les en-têtes.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Mise à jour du Logo</label>
                            <ImageUpload 
                                value={settings.logoUrl} 
                                onChange={(val) => setSettings({...settings, logoUrl: val})}
                                placeholder="Logo de l'application"
                                className="h-40"
                            />
                             <p className="text-xs text-slate-500 mt-1">Laissez vide pour utiliser l'icône par défaut.</p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={handleSaveSettings}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Enregistrer les modifications
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'rules' && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-10 text-center text-slate-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Configuration des règles de rétention et filtres anti-spam.</p>
                    <p className="text-xs mt-2">Simulation: Non disponible dans cette démo.</p>
                </div>
            )}
        </div>
    );
};