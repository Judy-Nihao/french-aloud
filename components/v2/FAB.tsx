'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export default function FAB() {
  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      aria-label="Add a card"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-fa-accent flex items-center justify-center"
      style={{
        boxShadow: '0 4px 16px rgba(44,72,112,0.35)',
      }}
    >
      <Plus size={24} className="text-white" strokeWidth={2} />
    </motion.button>
  )
}
