import React from 'react';
import BrandLogoImg from '../assets/images/defiw_pro_d_logo_1786816905455.jpg';

interface LogoProps {
  className?: string;
  size?: number;
  withCard?: boolean;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 80,
  withCard = true,
  alt = 'Défi - D Logo Oficial'
}) => {
  return (
    <span
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center shrink-0 select-none overflow-hidden bg-white transition-all duration-200 ${
        withCard
          ? 'rounded-2xl shadow-sm border border-emerald-100/80 p-0.5 hover:shadow-md'
          : 'rounded-xl'
      } ${className}`}
    >
      <img
        src={BrandLogoImg}
        alt={alt}
        className="w-full h-full object-cover rounded-[inherit] select-none pointer-events-none bg-white"
        loading="eager"
        decoding="sync"
        referrerPolicy="no-referrer"
      />
    </span>
  );
};

export default Logo;

