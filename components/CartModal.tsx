/*
 * Copyright (c) 2024, Jawahar R Mallah and iLoveGorakhpur Project Contributors.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 */
import React from 'react';
import { useCart } from '../context/CartContext';
import { XIcon, TrashIcon } from './icons';

const CartModal: React.FC = () => {
  const { cartItems, isCartOpen, closeCart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    alert(`Thank you for your order! Your total is ₹${cartTotal.toFixed(2)}. This is a demo and no payment will be processed.`);
    // Here you would typically proceed to a real checkout page.
    // For now, we can just close the modal.
    closeCart();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-end"
      onClick={closeCart}
    >
      <div
        className="relative bg-white shadow-xl w-full max-w-md h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
            <button
            onClick={closeCart}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close cart"
            >
            <XIcon />
            </button>
        </div>

        {cartItems.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <h3 className="text-lg font-semibold text-gray-800">Your cart is empty</h3>
                <p className="text-gray-500 mt-2">Looks like you haven't added anything to your cart yet.</p>
            </div>
        ) : (
            <div className="flex-grow overflow-y-auto p-4">
                <ul className="divide-y divide-gray-200">
                    {cartItems.map(item => (
                        <li key={item.id} className="flex py-4">
                            <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-md object-cover" />
                            <div className="ml-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-base font-semibold text-gray-800">{item.name}</h4>
                                    <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center border border-gray-200 rounded-md">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">-</button>
                                        <span className="px-3 py-1 text-sm">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700" aria-label={`Remove ${item.name}`}>
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )}
        
        {cartItems.length > 0 && (
            <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-800">Subtotal</span>
                    <span className="text-xl font-bold text-gray-900">₹{cartTotal.toFixed(2)}</span>
                </div>
                <button
                    onClick={handleCheckout}
                    className="w-full py-3 px-4 bg-orange-500 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                >
                    Proceed to Checkout
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;