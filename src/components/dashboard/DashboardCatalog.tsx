import React from 'react';
import DataCatalog from './catalog/Catalog';
import { ReactFlowProvider } from 'reactflow';

const DashboardCatalog: React.FC = () => {
  return (
    <main className="flex flex-1 flex-col p-4 md:p-8 max-w-[100vw]">
    <ReactFlowProvider>
        <h1 className="text-2xl font-bold mb-4">Data Catalog</h1>
        <p className="text-muted-foreground mb-4">View your catalog of channels, videos, and shorts. Also query the catalog to create new combined shorts.</p>
        <DataCatalog />
      </ReactFlowProvider>
    </main>
  );
};


export default DashboardCatalog;