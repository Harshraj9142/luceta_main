"use client";

import { Suspense } from 'react';
import { CheckCircle, ArrowRight, Download, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function SuccessContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Luceta! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your payment was successful. You now have access to our revolutionary audio cursor technology for game development.
          </p>
        </motion.div>

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            What's Next?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Download SDK</h3>
              <p className="text-sm text-gray-600">
                Get started with our audio cursor SDK for your game engine
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Start</h3>
              <p className="text-sm text-gray-600">
                Follow our 5-minute tutorial to create your first audio experience
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Deploy Global</h3>
              <p className="text-sm text-gray-600">
                Build locally, sell globally with one-click deployment
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/dashboard"
            className="bg-[#156d95] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#156d95]/90 transition-colors inline-flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            href="/docs"
            className="border border-[#156d95] text-[#156d95] px-8 py-3 rounded-xl font-medium hover:bg-[#156d95]/5 transition-colors inline-flex items-center justify-center gap-2"
          >
            View Documentation
            <Download className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Support Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 p-6 bg-gray-50 rounded-xl"
        >
          <p className="text-sm text-gray-600 mb-2">
            Need help getting started?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <Link href="/support" className="text-[#156d95] hover:underline">
              Contact Support
            </Link>
            <Link href="/community" className="text-[#156d95] hover:underline">
              Join Community
            </Link>
            <Link href="/examples" className="text-[#156d95] hover:underline">
              View Examples
            </Link>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8"
        >
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            ← Back to Luceta Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#156d95] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your success page...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}