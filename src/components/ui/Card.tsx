import React from 'react';
import { motion } from 'framer-motion';
import type { CardProps } from '../../types';

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  image,
  onClick,
  hover = true,
  className = '',
  children,
}) => {
  const baseClasses = 'glass rounded-xl overflow-hidden border border-transparent';
  const hoverClasses = hover ? 'card-hover cursor-pointer' : '';
  const classes = `${baseClasses} ${hoverClasses} ${className}`;

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    hover: hover ? { 
      y: -8, 
      rotateX: 5,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      transition: { duration: 0.3 }
    } : {},
  };

  return (
    <motion.div
      className={classes}
      onClick={onClick}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ duration: 0.5 }}
    >
      {image && (
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={image}
            alt={title || 'Card image'}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}
      
      <div className="p-6">
        {title && (
          <h3 className="text-xl font-western text-white mb-2 text-glow">
            {title}
          </h3>
        )}
        
        {subtitle && (
          <p className="text-neutral-300 font-elegant mb-4">
            {subtitle}
          </p>
        )}
        
  <div className="text-white/90">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
