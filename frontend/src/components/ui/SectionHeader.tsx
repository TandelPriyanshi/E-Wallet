import React from 'react';

const SectionHeader: React.FC<{ title: string; subtitle?: string; className?: string }> = ({
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      ) : null}
    </div>
  );
};

export default SectionHeader;

