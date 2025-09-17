import React from 'react';
import { motion } from 'framer-motion';

type CardProps = React.PropsWithChildren<{ className?: string }>

const Card: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`bg-white rounded-xl shadow-sm ring-1 ring-gray-200/50 hover:shadow-md hover:ring-gray-300/50 transition-all duration-300 backdrop-blur-sm ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;

