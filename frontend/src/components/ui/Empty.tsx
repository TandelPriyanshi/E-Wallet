import React from 'react';

const Empty: React.FC<{ title?: string; description?: string; action?: React.ReactNode }> = ({
  title = 'Nothing here yet',
  description = 'Try adjusting your filters or adding new data.',
  action,
}) => {
  return (
    <div className="text-center p-12">
      <div className="mx-auto h-12 w-12 text-indigo-600">ℹ️</div>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
};

export default Empty;

