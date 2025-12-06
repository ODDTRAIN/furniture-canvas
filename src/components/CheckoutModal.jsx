import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Wallet, Truck, Check, Lock, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit Card', icon: CreditCard },
  { id: 'apple', label: 'Apple Pay', icon: Wallet },
]

export default function CheckoutModal() {
  const { isCheckoutOpen, closeCheckout, cart } = useStore()
  const [step, setStep] = useState('info') // info -> processing -> success
  const [selectedPayment, setSelectedPayment] = useState('card')

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = 0 
  const total = subtotal + shipping

  // 결제 프로세스 시뮬레이션
  const handlePayment = () => {
    setStep('processing')
    setTimeout(() => {
      setStep('success')
    }, 2000)
  }

  // 모달이 닫힐 때 상태 초기화
  const handleClose = () => {
    closeCheckout()
    setTimeout(() => setStep('info'), 300) // 애니메이션 후 초기화
  }

  if (!isCheckoutOpen) return null

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <>
          {/* 배경 (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200]"
          />

          {/* 모달 컨테이너 */}
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-white w-full max-w-5xl h-[85vh] md:h-[700px] rounded-[32px] shadow-2xl pointer-events-auto flex flex-col md:flex-row overflow-hidden"
            >
              
              {/* [Left] 영수증 영역 (Order Summary) */}
              <div className="w-full md:w-[45%] bg-[#f5f5f7] p-8 md:p-12 flex flex-col h-full relative overflow-hidden">
                {/* 상단 컬러 라인 포인트 */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />
                
                <h3 className="text-2xl font-bold text-black mb-8 tracking-tight">Order Summary</h3>
                
                {/* 상품 리스트 */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-2">
                  {cart.length === 0 ? (
                    <p className="text-gray-400 text-sm">Your cart is empty.</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex gap-4 items-start">
                        <div className="w-20 h-20 bg-white rounded-xl shadow-sm overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                          {/* 이미지가 없으면 기본 아이콘 */}
                          {item.images ? (
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-gray-200 text-xs font-bold">IMG</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-sm text-black">{item.name}</h4>
                            <span className="font-mono text-sm text-gray-900">₩{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                          <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 가격 합계 */}
                <div className="mt-8 pt-8 border-t border-gray-200 space-y-3">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-mono">₩{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span className="font-mono">{shipping === 0 ? 'Free' : `₩${shipping.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-black pt-4">
                    <span>Total</span>
                    <span className="font-mono">₩{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* [Right] 입력 및 결제 영역 (Payment Form) */}
              <div className="w-full md:w-[55%] bg-white p-8 md:p-12 relative flex flex-col">
                <button onClick={handleClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                  <X size={20} />
                </button>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                  <AnimatePresence mode="wait">
                    
                    {/* Step 1: 정보 입력 */}
                    {step === 'info' && (
                      <motion.div
                        key="info"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-3xl font-black mb-8 tracking-tighter">Checkout</h2>
                        
                        <div className="space-y-6">
                          {/* 배송 정보 */}
                          <div className="space-y-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shipping Details</p>
                            <div className="grid grid-cols-2 gap-4">
                              <input placeholder="First Name" className="w-full p-4 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder:text-gray-400" />
                              <input placeholder="Last Name" className="w-full p-4 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder:text-gray-400" />
                            </div>
                            <input placeholder="Address" className="w-full p-4 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder:text-gray-400" />
                            <div className="flex gap-2 items-center text-xs text-gray-500 mt-2 ml-1">
                              <Truck size={14} />
                              <span>Free Standard Shipping (3-5 Business Days)</span>
                            </div>
                          </div>

                          {/* 결제 수단 */}
                          <div className="pt-6">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Method</p>
                            <div className="grid grid-cols-2 gap-3">
                              {PAYMENT_METHODS.map((method) => (
                                <button
                                  key={method.id}
                                  onClick={() => setSelectedPayment(method.id)}
                                  className={`
                                    flex items-center gap-3 p-4 rounded-xl border transition-all
                                    ${selectedPayment === method.id 
                                      ? 'border-black bg-black text-white shadow-md' 
                                      : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  <method.icon size={18} />
                                  <span className="text-sm font-medium">{method.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* 결제 버튼 */}
                        <div className="mt-10">
                          <button 
                            onClick={handlePayment}
                            className="w-full py-4 bg-[#0066cc] hover:bg-[#0055aa] text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
                          >
                            <Lock size={18} />
                            Pay ₩{total.toLocaleString()}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: 처리 중 (로딩) */}
                    {step === 'processing' && (
                      <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center text-center h-full"
                      >
                        <div className="w-16 h-16 border-4 border-gray-100 border-t-black rounded-full animate-spin mb-6" />
                        <h3 className="text-xl font-bold mb-2">Processing Payment...</h3>
                        <p className="text-gray-500 text-sm">Please do not close this window.</p>
                      </motion.div>
                    )}

                    {/* Step 3: 결제 완료 (성공) */}
                    {step === 'success' && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center h-full"
                      >
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30">
                          <Check size={40} color="white" strokeWidth={3} />
                        </div>
                        <h3 className="text-3xl font-black mb-2 tracking-tight">Order Confirmed!</h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                          Your order has been successfully placed. We've sent a confirmation email to you.
                        </p>
                        <button 
                          onClick={handleClose}
                          className="px-8 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                          Return to Shop <ChevronRight size={16} />
                        </button>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}