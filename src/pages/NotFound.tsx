import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Ghost } from 'lucide-react';
import { motion } from 'motion/react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-white p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Large 404 Background Text */}
        <h1 className="select-none text-[15rem] font-bold leading-none text-zinc-50 opacity-[0.03]">
          404
        </h1>
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-100 shadow-sm">
            <Ghost className="h-10 w-10 text-zinc-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-light tracking-tight text-black">Page Not Found</h2>
            <p className="mx-auto max-w-xs text-sm text-zinc-500">
              The page you're looking for doesn't exist or has been moved to another location.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-black transition-all hover:bg-zinc-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-800"
            >
              <Home className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </motion.div>

      {/* Subtle Footer */}
      <div className="mt-20">
        <p className="text-xs text-zinc-300 uppercase tracking-widest font-medium">
          Error Code: 404_PAGE_NOT_FOUND
        </p>
      </div>
    </div>
  );
}
