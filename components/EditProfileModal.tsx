/*
 * Copyright (c) 2024, iLoveGorakhpur Project Contributors.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { XIcon, UserCircleIcon, LoadingIcon } from './icons';
import { fileToBase64 } from '../utils/imageUtils';

interface EditProfileModalProps {
    onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose }) => {
    const { user, updateUserProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
    const [newAvatarBase64, setNewAvatarBase64] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setAvatarPreview(base64);
            setNewAvatarBase64(base64);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name.trim()) return;

        setIsLoading(true);
        // Simulate an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        updateUserProfile({
            name: name.trim(),
            avatarUrl: newAvatarBase64,
        });
        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar preview" className="h-24 w-24 rounded-full object-cover border-4 border-gray-200" />
                        ) : (
                             <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserCircleIcon />
                            </div>
                        )}
                        <div>
                            <input type="file" id="avatar-upload" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                            <label htmlFor="avatar-upload" className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Change Photo
                            </label>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md border border-gray-200 focus:border-orange-500 focus:ring-orange-500 focus:outline-none transition-colors"
                            required
                        />
                    </div>
                    <div className="pt-4 flex justify-end items-center gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 disabled:bg-orange-300 transition-colors flex items-center min-w-[120px] justify-center"
                        >
                            {isLoading ? <LoadingIcon /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;