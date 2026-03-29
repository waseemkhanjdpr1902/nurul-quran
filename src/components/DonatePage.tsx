import React, { useState } from 'react';
import { CreditCard, Heart, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db, collection, addDoc } from '../lib/firebase';

export const DonatePage = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(500);
  const [isRecurring, setIsRecurring] = useState(false);

  const handleDonate = async () => {
    try {
      const res = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt: `receipt_${Date.now()}` }),
      });
      const order = await res.json();

      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Nur al-Huda",
        description: isRecurring ? "Monthly Support" : "One-time Donation",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment on server
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.status === "ok") {
              // Record donation in Firestore
              await addDoc(collection(db, 'donations'), {
                user_id: user?.uid || 'anonymous',
                user_email: user?.email || 'anonymous',
                amount: amount,
                is_recurring: isRecurring,
                payment_id: response.razorpay_payment_id,
                date: new Date().toISOString()
              });

              alert("Payment Successful! Thank you for your support. Payment ID: " + response.razorpay_payment_id);
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Error verifying payment. Please contact support.");
          }
        },
        prefill: {
          name: user?.displayName || "User Name",
          email: user?.email || "user@example.com",
        },
        theme: {
          color: "#059669",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">Support Our Mission</h1>
        <p className="text-zinc-500 max-w-xl mx-auto leading-relaxed">
          Your contributions help us maintain the platform, add more reciters, and provide spiritual guidance to thousands.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Donation Card */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Make a Contribution</h2>
            <div className="flex gap-2 p-1 bg-emerald-50 dark:bg-zinc-800 rounded-2xl">
              <button
                id="donate-type-onetime"
                onClick={() => setIsRecurring(false)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!isRecurring ? 'bg-white dark:bg-zinc-700 shadow-sm text-emerald-600' : 'text-zinc-500'}`}
              >
                One-time
              </button>
              <button
                id="donate-type-monthly"
                onClick={() => setIsRecurring(true)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isRecurring ? 'bg-white dark:bg-zinc-700 shadow-sm text-emerald-600' : 'text-zinc-500'}`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[100, 500, 1000, 2000, 5000].map((val) => (
              <button
                key={val}
                id={`donate-amount-${val}`}
                onClick={() => setAmount(val)}
                className={`py-4 rounded-2xl border-2 font-bold transition-all text-lg ${amount === val ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' : 'border-emerald-50 dark:border-emerald-900/20 text-zinc-600 hover:border-emerald-400'}`}
              >
                ₹{val}
              </button>
            ))}
            <div className="relative">
              <input
                id="donate-amount-custom"
                type="number"
                placeholder="Custom"
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full py-4 px-4 rounded-2xl border-2 border-emerald-50 dark:border-emerald-900/20 text-center font-bold text-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl mb-8 border border-emerald-100 dark:border-emerald-900/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
                <Zap size={24} />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-100">
                  {isRecurring ? 'Monthly Subscription' : 'One-time Support'}
                </h4>
                <p className="text-xs text-zinc-500">
                  {isRecurring ? 'Cancel anytime from your dashboard' : 'Your support makes a difference'}
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {isRecurring 
                ? "By subscribing, you're providing consistent support that allows us to plan long-term projects and maintain high-quality content."
                : "Your one-time donation helps us cover immediate server costs and development of new features."}
            </p>
          </div>

          <button
            id="donate-submit-button"
            onClick={handleDonate}
            className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-bold text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-3"
          >
            <Heart size={24} fill="currentColor" />
            {isRecurring ? `Subscribe for ₹${amount}/mo` : `Donate ₹${amount}`}
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-zinc-400 text-xs">
            <ShieldCheck size={14} />
            Securely processed by Razorpay • SSL Encrypted
          </div>
        </div>

        {/* Benefits Card */}
        <div className="space-y-6">
          <div className="bg-emerald-900 text-white p-8 rounded-[40px] relative overflow-hidden h-full">
            <Zap className="absolute right-[-20px] bottom-[-20px] text-white/5" size={160} />
            <h3 className="text-2xl font-bold mb-6">Supporter Benefits</h3>
            <ul className="space-y-6">
              {[
                { title: "Ad-free Experience", desc: "Browse without interruptions" },
                { title: "Advanced Courses", desc: "Access to exclusive spiritual content" },
                { title: "Priority AI Support", desc: "Faster response times from Claude" },
                { title: "Monthly Newsletter", desc: "Spiritual insights in your inbox" },
                { title: "Supporter Badge", desc: "Visual recognition on your profile" }
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">✓</div>
                  <div>
                    <p className="font-bold text-sm">{benefit.title}</p>
                    <p className="text-xs text-emerald-300 opacity-80">{benefit.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="mt-12 p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-sm">
              <h4 className="font-bold mb-2 text-sm">Impact Report</h4>
              <p className="text-xs text-emerald-100 leading-relaxed opacity-80">
                In 2025, our supporters helped us reach 50,000+ students of knowledge across the globe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
